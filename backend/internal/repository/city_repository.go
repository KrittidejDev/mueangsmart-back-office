package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// superAdminRoleID is the fixed Role ID for SuperAdmin in the MueangSmart system (from SQL reference).
const superAdminRoleID = "853c7d3e-8885-454e-ba07-2f02db7e3171"

// cityManagementModuleID is the fixed Module ID for city management (Admin Only).
const cityManagementModuleID = "413bee92-d259-47e6-9f18-a311ca6a12dc"

type cityRepository struct {
	db *gorm.DB
}

func NewCityRepository(db *gorm.DB) domain.CityRepository {
	return &cityRepository{db: db}
}

func (r *cityRepository) FindAll(ctx context.Context) ([]domain.Municipality, error) {
	var cities []domain.Municipality
	err := r.db.WithContext(ctx).
		Order("\"NameTh\" ASC").
		Find(&cities).Error
	return cities, err
}

func (r *cityRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Municipality, error) {
	var city domain.Municipality
	err := r.db.WithContext(ctx).Where("\"Id\" = ?", id).First(&city).Error
	if err != nil {
		return nil, err
	}
	return &city, nil
}

// FindBankDetailByMunicipalityID retrieves the first bank detail record for a given municipality.
func (r *cityRepository) FindBankDetailByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (*domain.MunicipalityBankDetail, error) {
	var bank domain.MunicipalityBankDetail
	err := r.db.WithContext(ctx).
		Where("\"MunicipalityId\" = ?", municipalityID).
		First(&bank).Error
	if err != nil {
		return nil, err
	}
	return &bank, nil
}

// FindAdminUserByMunicipalityID retrieves the first admin user for a given municipality.
func (r *cityRepository) FindAdminUserByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (*domain.AdminUser, error) {
	var admin domain.AdminUser
	err := r.db.WithContext(ctx).
		Where("\"MunicipalityId\" = ?", municipalityID).
		Order("\"CreatedDate\" ASC").
		First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

// UpsertBankDetail creates or updates the bank detail for a municipality.
// Uses a soft upsert: UPDATE if exists, INSERT if not.
func (r *cityRepository) UpsertBankDetail(ctx context.Context, municipalityID uuid.UUID, req domain.UpdateCityRequest, updatedBy string) error {
	if strings.TrimSpace(req.BankName) == "" && strings.TrimSpace(req.BankAccountNumber) == "" {
		return nil // nothing to upsert
	}

	now := time.Now()
	var existing domain.MunicipalityBankDetail
	err := r.db.WithContext(ctx).
		Where("\"MunicipalityId\" = ?", municipalityID).
		First(&existing).Error

	if err != nil {
		// Not found → INSERT new
		record := domain.MunicipalityBankDetail{
			Id:                uuid.New(),
			BankName:          req.BankName,
			BankAccountNumber: req.BankAccountNumber,
			BankAccountName:   req.BankAccountName,
			BankBranch:        req.BankBranch,
			BankType:          req.BankType,
			BankStatus:        "Active",
			BankQrCodeUrl:     "",
			MunicipalityId:    municipalityID,
			CreatedBy:         updatedBy,
			CreatedDate:       now,
			UpdatedBy:         updatedBy,
			UpdatedDate:       now,
		}
		return r.db.WithContext(ctx).Create(&record).Error
	}

	// Found → UPDATE existing
	return r.db.WithContext(ctx).
		Model(&existing).
		Updates(map[string]interface{}{
			"BankName":          req.BankName,
			"BankAccountNumber": req.BankAccountNumber,
			"BankAccountName":   req.BankAccountName,
			"BankBranch":        req.BankBranch,
			"BankType":          req.BankType,
			"UpdatedBy":         updatedBy,
			"UpdatedDate":       now,
		}).Error
}

// UpsertAdminUser updates existing admin user or creates a new AdminUser with Super Admin department if none existed.
func (r *cityRepository) UpsertAdminUser(ctx context.Context, municipalityID uuid.UUID, req domain.UpdateCityRequest, updatedBy string) error {
	if strings.TrimSpace(req.AdminEmail) == "" && strings.TrimSpace(req.AdminName) == "" {
		return nil
	}

	var existing domain.AdminUser
	err := r.db.WithContext(ctx).
		Where("\"MunicipalityId\" = ?", municipalityID).
		Order("\"CreatedDate\" ASC").
		First(&existing).Error

	if err == nil {
		updates := map[string]interface{}{
			"Name":        req.AdminName,
			"LastName":    req.AdminLastName,
			"Email":       req.AdminEmail,
			"Phone":       req.AdminPhone,
			"UpdatedBy":   updatedBy,
			"UpdatedDate": time.Now(),
		}
		if strings.TrimSpace(req.AdminPassword) != "" {
			hashBytes, err := bcrypt.GenerateFromPassword([]byte(req.AdminPassword), bcrypt.DefaultCost)
			if err == nil {
				updates["PasswordHash"] = string(hashBytes)
			}
		}
		return r.db.WithContext(ctx).
			Model(&domain.AdminUser{}).
			Where("\"Id\" = ?", existing.Id).
			Updates(updates).Error
	}

	// No existing admin user found -> CREATE new AdminUser + Super Admin Department + DepartmentModules + AdminUserDepartments
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		rawPassword := req.AdminPassword
		if rawPassword == "" {
			rawPassword = "MueangSmart@" + municipalityID.String()[:8]
		}
		hashBytes, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("hash admin password: %w", err)
		}

		roleUUID, _ := uuid.Parse(superAdminRoleID)
		adminUserID := uuid.New()
		adminUser := domain.AdminUser{
			Id:             adminUserID,
			Name:           req.AdminName,
			LastName:       req.AdminLastName,
			Email:          req.AdminEmail,
			Phone:          req.AdminPhone,
			Position:       "SuperAdmin",
			PasswordHash:   string(hashBytes),
			MunicipalityId: municipalityID,
			RoleId:         &roleUUID,
			CreatedBy:      updatedBy,
			CreatedDate:    time.Now(),
			UpdatedBy:      updatedBy,
			UpdatedDate:    time.Now(),
		}
		if err := tx.Create(&adminUser).Error; err != nil {
			return fmt.Errorf("create admin user: %w", err)
		}

		// Ensure Super Admin Department exists for this municipality
		var dept domain.Department
		err = tx.Where("\"MunicipalityId\" = ? AND \"IsSuperAdmin\" = ?", municipalityID, true).First(&dept).Error
		var deptID uuid.UUID
		if err != nil {
			deptID = uuid.New()
			dept = domain.Department{
				Id:             deptID,
				Name:           "Super Admin",
				Status:         "Active",
				Description:    "Super Admin",
				MunicipalityId: municipalityID,
				IsSuperAdmin:   true,
				CreatedBy:      updatedBy,
				CreatedDate:    time.Now(),
				UpdatedBy:      updatedBy,
				UpdatedDate:    time.Now(),
			}
			if err := tx.Create(&dept).Error; err != nil {
				return fmt.Errorf("create department: %w", err)
			}

			// Add DepartmentModules
			cityMgmtModuleUUID, _ := uuid.Parse(cityManagementModuleID)
			deptModule := domain.DepartmentModule{
				Id:           uuid.New(),
				DepartmentId: deptID,
				ModuleId:     cityMgmtModuleUUID,
				CreatedBy:    updatedBy,
				CreatedDate:  time.Now(),
				UpdatedBy:    updatedBy,
				UpdatedDate:  time.Now(),
			}
			if err := tx.Create(&deptModule).Error; err != nil {
				return fmt.Errorf("create department module: %w", err)
			}
		} else {
			deptID = dept.Id
		}

		// Link AdminUser to Department
		adminUserDept := domain.AdminUserDepartment{
			AdminUserId:  adminUserID,
			DepartmentId: deptID,
			CreatedBy:    updatedBy,
			CreatedDate:  time.Now(),
			UpdatedBy:    updatedBy,
			UpdatedDate:  time.Now(),
		}
		return tx.Create(&adminUserDept).Error
	})
}

// CreateFullCityOnboarding creates a municipality and all required related records
// in a single atomic database transaction following the 7-table SQL onboarding pattern.
func (r *cityRepository) CreateFullCityOnboarding(ctx context.Context, city *domain.Municipality, req domain.CreateCityRequest, creator string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Step 1: INSERT Municipalities
		if err := tx.Create(city).Error; err != nil {
			return fmt.Errorf("create municipality: %w", err)
		}

		// Step 2: INSERT MunicipalityBankDetails (only if bank info provided)
		if strings.TrimSpace(req.BankName) != "" || strings.TrimSpace(req.BankAccountNumber) != "" {
			bankDetail := domain.MunicipalityBankDetail{
				Id:                uuid.New(),
				BankName:          req.BankName,
				BankAccountNumber: req.BankAccountNumber,
				BankAccountName:   req.BankAccountName,
				BankBranch:        req.BankBranch,
				BankType:          req.BankType,
				BankStatus:        "Active",
				BankQrCodeUrl:     "",
				MunicipalityId:    city.Id,
				CreatedBy:         creator,
				CreatedDate:       time.Now(),
				UpdatedBy:         creator,
				UpdatedDate:       time.Now(),
			}
			if err := tx.Create(&bankDetail).Error; err != nil {
				return fmt.Errorf("create bank detail: %w", err)
			}
		}

		// Step 3: INSERT AdminUsers (only if admin email is provided)
		adminUserID := uuid.New()
		if strings.TrimSpace(req.AdminEmail) != "" {
			rawPassword := req.AdminPassword
			if rawPassword == "" {
				rawPassword = "MueangSmart@" + city.Id.String()[:8]
			}
			hashBytes, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
			if err != nil {
				return fmt.Errorf("hash admin password: %w", err)
			}

			roleUUID, _ := uuid.Parse(superAdminRoleID)
			adminUser := domain.AdminUser{
				Id:             adminUserID,
				Name:           req.AdminName,
				LastName:       req.AdminLastName,
				Email:          req.AdminEmail,
				Phone:          req.AdminPhone,
				Position:       "SuperAdmin",
				PasswordHash:   string(hashBytes),
				MunicipalityId: city.Id,
				RoleId:         &roleUUID,
				CreatedBy:      creator,
				CreatedDate:    time.Now(),
				UpdatedBy:      creator,
				UpdatedDate:    time.Now(),
			}
			if err := tx.Create(&adminUser).Error; err != nil {
				return fmt.Errorf("create admin user: %w", err)
			}

			// Step 4: INSERT Departments (Super Admin department for this municipality)
			departmentID := uuid.New()
			dept := domain.Department{
				Id:             departmentID,
				Name:           "Super Admin",
				Status:         "Active",
				Description:    "Super Admin",
				MunicipalityId: city.Id,
				IsSuperAdmin:   true,
				CreatedBy:      creator,
				CreatedDate:    time.Now(),
				UpdatedBy:      creator,
				UpdatedDate:    time.Now(),
			}
			if err := tx.Create(&dept).Error; err != nil {
				return fmt.Errorf("create department: %w", err)
			}

			// Step 5: INSERT DepartmentModules (city management module for the Super Admin dept)
			cityMgmtModuleUUID, _ := uuid.Parse(cityManagementModuleID)
			deptModule := domain.DepartmentModule{
				Id:           uuid.New(),
				DepartmentId: departmentID,
				ModuleId:     cityMgmtModuleUUID,
				CreatedBy:    creator,
				CreatedDate:  time.Now(),
				UpdatedBy:    creator,
				UpdatedDate:  time.Now(),
			}
			if err := tx.Create(&deptModule).Error; err != nil {
				return fmt.Errorf("create department module: %w", err)
			}

			// Step 6: INSERT AdminUserDepartments (link admin user to the Super Admin dept)
			adminUserDept := domain.AdminUserDepartment{
				AdminUserId:  adminUserID,
				DepartmentId: departmentID,
				CreatedBy:    creator,
				CreatedDate:  time.Now(),
				UpdatedBy:    creator,
				UpdatedDate:  time.Now(),
			}
			if err := tx.Create(&adminUserDept).Error; err != nil {
				return fmt.Errorf("create admin user department: %w", err)
			}
		}

		// Step 7: INSERT MunicipalityModules for all selected modules
		for _, modIDStr := range req.SelectedModuleIds {
			modUUID, err := uuid.Parse(modIDStr)
			if err != nil {
				continue
			}
			mm := domain.MunicipalityModule{
				MunicipalityId: city.Id,
				ModuleId:       modUUID,
			}
			if err := tx.Create(&mm).Error; err != nil {
				return fmt.Errorf("create municipality module %s: %w", modIDStr, err)
			}
		}

		return nil
	})
}

func (r *cityRepository) Update(ctx context.Context, city *domain.Municipality) error {
	return r.db.WithContext(ctx).Save(city).Error
}

func (r *cityRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status, updatedBy string) error {
	return r.db.WithContext(ctx).
		Model(&domain.Municipality{}).
		Where("\"Id\" = ?", id).
		Updates(map[string]interface{}{
			"Status":      status,
			"UpdatedBy":   updatedBy,
			"UpdatedDate": time.Now(),
		}).Error
}
