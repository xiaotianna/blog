package dto

import "github.com/google/uuid"

type CreateArticleRequest struct {
	CategoryID  uuid.UUID `json:"categoryId" binding:"required" message:"required=文章所属目录不能为空"`
	Title       string    `json:"title" binding:"required,min=1,max=120" message:"required=文章标题不能为空;min=文章标题不能为空;max=文章标题不能超过120个字符"`
	Slug        string    `json:"slug" binding:"required,min=1,max=160,slug" message:"required=文章标识不能为空;min=文章标识不能为空;max=文章标识不能超过160个字符;slug=文章 slug 只能包含小写字母、数字和短横线"`
	Description string    `json:"description" binding:"max=300" message:"max=文章摘要不能超过300个字符"`
}

type UpdateArticleRequest struct {
	Title       string      `json:"title" binding:"required,min=1,max=120" message:"required=文章标题不能为空;min=文章标题不能为空;max=文章标题不能超过120个字符"`
	Slug        string      `json:"slug" binding:"required,min=1,max=160,slug" message:"required=文章标识不能为空;min=文章标识不能为空;max=文章标识不能超过160个字符;slug=文章 slug 只能包含小写字母、数字和短横线"`
	Description string      `json:"description" binding:"max=300" message:"max=文章摘要不能超过300个字符"`
	Content     string      `json:"content"`
	Status      string      `json:"status" binding:"required,oneof=publish private draft" message:"required=文章状态不能为空;oneof=文章状态不合法"`
	TagIDs      []uuid.UUID `json:"tagIds"`
}

type MoveArticleRequest struct {
	CategoryID uuid.UUID `json:"categoryId" binding:"required" message:"required=文章所属目录不能为空"`
}
