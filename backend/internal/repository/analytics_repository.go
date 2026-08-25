package repository

import (
	"context"

	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/gorm"
)

type analyticsRepository struct {
	db *gorm.DB
}

func NewAnalyticsRepository(db *gorm.DB) domain.AnalyticsRepository {
	return &analyticsRepository{db: db}
}

func (r *analyticsRepository) GetOverview(ctx context.Context) (*domain.OverviewAnalytics, error) {
	var overview domain.OverviewAnalytics

	r.db.WithContext(ctx).Table("\"Municipalities\"").
		Count(&overview.TotalCities)

	r.db.WithContext(ctx).Table("\"Municipalities\"").
		Where("\"Status\" ILIKE ? OR \"Status\" ILIKE ?", "active%", "%ใช้งาน%").
		Count(&overview.ActiveCities)

	overview.InactiveCities = overview.TotalCities - overview.ActiveCities
	if overview.InactiveCities < 0 {
		overview.InactiveCities = 0
	}

	r.db.WithContext(ctx).Table("\"UserMunicipalities\"").
		Count(&overview.TotalUsers)

	r.db.WithContext(ctx).Table("\"Users\"").Count(&overview.RegisteredUsers)

	r.db.WithContext(ctx).Table("\"AdminUsers\"").
		Count(&overview.TotalAdmins)

	r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabled\"").
		Count(&overview.TotalElderlyAndDisabled)

	r.db.WithContext(ctx).Table("\"ModuleBedriddenPatient\"").
		Count(&overview.TotalBedridden)

	r.db.WithContext(ctx).Table("\"UserMunicipalities\"").
		Where("\"Status\" ILIKE ? OR \"Status\" ILIKE ?", "approved%", "active%").
		Count(&overview.ApprovedUsers)

	r.db.WithContext(ctx).Table("\"UserMunicipalities\"").
		Where("\"Status\" ILIKE ?", "pending%").
		Count(&overview.PendingUsers)

	r.db.WithContext(ctx).Table("\"UserMunicipalities\"").
		Where("\"Status\" ILIKE ?", "rejected%").
		Count(&overview.RejectedUsers)

	var rawTrends []struct {
		Year          int   `gorm:"column:year"`
		Month         int   `gorm:"column:month"`
		ActiveCount   int64 `gorm:"column:active_count"`
		InactiveCount int64 `gorm:"column:inactive_count"`
	}

	trendQuery := `
		SELECT 
			COALESCE(EXTRACT(YEAR FROM "CreatedDate")::int, 2026) AS year,
			COALESCE(EXTRACT(MONTH FROM "CreatedDate")::int, 1) AS month,
			COUNT(CASE WHEN "Status" ILIKE 'active%' OR "Status" ILIKE '%ใช้งาน%' THEN 1 END) AS active_count,
			COUNT(CASE WHEN "Status" NOT ILIKE 'active%' AND "Status" NOT ILIKE '%ใช้งาน%' THEN 1 END) AS inactive_count
		FROM "Municipalities"
		WHERE "CreatedDate" IS NOT NULL
		GROUP BY 1, 2
		ORDER BY 1 ASC, 2 ASC
	`
	if err := r.db.WithContext(ctx).Raw(trendQuery).Scan(&rawTrends).Error; err == nil {
		monthNames := []string{"", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."}
		for _, rt := range rawTrends {
			name := ""
			if rt.Month >= 1 && rt.Month <= 12 {
				name = monthNames[rt.Month]
			}
			overview.MonthlyTrends = append(overview.MonthlyTrends, domain.MonthlyTrendStat{
				Year:          rt.Year,
				Month:         rt.Month,
				MonthName:     name,
				ActiveCount:   rt.ActiveCount,
				InactiveCount: rt.InactiveCount,
			})
		}
	}
	if overview.MonthlyTrends == nil {
		overview.MonthlyTrends = make([]domain.MonthlyTrendStat, 0)
	}

	return &overview, nil
}

func (r *analyticsRepository) GetVulnerableGroups(ctx context.Context) ([]domain.VulnerableGroupStat, error) {
	var stats []domain.VulnerableGroupStat

	query := `
		SELECT 
			m."Id"::text AS city_id,
			m."NameTh" AS city_name,
			COALESCE(e.elderly_cnt, 0) AS elderly_count,
			COALESCE(e.disabled_cnt, 0) AS disabled_count,
			COALESCE(b.bedridden_cnt, 0) AS bedridden_count,
			COALESCE(b.assessed_cnt, 0) AS assessed_count,
			COALESCE(b.pending_cnt, 0) AS pending_assessment_count
		FROM "Municipalities" m
		LEFT JOIN (
			SELECT "MunicipalityId", COUNT(*) AS elderly_cnt, COUNT(CASE WHEN "IsDisabled" = true THEN 1 END) AS disabled_cnt
			FROM "ModuleElderlyAndDisabled"
			GROUP BY "MunicipalityId"
		) e ON m."Id" = e."MunicipalityId"
		LEFT JOIN (
			SELECT 
				"MunicipalityId", 
				COUNT(*) AS bedridden_cnt,
				COUNT(CASE WHEN "Status" = 'Assessed' THEN 1 END) AS assessed_cnt,
				COUNT(CASE WHEN "Status" != 'Assessed' THEN 1 END) AS pending_cnt
			FROM "ModuleBedriddenPatient"
			GROUP BY "MunicipalityId"
		) b ON m."Id" = b."MunicipalityId"
		ORDER BY m."NameTh" ASC
	`

	if err := r.db.WithContext(ctx).Raw(query).Scan(&stats).Error; err != nil {
		return nil, err
	}
	return stats, nil
}

func (r *analyticsRepository) GetApprovalStatuses(ctx context.Context) ([]domain.ApprovalStatusStat, error) {
	var stats []domain.ApprovalStatusStat

	query := `
		SELECT 
			m."Id"::text AS city_id,
			m."NameTh" AS city_name,
			COUNT(CASE WHEN u."Status" ILIKE 'approved%' OR u."Status" ILIKE 'active%' THEN 1 END) AS approved,
			COUNT(CASE WHEN u."Status" ILIKE 'pending%' THEN 1 END) AS pending,
			COUNT(CASE WHEN u."Status" ILIKE 'rejected%' THEN 1 END) AS rejected,
			COUNT(u."Id") AS total_user
		FROM "Municipalities" m
		LEFT JOIN "UserMunicipalities" u ON m."Id" = u."MunicipalityId"
		GROUP BY m."Id", m."NameTh"
		ORDER BY m."NameTh" ASC
	`

	if err := r.db.WithContext(ctx).Raw(query).Scan(&stats).Error; err != nil {
		return nil, err
	}
	return stats, nil
}

func (r *analyticsRepository) GetModuleMetrics(ctx context.Context) ([]domain.ModuleMetricStat, error) {
	var stats []domain.ModuleMetricStat

	query := `
		SELECT 
			m."Id"::text AS city_id,
			m."NameTh" AS city_name,
			COALESCE(c.total_c, 0) AS total_complaints,
			COALESCE(c.resolved_c, 0) AS resolved_complaints,
			COALESCE(c.pending_c, 0) AS pending_complaints,
			COALESCE(w.total_w, 0) AS total_waste_bills,
			COALESCE(w.paid_w, 0) AS paid_waste_bills,
			COALESCE(r.sensors_cnt, 0) AS active_flood_sensors,
			COALESCE(r.alerts_cnt, 0) AS recent_flood_alerts
		FROM "Municipalities" m
		LEFT JOIN (
			SELECT "MunicipalityId", COUNT(*) AS total_c,
				COUNT(CASE WHEN "Status" = 'Resolved' OR "Status" = 'COMPLETED' THEN 1 END) AS resolved_c,
				COUNT(CASE WHEN "Status" != 'Resolved' AND "Status" != 'COMPLETED' THEN 1 END) AS pending_c
			FROM "ModuleComplaints"
			GROUP BY "MunicipalityId"
		) c ON m."Id" = c."MunicipalityId"
		LEFT JOIN (
			SELECT "MunicipalityId", COUNT(*) AS total_w,
				COUNT(CASE WHEN "Status" = 'Paid' OR "Status" = 'PAID' THEN 1 END) AS paid_w
			FROM "ModuleWasteFeesBills"
			GROUP BY "MunicipalityId"
		) w ON m."Id" = w."MunicipalityId"
		LEFT JOIN (
			SELECT "MunicipalityId", COUNT(*) AS sensors_cnt, 0 AS alerts_cnt
			FROM "ModuleRiverDeviceThresholds"
			GROUP BY "MunicipalityId"
		) r ON m."Id" = r."MunicipalityId"
		GROUP BY m."Id", m."NameTh", c.total_c, c.resolved_c, c.pending_c, w.total_w, w.paid_w, r.sensors_cnt, r.alerts_cnt
		ORDER BY m."NameTh" ASC
	`

	if err := r.db.WithContext(ctx).Raw(query).Scan(&stats).Error; err != nil {
		return nil, err
	}
	return stats, nil
}
