package router

import (
	"blog/controllers"
	"blog/dto"
	"blog/middlewares"

	"github.com/gin-gonic/gin"
)

func ArticleRouter(r *gin.RouterGroup) {
	// 新增文章接口
	r.POST("/", middlewares.JWTAuth, middlewares.ValidateJSON[dto.CreateArticleRequest], controllers.Article.Create)
}
