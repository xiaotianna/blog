package controllers

import (
	"blog/dto"
	"blog/middlewares"
	"blog/services"
	"blog/utils"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ArticleController struct {
	service services.ArticleService
}

var Article = ArticleController{
	service: services.Article,
}

func (article ArticleController) Create(c *gin.Context) {
	ctx := c.Request.Context()
	req := c.MustGet(middlewares.BodyKey).(dto.CreateArticleRequest)

	res, err := article.service.Create(ctx, req)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(c, "新增文章成功", res)
}

func (article ArticleController) Update(c *gin.Context) {
	ctx := c.Request.Context()
	req := c.MustGet(middlewares.BodyKey).(dto.UpdateArticleRequest)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "文章 ID 不合法")
		return
	}

	res, err := article.service.Update(ctx, id, req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Error(c, http.StatusNotFound, "文章不存在")
			return
		}

		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(c, "更新文章成功", res)
}

func (article ArticleController) UploadCover(c *gin.Context) {
	ctx := c.Request.Context()
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "文章 ID 不合法")
		return
	}

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, services.MaxArticleCoverRequestSize)

	fileHeader, err := c.FormFile("cover")
	if err != nil {
		if strings.Contains(err.Error(), "http: request body too large") {
			utils.Error(c, http.StatusBadRequest, services.ErrArticleCoverTooLarge.Error())
			return
		}

		utils.Error(c, http.StatusBadRequest, services.ErrArticleCoverRequired.Error())
		return
	}

	res, err := article.service.UploadCover(ctx, id, fileHeader)
	if err != nil {
		utils.Error(c, articleCoverErrorStatus(err), articleCoverErrorMessage(err))
		return
	}

	utils.Success(c, "更新文章封面成功", res)
}

func (article ArticleController) DeleteCover(c *gin.Context) {
	ctx := c.Request.Context()
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "文章 ID 不合法")
		return
	}

	res, err := article.service.DeleteCover(ctx, id)
	if err != nil {
		utils.Error(c, articleCoverErrorStatus(err), articleCoverErrorMessage(err))
		return
	}

	utils.Success(c, "删除文章封面成功", res)
}

func (article ArticleController) Move(c *gin.Context) {
	ctx := c.Request.Context()
	req := c.MustGet(middlewares.BodyKey).(dto.MoveArticleRequest)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "文章 ID 不合法")
		return
	}

	res, err := article.service.Move(ctx, id, req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Error(c, http.StatusNotFound, "文章不存在")
			return
		}

		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(c, "移动文章成功", res)
}

func (article ArticleController) List(c *gin.Context) {
	ctx := c.Request.Context()
	page, pageSize := readPagination(c)
	_, isAuthenticated := middlewares.CurrentUser(c)

	res, err := article.service.List(ctx, c.Query("categoryPath"), isAuthenticated, page, pageSize)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Error(c, http.StatusNotFound, "目录不存在")
			return
		}

		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, "获取文章列表成功", res)
}

func (article ArticleController) Detail(c *gin.Context) {
	ctx := c.Request.Context()
	_, isAuthenticated := middlewares.CurrentUser(c)

	res, err := article.service.Detail(ctx, c.Query("path"), isAuthenticated)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Error(c, http.StatusNotFound, "文章不存在")
			return
		}

		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, "获取文章详情成功", res)
}

func articleCoverErrorStatus(err error) int {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return http.StatusNotFound
	}

	if errors.Is(err, services.ErrArticleCoverDir) || errors.Is(err, services.ErrArticleCoverSave) {
		return http.StatusInternalServerError
	}

	return http.StatusBadRequest
}

func articleCoverErrorMessage(err error) string {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "文章不存在"
	}

	return err.Error()
}
