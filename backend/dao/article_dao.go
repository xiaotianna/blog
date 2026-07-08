package dao

import (
	"blog/config"
	"blog/entities"
	"context"
)

type ArticleDAO struct{}

var Article = ArticleDAO{}

func (ArticleDAO) FindBySlug(ctx context.Context, slug string) (*entities.ArticleEntity, error) {
	var article entities.ArticleEntity
	err := config.PgDB.WithContext(ctx).First(&article, "slug = ?", slug).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (ArticleDAO) Create(ctx context.Context, article *entities.ArticleEntity) error {
	return config.PgDB.WithContext(ctx).Create(article).Error
}

func (ArticleDAO) FindPublishedForCategoryCatalog(ctx context.Context) ([]entities.ArticleEntity, error) {
	var articles []entities.ArticleEntity
	err := config.PgDB.
		WithContext(ctx).
		Where("status = ?", entities.ArticleStatusPublish).
		Order("published_at DESC NULLS LAST").
		Order("created_at DESC").
		Find(&articles).Error

	return articles, err
}
