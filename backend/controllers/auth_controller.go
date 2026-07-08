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
	// 用于接收停止请求的，可以直接用于gorm，如果前端中断请求，gorm可以监听到ctx.Done()来关闭连接的
	ctx := c.Request.Context()
	req := c.MustGet(middlewares.BodyKey).(dto.LoginRequest)
	res, err := auth.service.Login(ctx, req)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}
	utils.Success(c, "登录成功", res)
}

func (auth AuthController) Logout(c *gin.Context) {
	ctx := c.Request.Context()
	userID, ok := middlewares.CurrentUserID(c)
	if !ok {
		utils.Error(c, http.StatusUnauthorized, "请先登录")
		return
	}

	if err := auth.service.Logout(ctx, userID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "退出登录失败")
		return
	}

	utils.Success(c, "退出登录成功", nil)
}
