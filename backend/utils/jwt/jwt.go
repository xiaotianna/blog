package jwt

import (
	"blog/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(config.GlobalConfig.JWT.SecretKey)

const tokenExpireDuration = 24 * time.Hour

func GenerateJWT(payload map[string]any) (string, error) {
	payload["exp"] = time.Now().Add(tokenExpireDuration).Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(payload))
	return token.SignedString(jwtSecret)
}

func VerifyJWT(tokenString string) bool {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return jwtSecret, nil
	})

	return err == nil && token.Valid
}
