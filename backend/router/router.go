package router

import (
	"github.com/gin-gonic/gin"
)

type RouterGroupFunc func(*gin.RouterGroup)

func Use(r *gin.Engine, path string, fn RouterGroupFunc) {
	fn(r.Group(path))
}

func InitRouter(r *gin.Engine) {
	Use(r, "/auth", AuthRouter)
	Use(r, "/article", ArticleRouter)
	Use(r, "/category", CategoryRouter)
	Use(r, "/tag", TagRouter)
	Use(r, "/search", SearchRouter)
}
