package handler

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type GisHandler struct {
	gisUseCase domain.GisUseCase
}

func NewGisHandler(gisUseCase domain.GisUseCase) *GisHandler {
	return &GisHandler{gisUseCase: gisUseCase}
}

func (h *GisHandler) GetLayerSummaries(c fiber.Ctx) error {
	var cityID *uuid.UUID
	cityIDStr := c.Query("city_id")
	if cityIDStr != "" {
		if id, err := uuid.Parse(cityIDStr); err == nil {
			cityID = &id
		}
	}

	summaries, err := h.gisUseCase.GetLayerSummaries(c.Context(), cityID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"layers": summaries,
	})
}

func (h *GisHandler) GetPoints(c fiber.Ctx) error {
	var filter domain.GisFilterRequest

	cityIDStr := c.Query("city_id")
	if cityIDStr != "" {
		if id, err := uuid.Parse(cityIDStr); err == nil {
			filter.CityID = &id
		}
	}

	layersStr := c.Query("layers")
	if layersStr != "" {
		filter.Layers = strings.Split(layersStr, ",")
	}

	filter.Status = c.Query("status")
	filter.Search = c.Query("search")

	points, err := h.gisUseCase.GetPoints(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"total":  len(points),
		"points": points,
	})
}
