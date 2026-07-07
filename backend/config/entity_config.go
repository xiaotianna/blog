package config

import (
	"blog/entities"

	"gorm.io/gorm"
)

func EntityConfig(db *gorm.DB) {
	// 设置枚举
	if err := InitEnums(db); err != nil {
		panic(err)
	}

	db.AutoMigrate(
		&entities.UserEntity{},
		&entities.CategoryEntity{},
		&entities.TagEntity{},
		&entities.ArticleEntity{},
	)
}
