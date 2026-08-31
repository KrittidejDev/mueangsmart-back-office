package usecase

import (
	"context"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type gisUseCase struct {
	gisRepo domain.GisRepository
}

func NewGisUseCase(gisRepo domain.GisRepository) domain.GisUseCase {
	return &gisUseCase{
		gisRepo: gisRepo,
	}
}

func (u *gisUseCase) GetLayerSummaries(ctx context.Context, cityID *uuid.UUID) ([]domain.GisLayerSummary, error) {
	return u.gisRepo.GetLayerSummaries(ctx, cityID)
}

func (u *gisUseCase) GetPoints(ctx context.Context, filter domain.GisFilterRequest) ([]domain.GisPoint, error) {
	return u.gisRepo.GetPoints(ctx, filter)
}
