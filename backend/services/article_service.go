package services

import (
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"
	"path"

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

	articlePath := path.Join(category.Path, req.Slug)

	if _, err := dao.Article.FindByPath(ctx, articlePath); err == nil {
		return nil, errors.New("文章路径已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	article := &entities.ArticleEntity{
		Title:       req.Title,
		Slug:        req.Slug,
		Path:        articlePath,
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
		Path:        toPublicPath(article.Path),
		Description: article.Description,
		Status:      string(article.Status),
		CategoryID:  article.CategoryID,
		PublishedAt: article.PublishedAt,
	}, nil
}

func (ArticleService) List(ctx context.Context, categoryPath string, includeAllStatuses bool, page int, pageSize int) (vo.PageVO[vo.ArticleListItemVO], error) {
	if toStoragePath(categoryPath) == "" {
		return vo.PageVO[vo.ArticleListItemVO]{
			Items:      []vo.ArticleListItemVO{},
			Pagination: vo.NewPaginationVO(page, pageSize, 0, 1),
		}, nil
	}

	category, err := dao.Category.FindByPath(ctx, toStoragePath(categoryPath))
	if err != nil {
		return vo.PageVO[vo.ArticleListItemVO]{}, err
	}

	res, err := dao.Article.FindByCategory(ctx, category.ID, includeAllStatuses, page, pageSize)
	if err != nil {
		return vo.PageVO[vo.ArticleListItemVO]{}, err
	}

	items := make([]vo.ArticleListItemVO, 0, len(res.Items))
	for _, article := range res.Items {
		items = append(items, articleToListItemVO(article, category.Path))
	}

	return vo.PageVO[vo.ArticleListItemVO]{
		Items:      items,
		Pagination: vo.NewPaginationVO(res.Page, res.PageSize, res.Total, res.TotalPages),
	}, nil
}

func (ArticleService) Detail(ctx context.Context, articlePath string, includeAllStatuses bool) (*vo.ArticleDetailVO, error) {
	article, err := dao.Article.FindByPath(ctx, toStoragePath(articlePath))
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		article, err = dao.Article.FindByCategoryPathAndSlug(ctx, toStoragePath(articlePath))
		if err != nil {
			return nil, err
		}
	}

	if !includeAllStatuses && article.Status != entities.ArticleStatusPublish {
		return nil, gorm.ErrRecordNotFound
	}

	if article.Path == "" {
		article.Path = toStoragePath(articlePath)
	}

	return articleToDetailVO(article), nil
}

func articleToListItemVO(article entities.ArticleEntity, categoryPath string) vo.ArticleListItemVO {
	articlePath := article.Path
	if articlePath == "" {
		articlePath = path.Join(categoryPath, article.Slug)
	}

	return vo.ArticleListItemVO{
		ID:          article.ID,
		Title:       article.Title,
		Slug:        article.Slug,
		Path:        toPublicPath(articlePath),
		Description: article.Description,
		Status:      string(article.Status),
		CategoryID:  article.CategoryID,
		PublishedAt: article.PublishedAt,
	}
}

func articleToDetailVO(article *entities.ArticleEntity) *vo.ArticleDetailVO {
	return &vo.ArticleDetailVO{
		ID:          article.ID,
		Title:       article.Title,
		Slug:        article.Slug,
		Path:        toPublicPath(article.Path),
		Description: article.Description,
		Content:     article.Content,
		Status:      string(article.Status),
		CategoryID:  article.CategoryID,
		PublishedAt: article.PublishedAt,
	}
}
