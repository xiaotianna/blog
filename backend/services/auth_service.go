package services

import "blog/dto"

type AuthService struct{}

var Auth = AuthService{}

func (AuthService) Login(req dto.LoginRequest) (string, error) {
	return "", nil
}
