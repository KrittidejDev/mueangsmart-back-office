package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/mueangsmart/back-office/backend/internal/config"
	"github.com/mueangsmart/back-office/backend/pkg/security"
)

type AssetHandler struct {
	cfg *config.Config
}

func NewAssetHandler(cfg *config.Config) *AssetHandler {
	return &AssetHandler{cfg: cfg}
}

const (
	MaxAssetFileSize = 5 * 1024 * 1024 // 5MB (aligned with C# FileService.cs)
)

var allowedAssetExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".pdf":  true,
}

func (h *AssetHandler) UploadAsset(c fiber.Ctx) error {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No file provided in form-data ('file')",
		})
	}

	// 1. Validation (aligned with C# FileService.cs)
	if fileHeader.Size > MaxAssetFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File size exceeds the maximum limit of 5MB",
		})
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if !allowedAssetExtensions[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed",
		})
	}

	zone := c.FormValue("zone", "public")
	pathVal := c.FormValue("path", "LogoMunicipality")
	municipalityID := c.FormValue("municipalityId", "")
	identity := c.FormValue("identity", "")
	oldAssetID := c.FormValue("oldAssetId", "")

	// Extract userId from authenticated JWT if available
	userID := c.FormValue("userId", "")
	if userID == "" {
		if rawClaims := c.Locals("superadmin_claims"); rawClaims != nil {
			if claims, ok := rawClaims.(*security.JWTClaims); ok && claims != nil {
				userID = claims.SuperAdminID.String()
			}
		}
	}

	// 2. If oldAssetId is supplied, trigger cleanup in microservice (matching C# UpdateWithValidateAndUpload)
	microApiURL := h.cfg.MicroApiUrl
	if microApiURL == "" || microApiURL == "https://api.mueangsmart.com" {
		microApiURL = "https://micro-api.mueangsmart.com"
	}

	if oldAssetID != "" && oldAssetID != "00000000-0000-0000-0000-000000000000" {
		go h.deleteOldAsset(microApiURL, oldAssetID)
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to open uploaded file",
		})
	}
	defer file.Close()

	// 3. Build multipart payload to forward to ms-api-micro
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	part, err := writer.CreateFormFile("file", fileHeader.Filename)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create form part",
		})
	}
	if _, err := io.Copy(part, file); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to copy file contents",
		})
	}

	_ = writer.WriteField("zone", zone)
	_ = writer.WriteField("path", pathVal)
	if municipalityID != "" && municipalityID != "00000000-0000-0000-0000-000000000000" {
		_ = writer.WriteField("municipalityId", municipalityID)
	}
	if identity != "" {
		_ = writer.WriteField("identity", identity)
	}
	if userID != "" && userID != "00000000-0000-0000-0000-000000000000" {
		_ = writer.WriteField("userId", userID)
	}
	_ = writer.Close()

	targetURL := fmt.Sprintf("%s/internal/assets/upload", strings.TrimRight(microApiURL, "/"))
	req, err := http.NewRequestWithContext(c.Context(), http.MethodPost, targetURL, &requestBody)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to construct upload request",
		})
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": fmt.Sprintf("Microservice upload unreachable: %v", err),
		})
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read response from microservice",
		})
	}

	c.Status(resp.StatusCode)
	c.Set("Content-Type", "application/json")
	return c.Send(bodyBytes)
}

func (h *AssetHandler) DeleteAsset(c fiber.Ctx) error {
	assetID := c.Params("id")
	if assetID == "" {
		assetID = c.FormValue("assetId")
	}
	if assetID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Asset ID is required",
		})
	}

	microApiURL := h.cfg.MicroApiUrl
	if microApiURL == "" || microApiURL == "https://api.mueangsmart.com" {
		microApiURL = "https://micro-api.mueangsmart.com"
	}

	h.deleteOldAsset(microApiURL, assetID)
	return c.JSON(fiber.Map{
		"message": "Asset delete request dispatched",
		"assetId": assetID,
	})
}

func (h *AssetHandler) GetAsset(c fiber.Ctx) error {
	assetID := c.Params("id")
	if assetID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Asset ID is required",
		})
	}

	mainApiURL := h.cfg.MainApiUrl
	if mainApiURL == "" {
		mainApiURL = h.cfg.MicroApiUrl
	}
	if mainApiURL == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "MAIN_API_URL or MICRO_API_URL is not configured",
		})
	}

	targetURL := fmt.Sprintf("%s/assets/%s", strings.TrimRight(mainApiURL, "/"), assetID)
	return c.Redirect().To(targetURL)
}

func (h *AssetHandler) deleteOldAsset(microBaseURL, assetID string) {
	deleteURL := fmt.Sprintf("%s/internal/assets/delete", strings.TrimRight(microBaseURL, "/"))
	payload, _ := json.Marshal(map[string]string{"assetId": assetID})

	req, err := http.NewRequest(http.MethodPost, deleteURL, bytes.NewBuffer(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err == nil && resp != nil {
		_ = resp.Body.Close()
	}
}

