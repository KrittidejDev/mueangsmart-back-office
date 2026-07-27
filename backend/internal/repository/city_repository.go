package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/gorm"
)

type cityRepository struct {
	db *gorm.DB
}

func NewCityRepository(db *gorm.DB) domain.CityRepository {
	return &cityRepository{db: db}
}

func (r *cityRepository) FindAll(ctx context.Context) ([]domain.Municipality, error) {
	var cities []domain.Municipality
	err := r.db.WithContext(ctx).Order("\"NameTh\" ASC").Find(&cities).Error
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

func (r *cityRepository) CreateFullCityOnboarding(ctx context.Context, city *domain.Municipality, req domain.CreateCityRequest, creator string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(city).Error; err != nil {
			return err
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
