package services

import (
	"blog/config"
	"blog/dto"
	"blog/entities"
	"blog/utils/jwt"
	"blog/utils/password"
	"errors"

	"gorm.io/gorm"
)

type AuthService struct{}

var Auth = AuthService{}

func (AuthService) Login(req dto.LoginRequest) (string, error) {
	var user entities.UserEntity
	res := config.PgDB.Where("phone = ?", req.Phone).First(&user)
	if err := res.Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", errors.New("手机号或密码错误")
		}
		return "", err
	}

	if !password.VerifyPassword(req.Password, user.Password) {
		return "", errors.New("手机号或密码错误")
	}

	token, err := jwt.GenerateJWT(map[string]any{
		"user_id": user.ID.String(),
		"phone":   user.PhoneNumber,
	})

	if err != nil {
		return "", err
	}

	return token, nil
}
