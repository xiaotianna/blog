package dao

import (
	"blog/config"
	"blog/entities"
	"context"
	"strings"

	"gorm.io/gorm/clause"
)

type SearchDAO struct{}

var Search = SearchDAO{}

const searchTagExists = `EXISTS (
	SELECT 1
	FROM article_tags search_article_tags
	JOIN tag search_tag ON search_tag.id = search_article_tags.tag_entity_id
	WHERE search_article_tags.article_entity_id = article.id
		AND search_tag.deleted_at IS NULL
		AND search_tag.name ILIKE ? ESCAPE '\'
)`

func (SearchDAO) FindRecentArticles(ctx context.Context, limit int) ([]entities.ArticleEntity, error) {
	var articles []entities.ArticleEntity
	err := config.PgDB.
		WithContext(ctx).
		Where("status = ?", entities.ArticleStatusPublish).
		Preload("Tags").
		Order("published_at DESC, updated_at DESC").
		Limit(limit).
		Find(&articles).
		Error

	return articles, err
}

func (SearchDAO) FindCategories(ctx context.Context, query string, limit int) ([]entities.CategoryEntity, error) {
	var categories []entities.CategoryEntity
	literal := escapeLike(query)
	contains := "%" + literal + "%"
	prefix := literal + "%"

	order := clause.Expr{
		SQL: `CASE
			WHEN LOWER(name) = LOWER(?) THEN 100
			WHEN name ILIKE ? ESCAPE '\' THEN 90
			WHEN name ILIKE ? ESCAPE '\' THEN 80
			WHEN description ILIKE ? ESCAPE '\' THEN 40
			ELSE 0
		END DESC,
		(
			CASE WHEN name ILIKE ? ESCAPE '\' THEN 1 ELSE 0 END +
			CASE WHEN description ILIKE ? ESCAPE '\' THEN 1 ELSE 0 END
		) DESC,
		updated_at DESC`,
		Vars:               []any{query, prefix, contains, contains, contains, contains},
		WithoutParentheses: true,
	}

	err := config.PgDB.
		WithContext(ctx).
		Where(`name ILIKE ? ESCAPE '\' OR description ILIKE ? ESCAPE '\'`, contains, contains).
		Clauses(clause.OrderBy{Expression: order}).
		Limit(limit).
		Find(&categories).
		Error

	return categories, err
}

func (SearchDAO) FindArticles(ctx context.Context, query string, includeAllStatuses bool, limit int) ([]entities.ArticleEntity, error) {
	var articles []entities.ArticleEntity
	literal := escapeLike(query)
	contains := "%" + literal + "%"
	prefix := literal + "%"

	searchCondition := `(
		article.title ILIKE ? ESCAPE '\'
		OR article.description ILIKE ? ESCAPE '\'
		OR article.content ILIKE ? ESCAPE '\'
		OR ` + searchTagExists + `
	)`

	order := clause.Expr{
		SQL: `CASE
			WHEN LOWER(article.title) = LOWER(?) THEN 100
			WHEN article.title ILIKE ? ESCAPE '\' THEN 90
			WHEN article.title ILIKE ? ESCAPE '\' THEN 80
			WHEN ` + searchTagExists + ` THEN 70
			WHEN ` + searchTagExists + ` THEN 60
			WHEN ` + searchTagExists + ` THEN 50
			WHEN article.description ILIKE ? ESCAPE '\' THEN 40
			WHEN article.content ILIKE ? ESCAPE '\' THEN 30
			ELSE 0
		END DESC,
		(
			CASE WHEN article.title ILIKE ? ESCAPE '\' THEN 1 ELSE 0 END +
			CASE WHEN ` + searchTagExists + ` THEN 1 ELSE 0 END +
			CASE WHEN article.description ILIKE ? ESCAPE '\' THEN 1 ELSE 0 END +
			CASE WHEN article.content ILIKE ? ESCAPE '\' THEN 1 ELSE 0 END
		) DESC,
		article.updated_at DESC`,
		Vars: []any{
			query, prefix, contains,
			literal, prefix, contains,
			contains, contains,
			contains, contains, contains, contains,
		},
		WithoutParentheses: true,
	}

	db := config.PgDB.
		WithContext(ctx).
		Model(&entities.ArticleEntity{}).
		Where(searchCondition, contains, contains, contains, contains)

	if !includeAllStatuses {
		db = db.Where("article.status = ?", entities.ArticleStatusPublish)
	}

	err := db.
		Preload("Tags").
		Clauses(clause.OrderBy{Expression: order}).
		Limit(limit).
		Find(&articles).
		Error

	return articles, err
}

func escapeLike(value string) string {
	replacer := strings.NewReplacer(
		`\`, `\\`,
		`%`, `\%`,
		`_`, `\_`,
	)

	return replacer.Replace(value)
}
