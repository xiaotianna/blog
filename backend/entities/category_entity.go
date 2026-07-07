package entities

import "github.com/google/uuid"

type CategoryEntity struct {
	BaseModel
	Name        string `gorm:"size:60;not null"`
	Path        string `gorm:"size:300;uniqueIndex;not null"`
	Description string `gorm:"size:300"`

	ParentID *uuid.UUID       // 最外层根目录为nil，数据库为null
	Parent   *CategoryEntity  `gorm:"foreignKey:ParentID"`
	Children []CategoryEntity `gorm:"foreignKey:ParentID"`
}
