package main

import (
	"blog/config"
	"blog/utils/validate"
)

func setup() {
	// 初始化数据库连接
	config.InitPgSqlORM()
	// 初始化 Redis 连接
	config.InitRedis()
	// 注册校验参数
	validate.RegisterValidation()
}
