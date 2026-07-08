package entities

import "gorm.io/gorm"

type UserEntity struct {
	BaseModel
	Username    string
	PhoneNumber string `gorm:"column:phone;unique;not null;"`
	Password    string `gorm:"not null;"`
	Avatar      string `gorm:"size:500;default:'/me.png'"`
}

func (u *UserEntity) BeforeCreate(tx *gorm.DB) error {
	u.Username = "user_" + u.PhoneNumber
	return nil
}

func (UserEntity) TableName() string {
	return "user"
}
