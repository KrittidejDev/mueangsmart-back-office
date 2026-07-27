package config

import (
	"log"
	"time"

	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDatabase(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	// High Performance & Connection Pool Safety
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	// Safe Migration: ONLY AutoMigrate Isolated Back-Office Tables with "Bo" Prefix
	err = db.AutoMigrate(
		&domain.BoSuperAdmin{},
		&domain.BoRole{},
		&domain.BoPermission{},
		&domain.BoAuditLog{},
	)
	if err != nil {
		log.Printf("Warning: Failed to auto-migrate isolated Back-Office tables: %v", err)
	} else {
		log.Println("Successfully auto-migrated isolated Back-Office tables (BoSuperAdmins, BoRoles, BoPermissions, BoAuditLogs)")
	}

	return db, nil
}
