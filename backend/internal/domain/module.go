package domain

import (
	"context"

	"github.com/google/uuid"
)

// SystemModuleResponse represents the DTO for a system module returned to the frontend.
type SystemModuleResponse struct {
	ID              uuid.UUID `json:"id"`
	SortOrder       int       `json:"sort_order"`
	NameTh          string    `json:"name_th"`
	NameEn          string    `json:"name_en"`
	DashboardNameTh string    `json:"dashboard_name_th"`
	DashboardNameEn string    `json:"dashboard_name_en"`
	VerifyIdentity  bool      `json:"verify_identity"`
	Department      bool      `json:"department"`
	AdminOnly       bool      `json:"admin_only"`
	ShowDashboard   bool      `json:"show_dashboard"`
	Key             string    `json:"key"`
}

// CreateModuleRequest is the payload for creating a new system module.
type CreateModuleRequest struct {
	SortOrder       int    `json:"sort_order"`
	NameTh          string `json:"name_th" validate:"required"`
	NameEn          string `json:"name_en" validate:"required"`
	DashboardNameTh string `json:"dashboard_name_th"`
	DashboardNameEn string `json:"dashboard_name_en"`
	VerifyIdentity  bool   `json:"verify_identity"`
	Department      bool   `json:"department"`
	AdminOnly       bool   `json:"admin_only"`
	ShowDashboard   bool   `json:"show_dashboard"`
	Key             string `json:"key"`
}

// UpdateModuleRequest is the payload for updating an existing system module.
type UpdateModuleRequest struct {
	SortOrder       int    `json:"sort_order"`
	NameTh          string `json:"name_th" validate:"required"`
	NameEn          string `json:"name_en" validate:"required"`
	DashboardNameTh string `json:"dashboard_name_th"`
	DashboardNameEn string `json:"dashboard_name_en"`
	VerifyIdentity  bool   `json:"verify_identity"`
	Department      bool   `json:"department"`
	AdminOnly       bool   `json:"admin_only"`
	ShowDashboard   bool   `json:"show_dashboard"`
	Key             string `json:"key"`
}

// ModuleManagementRepository defines database operations on the "Modules" table.
type ModuleManagementRepository interface {
	FindAll(ctx context.Context) ([]Module, error)
	FindByID(ctx context.Context, id uuid.UUID) (*Module, error)
	Create(ctx context.Context, module *Module) error
	Update(ctx context.Context, id uuid.UUID, req UpdateModuleRequest, updatedBy string) (*Module, error)
}

// ModuleManagementUseCase defines business logic for module management.
type ModuleManagementUseCase interface {
	GetAllModules(ctx context.Context) ([]SystemModuleResponse, error)
	GetModuleByID(ctx context.Context, id uuid.UUID) (*SystemModuleResponse, error)
	CreateModule(ctx context.Context, req CreateModuleRequest, createdBy string) (*SystemModuleResponse, error)
	UpdateModule(ctx context.Context, id uuid.UUID, req UpdateModuleRequest, updatedBy string) (*SystemModuleResponse, error)
}
