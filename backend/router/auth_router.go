package router

import (
	"blog/controllers"
	"blog/dto"
	"blog/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthRouter(r *gin.RouterGroup) {
	// 登录
	r.POST("/login", middlewares.ValidateJSON[dto.LoginRequest], controllers.Auth.Login)
	// 退出登录
	r.POST("/logout", middlewares.JWTAuth, controllers.Auth.Logout)
	// 个人信息
	r.GET("/me")
}
