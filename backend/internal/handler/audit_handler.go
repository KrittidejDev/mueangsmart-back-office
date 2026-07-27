package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type AuditLogHandler struct {
	auditUseCase domain.AuditLogUseCase
}

func NewAuditLogHandler(auditUseCase domain.AuditLogUseCase) *AuditLogHandler {
	return &AuditLogHandler{auditUseCase: auditUseCase}
}

func (h *AuditLogHandler) GetAuditLogs(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("pageSize", "20"))

	logs, total, err := h.auditUseCase.GetAuditLogs(c.Context(), page, pageSize)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":      logs,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}
