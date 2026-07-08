package dto

import "github.com/google/uuid"

type CreateCategoryRequest struct {
	Name        string     `json:"name" binding:"required,min=1,max=60" message:"required=目录名称不能为空;min=目录名称不能为空;max=目录名称不能超过60个字符"`
	Slug        string     `json:"slug" binding:"required,min=1,max=80,slug" message:"required=目录标识不能为空;min=目录标识不能为空;max=目录标识不能超过80个字符;slug=目录 slug 只能包含小写字母、数字和短横线"`
	Description string     `json:"description" binding:"max=300" message:"max=目录描述不能超过300个字符"`
	ParentID    *uuid.UUID `json:"parentId"` // 根目录为nil
}

type UpdateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=60" message:"required=目录名称不能为空;min=目录名称不能为空;max=目录名称不能超过60个字符"`
	Slug        string `json:"slug" binding:"required,min=1,max=80,slug" message:"required=目录标识不能为空;min=目录标识不能为空;max=目录标识不能超过80个字符;slug=目录 slug 只能包含小写字母、数字和短横线"`
	Description string `json:"description" binding:"max=300" message:"max=目录描述不能超过300个字符"`
}

type MoveCategoryRequest struct {
	ParentID *uuid.UUID `json:"parentId"` // 根目录为nil
}
