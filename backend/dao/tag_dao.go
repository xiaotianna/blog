package dao

import (
	"blog/config"
	"blog/entities"
	"context"

	"github.com/google/uuid"
)

type TagDAO struct{}

var Tag = TagDAO{}

func (TagDAO) Create(ctx context.Context, tag *entities.TagEntity) error {
	return config.PgDB.WithContext(ctx).Create(tag).Error
}

func (TagDAO) FindAll(ctx context.Context) ([]entities.TagEntity, error) {
	var tags []entities.TagEntity
	err := config.PgDB.
		WithContext(ctx).
		Order("name ASC").
		Find(&tags).
		Error

	return tags, err
}

func (TagDAO) FindByName(ctx context.Context, name string) (*entities.TagEntity, error) {
	var tag entities.TagEntity
	err := config.PgDB.WithContext(ctx).First(&tag, "name = ?", name).Error
	if err != nil {
		return nil, err
	}

	return &tag, nil
}

func (TagDAO) FindByID(ctx context.Context, id uuid.UUID) (*entities.TagEntity, error) {
	var tag entities.TagEntity
	err := config.PgDB.WithContext(ctx).First(&tag, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &tag, nil
}

func (TagDAO) FindByIDs(ctx context.Context, ids []uuid.UUID) ([]entities.TagEntity, error) {
	var tags []entities.TagEntity
	err := config.PgDB.
		WithContext(ctx).
		Where("id IN ?", ids).
		Order("name ASC").
		Find(&tags).
		Error

	return tags, err
}

func (TagDAO) Update(ctx context.Context, tag *entities.TagEntity) error {
	return config.PgDB.WithContext(ctx).Save(tag).Error
}
