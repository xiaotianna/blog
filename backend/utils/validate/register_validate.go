package validate

import (
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

// 注册结构体binding tag自定义字段
func RegisterValidation() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// 手机号验证
		v.RegisterValidation("cn_mobile", CNMobileValidation)
		// 短路径验证
		v.RegisterValidation("slug", SlugValidation)
	}
}
