package dao

import (
	"blog/config"
	"blog/entities"
	"context"
)

type UserDAO struct{}

var User = UserDAO{}

func (UserDAO) FindByPhone(ctx context.Context, phone string) (*entities.UserEntity, error) {
	var user entities.UserEntity
	err := config.PgDB.WithContext(ctx).Where("phone = ?", phone).First(&user).Error
	if err != nil {
		return nil, err
	}

	// 返回指针是为了方便判断为空
	return &user, nil
}
