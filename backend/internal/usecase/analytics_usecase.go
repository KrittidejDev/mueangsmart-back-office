package usecase

import (
	"context"

	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type analyticsUseCase struct {
	analyticsRepo domain.AnalyticsRepository
}

func NewAnalyticsUseCase(analyticsRepo domain.AnalyticsRepository) domain.AnalyticsUseCase {
	return &analyticsUseCase{analyticsRepo: analyticsRepo}
}

func (u *analyticsUseCase) GetOverview(ctx context.Context) (*domain.OverviewAnalytics, error) {
	return u.analyticsRepo.GetOverview(ctx)
}

func (u *analyticsUseCase) GetVulnerableGroups(ctx context.Context) ([]domain.VulnerableGroupStat, error) {
	return u.analyticsRepo.GetVulnerableGroups(ctx)
}

func (u *analyticsUseCase) GetApprovalStatuses(ctx context.Context) ([]domain.ApprovalStatusStat, error) {
	return u.analyticsRepo.GetApprovalStatuses(ctx)
}

func (u *analyticsUseCase) GetModuleMetrics(ctx context.Context) ([]domain.ModuleMetricStat, error) {
	return u.analyticsRepo.GetModuleMetrics(ctx)
}
