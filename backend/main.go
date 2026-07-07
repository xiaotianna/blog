package main

import (
	"blog/config"
	"blog/router"

	"github.com/gin-gonic/gin"
)

func main() {
	setup()
	defer config.CloseRedis()
	defer config.ClosePgSqlORM()

	r := gin.Default()

	router.InitRouter(r)
	r.Run(config.GlobalConfig.App.Port)
}
