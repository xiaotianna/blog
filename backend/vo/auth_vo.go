package vo

type LoginUserVO struct {
	ID    string `json:"id"`
	Phone string `json:"phone"`
}

type LoginVO struct {
	Token string      `json:"token"`
	User  LoginUserVO `json:"user"`
}

type MeVO struct {
	ID    string `json:"id"`
	Phone string `json:"phone"`
}
