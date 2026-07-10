package controllers

import (
	"blog/middlewares"
	"blog/services"
	"blog/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SearchController struct {
	service services.SearchService
}

var Search = SearchController{service: services.Search}

func (search SearchController) Search(c *gin.Context) {
	ctx := c.Request.Context()
	_, isAuthenticated := middlewares.CurrentUser(c)

	res, err := search.service.Search(ctx, c.Query("q"), isAuthenticated)
	if err != nil {
		if errors.Is(err, services.ErrSearchQueryTooLong) {
			utils.Error(c, http.StatusBadRequest, err.Error())
			return
		}

		utils.Error(c, http.StatusInternalServerError, "搜索服务暂时不可用，请稍后重试")
		return
	}

	utils.Success(c, "搜索成功", res)
}
