package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"github.com/mueangsmart/back-office/backend/pkg/middleware"
	"github.com/mueangsmart/back-office/backend/pkg/security"
)

type ModuleManagementHandler struct {
	useCase domain.ModuleManagementUseCase
}

// NewModuleManagementHandler creates a new instance of ModuleManagementHandler.
func NewModuleManagementHandler(useCase domain.ModuleManagementUseCase) *ModuleManagementHandler {
	return &ModuleManagementHandler{useCase: useCase}
}

// GetAllModules handles GET /api/v1/modules/management
func (h *ModuleManagementHandler) GetAllModules(c fiber.Ctx) error {
	modules, err := h.useCase.GetAllModules(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(modules)
}

// GetModuleByID handles GET /api/v1/modules/management/:id
func (h *ModuleManagementHandler) GetModuleByID(c fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid module id format",
		})
	}

	module, err := h.useCase.GetModuleByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(module)
}

// CreateModule handles POST /api/v1/modules/management
func (h *ModuleManagementHandler) CreateModule(c fiber.Ctx) error {
	var req domain.CreateModuleRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	createdBy := "SystemSuperAdmin"
	if rawClaims := c.Locals(middleware.LocalSuperAdminClaims); rawClaims != nil {
		if claims, ok := rawClaims.(*security.JWTClaims); ok {
			createdBy = claims.Username
		}
	}

	created, err := h.useCase.CreateModule(c.Context(), req, createdBy)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(created)
}

// UpdateModule handles PUT /api/v1/modules/management/:id
func (h *ModuleManagementHandler) UpdateModule(c fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid module id format",
		})
	}

	var req domain.UpdateModuleRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	updatedBy := "SystemSuperAdmin"
	if rawClaims := c.Locals(middleware.LocalSuperAdminClaims); rawClaims != nil {
		if claims, ok := rawClaims.(*security.JWTClaims); ok {
			updatedBy = claims.Username
		}
	}

	updated, err := h.useCase.UpdateModule(c.Context(), id, req, updatedBy)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(updated)
}
