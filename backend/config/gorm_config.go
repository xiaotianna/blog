package config

import (
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var PgDB *gorm.DB

func InitPgSqlORM() *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai",
		GlobalConfig.DB.Host,
		GlobalConfig.DB.User,
		GlobalConfig.DB.Password,
		GlobalConfig.DB.DB_Name,
		GlobalConfig.DB.Port,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic(err)
	}
	return db
}

func init() {
	db := InitPgSqlORM()
	sqlDb, err := db.DB()
	if err != nil {
		panic(err)
	}
	defer sqlDb.Close()

	sqlDb.SetMaxIdleConns(10)
	sqlDb.SetMaxOpenConns(100)
	sqlDb.SetConnMaxLifetime(time.Hour)

	// 实体配置
	EntityConfig(db)
	// 初始化账户配置
	SeedConfig(db)
}
