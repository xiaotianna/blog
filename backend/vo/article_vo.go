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
	Cover       string     `json:"cover"`
	Status      string     `json:"status"`
	CategoryID  uuid.UUID  `json:"categoryId"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	PublishedAt *time.Time `json:"publishedAt"`
	Tags        []TagVO    `json:"tags"`
}

type ArticleListItemVO struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Path        string     `json:"path"`
	Description string     `json:"description"`
	Cover       string     `json:"cover"`
	Status      string     `json:"status"`
	CategoryID  uuid.UUID  `json:"categoryId"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	PublishedAt *time.Time `json:"publishedAt"`
	Tags        []TagVO    `json:"tags"`
}

type ArticleDetailVO struct {
	ID          uuid.UUID  `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Path        string     `json:"path"`
	Description string     `json:"description"`
	Cover       string     `json:"cover"`
	Content     string     `json:"content"`
	Status      string     `json:"status"`
	CategoryID  uuid.UUID  `json:"categoryId"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	PublishedAt *time.Time `json:"publishedAt"`
	Tags        []TagVO    `json:"tags"`
}

type ArticleImageVO struct {
	URL string `json:"url"`
}

type TagVO struct {
	ID    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Color string    `json:"color"`
}
