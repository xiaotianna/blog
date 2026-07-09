package dao

import (
	"blog/config"
	"blog/entities"
	"context"
	"strings"

	"github.com/google/uuid"
)

type CategoryDAO struct{}

var Category = CategoryDAO{}

func (CategoryDAO) FindByID(ctx context.Context, id uuid.UUID) (*entities.CategoryEntity, error) {
	var category entities.CategoryEntity
	err := config.PgDB.WithContext(ctx).First(&category, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (CategoryDAO) FindByPath(ctx context.Context, path string) (*entities.CategoryEntity, error) {
	var category entities.CategoryEntity
	err := config.PgDB.WithContext(ctx).First(&category, "path = ?", path).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (CategoryDAO) Create(ctx context.Context, category *entities.CategoryEntity) error {
	return config.PgDB.WithContext(ctx).Create(category).Error
}

func (CategoryDAO) Save(ctx context.Context, category *entities.CategoryEntity) error {
	return config.PgDB.WithContext(ctx).Save(category).Error
}

func (CategoryDAO) Delete(ctx context.Context, category *entities.CategoryEntity) error {
	return config.PgDB.WithContext(ctx).Delete(category).Error
}

func (CategoryDAO) CountChildren(ctx context.Context, parentID uuid.UUID) (int64, error) {
	var total int64
	err := config.PgDB.
		WithContext(ctx).
		Model(&entities.CategoryEntity{}).
		Where("parent_id = ?", parentID).
		Count(&total).
		Error

	return total, err
}

func (CategoryDAO) FindDescendantsByPath(ctx context.Context, categoryPath string) ([]entities.CategoryEntity, error) {
	var categories []entities.CategoryEntity
	storagePath := strings.TrimRight(categoryPath, "/")
	err := config.PgDB.
		WithContext(ctx).
		Where("path LIKE ?", storagePath+"/%").
		Order("path ASC").
		Find(&categories).Error

	return categories, err
}

func (CategoryDAO) FindChildren(ctx context.Context, parentID *uuid.UUID, page int, pageSize int) (PageResult[entities.CategoryEntity], error) {
	var categories []entities.CategoryEntity
	var total int64
	query := config.PgDB.WithContext(ctx).Model(&entities.CategoryEntity{})

	if parentID == nil {
		query = query.Where("parent_id IS NULL")
	} else {
		query = query.Where("parent_id = ?", *parentID)
	}

	if err := query.Count(&total).Error; err != nil {
		return PageResult[entities.CategoryEntity]{}, err
	}

	err := query.
		Order("created_at DESC").
		Offset(Offset(page, pageSize)).
		Limit(pageSize).
		Find(&categories).Error
	if err != nil {
		return PageResult[entities.CategoryEntity]{}, err
	}

	return NewPageResult(categories, page, pageSize, total), nil
}

func (CategoryDAO) FindAll(ctx context.Context) ([]entities.CategoryEntity, error) {
	var categories []entities.CategoryEntity
	err := config.PgDB.
		WithContext(ctx).
		Order("path ASC").
		Find(&categories).Error

	return categories, err
}
