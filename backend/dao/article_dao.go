package dao

import (
	"blog/config"
	"blog/entities"
	"context"
	"path"

	"github.com/google/uuid"
)

type ArticleDAO struct{}

var Article = ArticleDAO{}

func (ArticleDAO) FindByPath(ctx context.Context, path string) (*entities.ArticleEntity, error) {
	var article entities.ArticleEntity
	err := config.PgDB.WithContext(ctx).First(&article, "path = ?", path).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (ArticleDAO) FindByCategoryPathAndSlug(ctx context.Context, articlePath string) (*entities.ArticleEntity, error) {
	var article entities.ArticleEntity
	categoryPath := path.Dir(articlePath)
	slug := path.Base(articlePath)

	err := config.PgDB.
		WithContext(ctx).
		Joins("JOIN category ON category.id = article.category_id").
		First(&article, "category.path = ? AND article.slug = ?", categoryPath, slug).
		Error
	if err != nil {
		return nil, err
	}

	return &article, nil
}

func (ArticleDAO) Create(ctx context.Context, article *entities.ArticleEntity) error {
	return config.PgDB.WithContext(ctx).Create(article).Error
}

func (ArticleDAO) FindByCategory(ctx context.Context, categoryID uuid.UUID, includeAllStatuses bool, page int, pageSize int) (PageResult[entities.ArticleEntity], error) {
	var articles []entities.ArticleEntity
	var total int64
	query := config.PgDB.
		WithContext(ctx).
		Model(&entities.ArticleEntity{}).
		Where("category_id = ?", categoryID)

	if !includeAllStatuses {
		query = query.Where("status = ?", entities.ArticleStatusPublish)
	}

	if err := query.Count(&total).Error; err != nil {
		return PageResult[entities.ArticleEntity]{}, err
	}

	err := query.
		Order("published_at DESC NULLS LAST").
		Order("created_at DESC").
		Offset(Offset(page, pageSize)).
		Limit(pageSize).
		Find(&articles).Error
	if err != nil {
		return PageResult[entities.ArticleEntity]{}, err
	}

	return NewPageResult(articles, page, pageSize, total), nil
}
