package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"github.com/mueangsmart/back-office/backend/pkg/middleware"
	"github.com/mueangsmart/back-office/backend/pkg/security"
)

type CityHandler struct {
	cityUseCase domain.CityUseCase
}

func NewCityHandler(cityUseCase domain.CityUseCase) *CityHandler {
	return &CityHandler{cityUseCase: cityUseCase}
}

func (h *CityHandler) GetAllCities(c fiber.Ctx) error {
	cities, err := h.cityUseCase.GetAllCities(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(cities)
}

func (h *CityHandler) GetCityByID(c fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid city id format",
		})
	}

	city, err := h.cityUseCase.GetCityByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(city)
}

func (h *CityHandler) UpdateCity(c fiber.Ctx) error {
	cityIDStr := c.Params("id")
	cityID, err := uuid.Parse(cityIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid city ID"})
	}

	var req domain.UpdateCityRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	updatedBy := "SystemSuperAdmin"
	if rawClaims := c.Locals(middleware.LocalSuperAdminClaims); rawClaims != nil {
		if claims, ok := rawClaims.(*security.JWTClaims); ok {
			updatedBy = claims.Username
		}
	}

	if err := h.cityUseCase.UpdateCity(c.Context(), cityID, req, updatedBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully updated city details",
	})
}

func (h *CityHandler) CreateCity(c fiber.Ctx) error {
	var req domain.CreateCityRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.NameTh == "" || req.NameEn == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "name_th and name_en are required",
		})
	}

	creator := "System"
	if rawClaims := c.Locals(middleware.LocalSuperAdminClaims); rawClaims != nil {
		if claims, ok := rawClaims.(*security.JWTClaims); ok {
			creator = claims.Username
		}
	}

	city, err := h.cityUseCase.CreateCity(c.Context(), req, creator)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(city)
}

func (h *CityHandler) UpdateCityStatus(c fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid city id format",
		})
	}

	var req domain.UpdateCityStatusRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	updatedBy := "System"
	if rawClaims := c.Locals(middleware.LocalSuperAdminClaims); rawClaims != nil {
		if claims, ok := rawClaims.(*security.JWTClaims); ok {
			updatedBy = claims.Username
		}
	}

	if err := h.cityUseCase.UpdateCityStatus(c.Context(), id, req, updatedBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "city status updated successfully",
	})
}

func (h *CityHandler) GetCityModules(c fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid city id format",
		})
	}

	modules, err := h.cityUseCase.GetCityModules(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(modules)
}

func (h *CityHandler) ToggleCityModule(c fiber.Ctx) error {
	idParam := c.Params("id")
	cityID, err := uuid.Parse(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid city id format",
		})
	}

	moduleParam := c.Params("moduleId")
	moduleID, err := uuid.Parse(moduleParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid module id format",
		})
	}

	var req domain.ToggleModuleRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	updatedBy := "System"
	if rawClaims := c.Locals(middleware.LocalSuperAdminClaims); rawClaims != nil {
		if claims, ok := rawClaims.(*security.JWTClaims); ok {
			updatedBy = claims.Username
		}
	}

	if err := h.cityUseCase.ToggleCityModule(c.Context(), cityID, moduleID, req, updatedBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "city module status toggled successfully",
	})
}
