package middlewares

import (
	"blog/config"
	"blog/utils"
	"blog/utils/jwt"
	"blog/utils/rediskey"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

const TokenUserInfoKey = "token_user_info"

type JWTClaims struct {
	UserID string `json:"user_id"`
	Phone  string `json:"phone"`
}

func JWTAuth(c *gin.Context) {
	claims, message, status := authenticateJWT(c)
	if status != http.StatusOK {
		utils.AbortError(c, status, message)
		return
	}

	c.Set(TokenUserInfoKey, claims)
	c.Next()
}

func OptionalJWTAuth(c *gin.Context) {
	claims, _, status := authenticateJWT(c)
	if status == http.StatusOK {
		c.Set(TokenUserInfoKey, claims)
	}

	c.Next()
}

func authenticateJWT(c *gin.Context) (JWTClaims, string, int) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return JWTClaims{}, "请先登录", http.StatusUnauthorized
	}

	parts := strings.Fields(authHeader)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return JWTClaims{}, "token格式错误", http.StatusUnauthorized
	}

	ok, claims := jwt.VerifyJWT[JWTClaims](parts[1])
	if !ok {
		return JWTClaims{}, "token无效或已过期", http.StatusUnauthorized
	}

	redisKey := rediskey.LoginUserToken(claims.UserID)

	cacheToken, err := config.RedisClient.Get(c.Request.Context(), redisKey).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return JWTClaims{}, "登录状态已失效，请重新登录", http.StatusUnauthorized
		}

		return JWTClaims{}, "登录状态校验失败", http.StatusInternalServerError
	}

	if cacheToken != parts[1] {
		return JWTClaims{}, "登录状态已失效，请重新登录", http.StatusUnauthorized
	}

	return claims, "", http.StatusOK
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
