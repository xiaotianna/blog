package services

import (
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"
	"path"

	"github.com/google/uuid"
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
	if _, err := dao.Category.FindByPath(ctx, articlePath); err == nil {
		return nil, errors.New("内容路径已存在")
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

func (ArticleService) Update(ctx context.Context, id uuid.UUID, req dto.UpdateArticleRequest) (*vo.ArticleVO, error) {
	article, err := dao.Article.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	category, err := dao.Category.FindByID(ctx, article.CategoryID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("所属目录不存在")
		}
		return nil, err
	}

	articlePath := path.Join(category.Path, req.Slug)
	if existing, err := dao.Article.FindByPath(ctx, articlePath); err == nil && existing.ID != article.ID {
		return nil, errors.New("文章路径已存在")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if _, err := dao.Category.FindByPath(ctx, articlePath); err == nil {
		return nil, errors.New("内容路径已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	article.Title = req.Title
	article.Slug = req.Slug
	article.Path = articlePath
	article.Description = req.Description

	if err := dao.Article.Save(ctx, article); err != nil {
		return nil, err
	}

	return articleToVO(article), nil
}

func (ArticleService) Move(ctx context.Context, id uuid.UUID, req dto.MoveArticleRequest) (*vo.ArticleVO, error) {
	article, err := dao.Article.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	category, err := dao.Category.FindByID(ctx, req.CategoryID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("所属目录不存在")
		}
		return nil, err
	}

	articlePath := path.Join(category.Path, article.Slug)
	if existing, err := dao.Article.FindByPath(ctx, articlePath); err == nil && existing.ID != article.ID {
		return nil, errors.New("文章路径已存在")
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if _, err := dao.Category.FindByPath(ctx, articlePath); err == nil {
		return nil, errors.New("内容路径已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	article.Path = articlePath
	article.CategoryID = category.ID

	if err := dao.Article.Save(ctx, article); err != nil {
		return nil, err
	}

	return articleToVO(article), nil
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

func articleToVO(article *entities.ArticleEntity) *vo.ArticleVO {
	return &vo.ArticleVO{
		ID:          article.ID,
		Title:       article.Title,
		Slug:        article.Slug,
		Path:        toPublicPath(article.Path),
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
