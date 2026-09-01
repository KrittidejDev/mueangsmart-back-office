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
	ModulesCount       int       `json:"modules_count"`
	ActiveModulesCount int       `json:"active_modules_count"`
	TotalUsersCount    int       `json:"total_users_count"`
	AdminsCount        int       `json:"admins_count"`
	VulnerableCount    int       `json:"vulnerable_count"`
	RiverStatus        int       `json:"river_status"`
	SenseStatus        int       `json:"sense_status"`

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
	AddressEn string  `json:"address_en"`
	Phone     string  `json:"phone"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	LogoUrl   *string `json:"logo_url"`
	Status    string  `json:"status"`

	// Bank Account Details (Upsert on update)
	BankName          string `json:"bank_name"`
	BankAccountNumber string `json:"bank_account_number"`
	BankAccountName   string `json:"bank_account_name"`
	BankBranch        string `json:"bank_branch"`
	BankType          string `json:"bank_type"`

	// Local Admin Info (Upsert on update)
	AdminName     string `json:"admin_name"`
	AdminLastName string `json:"admin_last_name"`
	AdminEmail    string `json:"admin_email"`
	AdminPhone    string `json:"admin_phone"`
	AdminPassword string `json:"admin_password"`

	// Selected Module IDs
	SelectedModuleIds []string `json:"selected_module_ids"`
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

type CityModuleDetailStatistics struct {
	CityId                      uuid.UUID `json:"city_id"`
	RegisteredUsers             int64     `json:"registered_users"`
	ActiveUsers                 int64     `json:"active_users"`
	AdminUsers                  int64     `json:"admin_users"`
	ElderlyAndDisabledCount     int64     `json:"elderly_and_disabled_count"`
	ElderlyCount                int64     `json:"elderly_count"`
	DisabledCount               int64     `json:"disabled_count"`
	ElderlyAndDisabledBothCount int64     `json:"elderly_and_disabled_both_count"`
	BedriddenCount              int64     `json:"bedridden_count"`
	GeneralComplaintsCount      int64     `json:"general_complaints_count"`
	TotalComplaintsCount        int64     `json:"total_complaints_count"`
	ResolvedComplaintsCount     int64     `json:"resolved_complaints_count"`
	TaxLandBuildingCount        int64     `json:"tax_land_building_count"`
	TaxSignboardCount           int64     `json:"tax_signboard_count"`
	PetDogsCount                int64     `json:"pet_dogs_count"`
	PetCatsCount                int64     `json:"pet_cats_count"`
	VerifiedUsersCount          int64     `json:"verified_users_count"`
	PublicRelationsCount        int64     `json:"public_relations_count"`
	NotificationsCount          int64     `json:"notifications_count"`
	WasteMembersCount           int64     `json:"waste_members_count"`
	WasteBillsCount             int64     `json:"waste_bills_count"`
	WastePendingBillsCount      int64     `json:"waste_pending_bills_count"`
	WastePaidBillsCount         int64     `json:"waste_paid_bills_count"`
	WasteSystemMode             string    `json:"waste_system_mode"`
	CctvCamerasCount            int64     `json:"cctv_cameras_count"`
	CctvViewsCount              int64     `json:"cctv_views_count"`
	RiverStationsCount          int64     `json:"river_stations_count"`
	RiverOnlineCount            int64     `json:"river_online_count"`
	RiverOfflineCount           int64     `json:"river_offline_count"`
	SenseStationsCount          int64     `json:"sense_stations_count"`
	SenseOnlineCount            int64     `json:"sense_online_count"`
	SenseOfflineCount           int64     `json:"sense_offline_count"`
}

// Repository Interfaces
type CityRepository interface {
	FindAll(ctx context.Context) ([]Municipality, error)
	FindByID(ctx context.Context, id uuid.UUID) (*Municipality, error)
	FindBankDetailByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (*MunicipalityBankDetail, error)
	FindAdminUserByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (*AdminUser, error)
	UpsertBankDetail(ctx context.Context, municipalityID uuid.UUID, req UpdateCityRequest, updatedBy string) error
	UpsertAdminUser(ctx context.Context, municipalityID uuid.UUID, req UpdateCityRequest, updatedBy string) error
	CreateFullCityOnboarding(ctx context.Context, city *Municipality, req CreateCityRequest, creator string) error
	Update(ctx context.Context, city *Municipality) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status, updatedBy string) error
}


type ModuleRepository interface {
	CountActiveByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error)
	CountUsersByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error)
	CountAdminsByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error)
	CountRiverByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error)
	CountSenseByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error)
	FindByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) ([]CityModuleStatus, error)
	FindAllMasterModules(ctx context.Context) ([]CityModuleStatus, error)
	UpsertModuleStatus(ctx context.Context, municipalityID, moduleID uuid.UUID, isActive bool, updatedBy string) error
	SyncCityModules(ctx context.Context, municipalityID uuid.UUID, selectedModuleIDs []string) error
	GetCityStatistics(ctx context.Context, cityID uuid.UUID) (*CityModuleDetailStatistics, error)
}

// UseCase Interface
type CityUseCase interface {
	GetAllCities(ctx context.Context) ([]CityResponse, error)
	GetCityByID(ctx context.Context, id uuid.UUID) (*CityResponse, error)
	CreateCity(ctx context.Context, req CreateCityRequest, creator string) (*CityResponse, error)
	UpdateCity(ctx context.Context, id uuid.UUID, req UpdateCityRequest, updatedBy string) error
	UpdateCityStatus(ctx context.Context, id uuid.UUID, req UpdateCityStatusRequest, updatedBy string) error
	GetCityModules(ctx context.Context, cityID uuid.UUID) ([]CityModuleStatus, error)
	GetAllMasterModules(ctx context.Context) ([]CityModuleStatus, error)
	ToggleCityModule(ctx context.Context, cityID, moduleID uuid.UUID, req ToggleModuleRequest, updatedBy string) error
	GetCityStatistics(ctx context.Context, cityID uuid.UUID) (*CityModuleDetailStatistics, error)
}
