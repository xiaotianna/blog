package main

import (
	"blog/config"
	"blog/router"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	setup()
	router.InitRouter(r)
	r.Run(config.GlobalConfig.App.Port)
}
