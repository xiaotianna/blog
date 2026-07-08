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
