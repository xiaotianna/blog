package vo

import (
	"time"

	"github.com/google/uuid"
)

type ArticleVO struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Path        string     `json:"path"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	CategoryID  uuid.UUID  `json:"categoryId"`
	PublishedAt *time.Time `json:"publishedAt"`
}

type ArticleListItemVO struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Path        string     `json:"path"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	CategoryID  uuid.UUID  `json:"categoryId"`
	PublishedAt *time.Time `json:"publishedAt"`
}

type ArticleDetailVO struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Path        string     `json:"path"`
	Description string     `json:"description"`
	Content     string     `json:"content"`
	Status      string     `json:"status"`
	CategoryID  uuid.UUID  `json:"categoryId"`
	PublishedAt *time.Time `json:"publishedAt"`
}
