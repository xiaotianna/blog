package controllers

import (
	"blog/dto"
	"blog/middlewares"
	"blog/services"
	"blog/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CategoryController struct {
	service services.CategoryService
}

var Category = CategoryController{
	service: services.Category,
}

func (category CategoryController) Create(c *gin.Context) {
	ctx := c.Request.Context()
	req := c.MustGet(middlewares.BodyKey).(dto.CreateCategoryRequest)

	res, err := category.service.Create(ctx, req)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(c, "新增目录成功", res)
}

func (category CategoryController) Catalog(c *gin.Context) {
	ctx := c.Request.Context()

	res, err := category.service.Catalog(ctx)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, "获取目录内容成功", res)
}
