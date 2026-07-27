package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// DTOs for City Management
type CityResponse struct {
	Id                 uuid.UUID `json:"id"`
	NameTh             string    `json:"name_th"`
	NameEn             string    `json:"name_en"`
	AddressTh          string    `json:"address_th"`
	AddressEn          string    `json:"address_en"`
	Phone              string    `json:"phone"`
	Latitude           float64   `json:"latitude"`
	Longitude          float64   `json:"longitude"`
	LogoUrl            *string   `json:"logo_url"`
	Status             string    `json:"status"`
	ActiveModulesCount int       `json:"active_modules_count"`
	TotalUsersCount    int       `json:"total_users_count"`
	AdminsCount        int       `json:"admins_count"`
	VulnerableCount    int       `json:"vulnerable_count"`

	// Bank Account Details
	BankName          string `json:"bank_name"`
	BankAccountNumber string `json:"bank_account_number"`
	BankAccountName   string `json:"bank_account_name"`
	BankBranch        string `json:"bank_branch"`
	BankType          string `json:"bank_type"`

	// Local Admin Contact Details
	AdminName     string `json:"admin_name"`
	AdminLastName string `json:"admin_last_name"`
	AdminEmail    string `json:"admin_email"`
	AdminPhone    string `json:"admin_phone"`

	CreatedDate time.Time `json:"created_date"`
}

type CreateCityRequest struct {
	NameTh    string  `json:"name_th" validate:"required"`
	NameEn    string  `json:"name_en" validate:"required"`
	AddressTh string  `json:"address_th"`
	AddressEn string  `json:"address_en"`
	Phone     string  `json:"phone"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	LogoUrl   *string `json:"logo_url"`

	// Local Admin Account Credentials for this City
	AdminName     string `json:"admin_name"`
	AdminLastName string `json:"admin_last_name"`
	AdminEmail    string `json:"admin_email"`
	AdminPhone    string `json:"admin_phone"`
	AdminPassword string `json:"admin_password"`

	// Bank Account Details for Municipality
	BankName          string `json:"bank_name"`
	BankAccountNumber string `json:"bank_account_number"`
	BankAccountName   string `json:"bank_account_name"`
	BankBranch        string `json:"bank_branch"`
	BankType          string `json:"bank_type"`

	// Selected Module IDs
	SelectedModuleIds []string `json:"selected_module_ids"`
}

type UpdateCityRequest struct {
	NameTh    string  `json:"name_th" validate:"required"`
	NameEn    string  `json:"name_en"`
	AddressTh string  `json:"address_th"`
	Phone     string  `json:"phone"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Status    string  `json:"status"`
}

type UpdateCityStatusRequest struct {
	Status string `json:"status" validate:"required"` // e.g. "Active", "Suspended", "Maintenance"
}

type CityModuleStatus struct {
	ModuleId    uuid.UUID `json:"module_id"`
	NameTh      string    `json:"name_th"`
	NameEn      string    `json:"name_en"`
	Code        string    `json:"code"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
}

type ToggleModuleRequest struct {
	IsActive bool `json:"is_active"`
}

// Repository Interfaces
type CityRepository interface {
	FindAll(ctx context.Context) ([]Municipality, error)
	FindByID(ctx context.Context, id uuid.UUID) (*Municipality, error)
	CreateFullCityOnboarding(ctx context.Context, city *Municipality, req CreateCityRequest, creator string) error
	Update(ctx context.Context, city *Municipality) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status, updatedBy string) error
}

type ModuleRepository interface {
	CountActiveByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error)
	CountUsersByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error)
	CountAdminsByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error)
	FindByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) ([]CityModuleStatus, error)
	UpsertModuleStatus(ctx context.Context, municipalityID, moduleID uuid.UUID, isActive bool, updatedBy string) error
}

// UseCase Interface
type CityUseCase interface {
	GetAllCities(ctx context.Context) ([]CityResponse, error)
	GetCityByID(ctx context.Context, id uuid.UUID) (*CityResponse, error)
	CreateCity(ctx context.Context, req CreateCityRequest, creator string) (*CityResponse, error)
	UpdateCity(ctx context.Context, id uuid.UUID, req UpdateCityRequest, updatedBy string) error
	UpdateCityStatus(ctx context.Context, id uuid.UUID, req UpdateCityStatusRequest, updatedBy string) error
	GetCityModules(ctx context.Context, cityID uuid.UUID) ([]CityModuleStatus, error)
	ToggleCityModule(ctx context.Context, cityID, moduleID uuid.UUID, req ToggleModuleRequest, updatedBy string) error
}
