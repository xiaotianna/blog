package entities

type ArticleStatus string

const (
	ArticleStatusPublish ArticleStatus = "publish" // 已发布
	ArticleStatusPrivate ArticleStatus = "private" // 私有
	ArticleStatusDraft   ArticleStatus = "draft"   // 草稿
)

type ArticleEntity struct {
	BaseModel
	Title       string `gorm:"default:'未命名'"`
	Description string
	Status      ArticleStatus `gorm:"type:article_status;not null;default:'draft'"`
}
