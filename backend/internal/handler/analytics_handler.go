package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type AnalyticsHandler struct {
	analyticsUseCase domain.AnalyticsUseCase
}

func NewAnalyticsHandler(analyticsUseCase domain.AnalyticsUseCase) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsUseCase: analyticsUseCase}
}

func (h *AnalyticsHandler) GetOverview(c fiber.Ctx) error {
	overview, err := h.analyticsUseCase.GetOverview(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(overview)
}

func (h *AnalyticsHandler) GetVulnerableGroups(c fiber.Ctx) error {
	stats, err := h.analyticsUseCase.GetVulnerableGroups(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(stats)
}

func (h *AnalyticsHandler) GetApprovalStatuses(c fiber.Ctx) error {
	stats, err := h.analyticsUseCase.GetApprovalStatuses(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(stats)
}

func (h *AnalyticsHandler) GetModuleMetrics(c fiber.Ctx) error {
	stats, err := h.analyticsUseCase.GetModuleMetrics(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(stats)
}
