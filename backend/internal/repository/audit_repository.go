package repository

import (
	"context"

	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/gorm"
)

type auditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) domain.AuditLogRepository {
	return &auditLogRepository{db: db}
}

func (r *auditLogRepository) FindAll(ctx context.Context, limit, offset int) ([]domain.AuditLogResponse, int64, error) {
	var logs []domain.AuditLogResponse
	var total int64

	r.db.WithContext(ctx).Table("\"BoAuditLogs\"").Count(&total)

	query := `
		SELECT 
			a."Id" AS id,
			a."SuperAdminId" AS super_admin_id,
			COALESCE(u."Username", 'System') AS username,
			COALESCE(u."FullName", 'System SuperAdmin') AS full_name,
			a."Action" AS action,
			a."Details" AS details,
			a."IpAddress" AS ip_address,
			a."CreatedDate" AS created_date
		FROM "BoAuditLogs" a
		LEFT JOIN "BoSuperAdmins" u ON a."SuperAdminId" = u."Id"
		ORDER BY a."CreatedDate" DESC
		LIMIT ? OFFSET ?
	`

	if err := r.db.WithContext(ctx).Raw(query, limit, offset).Scan(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}
