package controllers

import (
	"blog/dto"
	"blog/middlewares"
	"blog/services"
	"blog/utils"
	"net/http"

	"github.com/gin-gonic/gin"
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
