package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type AuditLogResponse struct {
	Id           uuid.UUID `json:"id"`
	SuperAdminId uuid.UUID `json:"super_admin_id"`
	Username     string    `json:"username"`
	FullName     string    `json:"full_name"`
	Action       string    `json:"action"`
	Details      string    `json:"details"`
	IpAddress    string    `json:"ip_address"`
	CreatedDate  time.Time `json:"created_date"`
}

type AuditLogRepository interface {
	FindAll(ctx context.Context, limit, offset int) ([]AuditLogResponse, int64, error)
}

type AuditLogUseCase interface {
	GetAuditLogs(ctx context.Context, page, pageSize int) ([]AuditLogResponse, int64, error)
}
