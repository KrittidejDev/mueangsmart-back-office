package security

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestPasswordHashing(t *testing.T) {
	password := "SuperSecret123!"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if !CheckPasswordHash(password, hash) {
		t.Errorf("Password hash verification failed")
	}

	if CheckPasswordHash("WrongPassword", hash) {
		t.Errorf("Password hash verification should fail for wrong password")
	}
}

func TestSuperAdminTokenValidation(t *testing.T) {
	secret := "test-jwt-secret-key"
	adminID := uuid.New()
	roleID := uuid.New()
	username := "superadmin"

	token, err := GenerateSuperAdminToken(adminID, username, roleID, secret, 1*time.Hour)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	claims, err := ValidateSuperAdminToken(token, secret)
	if err != nil {
		t.Fatalf("Failed to validate valid token: %v", err)
	}

	if claims.SuperAdminID != adminID {
		t.Errorf("Expected AdminID %v, got %v", adminID, claims.SuperAdminID)
	}

	if claims.Domain != "superadmin_backoffice" {
		t.Errorf("Expected Domain 'superadmin_backoffice', got %v", claims.Domain)
	}
}
