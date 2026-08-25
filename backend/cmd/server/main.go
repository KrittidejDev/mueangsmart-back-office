package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"

	"github.com/mueangsmart/back-office/backend/internal/config"
	"github.com/mueangsmart/back-office/backend/internal/handler"
	"github.com/mueangsmart/back-office/backend/internal/repository"
	"github.com/mueangsmart/back-office/backend/internal/usecase"
	"github.com/mueangsmart/back-office/backend/pkg/middleware"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load application config: %v", err)
	}

	db, err := config.InitDatabase(cfg.DatabaseDSN)
	if err != nil {
		log.Printf("Warning: Database connection failed: %v", err)
	} else {
		log.Println("Successfully connected to UAT Database!")
		config.SeedInitialSuperAdmin(db)
	}

	app := fiber.New(fiber.Config{
		AppName:      "MueangSmart Back Office SuperAdmin Service",
		ServerHeader: "Go-Fiber-v3",
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{"Origin, Content-Type, Accept, Authorization"},
	}))

	if db != nil {
		app.Use(middleware.AuditLogger(db))
	}

	healthHandler := handler.NewHealthHandler()
	api := app.Group("/api/v1")
	api.Get("/health", healthHandler.Check)

	if db != nil {
		adminRepo := repository.NewSuperAdminRepository(db)
		roleRepo := repository.NewRoleRepository(db)
		authUseCase := usecase.NewAuthUseCase(adminRepo, roleRepo, cfg.JWTSecret)
		authHandler := handler.NewAuthHandler(authUseCase)

		cityRepo := repository.NewCityRepository(db)
		moduleRepo := repository.NewModuleRepository(db)
		cityUseCase := usecase.NewCityUseCase(cityRepo, moduleRepo)
		cityHandler := handler.NewCityHandler(cityUseCase)

		moduleMgmtRepo := repository.NewModuleManagementRepository(db)
		moduleMgmtUseCase := usecase.NewModuleManagementUseCase(moduleMgmtRepo)
		moduleMgmtHandler := handler.NewModuleManagementHandler(moduleMgmtUseCase)

		analyticsRepo := repository.NewAnalyticsRepository(db)
		analyticsUseCase := usecase.NewAnalyticsUseCase(analyticsRepo)
		analyticsHandler := handler.NewAnalyticsHandler(analyticsUseCase)

		auditRepo := repository.NewAuditLogRepository(db)
		auditUseCase := usecase.NewAuditLogUseCase(auditRepo)
		auditHandler := handler.NewAuditLogHandler(auditUseCase)

		authGroup := api.Group("/auth")
		authGroup.Post("/login", authHandler.Login)
		protectedAuth := authGroup.Group("", middleware.AuthGuard(cfg.JWTSecret))
		protectedAuth.Get("/me", authHandler.GetProfile)

		usersGroup := api.Group("/super-admins", middleware.AuthGuard(cfg.JWTSecret), middleware.RequirePermission(roleRepo, "User", "Manage"))
		usersGroup.Get("/", authHandler.GetAllUsers)
		usersGroup.Post("/", authHandler.CreateUser)
		usersGroup.Delete("/:id", authHandler.DeleteUser)

		rolesGroup := api.Group("/roles", middleware.AuthGuard(cfg.JWTSecret))
		rolesGroup.Get("/", authHandler.GetAllRoles)

		citiesGroup := api.Group("/cities", middleware.AuthGuard(cfg.JWTSecret))
		citiesGroup.Get("/", cityHandler.GetAllCities)
		citiesGroup.Post("/", middleware.RequirePermission(roleRepo, "City", "Create"), cityHandler.CreateCity)
		citiesGroup.Get("/:id", cityHandler.GetCityByID)
		citiesGroup.Put("/:id", middleware.RequirePermission(roleRepo, "City", "Write"), cityHandler.UpdateCity)
		citiesGroup.Patch("/:id/status", middleware.RequirePermission(roleRepo, "City", "Write"), cityHandler.UpdateCityStatus)
		citiesGroup.Get("/:id/modules", cityHandler.GetCityModules)
		citiesGroup.Get("/:id/statistics", cityHandler.GetCityStatistics)
		citiesGroup.Patch("/:id/modules/:moduleId", middleware.RequirePermission(roleRepo, "Module", "Toggle"), cityHandler.ToggleCityModule)

		modulesGroup := api.Group("/modules", middleware.AuthGuard(cfg.JWTSecret))
		modulesGroup.Get("/", cityHandler.GetAllMasterModules)
		modulesGroup.Get("/management", moduleMgmtHandler.GetAllModules)
		modulesGroup.Get("/management/:id", moduleMgmtHandler.GetModuleByID)
		modulesGroup.Post("/management", middleware.RequirePermission(roleRepo, "Module", "Manage"), moduleMgmtHandler.CreateModule)
		modulesGroup.Put("/management/:id", middleware.RequirePermission(roleRepo, "Module", "Manage"), moduleMgmtHandler.UpdateModule)

		analyticsGroup := api.Group("/analytics", middleware.AuthGuard(cfg.JWTSecret))
		analyticsGroup.Get("/overview", analyticsHandler.GetOverview)
		analyticsGroup.Get("/vulnerable-groups", analyticsHandler.GetVulnerableGroups)
		analyticsGroup.Get("/approvals", analyticsHandler.GetApprovalStatuses)
		analyticsGroup.Get("/modules", analyticsHandler.GetModuleMetrics)

		auditGroup := api.Group("/audit-logs", middleware.AuthGuard(cfg.JWTSecret), middleware.RequirePermission(roleRepo, "AuditLog", "Read"))
		auditGroup.Get("/", auditHandler.GetAuditLogs)

		assetHandler := handler.NewAssetHandler(cfg)
		app.Get("/assets/:id", assetHandler.GetAsset)
		api.Get("/assets/:id", assetHandler.GetAsset)

		assetsGroup := api.Group("/assets", middleware.AuthGuard(cfg.JWTSecret))
		assetsGroup.Post("/upload", assetHandler.UploadAsset)
		assetsGroup.Post("/delete", assetHandler.DeleteAsset)
		assetsGroup.Delete("/:id", assetHandler.DeleteAsset)
	}

	log.Printf("Starting MueangSmart Back Office Fiber v3 backend on port %s (%s)", cfg.AppPort, cfg.AppEnv)
	if err := app.Listen(":" + cfg.AppPort); err != nil {
		log.Fatalf("Error starting Fiber server: %v", err)
	}
}
