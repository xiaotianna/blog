package dto

type LoginRequest struct {
	Phone    string `json:"phone" binding:"required,cn_mobile" message:"required=手机号不能为空;cn_mobile=手机号不合法"`
	Password string `json:"password" binding:"required" message:"required=密码不能为空"`
}
