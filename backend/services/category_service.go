package services

import (
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"
	"path"

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
