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

	redisKey := rediskey.LoginUserToken(claims.UserID)

	cacheToken, err := config.RedisClient.Get(c.Request.Context(), redisKey).Result()
	if err != nil {
		// redis不存在
		if errors.Is(err, redis.Nil) {
			utils.AbortError(c, http.StatusUnauthorized, "登录状态已失效，请重新登录")
			return
		}
		// redis错误
		utils.AbortError(c, http.StatusInternalServerError, "登录状态校验失败")
		return
	}

	// 和redis中缓存的不一样
	if cacheToken != parts[1] {
		utils.AbortError(c, http.StatusUnauthorized, "登录状态已失效，请重新登录")
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
