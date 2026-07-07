package entities

import (
	"time"

	"github.com/google/uuid"
)

type ArticleStatus string

const (
	ArticleStatusPublish ArticleStatus = "publish" // 已发布
	ArticleStatusPrivate ArticleStatus = "private" // 私有
	ArticleStatusDraft   ArticleStatus = "draft"   // 草稿
)

type ArticleEntity struct {
	BaseModel
	Title       string `gorm:"default:'未命名'"`
	Slug        string `gorm:"size:160;uniqueIndex;not null"` // 短标识
	Description string
	Content     string        `gorm:"type:text"`
	Status      ArticleStatus `gorm:"type:article_status;not null;default:'draft'"`
	Cover       string        `gorm:"size:500"` // 封面图
	PublishedAt *time.Time    // 采用指针表示，因为time.Time会给一个零值，而指针的话零值是nil表示空

	CategoryID *uuid.UUID      // 分类目录id，指针也是为了表示零值
	Category   *CategoryEntity `gorm:"foreignKey:CategoryID"`

	Tags []TagEntity `gorm:"many2many:article_tags;"`
}
