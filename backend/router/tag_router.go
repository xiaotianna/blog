package router

import (
	"blog/controllers"
	"blog/dto"
	"blog/middlewares"

	"github.com/gin-gonic/gin"
)

func TagRouter(r *gin.RouterGroup) {
	// 新增标签接口
	r.POST("/", middlewares.JWTAuth, middlewares.ValidateJSON[dto.CreateTagRequest], controllers.Tag.Create)
	// 更新标签接口
	r.PATCH("/:id", middlewares.JWTAuth, middlewares.ValidateJSON[dto.UpdateTagRequest], controllers.Tag.Update)
	// 获取标签选择项接口
	r.GET("/options", controllers.Tag.Options)
	// 分页获取标签下的文章接口
	r.GET("/articles", middlewares.OptionalJWTAuth, controllers.Tag.Articles)
}
