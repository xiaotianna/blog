package validate

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

var slugRegexp = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func SlugValidation(fl validator.FieldLevel) bool {
	slug := fl.Field().String()
	return slugRegexp.MatchString(slug)
}
