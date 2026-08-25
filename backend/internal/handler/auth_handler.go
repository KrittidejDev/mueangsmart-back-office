package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"github.com/mueangsmart/back-office/backend/pkg/middleware"
	"github.com/mueangsmart/back-office/backend/pkg/security"
)

type AuthHandler struct {
	authUseCase domain.AuthUseCase
}

func NewAuthHandler(authUseCase domain.AuthUseCase) *AuthHandler {
	return &AuthHandler{authUseCase: authUseCase}
}

func (h *AuthHandler) Login(c fiber.Ctx) error {
	var req domain.LoginRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "username and password are required",
		})
	}

	res, err := h.authUseCase.Login(c.Context(), req.Username, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *AuthHandler) GetProfile(c fiber.Ctx) error {
	rawClaims := c.Locals(middleware.LocalSuperAdminClaims)
	if rawClaims == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	claims, ok := rawClaims.(*security.JWTClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	profile, err := h.authUseCase.GetProfile(c.Context(), claims.SuperAdminID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(profile)
}

func (h *AuthHandler) UpdateProfile(c fiber.Ctx) error {
	rawClaims := c.Locals(middleware.LocalSuperAdminClaims)
	if rawClaims == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	claims, ok := rawClaims.(*security.JWTClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	var req domain.UpdateProfileRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	updatedBy := claims.Username
	profile, err := h.authUseCase.UpdateProfile(c.Context(), claims.SuperAdminID, &req, updatedBy)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(profile)
}

func (h *AuthHandler) CreateUser(c fiber.Ctx) error {
	var req domain.CreateSuperAdminRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	createdBy := "SystemSuperAdmin"
	if rawClaims := c.Locals(middleware.LocalSuperAdminClaims); rawClaims != nil {
		if claims, ok := rawClaims.(*security.JWTClaims); ok {
			createdBy = claims.Username
		}
	}

	if err := h.authUseCase.CreateUser(c.Context(), &req, createdBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Successfully created new Back Office user",
	})
}

func (h *AuthHandler) DeleteUser(c fiber.Ctx) error {
	userIDStr := c.Params("id")
	targetID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var currentSuperAdminID uuid.UUID
	if rawClaims := c.Locals(middleware.LocalSuperAdminClaims); rawClaims != nil {
		if claims, ok := rawClaims.(*security.JWTClaims); ok {
			currentSuperAdminID = claims.SuperAdminID
		}
	}

	if err := h.authUseCase.DeleteUser(c.Context(), targetID, currentSuperAdminID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully deleted Back Office user",
	})
}

func (h *AuthHandler) GetAllUsers(c fiber.Ctx) error {
	users, err := h.authUseCase.GetUsers(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(users)
}

func (h *AuthHandler) GetAllRoles(c fiber.Ctx) error {
	roles, err := h.authUseCase.GetRoles(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(roles)
}
