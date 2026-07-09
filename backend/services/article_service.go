package services

import (
	"blog/dao"
	"blog/dto"
	"blog/entities"
	"blog/vo"
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const maxArticleCoverSize = 5 << 20

const MaxArticleCoverRequestSize = maxArticleCoverSize + (1 << 20)

var (
	ErrArticleCoverRequired = errors.New("请上传封面图")
	ErrArticleCoverTooLarge = errors.New("封面图不能超过5MB")
	ErrArticleCoverRead     = errors.New("封面读取失败")
	ErrArticleCoverType     = errors.New("封面图仅支持 PNG、JPEG 或 WebP")
	ErrArticleCoverDir      = errors.New("封面目录创建失败")
	ErrArticleCoverSave     = errors.New("封面保存失败")
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
		Cover:       article.Cover,
		Status:      string(article.Status),
		CategoryID:  article.CategoryID,
		CreatedAt:   article.CreatedAt,
		UpdatedAt:   article.UpdatedAt,
		PublishedAt: article.PublishedAt,
		Tags:        articleTagsToVO(article.Tags),
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
	article.Content = req.Content
	article.Status = entities.ArticleStatus(req.Status)

	if err := dao.Article.Save(ctx, article); err != nil {
		return nil, err
	}

	return articleToVO(article), nil
}

func (s ArticleService) UploadCover(ctx context.Context, id uuid.UUID, fileHeader *multipart.FileHeader) (*vo.ArticleVO, error) {
	if fileHeader == nil {
		return nil, ErrArticleCoverRequired
	}

	if fileHeader.Size > maxArticleCoverSize {
		return nil, ErrArticleCoverTooLarge
	}

	ext, err := detectArticleCoverExt(fileHeader)
	if err != nil {
		return nil, err
	}

	if err := os.MkdirAll(filepath.Join("uploads", "covers"), 0755); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrArticleCoverDir, err)
	}

	filename := fmt.Sprintf("%s-%d.%s", id.String(), time.Now().UnixNano(), ext)
	dst := filepath.Join("uploads", "covers", filename)

	if err := saveUploadedArticleCover(fileHeader, dst); err != nil {
		return nil, err
	}

	coverPath := "/uploads/covers/" + filename
	res, oldCover, err := s.updateCover(ctx, id, coverPath)
	if err != nil {
		_ = os.Remove(dst)
		return nil, err
	}

	removeLocalArticleCover(oldCover)
	return res, nil
}

func (s ArticleService) DeleteCover(ctx context.Context, id uuid.UUID) (*vo.ArticleVO, error) {
	res, oldCover, err := s.updateCover(ctx, id, "")
	if err != nil {
		return nil, err
	}

	removeLocalArticleCover(oldCover)
	return res, nil
}

func (ArticleService) updateCover(ctx context.Context, id uuid.UUID, cover string) (*vo.ArticleVO, string, error) {
	article, err := dao.Article.FindByID(ctx, id)
	if err != nil {
		return nil, "", err
	}

	oldCover := article.Cover
	article.Cover = cover

	if err := dao.Article.Save(ctx, article); err != nil {
		return nil, "", err
	}

	return articleToVO(article), oldCover, nil
}

func detectArticleCoverExt(fileHeader *multipart.FileHeader) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", ErrArticleCoverRead
	}
	defer file.Close()

	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && !errors.Is(err, io.EOF) {
		return "", ErrArticleCoverRead
	}

	contentType := http.DetectContentType(buffer[:n])
	switch contentType {
	case "image/png":
		return "png", nil
	case "image/jpeg":
		return "jpg", nil
	case "image/webp":
		return "webp", nil
	default:
		return "", ErrArticleCoverType
	}
}

func saveUploadedArticleCover(fileHeader *multipart.FileHeader, dst string) error {
	src, err := fileHeader.Open()
	if err != nil {
		return ErrArticleCoverRead
	}
	defer src.Close()

	out, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrArticleCoverSave, err)
	}
	defer out.Close()

	if _, err := io.Copy(out, src); err != nil {
		return fmt.Errorf("%w: %v", ErrArticleCoverSave, err)
	}

	return nil
}

func removeLocalArticleCover(cover string) {
	if !strings.HasPrefix(cover, "/uploads/covers/") {
		return
	}

	_ = os.Remove(filepath.Join(".", filepath.FromSlash(strings.TrimPrefix(cover, "/"))))
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
		Cover:       article.Cover,
		Status:      string(article.Status),
		CategoryID:  article.CategoryID,
		CreatedAt:   article.CreatedAt,
		UpdatedAt:   article.UpdatedAt,
		PublishedAt: article.PublishedAt,
		Tags:        articleTagsToVO(article.Tags),
	}
}

func articleToVO(article *entities.ArticleEntity) *vo.ArticleVO {
	return &vo.ArticleVO{
		ID:          article.ID,
		Title:       article.Title,
		Slug:        article.Slug,
		Path:        toPublicPath(article.Path),
		Description: article.Description,
		Cover:       article.Cover,
		Status:      string(article.Status),
		CategoryID:  article.CategoryID,
		CreatedAt:   article.CreatedAt,
		UpdatedAt:   article.UpdatedAt,
		PublishedAt: article.PublishedAt,
		Tags:        articleTagsToVO(article.Tags),
	}
}

func articleToDetailVO(article *entities.ArticleEntity) *vo.ArticleDetailVO {
	return &vo.ArticleDetailVO{
		ID:          article.ID,
		Title:       article.Title,
		Slug:        article.Slug,
		Path:        toPublicPath(article.Path),
		Description: article.Description,
		Cover:       article.Cover,
		Content:     article.Content,
		Status:      string(article.Status),
		CategoryID:  article.CategoryID,
		CreatedAt:   article.CreatedAt,
		UpdatedAt:   article.UpdatedAt,
		PublishedAt: article.PublishedAt,
		Tags:        articleTagsToVO(article.Tags),
	}
}

func articleTagsToVO(tags []entities.TagEntity) []vo.TagVO {
	res := make([]vo.TagVO, 0, len(tags))
	for _, tag := range tags {
		res = append(res, vo.TagVO{
			ID:   tag.ID,
			Name: tag.Name,
		})
	}

	return res
}
