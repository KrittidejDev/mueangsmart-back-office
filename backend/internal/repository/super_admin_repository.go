package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/gorm"
)

type superAdminRepository struct {
	db *gorm.DB
}

func NewSuperAdminRepository(db *gorm.DB) domain.SuperAdminRepository {
	return &superAdminRepository{db: db}
}

func (r *superAdminRepository) FindByUsername(ctx context.Context, username string) (*domain.BoSuperAdmin, error) {
	var admin domain.BoSuperAdmin
	err := r.db.WithContext(ctx).Where("\"Username\" = ?", username).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *superAdminRepository) FindByEmail(ctx context.Context, email string) (*domain.BoSuperAdmin, error) {
	var admin domain.BoSuperAdmin
	err := r.db.WithContext(ctx).Where("\"Email\" = ?", email).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *superAdminRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.BoSuperAdmin, error) {
	var admin domain.BoSuperAdmin
	err := r.db.WithContext(ctx).Where("\"Id\" = ?", id).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (r *superAdminRepository) FindAll(ctx context.Context) ([]domain.BoSuperAdmin, error) {
	var admins []domain.BoSuperAdmin
	err := r.db.WithContext(ctx).Order("\"CreatedDate\" DESC").Find(&admins).Error
	return admins, err
}

func (r *superAdminRepository) Create(ctx context.Context, admin *domain.BoSuperAdmin) error {
	return r.db.WithContext(ctx).Create(admin).Error
}

func (r *superAdminRepository) Update(ctx context.Context, admin *domain.BoSuperAdmin) error {
	return r.db.WithContext(ctx).Save(admin).Error
}

func (r *superAdminRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Where("\"Id\" = ?", id).Delete(&domain.BoSuperAdmin{}).Error
}
