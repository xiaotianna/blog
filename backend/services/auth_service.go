package services

import (
	"blog/dao"
	"blog/dto"
	"blog/middlewares"
	"blog/utils/jwt"
	"blog/utils/password"
	"blog/vo"
	"context"
	"errors"

	"gorm.io/gorm"
)

type AuthService struct{}

var Auth = AuthService{}

func (AuthService) Login(ctx context.Context, req dto.LoginRequest) (*vo.LoginVO, error) {
	user, err := dao.User.FindByPhone(ctx, req.Phone)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("手机号或密码错误")
		}
		return nil, err
	}

	if !password.VerifyPassword(req.Password, user.Password) {
		return nil, errors.New("手机号或密码错误")
	}

	token, err := jwt.GenerateJWT(middlewares.JWTClaims{
		UserID: user.ID.String(),
		Phone:  user.PhoneNumber,
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
