package router

import (
	"blog/controllers"
	"blog/middlewares"

	"github.com/gin-gonic/gin"
)

func SearchRouter(r *gin.RouterGroup) {
	r.GET("", middlewares.OptionalJWTAuth, controllers.Search.Search)
}
