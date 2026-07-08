package vo

import (
	"time"

	"github.com/google/uuid"
)

type ArticleVO struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	CategoryID  uuid.UUID  `json:"categoryId"`
	PublishedAt *time.Time `json:"publishedAt"`
}
