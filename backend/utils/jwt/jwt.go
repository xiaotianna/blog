package jwt

import (
	"blog/config"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(config.GlobalConfig.JWT.SecretKey)

func GenerateJWT(payload map[string]any) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(payload))
	return token.SignedString(jwtSecret)
}

func VerifyJWT(tokenString string) bool {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return jwtSecret, nil
	})

	return err == nil && token.Valid
}
