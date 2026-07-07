package config

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis() *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%s", GlobalConfig.Redis.Host, GlobalConfig.Redis.Port),
		Password:     GlobalConfig.Redis.Password,
		DB:           GlobalConfig.Redis.DB,
		PoolSize:     20, // 连接池最多多少连接
		MinIdleConns: 5,  // 保持多少空闲连接

		DialTimeout:  5 * time.Second, // 建立 TCP 连接的超时时间
		ReadTimeout:  3 * time.Second, // 读取 Redis 响应的超时时间
		WriteTimeout: 3 * time.Second, // 写入命令到 Redis 的超时时间
		PoolTimeout:  4 * time.Second, // 从连接池获取连接的等待时间
		// 例如：PoolSize 是 20，当前 20 个连接都被占用了，第 21 个请求来了，它会等待可用连接。等超过 4 秒还拿不到连接，就返回超时错误。
	})

	// 超时通知redis关闭
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 所以初始化时通常会主动 Ping 一下，Redis 正常会回PONG，这样就可以判断连接是否成功
	if err := client.Ping(ctx).Err(); err != nil {
		client.Close()
		panic(err)
	}

	RedisClient = client
	return RedisClient
}

func CloseRedis() {
	RedisClient.Close()
}
