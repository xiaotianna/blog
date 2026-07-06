package controllers

import (
	"blog/dto"
	"blog/middlewares"
	"blog/services"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	service services.AuthService
}

var Auth = AuthController{
	// 依赖注入
	service: services.Auth,
}

// 给AuthController结构体绑定方法
func (auth AuthController) Login(c *gin.Context) {
	req := c.MustGet(middlewares.BodyKey).(dto.LoginRequest)
	_, _ = auth.service.Login(req)
}

func (AuthController) Logout(c *gin.Context) {

}
