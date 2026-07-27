package middleware

import (
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"github.com/mueangsmart/back-office/backend/pkg/security"
	"gorm.io/gorm"
)

func AuditLogger(db *gorm.DB) fiber.Handler {
	return func(c fiber.Ctx) error {
		// Process request first
		err := c.Next()

		// Only log mutating actions (POST, PUT, PATCH, DELETE) or Auth Login
		method := c.Method()
		path := c.Path()
		if method == "GET" && path != "/api/v1/auth/me" {
			return err
		}

		status := c.Response().StatusCode()
		// Only log successful operations (2xx)
		if status < 200 || status >= 300 {
			return err
		}

		var superAdminID uuid.UUID
		if rawClaims := c.Locals(LocalSuperAdminClaims); rawClaims != nil {
			if claims, ok := rawClaims.(*security.JWTClaims); ok {
				superAdminID = claims.SuperAdminID
			}
		}

		if superAdminID == [16]byte{} {
			return err
		}

		action := method + " " + path
		detailsMap := map[string]interface{}{
			"method":      method,
			"path":        path,
			"status_code": status,
			"user_agent":  c.Get("User-Agent"),
		}
		detailsBytes, _ := json.Marshal(detailsMap)

		auditLog := domain.BoAuditLog{
			Id:           uuid.New(),
			SuperAdminId: superAdminID,
			Action:       action,
			Details:      string(detailsBytes),
			IpAddress:    c.IP(),
			CreatedDate:  time.Now(),
		}

		// Asynchronously save audit log to prevent blocking main HTTP response
		go func(logEntry domain.BoAuditLog) {
			_ = db.Create(&logEntry).Error
		}(auditLog)

		return err
	}
}
