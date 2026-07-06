package validate

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

func CNMobileValidation(fl validator.FieldLevel) bool {
	phone := fl.Field().String()
	matched, _ := regexp.MatchString(`^1[3-9]\d{9}$`, phone)
	return matched
}
