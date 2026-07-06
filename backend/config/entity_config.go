package config

import (
	"blog/entities"

	"gorm.io/gorm"
)

func EntityConfig(db *gorm.DB) {
	db.AutoMigrate(&entities.UserEntity{})
}
