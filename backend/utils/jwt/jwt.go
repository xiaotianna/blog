package jwt

import (
	"blog/config"
	"encoding/json"
	"errors"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(config.GlobalConfig.JWT.SecretKey)

const tokenExpireDuration = 24 * time.Hour

func GenerateJWT(payload any) (string, error) {
	claims, err := toMapClaims(payload)
	if err != nil {
		return "", err
	}

	claims["exp"] = time.Now().Add(tokenExpireDuration).Unix()
	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func VerifyJWT[T any](tokenString string) (bool, T) {
	var result T
	claims := jwtlib.MapClaims{}

	token, err := jwtlib.ParseWithClaims(tokenString, claims, func(token *jwtlib.Token) (any, error) {
		return jwtSecret, nil
	}, jwtlib.WithValidMethods([]string{jwtlib.SigningMethodHS256.Alg()}))
	if err != nil {
		return false, result
	}
	if !token.Valid {
		return false, result
	}

	data, err := json.Marshal(claims)
	if err != nil {
		return false, result
	}

	if err := json.Unmarshal(data, &result); err != nil {
		return false, result
	}

	return true, result
}

func toMapClaims(payload any) (jwtlib.MapClaims, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	var claims jwtlib.MapClaims
	if err := json.Unmarshal(data, &claims); err != nil {
		return nil, err
	}
	if claims == nil {
		return nil, errors.New("jwt payload must be a JSON object")
	}

	return claims, nil
}
