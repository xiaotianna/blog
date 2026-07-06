package middlewares

import (
	"blog/utils/validate"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const (
	BodyKey  = "body"
	FormKey  = "form"
	QueryKey = "query"
	UriKey   = "uri"
)

type bindFunc func(obj any) error

func ValidateJSON[T any](c *gin.Context) {
	validateBind[T](c, BodyKey, c.ShouldBindJSON)
}

func ValidateQuery[T any](c *gin.Context) {
	validateBind[T](c, QueryKey, c.ShouldBindQuery)
}

func ValidateForm[T any](c *gin.Context) {
	validateBind[T](c, FormKey, func(obj any) error {
		return c.ShouldBindWith(obj, binding.Form)
	})
}

func ValidateUri[T any](c *gin.Context) {
	validateBind[T](c, UriKey, c.ShouldBindUri)
}

func validateBind[T any](c *gin.Context, key string, bind bindFunc) {
	var req T

	if err := bind(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"message": validate.GetValidateMessage(req, err),
		})
		return
	}

	// 避免 controller 再次 bind
	c.Set(key, req)
	c.Next()
}
