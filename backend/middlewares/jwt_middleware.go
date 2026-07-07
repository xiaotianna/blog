package middlewares

import (
	"blog/utils"
	"blog/utils/jwt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const TokenUserInfoKey = "token_user_info"

type JWTClaims struct {
	UserID string `json:"user_id"`
	Phone  string `json:"phone"`
}

func JWTAuth(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		utils.AbortError(c, http.StatusUnauthorized, "请先登录")
		return
	}

	parts := strings.Fields(authHeader)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		utils.AbortError(c, http.StatusUnauthorized, "token格式错误")
		return
	}

	ok, claims := jwt.VerifyJWT[JWTClaims](parts[1])
	if !ok {
		utils.AbortError(c, http.StatusUnauthorized, "token无效或已过期")
		return
	}

	c.Set(TokenUserInfoKey, claims)
	c.Next()
}

func CurrentUser(c *gin.Context) (JWTClaims, bool) {
	claims, ok := c.Get(TokenUserInfoKey)
	if !ok {
		return JWTClaims{}, false
	}

	user, ok := claims.(JWTClaims)
	return user, ok
}

func CurrentUserID(c *gin.Context) (string, bool) {
	user, ok := CurrentUser(c)
	if !ok {
		return "", false
	}

	return user.UserID, true
}
