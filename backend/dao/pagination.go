package dao

type PageResult[T any] struct {
	Items      []T
	Page       int
	PageSize   int
	Total      int64
	TotalPages int
}

func NewPageResult[T any](items []T, page int, pageSize int, total int64) PageResult[T] {
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))
	if totalPages < 1 {
		totalPages = 1
	}

	return PageResult[T]{
		Items:      items,
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: totalPages,
	}
}

func Offset(page int, pageSize int) int {
	return (page - 1) * pageSize
}
