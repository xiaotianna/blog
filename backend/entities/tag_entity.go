package entities

type TagEntity struct {
	BaseModel
	Name string `gorm:"size:40;uniqueIndex;not null"`
}

func (TagEntity) TableName() string {
	return "tag"
}
