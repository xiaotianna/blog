package rediskey

import "fmt"

func LoginUserToken(userID string) string {
	return fmt.Sprintf("login:user:%s", userID)
}
