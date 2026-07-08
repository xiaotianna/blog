package services

import (
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"

	"gorm.io/gorm"
)

type ArticleService struct{}

var Article = ArticleService{}

func (ArticleService) Create(ctx context.Context, req dto.CreateArticleRequest) (*vo.ArticleVO, error) {
	category, err := dao.Category.FindByID(ctx, req.CategoryID)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("所属目录不存在")
		}
		return nil, err
	}

	if _, err := dao.Article.FindBySlug(ctx, req.Slug); err == nil {
		return nil, errors.New("文章标识已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	article := &entities.ArticleEntity{
		Title:       req.Title,
		Slug:        req.Slug,
		Description: req.Description,
		Content:     "",
		Status:      entities.ArticleStatusDraft,
		CategoryID:  category.ID,
	}

	if err := dao.Article.Create(ctx, article); err != nil {
		return nil, err
	}

	return &vo.ArticleVO{
		ID:          article.ID,
		Title:       article.Title,
		Slug:        article.Slug,
		Description: article.Description,
		Status:      string(article.Status),
		CategoryID:  article.CategoryID,
		PublishedAt: article.PublishedAt,
	}, nil
}
