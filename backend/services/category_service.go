package services

import (
	"blog/config"
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"
	"path"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CategoryService struct{}

var Category = CategoryService{}

func (CategoryService) Create(ctx context.Context, req dto.CreateCategoryRequest) (*vo.CategoryVO, error) {
	categoryPath := "/" + req.Slug

	if req.ParentID != nil {
		parent, err := dao.Category.FindByID(ctx, *req.ParentID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("父级目录不存在")
			}
			return nil, err
		}

		categoryPath = path.Join(parent.Path, req.Slug)
	}

	if _, err := dao.Category.FindByPath(ctx, categoryPath); err == nil {
		return nil, errors.New("目录路径已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if _, err := dao.Article.FindByPath(ctx, categoryPath); err == nil {
		return nil, errors.New("内容路径已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	category := &entities.CategoryEntity{
		Name:        req.Name,
		Slug:        req.Slug,
		Path:        categoryPath,
		Description: req.Description,
		ParentID:    req.ParentID,
	}

	if err := dao.Category.Create(ctx, category); err != nil {
		return nil, err
	}

	return &vo.CategoryVO{
		ID:          category.ID,
		Name:        category.Name,
		Slug:        category.Slug,
		Path:        toPublicPath(category.Path),
		Description: category.Description,
		ParentID:    category.ParentID,
	}, nil
}

func (CategoryService) Update(ctx context.Context, id uuid.UUID, req dto.UpdateCategoryRequest) (*vo.CategoryVO, error) {
	category, err := dao.Category.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	oldPath := category.Path
	newPath := path.Join(path.Dir(category.Path), req.Slug)

	if existing, err := dao.Category.FindByPath(ctx, newPath); err == nil && existing.ID != category.ID {
		return nil, errors.New("目录路径已存在")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if _, err := dao.Article.FindByPath(ctx, newPath); err == nil {
		return nil, errors.New("内容路径已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	descendants, err := dao.Category.FindDescendantsByPath(ctx, oldPath)
	if err != nil {
		return nil, err
	}

	articles, err := dao.Article.FindByPathPrefix(ctx, oldPath)
	if err != nil {
		return nil, err
	}

	category.Name = req.Name
	category.Slug = req.Slug
	category.Path = newPath
	category.Description = req.Description

	err = config.PgDB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(category).Error; err != nil {
			return err
		}

		for _, descendant := range descendants {
			descendant.Path = replacePathPrefix(descendant.Path, oldPath, newPath)
			if err := tx.Save(&descendant).Error; err != nil {
				return err
			}
		}

		for _, article := range articles {
			article.Path = replacePathPrefix(article.Path, oldPath, newPath)
			if err := tx.Save(&article).Error; err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return categoryToVO(category), nil
}

func (CategoryService) Move(ctx context.Context, id uuid.UUID, req dto.MoveCategoryRequest) (*vo.CategoryVO, error) {
	category, err := dao.Category.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	oldPath := category.Path
	newPath := "/" + category.Slug

	if req.ParentID != nil {
		if *req.ParentID == category.ID {
			return nil, errors.New("目录不能移动到自身下")
		}

		parent, err := dao.Category.FindByID(ctx, *req.ParentID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("父级目录不存在")
			}
			return nil, err
		}

		if isDescendantPath(parent.Path, category.Path) {
			return nil, errors.New("目录不能移动到自己的子目录下")
		}

		newPath = path.Join(parent.Path, category.Slug)
	}

	if existing, err := dao.Category.FindByPath(ctx, newPath); err == nil && existing.ID != category.ID {
		return nil, errors.New("目录路径已存在")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if _, err := dao.Article.FindByPath(ctx, newPath); err == nil {
		return nil, errors.New("内容路径已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	descendants, err := dao.Category.FindDescendantsByPath(ctx, oldPath)
	if err != nil {
		return nil, err
	}

	articles, err := dao.Article.FindByPathPrefix(ctx, oldPath)
	if err != nil {
		return nil, err
	}

	category.Path = newPath
	category.ParentID = req.ParentID

	err = config.PgDB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(category).Error; err != nil {
			return err
		}

		for _, descendant := range descendants {
			descendant.Path = replacePathPrefix(descendant.Path, oldPath, newPath)
			if err := tx.Save(&descendant).Error; err != nil {
				return err
			}
		}

		for _, article := range articles {
			article.Path = replacePathPrefix(article.Path, oldPath, newPath)
			if err := tx.Save(&article).Error; err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return categoryToVO(category), nil
}

func (CategoryService) Detail(ctx context.Context, path string) (*vo.CategoryVO, error) {
	category, err := dao.Category.FindByPath(ctx, toStoragePath(path))
	if err != nil {
		return nil, err
	}

	return categoryToVO(category), nil
}

func (CategoryService) Children(ctx context.Context, parentPath string, page int, pageSize int) (vo.PageVO[vo.CategoryListItemVO], error) {
	var parentID *uuid.UUID

	if toStoragePath(parentPath) != "" {
		parent, err := dao.Category.FindByPath(ctx, toStoragePath(parentPath))
		if err != nil {
			return vo.PageVO[vo.CategoryListItemVO]{}, err
		}

		parentID = &parent.ID
	}

	res, err := dao.Category.FindChildren(ctx, parentID, page, pageSize)
	if err != nil {
		return vo.PageVO[vo.CategoryListItemVO]{}, err
	}

	items := make([]vo.CategoryListItemVO, 0, len(res.Items))
	for _, category := range res.Items {
		items = append(items, categoryToListItemVO(category))
	}

	return vo.PageVO[vo.CategoryListItemVO]{
		Items:      items,
		Pagination: vo.NewPaginationVO(res.Page, res.PageSize, res.Total, res.TotalPages),
	}, nil
}

func (CategoryService) Options(ctx context.Context) ([]vo.CategoryOptionVO, error) {
	categories, err := dao.Category.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	options := make([]vo.CategoryOptionVO, 0, len(categories))
	for _, category := range categories {
		options = append(options, vo.CategoryOptionVO{
			ID:    category.ID,
			Label: category.Name,
			Path:  toPublicPath(category.Path),
		})
	}

	return options, nil
}

func categoryToVO(category *entities.CategoryEntity) *vo.CategoryVO {
	return &vo.CategoryVO{
		ID:          category.ID,
		Name:        category.Name,
		Slug:        category.Slug,
		Path:        toPublicPath(category.Path),
		Description: category.Description,
		ParentID:    category.ParentID,
	}
}

func categoryToListItemVO(category entities.CategoryEntity) vo.CategoryListItemVO {
	return vo.CategoryListItemVO{
		ID:          category.ID,
		Name:        category.Name,
		Slug:        category.Slug,
		Path:        toPublicPath(category.Path),
		Description: category.Description,
		ParentID:    category.ParentID,
	}
}

func isDescendantPath(candidatePath string, parentPath string) bool {
	return strings.HasPrefix(strings.TrimRight(candidatePath, "/"), strings.TrimRight(parentPath, "/")+"/")
}

func replacePathPrefix(value string, oldPrefix string, newPrefix string) string {
	return newPrefix + strings.TrimPrefix(value, oldPrefix)
}
