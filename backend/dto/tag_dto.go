package dto

type CreateTagRequest struct {
	Name  string `json:"name" binding:"required,min=1,max=40" message:"required=标签名称不能为空;min=标签名称不能为空;max=标签名称不能超过40个字符"`
	Color string `json:"color"`
}

type UpdateTagRequest struct {
	Name  string `json:"name" binding:"required,min=1,max=40" message:"required=标签名称不能为空;min=标签名称不能为空;max=标签名称不能超过40个字符"`
	Color string `json:"color"`
}
