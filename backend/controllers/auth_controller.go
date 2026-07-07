package controllers

import (
	"blog/dto"
	"blog/middlewares"
	"blog/services"
	"blog/utils"
	"net/http"

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
	res, err := auth.service.Login(req)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}
	utils.Success(c, "登录成功", res)
}

func (AuthController) Logout(c *gin.Context) {

}
