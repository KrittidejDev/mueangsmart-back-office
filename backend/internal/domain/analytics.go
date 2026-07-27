package domain

import "context"

// Analytics DTOs
type OverviewAnalytics struct {
	TotalCities             int64 `json:"total_cities"`
	ActiveCities            int64 `json:"active_cities"`
	TotalElderlyAndDisabled int64 `json:"total_elderly_and_disabled"`
	TotalBedridden          int64 `json:"total_bedridden"`
	TotalUsers              int64 `json:"total_users"`
	ApprovedUsers           int64 `json:"approved_users"`
	PendingUsers            int64 `json:"pending_users"`
	RejectedUsers           int64 `json:"rejected_users"`
}

type VulnerableGroupStat struct {
	CityId            string `json:"city_id"`
	CityName          string `json:"city_name"`
	ElderlyCount      int64  `json:"elderly_count"`
	DisabledCount     int64  `json:"disabled_count"`
	BedriddenCount    int64  `json:"bedridden_count"`
	AssessedCount     int64  `json:"assessed_count"`
	PendingAssessment int64  `json:"pending_assessment_count"`
}

type ApprovalStatusStat struct {
	CityId    string `json:"city_id"`
	CityName  string `json:"city_name"`
	Approved  int64  `json:"approved"`
	Pending   int64  `json:"pending"`
	Rejected  int64  `json:"rejected"`
	TotalUser int64  `json:"total_user"`
}

type ModuleMetricStat struct {
	CityId              string `json:"city_id"`
	CityName            string `json:"city_name"`
	TotalComplaints     int64  `json:"total_complaints"`
	ResolvedComplaints  int64  `json:"resolved_complaints"`
	PendingComplaints   int64  `json:"pending_complaints"`
	TotalWasteBills     int64  `json:"total_waste_bills"`
	PaidWasteBills      int64  `json:"paid_waste_bills"`
	ActiveFloodSensors  int64  `json:"active_flood_sensors"`
	RecentFloodAlerts   int64  `json:"recent_flood_alerts"`
}

// Repository & UseCase Interfaces
type AnalyticsRepository interface {
	GetOverview(ctx context.Context) (*OverviewAnalytics, error)
	GetVulnerableGroups(ctx context.Context) ([]VulnerableGroupStat, error)
	GetApprovalStatuses(ctx context.Context) ([]ApprovalStatusStat, error)
	GetModuleMetrics(ctx context.Context) ([]ModuleMetricStat, error)
}

type AnalyticsUseCase interface {
	GetOverview(ctx context.Context) (*OverviewAnalytics, error)
	GetVulnerableGroups(ctx context.Context) ([]VulnerableGroupStat, error)
	GetApprovalStatuses(ctx context.Context) ([]ApprovalStatusStat, error)
	GetModuleMetrics(ctx context.Context) ([]ModuleMetricStat, error)
}
