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
	r.StaticFile("/", "./public/index.html")
	r.Static("/uploads", "./uploads")

	router.InitRouter(r)
	r.Run(config.GlobalConfig.App.Port)
}
