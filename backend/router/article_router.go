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
	// 更新文章接口
	r.PATCH("/:id", middlewares.JWTAuth, middlewares.ValidateJSON[dto.UpdateArticleRequest], controllers.Article.Update)
	// 更新文章封面接口
	r.PATCH("/:id/cover", middlewares.JWTAuth, controllers.Article.UploadCover)
	// 上传文章内容图片接口
	r.POST("/:id/assets/images", middlewares.JWTAuth, controllers.Article.UploadImage)
	// 删除文章封面接口
	r.DELETE("/:id/cover", middlewares.JWTAuth, controllers.Article.DeleteCover)
	// 删除文章接口
	r.DELETE("/:id", middlewares.JWTAuth, controllers.Article.Delete)
	// 移动文章接口
	r.PATCH("/:id/move", middlewares.JWTAuth, middlewares.ValidateJSON[dto.MoveArticleRequest], controllers.Article.Move)
	// 分页获取文章接口
	r.GET("/list", middlewares.OptionalJWTAuth, controllers.Article.List)
	// 获取文章详情接口
	r.GET("/detail", middlewares.OptionalJWTAuth, controllers.Article.Detail)
	// 根据 ID 获取文章详情接口
	r.GET("/by-id/:id", middlewares.JWTAuth, controllers.Article.DetailByID)
}
