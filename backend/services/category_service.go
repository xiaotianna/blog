package services

import (
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"
	"path"

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
		Path:        category.Path,
		Description: category.Description,
		ParentID:    category.ParentID,
	}, nil
}
