package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort     string
	AppEnv      string
	DatabaseDSN string
	JWTSecret   string
}

func LoadConfig() (*Config, error) {
	_ = godotenv.Load()

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = "development"
	}

	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=mueangsmart port=5432 sslmode=disable"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super-secret-mueangsmart-backoffice-key"
	}

	return &Config{
		AppPort:     port,
		AppEnv:      appEnv,
		DatabaseDSN: dsn,
		JWTSecret:   jwtSecret,
	}, nil
}
