package domain

import (
	"time"

	"github.com/google/uuid"
)

// --- Safe Read-Only / Transaction Entities matching existing MueangSmart Schema ---

type Municipality struct {
	Id          uuid.UUID `gorm:"column:Id;primaryKey;type:uuid"`
	NameTh      string    `gorm:"column:NameTh"`
	NameEn      string    `gorm:"column:NameEn"`
	AddressTh   string    `gorm:"column:AddressTh"`
	AddressEn   string    `gorm:"column:AddressEn"`
	Phone       string    `gorm:"column:Phone"`
	Latitude    float64   `gorm:"column:Latitude"`
	Longitude   float64   `gorm:"column:Longitude"`
	LogoUrl     *string   `gorm:"column:LogoUrl"`
	Status      string    `gorm:"column:Status"`
	CreatedBy   string    `gorm:"column:CreatedBy"`
	CreatedDate time.Time `gorm:"column:CreatedDate"`
	UpdatedBy   string    `gorm:"column:UpdatedBy"`
	UpdatedDate time.Time `gorm:"column:UpdatedDate"`
}

func (Municipality) TableName() string {
	return "Municipalities"
}

type MunicipalityModule struct {
	Id             uuid.UUID `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	MunicipalityId uuid.UUID `gorm:"column:MunicipalityId;type:uuid"`
	ModuleId       uuid.UUID `gorm:"column:ModuleId;type:uuid"`
	IsActive       bool      `gorm:"column:IsActive"`
	CreatedBy      string    `gorm:"column:CreatedBy;default:''"`
	CreatedDate    time.Time `gorm:"column:CreatedDate;autoCreateTime"`
	UpdatedBy      string    `gorm:"column:UpdatedBy;default:''"`
	UpdatedDate    time.Time `gorm:"column:UpdatedDate;autoUpdateTime"`
}

func (MunicipalityModule) TableName() string {
	return "MunicipalityModules"
}

type Module struct {
	Id          uuid.UUID `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	NameTh      string    `gorm:"column:NameTh"`
	NameEn      string    `gorm:"column:NameEn"`
	Code        string    `gorm:"column:Code"`
	Description string    `gorm:"column:Description"`
	IsActive    bool      `gorm:"column:IsActive"`
	CreatedDate time.Time `gorm:"column:CreatedDate"`
}

func (Module) TableName() string {
	return "Modules"
}

type MunicipalityBankDetail struct {
	Id                uuid.UUID `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	BankName          string    `gorm:"column:BankName"`
	BankAccountNumber string    `gorm:"column:BankAccountNumber"`
	BankAccountName   string    `gorm:"column:BankAccountName"`
	BankBranch        string    `gorm:"column:BankBranch"`
	BankType          string    `gorm:"column:BankType"`
	BankStatus        string    `gorm:"column:BankStatus"`
	BankQrCodeUrl     string    `gorm:"column:BankQrCodeUrl"`
	MunicipalityId    uuid.UUID `gorm:"column:MunicipalityId;type:uuid"`
	CreatedBy         string    `gorm:"column:CreatedBy;default:''"`
	CreatedDate       time.Time `gorm:"column:CreatedDate;autoCreateTime"`
	UpdatedBy         string    `gorm:"column:UpdatedBy;default:''"`
	UpdatedDate       time.Time `gorm:"column:UpdatedDate;autoUpdateTime"`
}

func (MunicipalityBankDetail) TableName() string {
	return "MunicipalityBankDetails"
}

type AdminUser struct {
	Id             uuid.UUID  `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	Name           string     `gorm:"column:Name"`
	LastName       string     `gorm:"column:LastName"`
	Email          string     `gorm:"column:Email"`
	Phone          string     `gorm:"column:Phone"`
	Position       string     `gorm:"column:Position"`
	PasswordHash   string     `gorm:"column:PasswordHash"`
	MunicipalityId uuid.UUID  `gorm:"column:MunicipalityId;type:uuid"`
	RoleId         *uuid.UUID `gorm:"column:RoleId;type:uuid"`
	CreatedBy      string     `gorm:"column:CreatedBy;default:''"`
	CreatedDate    time.Time  `gorm:"column:CreatedDate;autoCreateTime"`
	UpdatedBy      string     `gorm:"column:UpdatedBy;default:''"`
	UpdatedDate    time.Time  `gorm:"column:UpdatedDate;autoUpdateTime"`
}

func (AdminUser) TableName() string {
	return "AdminUsers"
}

type Department struct {
	Id             uuid.UUID `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	Name           string    `gorm:"column:Name"`
	Status         string    `gorm:"column:Status"`
	Description    string    `gorm:"column:Description"`
	MunicipalityId uuid.UUID `gorm:"column:MunicipalityId;type:uuid"`
	IsSuperAdmin   bool      `gorm:"column:IsSuperAdmin"`
	CreatedBy      string    `gorm:"column:CreatedBy;default:''"`
	CreatedDate    time.Time `gorm:"column:CreatedDate;autoCreateTime"`
	UpdatedBy      string    `gorm:"column:UpdatedBy;default:''"`
	UpdatedDate    time.Time `gorm:"column:UpdatedDate;autoUpdateTime"`
}

func (Department) TableName() string {
	return "Departments"
}

type AdminUserDepartment struct {
	AdminUserId  uuid.UUID `gorm:"column:AdminUserId;primaryKey;type:uuid"`
	DepartmentId uuid.UUID `gorm:"column:DepartmentId;primaryKey;type:uuid"`
	CreatedBy    string    `gorm:"column:CreatedBy;default:''"`
	CreatedDate  time.Time `gorm:"column:CreatedDate;autoCreateTime"`
	UpdatedBy    string    `gorm:"column:UpdatedBy;default:''"`
	UpdatedDate  time.Time `gorm:"column:UpdatedDate;autoUpdateTime"`
}

func (AdminUserDepartment) TableName() string {
	return "AdminUserDepartments"
}

// --- Isolated SuperAdmin Back Office Entities (PascalCase Plural Pattern) ---

type BoSuperAdmin struct {
	Id           uuid.UUID `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	Username     string    `gorm:"column:Username;uniqueIndex;not null"`
	Email        string    `gorm:"column:Email;uniqueIndex;not null"`
	PasswordHash string    `gorm:"column:PasswordHash;not null"`
	FullName     string    `gorm:"column:FullName;not null"`
	RoleId       uuid.UUID `gorm:"column:RoleId;type:uuid;not null"`
	IsActive     bool      `gorm:"column:IsActive;default:true"`
	CreatedBy    string    `gorm:"column:CreatedBy;default:''"`
	CreatedDate  time.Time `gorm:"column:CreatedDate;autoCreateTime"`
	UpdatedBy    string    `gorm:"column:UpdatedBy;default:''"`
	UpdatedDate  time.Time `gorm:"column:UpdatedDate;autoUpdateTime"`
}

func (BoSuperAdmin) TableName() string {
	return "BoSuperAdmins"
}

type BoRole struct {
	Id          uuid.UUID `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string    `gorm:"column:Name;uniqueIndex;not null"`
	Description string    `gorm:"column:Description"`
	CreatedBy   string    `gorm:"column:CreatedBy;default:''"`
	CreatedDate time.Time `gorm:"column:CreatedDate;autoCreateTime"`
	UpdatedBy   string    `gorm:"column:UpdatedBy;default:''"`
	UpdatedDate time.Time `gorm:"column:UpdatedDate;autoUpdateTime"`
}

func (BoRole) TableName() string {
	return "BoRoles"
}

type BoPermission struct {
	Id          uuid.UUID `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	RoleId      uuid.UUID `gorm:"column:RoleId;type:uuid;not null"`
	Resource    string    `gorm:"column:Resource;not null"`
	Action      string    `gorm:"column:Action;not null"`
	CreatedDate time.Time `gorm:"column:CreatedDate;autoCreateTime"`
}

func (BoPermission) TableName() string {
	return "BoPermissions"
}

type BoAuditLog struct {
	Id           uuid.UUID `gorm:"column:Id;primaryKey;type:uuid;default:gen_random_uuid()"`
	SuperAdminId uuid.UUID `gorm:"column:SuperAdminId;type:uuid;not null"`
	Action       string    `gorm:"column:Action;not null"`
	Details      string    `gorm:"column:Details;type:jsonb"`
	IpAddress    string    `gorm:"column:IpAddress"`
	CreatedDate  time.Time `gorm:"column:CreatedDate;autoCreateTime"`
}

func (BoAuditLog) TableName() string {
	return "BoAuditLogs"
}

// HealthCheckResponse DTO for system diagnostics
type HealthCheckResponse struct {
	Status    string    `json:"status"`
	Service   string    `json:"service"`
	Timestamp time.Time `json:"timestamp"`
	Version   string    `json:"version"`
}
