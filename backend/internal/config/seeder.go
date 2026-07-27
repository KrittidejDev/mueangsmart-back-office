package config

import (
	"context"
	"log"

	"github.com/mueangsmart/back-office/backend/internal/domain"
	"github.com/mueangsmart/back-office/backend/pkg/security"
	"gorm.io/gorm"
)

func SeedInitialSuperAdmin(db *gorm.DB) {
	ctx := context.Background()

	// 1. Ensure 3-Tier Roles Exist: SuperAdmin, Admin, Executive
	rolesToSeed := []domain.BoRole{
		{
			Name:        "SuperAdmin",
			Description: "Platform SuperAdmin with full control, onboarding, and audit log access",
			CreatedBy:   "SystemSeeder",
		},
		{
			Name:        "Admin",
			Description: "Back Office Admin for City and Module Management",
			CreatedBy:   "SystemSeeder",
		},
		{
			Name:        "Executive",
			Description: "Executive Read-Only Viewer for City Details & Analytics",
			CreatedBy:   "SystemSeeder",
		},
	}

	roleMap := make(map[string]domain.BoRole)
	for _, r := range rolesToSeed {
		var role domain.BoRole
		err := db.WithContext(ctx).Where("\"Name\" = ?", r.Name).First(&role).Error
		if err == gorm.ErrRecordNotFound {
			role = r
			if err := db.WithContext(ctx).Create(&role).Error; err != nil {
				log.Printf("Seeder Warning: Failed to create role %s: %v", r.Name, err)
				continue
			}
			log.Printf("Seeder: Created role '%s'", r.Name)
		}
		roleMap[r.Name] = role
	}

	// 2. Seed Permissions for Roles
	superAdminRole := roleMap["SuperAdmin"]
	adminRole := roleMap["Admin"]
	executiveRole := roleMap["Executive"]

	permissionsToSeed := []domain.BoPermission{
		// SuperAdmin Permissions
		{RoleId: superAdminRole.Id, Resource: "City", Action: "Read"},
		{RoleId: superAdminRole.Id, Resource: "City", Action: "Write"},
		{RoleId: superAdminRole.Id, Resource: "City", Action: "Create"},
		{RoleId: superAdminRole.Id, Resource: "Module", Action: "Toggle"},
		{RoleId: superAdminRole.Id, Resource: "User", Action: "Manage"},
		{RoleId: superAdminRole.Id, Resource: "AuditLog", Action: "Read"},

		// Admin Permissions
		{RoleId: adminRole.Id, Resource: "City", Action: "Read"},
		{RoleId: adminRole.Id, Resource: "City", Action: "Write"},
		{RoleId: adminRole.Id, Resource: "Module", Action: "Toggle"},

		// Executive Permissions
		{RoleId: executiveRole.Id, Resource: "City", Action: "Read"},
		{RoleId: executiveRole.Id, Resource: "Module", Action: "Read"},
	}

	for _, p := range permissionsToSeed {
		if p.RoleId == [16]byte{} {
			continue
		}
		var count int64
		db.WithContext(ctx).Model(&domain.BoPermission{}).
			Where("\"RoleId\" = ? AND \"Resource\" = ? AND \"Action\" = ?", p.RoleId, p.Resource, p.Action).
			Count(&count)
		if count == 0 {
			_ = db.WithContext(ctx).Create(&p).Error
		}
	}

	// 3. Ensure Initial SuperAdmin Account Exists
	var count int64
	db.WithContext(ctx).Model(&domain.BoSuperAdmin{}).Count(&count)
	if count == 0 && superAdminRole.Id != ([16]byte{}) {
		hashedPassword, err := security.HashPassword("SuperAdmin2026!")
		if err != nil {
			log.Printf("Seeder Warning: Failed to hash password: %v", err)
			return
		}

		admin := domain.BoSuperAdmin{
			Username:     "superadmin",
			Email:        "superadmin@mueangsmart.go.th",
			PasswordHash: hashedPassword,
			FullName:     "System SuperAdmin",
			RoleId:       superAdminRole.Id,
			IsActive:     true,
			CreatedBy:    "SystemSeeder",
		}

		if err := db.WithContext(ctx).Create(&admin).Error; err != nil {
			log.Printf("Seeder Warning: Failed to seed initial SuperAdmin user: %v", err)
			return
		}
		log.Println("Seeder: Successfully created initial SuperAdmin user (Username: 'superadmin')")
	}
}
