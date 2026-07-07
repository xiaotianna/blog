package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ResponseJSON struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

func JSON(c *gin.Context, httpCode int, code int, message string, data any) {
	c.JSON(httpCode, ResponseJSON{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

func Success(c *gin.Context, message string, data any) {
	JSON(c, http.StatusOK, http.StatusOK, message, data)
}

func Error(c *gin.Context, httpCode int, message string) {
	JSON(c, httpCode, httpCode, message, nil)
}

// 用于中间件抛出异常
func AbortError(c *gin.Context, httpCode int, message string) {
	c.AbortWithStatusJSON(httpCode, ResponseJSON{
		Code:    httpCode,
		Message: message,
	})
}
