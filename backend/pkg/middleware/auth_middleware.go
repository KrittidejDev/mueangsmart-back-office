package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"github.com/mueangsmart/back-office/backend/pkg/security"
)

const (
	LocalSuperAdminClaims = "superadmin_claims"
)

func AuthGuard(jwtSecret string) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "missing authorization header",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid authorization header format",
			})
		}

		claims, err := security.ValidateSuperAdminToken(parts[1], jwtSecret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		c.Locals(LocalSuperAdminClaims, claims)
		return c.Next()
	}
}

func RequirePermission(roleRepo domain.RoleRepository, resource, action string) fiber.Handler {
	return func(c fiber.Ctx) error {
		rawClaims := c.Locals(LocalSuperAdminClaims)
		claims, ok := rawClaims.(*security.JWTClaims)
		if !ok || claims == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "unauthorized access context")
		}

		role, err := roleRepo.FindByID(c.Context(), claims.RoleID)
		if err == nil && role != nil {
			if role.Name == "SuperAdmin" {
				return c.Next()
			}
			if role.Name == "Admin" && (resource == "City" || resource == "Module") {
				return c.Next()
			}
		}

		hasPerm, err := roleRepo.HasPermission(c.Context(), claims.RoleID, resource, action)
		if err != nil || !hasPerm {
			return fiber.NewError(fiber.StatusForbidden, "insufficient permissions for resource: "+resource+" action: "+action)
		}

		return c.Next()
	}
}
