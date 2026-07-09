package services

import (
	"blog/config"
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"database/sql"
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

	category.Name = req.Name
	category.Slug = req.Slug
	category.Path = newPath
	category.Description = req.Description

	// 开始数据库事务操作，批量更新当前目录、后代目录和文章路径，确保操作的原子性
	err = config.PgDB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(category).Error; err != nil {
			return err
		}

		// 修改 slug 后，批量替换所有后代目录的路径前缀
		if err := batchReplacePathPrefix(tx, &entities.CategoryEntity{}, oldPath, newPath); err != nil {
			return err
		}

		// 修改 slug 后，批量替换目录下所有文章的路径前缀
		if err := batchReplacePathPrefix(tx, &entities.ArticleEntity{}, oldPath, newPath); err != nil {
			return err
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

	// 找到当前目录
	oldPath := category.Path
	// 移动后路径（根路径，后面如果有子路径会重新赋值）
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

	// 查找新路径在某个目录是否存在
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

	category.Path = newPath
	category.ParentID = req.ParentID

	// 开始数据库事务操作，批量进行路径替换，确保操作的原子性
	// ctx 用于处理超时、取消请求等情况
	err = config.PgDB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// ts就是事务里的数据库操作对象
		if err := tx.Save(category).Error; err != nil {
			return err
		}

		// Descendants（查找后代），找到所有的子目录，通过Like去匹配：Where("path LIKE ?", storagePath+"/%")
		// 由数据库批量进行前缀拼接，避免循环逐条执行 Save 产生大量 SQL
		if err := batchReplacePathPrefix(tx, &entities.CategoryEntity{}, oldPath, newPath); err != nil {
			return err
		}

		// 找到所有的文章
		// 同一条 SQL 批量更新文章路径，并通过路径分隔符避免匹配相似前缀
		if err := batchReplacePathPrefix(tx, &entities.ArticleEntity{}, oldPath, newPath); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return categoryToVO(category), nil
}

func (CategoryService) Delete(ctx context.Context, id uuid.UUID) (*vo.CategoryVO, error) {
	var res *vo.CategoryVO

	err := config.PgDB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var category entities.CategoryEntity
		if err := tx.First(&category, "id = ?", id).Error; err != nil {
			return err
		}

		var childCount int64
		if err := tx.
			Model(&entities.CategoryEntity{}).
			Where("parent_id = ?", category.ID).
			Count(&childCount).
			Error; err != nil {
			return err
		}
		if childCount > 0 {
			return errors.New("目录下还有子目录，不能删除")
		}

		var articleCount int64
		if err := tx.
			Model(&entities.ArticleEntity{}).
			Where("category_id = ?", category.ID).
			Count(&articleCount).
			Error; err != nil {
			return err
		}
		if articleCount > 0 {
			return errors.New("目录下还有文章，不能删除")
		}

		res = categoryToVO(&category)
		return tx.Delete(&category).Error
	}, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
	})
	if err != nil {
		return nil, err
	}

	return res, nil
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

func batchReplacePathPrefix(tx *gorm.DB, model any, oldPath string, newPath string) error {
	return tx.Model(model).
		Where(
			"LEFT(path, CHAR_LENGTH(?)) = ? AND SUBSTRING(path FROM CHAR_LENGTH(?) + 1 FOR 1) = '/'",
			oldPath,
			oldPath,
			oldPath,
		).
		Update(
			"path",
			gorm.Expr("? || SUBSTRING(path FROM CHAR_LENGTH(?) + 1)", newPath, oldPath),
		).Error
}
