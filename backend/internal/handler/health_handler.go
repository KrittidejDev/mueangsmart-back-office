package handler

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Check(c fiber.Ctx) error {
	res := domain.HealthCheckResponse{
		Status:    "OK",
		Service:   "MueangSmart Back Office Fiber v3 API",
		Timestamp: time.Now(),
		Version:   "1.0.0",
	}
	return c.Status(fiber.StatusOK).JSON(res)
}
