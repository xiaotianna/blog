package controllers

import (
	"blog/services"

	"github.com/gin-gonic/gin"
)

type ArticleController struct {
	service services.ArticleService
}

var Article = ArticleController{
	service: services.Article,
}

func (article ArticleController) Create(c *gin.Context) {

}
