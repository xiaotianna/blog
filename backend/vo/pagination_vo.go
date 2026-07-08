package vo

type PaginationVO struct {
	Page            int   `json:"page"`
	PageSize        int   `json:"pageSize"`
	Total           int64 `json:"total"`
	TotalPages      int   `json:"totalPages"`
	HasPreviousPage bool  `json:"hasPreviousPage"`
	HasNextPage     bool  `json:"hasNextPage"`
}

type PageVO[T any] struct {
	Items      []T          `json:"items"`
	Pagination PaginationVO `json:"pagination"`
}

func NewPaginationVO(page int, pageSize int, total int64, totalPages int) PaginationVO {
	return PaginationVO{
		Page:            page,
		PageSize:        pageSize,
		Total:           total,
		TotalPages:      totalPages,
		HasPreviousPage: page > 1,
		HasNextPage:     page < totalPages,
	}
}
