package controllers

import (
	"blog/dto"
	"blog/middlewares"
	"blog/services"
	"blog/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TagController struct {
	service services.TagService
}

var Tag = TagController{
	service: services.Tag,
}

func (tag TagController) Create(c *gin.Context) {
	ctx := c.Request.Context()
	req := c.MustGet(middlewares.BodyKey).(dto.CreateTagRequest)

	res, err := tag.service.Create(ctx, req)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(c, "新增标签成功", res)
}

func (tag TagController) Update(c *gin.Context) {
	ctx := c.Request.Context()
	req := c.MustGet(middlewares.BodyKey).(dto.UpdateTagRequest)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "标签 ID 不合法")
		return
	}

	res, err := tag.service.Update(ctx, id, req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Error(c, http.StatusNotFound, "标签不存在")
			return
		}

		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(c, "更新标签成功", res)
}

func (tag TagController) Options(c *gin.Context) {
	ctx := c.Request.Context()

	res, err := tag.service.Options(ctx)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, "获取标签选项成功", res)
}

func (tag TagController) Articles(c *gin.Context) {
	ctx := c.Request.Context()
	page, pageSize := readPagination(c)
	_, isAuthenticated := middlewares.CurrentUser(c)

	res, err := tag.service.Articles(ctx, c.Query("name"), isAuthenticated, page, pageSize)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrTagNameRequired), errors.Is(err, services.ErrTagNameTooLong):
			utils.Error(c, http.StatusBadRequest, err.Error())
		case errors.Is(err, gorm.ErrRecordNotFound):
			utils.Error(c, http.StatusNotFound, "标签不存在")
		default:
			utils.Error(c, http.StatusInternalServerError, err.Error())
		}
		return
	}

	utils.Success(c, "获取标签文章成功", res)
}
