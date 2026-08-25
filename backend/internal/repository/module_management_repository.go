package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/gorm"
)

type moduleManagementRepository struct {
	db *gorm.DB
}

// NewModuleManagementRepository creates a new instance of domain.ModuleManagementRepository.
func NewModuleManagementRepository(db *gorm.DB) domain.ModuleManagementRepository {
	return &moduleManagementRepository{db: db}
}

func (r *moduleManagementRepository) FindAll(ctx context.Context) ([]domain.Module, error) {
	var modules []domain.Module
	err := r.db.WithContext(ctx).
		Order("\"Sequence\" ASC NULLS LAST, \"NameTh\" ASC").
		Find(&modules).Error
	if err != nil {
		return nil, err
	}
	return modules, nil
}

func (r *moduleManagementRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Module, error) {
	var module domain.Module
	err := r.db.WithContext(ctx).
		Where("\"Id\" = ?", id).
		First(&module).Error
	if err != nil {
		return nil, err
	}
	return &module, nil
}

func (r *moduleManagementRepository) Create(ctx context.Context, module *domain.Module) error {
	return r.db.WithContext(ctx).Create(module).Error
}

func (r *moduleManagementRepository) Update(ctx context.Context, id uuid.UUID, req domain.UpdateModuleRequest, updatedBy string) (*domain.Module, error) {
	var module domain.Module
	err := r.db.WithContext(ctx).Where("\"Id\" = ?", id).First(&module).Error
	if err != nil {
		return nil, err
	}

	seq := req.SortOrder
	now := time.Now()

	updates := map[string]interface{}{
		"NameTh":                             req.NameTh,
		"NameEn":                             req.NameEn,
		"Sequence":                           &seq,
		"DashboardNameTh":                    &req.DashboardNameTh,
		"DashboardNameEn":                    &req.DashboardNameEn,
		"IsUsedForUserRegistrationOnly":       req.VerifyIdentity,
		"CanBeSelectedWithAdminUserSettings": req.Department,
		"IsAdminOnly":                        req.AdminOnly,
		"IsDashboard":                        req.ShowDashboard,
		"UpdatedBy":                          updatedBy,
		"UpdatedDate":                        now,
	}

	if req.Key != "" {
		updates["Key"] = &req.Key
	}

	err = r.db.WithContext(ctx).
		Model(&domain.Module{}).
		Where("\"Id\" = ?", id).
		Updates(updates).Error
	if err != nil {
		return nil, err
	}

	// Fetch fresh state
	err = r.db.WithContext(ctx).Where("\"Id\" = ?", id).First(&module).Error
	if err != nil {
		return nil, err
	}

	return &module, nil
}
