package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/gorm"
)

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) domain.RoleRepository {
	return &roleRepository{db: db}
}

func (r *roleRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.BoRole, error) {
	var role domain.BoRole
	err := r.db.WithContext(ctx).Where("\"Id\" = ?", id).First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *roleRepository) FindAll(ctx context.Context) ([]domain.BoRole, error) {
	var roles []domain.BoRole
	err := r.db.WithContext(ctx).Find(&roles).Error
	return roles, err
}

func (r *roleRepository) GetPermissionsByRoleID(ctx context.Context, roleID uuid.UUID) ([]domain.BoPermission, error) {
	var permissions []domain.BoPermission
	err := r.db.WithContext(ctx).Where("\"RoleId\" = ?", roleID).Find(&permissions).Error
	return permissions, err
}

func (r *roleRepository) HasPermission(ctx context.Context, roleID uuid.UUID, resource, action string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&domain.BoPermission{}).
		Where("\"RoleId\" = ? AND \"Resource\" = ? AND \"Action\" = ?", roleID, resource, action).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
