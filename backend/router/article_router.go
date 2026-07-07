package router

import (
	"blog/middlewares"

	"github.com/gin-gonic/gin"
)

func ArticleRouter(r *gin.RouterGroup) {
	// 新增文件接口
	r.POST("/", middlewares.JWTAuth)
}
