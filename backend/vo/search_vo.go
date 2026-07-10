package vo

import "github.com/google/uuid"

type SearchResultType string

const (
	SearchResultTypeDirectory SearchResultType = "directory"
	SearchResultTypeArticle   SearchResultType = "article"
)

type SearchResultVO struct {
	ID           uuid.UUID        `json:"id"`
	Type         SearchResultType `json:"type"`
	Title        string           `json:"title"`
	Path         string           `json:"path"`
	TitleMatched bool             `json:"titleMatched"`
	Description  string           `json:"description,omitempty"`
	Tags         []TagVO          `json:"tags,omitempty"`
	Content      string           `json:"content,omitempty"`
}

type SearchResponseVO struct {
	Items []SearchResultVO `json:"items"`
}
