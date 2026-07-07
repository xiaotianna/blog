package services

import (
	"blog/dao"
	"blog/dto"
	"blog/utils/jwt"
	"blog/utils/password"
	"blog/vo"
	"errors"

	"gorm.io/gorm"
)

type AuthService struct{}

var Auth = AuthService{}

func (AuthService) Login(req dto.LoginRequest) (*vo.LoginVO, error) {
	user, err := dao.User.FindByPhone(req.Phone)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("手机号或密码错误")
		}
		return nil, err
	}

	if !password.VerifyPassword(req.Password, user.Password) {
		return nil, errors.New("手机号或密码错误")
	}

	token, err := jwt.GenerateJWT(map[string]any{
		"user_id": user.ID.String(),
		"phone":   user.PhoneNumber,
	})

	if err != nil {
		return nil, err
	}

	return &vo.LoginVO{
		Token: token,
		User: vo.LoginUserVO{
			ID:    user.ID.String(),
			Phone: user.PhoneNumber,
		},
	}, nil
}
