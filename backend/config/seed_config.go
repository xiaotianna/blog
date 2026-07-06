package config

import (
	"blog/entities"
	"blog/utils/password"

	"gorm.io/gorm"
)

func SeedConfig(db *gorm.DB) {
	var count int64

	db.Model(&entities.UserEntity{}).
		Where("phone = ?", GlobalConfig.Account.Phone).
		Count(&count)

	if count > 0 {
		return
	}

	hashedPassword, _ := password.HashPassword(GlobalConfig.Account.Password)

	db.Create(&entities.UserEntity{
		PhoneNumber: GlobalConfig.Account.Phone,
		Password:    hashedPassword,
	})
}
