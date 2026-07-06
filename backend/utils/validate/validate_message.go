package validate

import (
	"errors"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

// 获取校验参数的message（需要与binding对应）
/*
type LoginRequest struct {
	Phone    string `json:"phone" binding:"required,cn_mobile" message:"required=手机号不能为空;cn_mobile=手机号不合法"`
	Password string `json:"password" binding:"required,min=6,max=32" message:"required=请输入密码;min=密码不能少于 6 位;max=密码不能超过 32 位"`
}
binding:"required,cn_mobile"
自定义解析：message:"required=手机号不能为空;cn_mobile=手机号不合法"

使用：getValidateMessage(LoginRequest, err)
*/
func GetValidateMessage(dto any, err error) string {
	var validateErrs validator.ValidationErrors
	/** 判断 err 这个错误，能不能转换成 validator.ValidationErrors 类型
		如果可以，validateErrs就会被赋值：
	for _, fieldErr := range validateErrs {
		fieldErr.StructField() // Password
		fieldErr.Tag()         // required / min / max
	}
	*/
	if !errors.As(err, &validateErrs) {
		return "参数错误"
	}

	dtoType := reflect.TypeOf(dto)
	// 传进来的 dto 到底是结构体，还是结构体指针（reflect.Ptr为指针）
	if dtoType.Kind() == reflect.Ptr {
		// Elem() 表示“取指针指向的那个真实类型”
		dtoType = dtoType.Elem()
	}

	for _, fieldErr := range validateErrs {
		field, ok := dtoType.FieldByName(fieldErr.StructField())
		if !ok {
			continue
		}

		if message := parseMessage(field.Tag.Get("message"), fieldErr.Tag()); message != "" {
			return message
		}
	}

	return "参数错误"
}

// 解析自定义tag的message
func parseMessage(messageTag string, validateTag string) string {
	for _, item := range strings.Split(messageTag, ";") {
		parts := strings.SplitN(strings.TrimSpace(item), "=", 2)
		if len(parts) != 2 {
			continue
		}

		if parts[0] == validateTag {
			return parts[1]
		}
	}

	return ""
}
