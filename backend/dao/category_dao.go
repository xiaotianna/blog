package dao

import (
	"blog/config"
	"blog/entities"
	"context"

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

func (CategoryDAO) FindAll(ctx context.Context) ([]entities.CategoryEntity, error) {
	var categories []entities.CategoryEntity
	err := config.PgDB.
		WithContext(ctx).
		Order("path ASC").
		Find(&categories).Error

	return categories, err
}
