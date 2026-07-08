package router

import (
	"blog/controllers"
	"blog/dto"
	"blog/middlewares"

	"github.com/gin-gonic/gin"
)

func CategoryRouter(r *gin.RouterGroup) {
	// 新增目录接口
	r.POST("/", middlewares.JWTAuth, middlewares.ValidateJSON[dto.CreateCategoryRequest], controllers.Category.Create)
	// 获取目录详情接口
	r.GET("/detail", controllers.Category.Detail)
	// 分页获取当前层子目录接口
	r.GET("/children", controllers.Category.Children)
	// 获取目录选择项接口
	r.GET("/options", controllers.Category.Options)
}
