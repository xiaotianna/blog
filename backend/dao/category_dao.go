package dao

import (
	"blog/config"
	"blog/entities"
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
)

type CategoryDAO struct{}

var Category = CategoryDAO{}

type HomeCategoryArticleRow struct {
	CategoryID          uuid.UUID
	CategoryName        string
	CategoryPath        string
	CategoryDescription string
	ArticleID           uuid.UUID
	ArticleTitle        string
	ArticleSlug         string
	ArticlePath         string
	ArticleDescription  string
	ArticleStatus       entities.ArticleStatus
	ArticleUpdatedAt    time.Time
}

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

func (CategoryDAO) FindHomeCategoryArticles(ctx context.Context, includeAllStatuses bool, articleLimit int) ([]HomeCategoryArticleRow, error) {
	rankedArticles := config.PgDB.
		WithContext(ctx).
		Table("article").
		Select(`
			article.id AS article_id,
			article.title AS article_title,
			article.slug AS article_slug,
			article.path AS article_path,
			article.description AS article_description,
			article.status AS article_status,
			article.category_id,
			article.updated_at AS article_updated_at,
			ROW_NUMBER() OVER (
				PARTITION BY article.category_id
				ORDER BY article.updated_at DESC, article.id DESC
			) AS row_number,
			MAX(article.updated_at) OVER (
				PARTITION BY article.category_id
			) AS category_updated_at
		`).
		Where("article.deleted_at IS NULL")

	if !includeAllStatuses {
		rankedArticles = rankedArticles.Where("article.status = ?", entities.ArticleStatusPublish)
	}

	var rows []HomeCategoryArticleRow
	err := config.PgDB.
		WithContext(ctx).
		Table("category").
		Select(`
			category.id AS category_id,
			category.name AS category_name,
			category.path AS category_path,
			category.description AS category_description,
			ranked_articles.article_id,
			ranked_articles.article_title,
			ranked_articles.article_slug,
			ranked_articles.article_path,
			ranked_articles.article_description,
			ranked_articles.article_status,
			ranked_articles.article_updated_at
		`).
		Joins("JOIN (?) AS ranked_articles ON ranked_articles.category_id = category.id", rankedArticles).
		Where("category.deleted_at IS NULL").
		Where("ranked_articles.row_number <= ?", articleLimit).
		Order("ranked_articles.category_updated_at DESC").
		Order("category.id ASC").
		Order("ranked_articles.article_updated_at DESC").
		Order("ranked_articles.article_id DESC").
		Scan(&rows).
		Error

	return rows, err
}
