package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"github.com/mueangsmart/back-office/backend/internal/handler"
	"github.com/mueangsmart/back-office/backend/internal/repository"
	"github.com/mueangsmart/back-office/backend/internal/usecase"
	"github.com/mueangsmart/back-office/backend/pkg/middleware"
	"github.com/mueangsmart/back-office/backend/pkg/security"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestUpdateProfile(t *testing.T) {
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

	adminRepo := repository.NewSuperAdminRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	authUseCase := usecase.NewAuthUseCase(adminRepo, roleRepo, secret)
	authHandler := handler.NewAuthHandler(authUseCase)

	app := fiber.New()
	api := app.Group("/api/v1")
	authGroup := api.Group("/auth")
	protectedAuth := authGroup.Group("", middleware.AuthGuard(secret))
	protectedAuth.Put("/profile", authHandler.UpdateProfile)

	// Create a temporary test admin user in DB
	testRoleID := uuid.MustParse("15ddfceb-41f7-4252-86f7-a32579ddbe5e") // SuperAdmin role
	testUserID := uuid.New()
	initialHashedPassword, _ := security.HashPassword("InitialPass123")
	testAdmin := &domain.BoSuperAdmin{
		Id:           testUserID,
		Username:     "test_profile_" + testUserID.String()[:8],
		Email:        "test_profile_" + testUserID.String()[:8] + "@mueangsmart.go.th",
		PasswordHash: initialHashedPassword,
		FullName:     "Original Name",
		RoleId:       testRoleID,
		IsActive:     true,
		CreatedBy:    "UnitTest",
		CreatedDate:  time.Now(),
	}
	if err := adminRepo.Create(db.Statement.Context, testAdmin); err != nil {
		t.Fatalf("Failed to create test admin: %v", err)
	}
	defer func() {
		_ = adminRepo.Delete(db.Statement.Context, testUserID)
	}()

	testToken, _ := security.GenerateSuperAdminToken(testUserID, testAdmin.Username, testRoleID, secret, time.Hour)

	// Case 1: Update FullName & Email
	updateReq1 := domain.UpdateProfileRequest{
		FullName: "Updated Name Test",
		Email:    "updated_" + testAdmin.Email,
	}
	body1, _ := json.Marshal(updateReq1)
	req1 := httptest.NewRequest(http.MethodPut, "/api/v1/auth/profile", bytes.NewReader(body1))
	req1.Header.Set("Authorization", "Bearer "+testToken)
	req1.Header.Set("Content-Type", "application/json")
	resp1, err := app.Test(req1)
	if err != nil {
		t.Fatalf("req1 failed: %v", err)
	}
	if resp1.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for valid profile update, got %d", resp1.StatusCode)
	}

	// Case 2: Update Password with wrong current password (MUST FAIL 400)
	updateReq2 := domain.UpdateProfileRequest{
		FullName:        "Updated Name Test",
		Email:           "updated_" + testAdmin.Email,
		CurrentPassword: "WrongPassword999",
		NewPassword:     "NewValidPass123",
	}
	body2, _ := json.Marshal(updateReq2)
	req2 := httptest.NewRequest(http.MethodPut, "/api/v1/auth/profile", bytes.NewReader(body2))
	req2.Header.Set("Authorization", "Bearer "+testToken)
	req2.Header.Set("Content-Type", "application/json")
	resp2, _ := app.Test(req2)
	if resp2.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for wrong current password, got %d", resp2.StatusCode)
	}

	// Case 3: Update Password with correct current password (MUST SUCCEED 200)
	updateReq3 := domain.UpdateProfileRequest{
		FullName:        "Updated Name Test",
		Email:           "updated_" + testAdmin.Email,
		CurrentPassword: "InitialPass123",
		NewPassword:     "BrandNewPass123",
	}
	body3, _ := json.Marshal(updateReq3)
	req3 := httptest.NewRequest(http.MethodPut, "/api/v1/auth/profile", bytes.NewReader(body3))
	req3.Header.Set("Authorization", "Bearer "+testToken)
	req3.Header.Set("Content-Type", "application/json")
	resp3, _ := app.Test(req3)
	if resp3.StatusCode != http.StatusOK {
		t.Errorf("Expected 200 OK for correct password update, got %d", resp3.StatusCode)
	}
}
