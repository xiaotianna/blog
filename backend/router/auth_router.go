package router

import (
	"blog/controllers"
	"blog/dto"
	"blog/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthRouter(r *gin.RouterGroup) {
	r.POST("/login", middlewares.ValidateJSON[dto.LoginRequest], controllers.Auth.Login)
	r.POST("/logout")
	r.GET("/me")
}
