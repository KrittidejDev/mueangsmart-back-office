package handler_test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/mueangsmart/back-office/backend/internal/handler"
	"github.com/mueangsmart/back-office/backend/internal/repository"
	"github.com/mueangsmart/back-office/backend/internal/usecase"
	"github.com/mueangsmart/back-office/backend/pkg/middleware"
	"github.com/mueangsmart/back-office/backend/pkg/security"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestExecutiveModuleLock(t *testing.T) {
	_ = godotenv.Load("../../.env")
	dsn := os.Getenv("DATABASE_DSN")
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your_super_secret_jwt_key_here_change_in_production"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Skip("PostgreSQL DB not available for unit test")
	}

	roleRepo := repository.NewRoleRepository(db)
	moduleMgmtRepo := repository.NewModuleManagementRepository(db)
	moduleMgmtUseCase := usecase.NewModuleManagementUseCase(moduleMgmtRepo)
	moduleMgmtHandler := handler.NewModuleManagementHandler(moduleMgmtUseCase)

	app := fiber.New()
	api := app.Group("/api/v1")
	modulesGroup := api.Group("/modules", middleware.AuthGuard(secret))
	moduleMgmtGroup := modulesGroup.Group("/management", middleware.RequirePermission(roleRepo, "Module", "Manage"))
	moduleMgmtGroup.Get("/", moduleMgmtHandler.GetAllModules)

	// 1. Executive User
	execUserID := uuid.New()
	execRoleID := uuid.MustParse("42f61beb-487c-4286-af28-b7b33eceed28") // Executive
	execToken, _ := security.GenerateSuperAdminToken(execUserID, "ex1", execRoleID, secret, time.Hour)

	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/modules/management", nil)
	req1.Header.Set("Authorization", "Bearer "+execToken)
	resp1, err := app.Test(req1)
	if err != nil {
		t.Fatalf("test request failed: %v", err)
	}

	if resp1.StatusCode != http.StatusForbidden {
		t.Errorf("Expected Executive to get 403 Forbidden, got %d", resp1.StatusCode)
	}

	// 2. Admin User (MUST be 200 OK)
	adminUserID := uuid.New()
	adminRoleID := uuid.MustParse("91e46e73-48b1-4188-8e9c-8fae2cb6ca22") // Admin
	adminToken, _ := security.GenerateSuperAdminToken(adminUserID, "admin1", adminRoleID, secret, time.Hour)

	reqAdmin := httptest.NewRequest(http.MethodGet, "/api/v1/modules/management", nil)
	reqAdmin.Header.Set("Authorization", "Bearer "+adminToken)
	respAdmin, err := app.Test(reqAdmin)
	if err != nil {
		t.Fatalf("test request failed: %v", err)
	}

	if respAdmin.StatusCode != http.StatusOK {
		t.Errorf("Expected Admin to get 200 OK, got %d", respAdmin.StatusCode)
	}

	// 3. SuperAdmin User (MUST be 200 OK)
	superUserID := uuid.New()
	superRoleID := uuid.MustParse("15ddfceb-41f7-4252-86f7-a32579ddbe5e") // SuperAdmin
	superToken, _ := security.GenerateSuperAdminToken(superUserID, "superadmin", superRoleID, secret, time.Hour)

	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/modules/management", nil)
	req2.Header.Set("Authorization", "Bearer "+superToken)
	resp2, err := app.Test(req2)
	if err != nil {
		t.Fatalf("test request failed: %v", err)
	}

	if resp2.StatusCode != http.StatusOK {
		t.Errorf("Expected SuperAdmin to get 200 OK, got %d", resp2.StatusCode)
	}
}
