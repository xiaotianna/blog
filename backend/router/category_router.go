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
}
