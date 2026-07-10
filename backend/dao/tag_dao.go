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

func (TagDAO) FindArticles(ctx context.Context, tagID uuid.UUID, includeAllStatuses bool, page int, pageSize int) (PageResult[entities.ArticleEntity], error) {
	var articles []entities.ArticleEntity
	var total int64
	query := config.PgDB.
		WithContext(ctx).
		Model(&entities.ArticleEntity{}).
		Joins("JOIN article_tags ON article_tags.article_entity_id = article.id").
		Where("article_tags.tag_entity_id = ?", tagID)

	if !includeAllStatuses {
		query = query.Where("article.status = ?", entities.ArticleStatusPublish)
	}

	if err := query.Count(&total).Error; err != nil {
		return PageResult[entities.ArticleEntity]{}, err
	}

	err := query.
		Preload("Tags").
		Order("article.created_at DESC").
		Offset(Offset(page, pageSize)).
		Limit(pageSize).
		Find(&articles).
		Error
	if err != nil {
		return PageResult[entities.ArticleEntity]{}, err
	}

	return NewPageResult(articles, page, pageSize, total), nil
}
