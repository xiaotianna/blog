package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

const (
	defaultPage     = 1
	defaultPageSize = 10
	maxPageSize     = 50
)

func readPagination(c *gin.Context) (int, int) {
	page := readPositiveInt(c.Query("page"), defaultPage)
	pageSize := readPositiveInt(c.Query("pageSize"), defaultPageSize)

	if pageSize > maxPageSize {
		pageSize = maxPageSize
	}

	return page, pageSize
}

func readPositiveInt(value string, fallback int) int {
	num, err := strconv.Atoi(value)
	if err != nil || num < 1 {
		return fallback
	}

	return num
}
