package config

import (
	"log"

	"github.com/spf13/viper"
)

type DB struct {
	Host     string
	Port     string
	User     string
	Password string
	DB_Name  string
}

type Redis struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type Account struct {
	Phone    string
	Password string
}

type Config struct {
	App struct {
		Port string
	}
	DB      DB
	Redis   Redis
	Account Account
	JWT     struct {
		SecretKey string `mapstructure:"secret_key"` // 告诉viper序列化的字段key
	}
}

var GlobalConfig *Config

func init() {
	viper.SetConfigName("config")
	// 设置配置文件的类型
	viper.SetConfigType("yml")
	// 添加配置文件的路径
	viper.AddConfigPath("./")
	// 按前面配置好的路径、文件名、类型去查找，并把配置内容加载到 Viper 里
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config: %v", err)
	}

	GlobalConfig = &Config{}
	if err := viper.Unmarshal(GlobalConfig); err != nil {
		log.Fatalf("Error unmarshalling config: %v", err)
	}
}
