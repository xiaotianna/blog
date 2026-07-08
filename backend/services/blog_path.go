package services

import "strings"

func toStoragePath(value string) string {
	path := strings.Trim(value, "/")
	if path == "" {
		return ""
	}

	return "/" + path
}

func toPublicPath(value string) string {
	return strings.Trim(value, "/")
}
