package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/gorm"
)

type moduleRepository struct {
	db *gorm.DB
}

func NewModuleRepository(db *gorm.DB) domain.ModuleRepository {
	return &moduleRepository{db: db}
}

func (r *moduleRepository) CountActiveByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Table("\"MunicipalityModules\"").
		Where("\"MunicipalityId\" = ?", municipalityID).
		Count(&count).Error
	if err != nil {
		return 0, nil
	}
	return int(count), nil
}

func (r *moduleRepository) CountUsersByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Table("\"UserMunicipalities\"").
		Where("\"MunicipalityId\" = ?", municipalityID).
		Count(&count).Error
	if err != nil {
		return 0, nil
	}
	return int(count), nil
}

func (r *moduleRepository) CountAdminsByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Table("\"AdminUsers\"").
		Where("\"MunicipalityId\" = ?", municipalityID).
		Count(&count).Error
	if err != nil {
		return 0, nil
	}
	return int(count), nil
}

func (r *moduleRepository) CountRiverByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Table("\"ModuleRiverDeviceThresholds\"").
		Where("\"MunicipalityId\" = ?", municipalityID).
		Count(&count).Error
	if err != nil {
		return 0, nil
	}
	return int(count), nil
}

func (r *moduleRepository) CountSenseByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) (int, error) {
	// [ISOLATED LOGIC: Fahfon / Weather Sense]
	// โมดูลฟ้าฝนจะใช้การเชื่อมต่อและตรรกะเฉพาะแยกต่างหาก ไม่ดึงจาก MunicipalitySense โดยตรง
	// รอ Implement ส่วนเชื่อมโยงเฉพาะกิจเพิ่มเติมโดย Senior Engineer
	return 0, nil
}

func (r *moduleRepository) FindByMunicipalityID(ctx context.Context, municipalityID uuid.UUID) ([]domain.CityModuleStatus, error) {
	var results []domain.CityModuleStatus

	query := `
		SELECT 
			m."Id" AS module_id,
			m."NameTh" AS name_th,
			m."NameEn" AS name_en,
			COALESCE(m."Key", '') AS code,
			'' AS description,
			CASE WHEN mm."ModuleId" IS NOT NULL THEN true ELSE false END AS is_active
		FROM "Modules" m
		LEFT JOIN "MunicipalityModules" mm ON m."Id" = mm."ModuleId" AND mm."MunicipalityId" = ?
		WHERE m."Id" NOT IN ('669adf41-d5f6-4216-9535-9bfc1179d53a', '413bee92-d259-47e6-9f18-a311ca6a12dc')
		ORDER BY m."Sequence" ASC NULLS LAST, m."NameTh" ASC
	`

	err := r.db.WithContext(ctx).Raw(query, municipalityID).Scan(&results).Error
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (r *moduleRepository) FindAllMasterModules(ctx context.Context) ([]domain.CityModuleStatus, error) {
	var results []domain.CityModuleStatus
	query := `
		SELECT 
			m."Id" AS module_id,
			m."NameTh" AS name_th,
			m."NameEn" AS name_en,
			COALESCE(m."Key", '') AS code,
			'' AS description,
			true AS is_active
		FROM "Modules" m
		WHERE m."Id" NOT IN ('669adf41-d5f6-4216-9535-9bfc1179d53a', '413bee92-d259-47e6-9f18-a311ca6a12dc')
		ORDER BY m."Sequence" ASC NULLS LAST, m."NameTh" ASC
	`
	err := r.db.WithContext(ctx).Raw(query).Scan(&results).Error
	if err != nil {
		return nil, err
	}
	return results, nil
}

func (r *moduleRepository) UpsertModuleStatus(ctx context.Context, municipalityID, moduleID uuid.UUID, isActive bool, updatedBy string) error {
	if isActive {
		// Insert into MunicipalityModules if not already present
		return r.db.WithContext(ctx).Exec(`
			INSERT INTO "MunicipalityModules" ("MunicipalityId", "ModuleId")
			VALUES (?, ?)
			ON CONFLICT ("MunicipalityId", "ModuleId") DO NOTHING
		`, municipalityID, moduleID).Error
	}

	// If inactive, remove the row from MunicipalityModules
	return r.db.WithContext(ctx).Exec(`
		DELETE FROM "MunicipalityModules"
		WHERE "MunicipalityId" = ? AND "ModuleId" = ?
	`, municipalityID, moduleID).Error
}

func (r *moduleRepository) SyncCityModules(ctx context.Context, municipalityID uuid.UUID, selectedModuleIDs []string) error {
	if selectedModuleIDs == nil {
		return nil
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var selectedUUIDs []uuid.UUID
		for _, idStr := range selectedModuleIDs {
			if u, err := uuid.Parse(idStr); err == nil {
				selectedUUIDs = append(selectedUUIDs, u)
			}
		}

		if len(selectedUUIDs) > 0 {
			if err := tx.Exec(`
				DELETE FROM "MunicipalityModules"
				WHERE "MunicipalityId" = ? AND "ModuleId" NOT IN (?)
			`, municipalityID, selectedUUIDs).Error; err != nil {
				return err
			}

			for _, u := range selectedUUIDs {
				if err := tx.Exec(`
					INSERT INTO "MunicipalityModules" ("MunicipalityId", "ModuleId")
					VALUES (?, ?)
					ON CONFLICT ("MunicipalityId", "ModuleId") DO NOTHING
				`, municipalityID, u).Error; err != nil {
					return err
				}
			}
			return nil
		}

		return tx.Exec(`
			DELETE FROM "MunicipalityModules"
			WHERE "MunicipalityId" = ?
		`, municipalityID).Error
	})
}

func (r *moduleRepository) GetCityStatistics(ctx context.Context, cityID uuid.UUID) (*domain.CityModuleDetailStatistics, error) {
	stats := &domain.CityModuleDetailStatistics{
		CityId: cityID,
	}

	// 1. Dynamic Waste System Mode (Query from ModuleWasteFeesSystemModes)
	var wasteMode string
	err := r.db.WithContext(ctx).
		Table("\"ModuleWasteFeesSystemModes\"").
		Select("\"Mode\"").
		Where("\"MunicipalityId\" = ?", cityID.String()).
		Scan(&wasteMode).Error
	if err == nil && (wasteMode == "new" || wasteMode == "New") {
		stats.WasteSystemMode = "ระบบใหม่"
	} else {
		stats.WasteSystemMode = "ระบบเก่า"
	}

	// 2. Users & Admins
	r.db.WithContext(ctx).Table("\"UserMunicipalities\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.RegisteredUsers)
	stats.ActiveUsers = stats.RegisteredUsers
	r.db.WithContext(ctx).Table("\"AdminUsers\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.AdminUsers)

	// 3. Elderly & Bedridden (3 Types of Elderly/Disabled)
	r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabled\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.ElderlyAndDisabledCount)
	r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabled\"").Where("\"MunicipalityId\" = ? AND \"Type\" = 'Elderly'", cityID).Count(&stats.ElderlyCount)
	r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabled\"").Where("\"MunicipalityId\" = ? AND \"Type\" = 'Disabled'", cityID).Count(&stats.DisabledCount)
	r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabled\"").Where("\"MunicipalityId\" = ? AND \"Type\" = 'ElderlyAndDisabled'", cityID).Count(&stats.ElderlyAndDisabledBothCount)
	r.db.WithContext(ctx).Table("\"ModuleBedriddenPatient\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.BedriddenCount)

	// 4. Complaints (Total & Completed)
	r.db.WithContext(ctx).Table("\"ModuleComplaints\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.TotalComplaintsCount)
	stats.GeneralComplaintsCount = stats.TotalComplaintsCount
	r.db.WithContext(ctx).Table("\"ModuleComplaints\"").
		Where("\"MunicipalityId\" = ? AND (\"Status\" ILIKE 'Completed' OR \"Status\" ILIKE 'Resolved')", cityID).
		Count(&stats.ResolvedComplaintsCount)

	// 5. Online Tax (Land & Building vs Signboard)
	// Query ภาษีที่ดินและสิ่งปลูกสร้าง (ModuleTypeId: 338b45ad-8b66-4871-9529-0b07dae6887a)
	r.db.WithContext(ctx).Table("\"ModuleOnlineTaxPayments\" AS t").
		Joins("LEFT JOIN \"ModuleTypes\" AS m ON t.\"ModuleTypeId\" = m.\"Id\"").
		Where("t.\"MunicipalityId\" = ? AND (t.\"ModuleTypeId\"::text = '338b45ad-8b66-4871-9529-0b07dae6887a' OR m.\"NameTh\" LIKE '%ที่ดิน%' OR m.\"NameEn\" ILIKE '%land%')", cityID).
		Count(&stats.TaxLandBuildingCount)

	// Query ภาษีป้าย (ModuleTypeId: 1ea37dd5-9705-42e1-93d9-08f53881477a)
	r.db.WithContext(ctx).Table("\"ModuleOnlineTaxPayments\" AS t").
		Joins("LEFT JOIN \"ModuleTypes\" AS m ON t.\"ModuleTypeId\" = m.\"Id\"").
		Where("t.\"MunicipalityId\" = ? AND (t.\"ModuleTypeId\"::text = '1ea37dd5-9705-42e1-93d9-08f53881477a' OR m.\"NameTh\" LIKE '%ป้าย%' OR m.\"NameEn\" ILIKE '%sign%')", cityID).
		Count(&stats.TaxSignboardCount)

	// ตรวจสอบระดับรายชื่อประเมินภาษีของประชาชน (ModuleOnlineTaxPaymentInformations) หากมีข้อมูล ให้ใช้ยอดรวมระดับประชาชน
	var infoLandCount, infoSignCount int64
	r.db.WithContext(ctx).Table("\"ModuleOnlineTaxPaymentInformations\" AS i").
		Joins("JOIN \"ModuleOnlineTaxPayments\" AS t ON i.\"ModuleOnlineTaxPaymentId\" = t.\"Id\"").
		Joins("LEFT JOIN \"ModuleTypes\" AS m ON t.\"ModuleTypeId\" = m.\"Id\"").
		Where("t.\"MunicipalityId\" = ? AND (t.\"ModuleTypeId\"::text = '338b45ad-8b66-4871-9529-0b07dae6887a' OR m.\"NameTh\" LIKE '%ที่ดิน%' OR m.\"NameEn\" ILIKE '%land%')", cityID).
		Count(&infoLandCount)

	r.db.WithContext(ctx).Table("\"ModuleOnlineTaxPaymentInformations\" AS i").
		Joins("JOIN \"ModuleOnlineTaxPayments\" AS t ON i.\"ModuleOnlineTaxPaymentId\" = t.\"Id\"").
		Joins("LEFT JOIN \"ModuleTypes\" AS m ON t.\"ModuleTypeId\" = m.\"Id\"").
		Where("t.\"MunicipalityId\" = ? AND (t.\"ModuleTypeId\"::text = '1ea37dd5-9705-42e1-93d9-08f53881477a' OR m.\"NameTh\" LIKE '%ป้าย%' OR m.\"NameEn\" ILIKE '%sign%')", cityID).
		Count(&infoSignCount)

	if infoLandCount > 0 || infoSignCount > 0 {
		stats.TaxLandBuildingCount = infoLandCount
		stats.TaxSignboardCount = infoSignCount
	}

	// Fallback if records do not match specific keyword but exist under municipality
	if stats.TaxLandBuildingCount == 0 && stats.TaxSignboardCount == 0 {
		r.db.WithContext(ctx).Table("\"ModuleOnlineTaxPayments\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.TaxLandBuildingCount)
	}

	// 6. Pets
	r.db.WithContext(ctx).Table("\"ModulePetHealthPetInformations\"").Where("\"MunicipalityId\" = ? AND (\"PetType\" ILIKE '%dog%' OR \"PetType\" ILIKE '%สุนัข%')", cityID).Count(&stats.PetDogsCount)
	r.db.WithContext(ctx).Table("\"ModulePetHealthPetInformations\"").Where("\"MunicipalityId\" = ? AND (\"PetType\" ILIKE '%cat%' OR \"PetType\" ILIKE '%แมว%')", cityID).Count(&stats.PetCatsCount)

	// 7. PR & Notifications & Verification
	stats.VerifiedUsersCount = stats.RegisteredUsers
	r.db.WithContext(ctx).Table("\"ModulePublicRelations\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.PublicRelationsCount)
	r.db.WithContext(ctx).Table("\"ModuleNotifications\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.NotificationsCount)

	// 8. Waste Fees (Members, Total Bills, Paid Bills, Pending Bills)
	if stats.WasteSystemMode == "ระบบใหม่" {
		r.db.WithContext(ctx).Table("\"ModuleWasteFeesMembers\"").
			Where("\"MunicipalityId\" = ? AND (\"Status\" IS NULL OR \"Status\" != 'Deleted')", cityID).
			Count(&stats.WasteMembersCount)

		r.db.WithContext(ctx).Table("\"ModuleWasteFeesBills\"").
			Where("\"MunicipalityId\" = ? AND (\"Status\" IS NULL OR \"Status\" != 'Cancelled')", cityID).
			Count(&stats.WasteBillsCount)

		r.db.WithContext(ctx).Table("\"ModuleWasteFeesBills\"").
			Where("\"MunicipalityId\" = ? AND (\"Status\" ILIKE 'Completed' OR \"Status\" ILIKE 'Paid')", cityID).
			Count(&stats.WastePaidBillsCount)

		stats.WastePendingBillsCount = stats.WasteBillsCount - stats.WastePaidBillsCount
		if stats.WastePendingBillsCount < 0 {
			stats.WastePendingBillsCount = 0
		}
	} else {
		// Legacy Mode (ModuleWasteFees)
		r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").
			Where("\"MunicipalityId\" = ?", cityID).
			Distinct("\"IdentityNumber\"").
			Count(&stats.WasteMembersCount)

		r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").
			Where("\"MunicipalityId\" = ?", cityID).
			Count(&stats.WasteBillsCount)

		r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").
			Where("\"MunicipalityId\" = ? AND (\"Status\" ILIKE 'Completed' OR \"Status\" ILIKE 'Paid')", cityID).
			Count(&stats.WastePaidBillsCount)

		r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").
			Where("\"MunicipalityId\" = ? AND (\"Status\" NOT ILIKE 'Completed' AND \"Status\" NOT ILIKE 'Paid')", cityID).
			Count(&stats.WastePendingBillsCount)
	}

	// Fallback check: If New Mode returned 0 bills but Legacy has records, populate from Legacy
	if stats.WasteBillsCount == 0 {
		var legacyCount int64
		r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").Where("\"MunicipalityId\" = ?", cityID).Count(&legacyCount)
		if legacyCount > 0 {
			stats.WasteBillsCount = legacyCount
			r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").
				Where("\"MunicipalityId\" = ?", cityID).
				Distinct("\"IdentityNumber\"").
				Count(&stats.WasteMembersCount)
			r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").
				Where("\"MunicipalityId\" = ? AND (\"Status\" ILIKE 'Completed' OR \"Status\" ILIKE 'Paid')", cityID).
				Count(&stats.WastePaidBillsCount)
			r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").
				Where("\"MunicipalityId\" = ? AND (\"Status\" NOT ILIKE 'Completed' AND \"Status\" NOT ILIKE 'Paid')", cityID).
				Count(&stats.WastePendingBillsCount)
		}
	}

	// 9. CCTV (Cameras count via CameraGroups JOIN, View sessions)
	r.db.WithContext(ctx).Table("\"ModuleCctvCameras\" AS c").
		Joins("JOIN \"ModuleCctvCameraGroups\" AS g ON c.\"GroupId\" = g.\"Id\"").
		Where("g.\"MunicipalityId\" = ? AND (c.\"IsDeleted\" = false OR c.\"IsDeleted\" IS NULL) AND (g.\"IsDeleted\" = false OR g.\"IsDeleted\" IS NULL)", cityID).
		Count(&stats.CctvCamerasCount)

	r.db.WithContext(ctx).Table("\"ModuleCctvViewSessions\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.CctvViewsCount)

	// 10. River
	r.db.WithContext(ctx).Table("\"ModuleRiverDeviceThresholds\"").Where("\"MunicipalityId\" = ?", cityID).Count(&stats.RiverStationsCount)
	stats.RiverOnlineCount = stats.RiverStationsCount
	stats.RiverOfflineCount = 0

	// 11. Sense / Fahfon (Isolated Logic - Managed asynchronously by Gateway Service)
	stats.SenseStationsCount = 0
	stats.SenseOnlineCount = 0
	stats.SenseOfflineCount = 0

	return stats, nil
}
