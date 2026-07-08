package services

import (
	"blog/config"
	"blog/dao"
	"blog/dto"
	"blog/middlewares"
	"blog/utils/jwt"
	"blog/utils/password"
	"blog/utils/rediskey"
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

	// 存redis
	redisKey := rediskey.LoginUserToken(user.ID.String())

	if err := config.RedisClient.Set(ctx, redisKey, token, jwt.TokenExpireDuration).Err(); err != nil {
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

func (AuthService) Logout(ctx context.Context, userID string) error {
	rediskey := rediskey.LoginUserToken(userID)

	if err := config.RedisClient.Del(ctx, rediskey).Err(); err != nil {
		return err
	}
	return nil
}
