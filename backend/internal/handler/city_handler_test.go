package handler_test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
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

func TestExecutiveCityPermissions(t *testing.T) {
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
	cityRepo := repository.NewCityRepository(db)
	moduleRepo := repository.NewModuleRepository(db)
	cityUseCase := usecase.NewCityUseCase(cityRepo, moduleRepo)
	cityHandler := handler.NewCityHandler(cityUseCase)

	app := fiber.New()
	api := app.Group("/api/v1")
	citiesGroup := api.Group("/cities", middleware.AuthGuard(secret))
	citiesGroup.Get("/", cityHandler.GetAllCities)
	citiesGroup.Post("/", cityHandler.CreateCity, middleware.RequirePermission(roleRepo, "City", "Create"))
	citiesGroup.Get("/:id", cityHandler.GetCityByID)
	citiesGroup.Put("/:id", cityHandler.UpdateCity, middleware.RequirePermission(roleRepo, "City", "Write"))
	citiesGroup.Patch("/:id/status", cityHandler.UpdateCityStatus, middleware.RequirePermission(roleRepo, "City", "Write"))
	citiesGroup.Patch("/:id/modules/:moduleId", cityHandler.ToggleCityModule, middleware.RequirePermission(roleRepo, "Module", "Toggle"))

	// Executive User
	execUserID := uuid.New()
	execRoleID := uuid.MustParse("42f61beb-487c-4286-af28-b7b33eceed28") // Executive
	execToken, _ := security.GenerateSuperAdminToken(execUserID, "ex1", execRoleID, secret, time.Hour)

	// 1. POST /api/v1/cities (Create City) -> MUST be 403 Forbidden
	req1 := httptest.NewRequest(http.MethodPost, "/api/v1/cities", strings.NewReader(`{}`))
	req1.Header.Set("Authorization", "Bearer "+execToken)
	req1.Header.Set("Content-Type", "application/json")
	resp1, _ := app.Test(req1)
	if resp1.StatusCode != http.StatusForbidden {
		t.Errorf("Expected POST /cities (Create) to be 403 Forbidden, got %d", resp1.StatusCode)
	}

	// 2. PUT /api/v1/cities/:id (Update City) -> MUST be 403 Forbidden
	req2 := httptest.NewRequest(http.MethodPut, "/api/v1/cities/00000000-0000-0000-0000-000000000000", strings.NewReader(`{}`))
	req2.Header.Set("Authorization", "Bearer "+execToken)
	req2.Header.Set("Content-Type", "application/json")
	resp2, _ := app.Test(req2)
	if resp2.StatusCode != http.StatusForbidden {
		t.Errorf("Expected PUT /cities/:id (Update) to be 403 Forbidden, got %d", resp2.StatusCode)
	}

	// 3. PATCH /api/v1/cities/:id/status (Toggle Status) -> MUST be 403 Forbidden
	req3 := httptest.NewRequest(http.MethodPatch, "/api/v1/cities/00000000-0000-0000-0000-000000000000/status", strings.NewReader(`{}`))
	req3.Header.Set("Authorization", "Bearer "+execToken)
	req3.Header.Set("Content-Type", "application/json")
	resp3, _ := app.Test(req3)
	if resp3.StatusCode != http.StatusForbidden {
		t.Errorf("Expected PATCH /cities/:id/status to be 403 Forbidden, got %d", resp3.StatusCode)
	}

	// 4. PATCH /api/v1/cities/:id/modules/:moduleId (Toggle Module) -> MUST be 403 Forbidden
	req4 := httptest.NewRequest(http.MethodPatch, "/api/v1/cities/00000000-0000-0000-0000-000000000000/modules/00000000-0000-0000-0000-000000000000", nil)
	req4.Header.Set("Authorization", "Bearer "+execToken)
	resp4, _ := app.Test(req4)
	if resp4.StatusCode != http.StatusForbidden {
		t.Errorf("Expected PATCH /cities/:id/modules/:moduleId to be 403 Forbidden, got %d", resp4.StatusCode)
	}

	// 5. GET /api/v1/cities (Read City List) -> MUST be 200 OK (Executive has City: Read)
	req5 := httptest.NewRequest(http.MethodGet, "/api/v1/cities", nil)
	req5.Header.Set("Authorization", "Bearer "+execToken)
	resp5, _ := app.Test(req5)
	if resp5.StatusCode != http.StatusOK {
		t.Errorf("Expected GET /cities (Read) to be 200 OK, got %d", resp5.StatusCode)
	}

	// 6. Admin User -> MUST be permitted for City actions (Not 403 Forbidden)
	adminUserID := uuid.New()
	adminRoleID := uuid.MustParse("91e46e73-48b1-4188-8e9c-8fae2cb6ca22") // Admin
	adminToken, _ := security.GenerateSuperAdminToken(adminUserID, "admin1", adminRoleID, secret, time.Hour)

	reqAdminGet := httptest.NewRequest(http.MethodGet, "/api/v1/cities", nil)
	reqAdminGet.Header.Set("Authorization", "Bearer "+adminToken)
	respAdminGet, _ := app.Test(reqAdminGet)
	if respAdminGet.StatusCode != http.StatusOK {
		t.Errorf("Expected Admin GET /cities to be 200 OK, got %d", respAdminGet.StatusCode)
	}
}
