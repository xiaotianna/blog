package vo

import "github.com/google/uuid"

type CategoryVO struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Path        string     `json:"path"`
	Description string     `json:"description"`
	ParentID    *uuid.UUID `json:"parentId"`
}
