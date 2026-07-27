package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type Permission struct {
	Resource string `json:"resource"`
	Action   string `json:"action"`
}

type LoginResponse struct {
	Token        string       `json:"token"`
	SuperAdminID uuid.UUID    `json:"super_admin_id"`
	Username     string       `json:"username"`
	FullName     string       `json:"full_name"`
	RoleName     string       `json:"role_name"`
	Permissions  []Permission `json:"permissions"`
}

type SuperAdminProfileResponse struct {
	Id          uuid.UUID    `json:"id"`
	Username    string       `json:"username"`
	Email       string       `json:"email"`
	FullName    string       `json:"full_name"`
	RoleName    string       `json:"role_name"`
	IsActive    bool         `json:"is_active"`
	CreatedDate time.Time    `json:"created_date"`
	Permissions []Permission `json:"permissions,omitempty"`
}

type CreateSuperAdminRequest struct {
	Username string    `json:"username" validate:"required"`
	Email    string    `json:"email" validate:"required,email"`
	Password string    `json:"password" validate:"required"`
	FullName string    `json:"full_name" validate:"required"`
	RoleId   uuid.UUID `json:"role_id" validate:"required"`
}

type SuperAdminRepository interface {
	FindByUsername(ctx context.Context, username string) (*BoSuperAdmin, error)
	FindByID(ctx context.Context, id uuid.UUID) (*BoSuperAdmin, error)
	FindAll(ctx context.Context) ([]BoSuperAdmin, error)
	Create(ctx context.Context, admin *BoSuperAdmin) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type RoleRepository interface {
	FindByID(ctx context.Context, id uuid.UUID) (*BoRole, error)
	FindAll(ctx context.Context) ([]BoRole, error)
	GetPermissionsByRoleID(ctx context.Context, roleID uuid.UUID) ([]BoPermission, error)
	HasPermission(ctx context.Context, roleID uuid.UUID, resource, action string) (bool, error)
}

type AuthUseCase interface {
	Login(ctx context.Context, username, password string) (*LoginResponse, error)
	GetProfile(ctx context.Context, id uuid.UUID) (*SuperAdminProfileResponse, error)
	CreateUser(ctx context.Context, req *CreateSuperAdminRequest, createdBy string) error
	DeleteUser(ctx context.Context, id, currentSuperAdminID uuid.UUID) error
	GetUsers(ctx context.Context) ([]SuperAdminProfileResponse, error)
	GetRoles(ctx context.Context) ([]BoRole, error)
}
