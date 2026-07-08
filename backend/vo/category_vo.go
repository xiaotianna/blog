package vo

import (
	"time"

	"github.com/google/uuid"
)

type CategoryVO struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Path        string     `json:"path"`
	Description string     `json:"description"`
	ParentID    *uuid.UUID `json:"parentId"`
}

type CategoryListItemVO struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Path        string     `json:"path"`
	Description string     `json:"description"`
	ParentID    *uuid.UUID `json:"parentId"`
}

type CategoryOptionVO struct {
	ID    uuid.UUID `json:"id"`
	Label string    `json:"label"`
	Path  string    `json:"path"`
}

type CategoryCatalogNodeType string

const (
	CategoryCatalogNodeTypeCategory CategoryCatalogNodeType = "category"
	CategoryCatalogNodeTypeArticle  CategoryCatalogNodeType = "article"
)

type CategoryCatalogVO struct {
	ID          uuid.UUID               `json:"id"`
	Type        CategoryCatalogNodeType `json:"type"`
	Title       string                  `json:"title"`
	Slug        string                  `json:"slug"`
	Description string                  `json:"description,omitempty"`
	ParentID    *uuid.UUID              `json:"parentId,omitempty"`
	CategoryID  *uuid.UUID              `json:"categoryId,omitempty"`
	PublishedAt *time.Time              `json:"publishedAt,omitempty"`
	Children    []CategoryCatalogVO     `json:"children,omitempty"`
}
