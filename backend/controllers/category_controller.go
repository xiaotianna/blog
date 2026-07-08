package controllers

import (
	"blog/dto"
	"blog/middlewares"
	"blog/services"
	"blog/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

func (category CategoryController) Detail(c *gin.Context) {
	ctx := c.Request.Context()
	path := c.Query("path")

	res, err := category.service.Detail(ctx, path)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Error(c, http.StatusNotFound, "目录不存在")
			return
		}

		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, "获取目录详情成功", res)
}

func (category CategoryController) Children(c *gin.Context) {
	ctx := c.Request.Context()
	page, pageSize := readPagination(c)

	res, err := category.service.Children(ctx, c.Query("parentPath"), page, pageSize)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Error(c, http.StatusNotFound, "父级目录不存在")
			return
		}

		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, "获取目录列表成功", res)
}

func (category CategoryController) Options(c *gin.Context) {
	ctx := c.Request.Context()

	res, err := category.service.Options(ctx)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, "获取目录选项成功", res)
}
