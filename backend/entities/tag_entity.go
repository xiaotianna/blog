package entities

type TagEntity struct {
	BaseModel
	Name  string `gorm:"size:40;uniqueIndex;not null"`
	Color string `gorm:"size:7;not null;default:'#60a5fa'"`
}

func (TagEntity) TableName() string {
	return "tag"
}
