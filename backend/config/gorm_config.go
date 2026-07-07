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

	sqlDB, err := db.DB()
	if err != nil {
		panic(err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// 实体配置
	EntityConfig(db)
	// 初始化账户配置
	SeedConfig(db)

	PgDB = db
	return PgDB
}

func ClosePgSqlORM() {
	sqlDB, err := PgDB.DB()
	if err != nil {
		panic(err)
	}

	sqlDB.Close()
}
