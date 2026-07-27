package usecase

import (
	"context"

	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type auditLogUseCase struct {
	auditRepo domain.AuditLogRepository
}

func NewAuditLogUseCase(auditRepo domain.AuditLogRepository) domain.AuditLogUseCase {
	return &auditLogUseCase{auditRepo: auditRepo}
}

func (u *auditLogUseCase) GetAuditLogs(ctx context.Context, page, pageSize int) ([]domain.AuditLogResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	return u.auditRepo.FindAll(ctx, pageSize, offset)
}
