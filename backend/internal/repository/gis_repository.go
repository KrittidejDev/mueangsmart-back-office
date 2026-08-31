package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"gorm.io/gorm"
)

type gisRepository struct {
	db *gorm.DB
}

func NewGisRepository(db *gorm.DB) domain.GisRepository {
	return &gisRepository{db: db}
}

// Helper to construct unambiguous Thailand coordinates condition with table alias
func coordCond(alias string) string {
	if alias == "" {
		return "\"Latitude\" BETWEEN 5.0 AND 21.0 AND \"Longitude\" BETWEEN 97.0 AND 106.0"
	}
	return fmt.Sprintf("%s.\"Latitude\" BETWEEN 5.0 AND 21.0 AND %s.\"Longitude\" BETWEEN 97.0 AND 106.0", alias, alias)
}

func (r *gisRepository) GetLayerSummaries(ctx context.Context, cityID *uuid.UUID) ([]domain.GisLayerSummary, error) {
	summaries := []domain.GisLayerSummary{
		{
			LayerKey:    "complaint",
			NameTh:      "เรื่องร้องทุกข์ร้องเรียน",
			NameEn:      "Public Complaints",
			Icon:        "AlertTriangle",
			Color:       "#ef4444", // Red
			IsDefaultOn: true,
		},
		{
			LayerKey:    "complaint_activity",
			NameTh:      "จุดลงพื้นที่แก้ไขเรื่องร้องทุกข์",
			NameEn:      "Complaint Field Actions",
			Icon:        "Wrench",
			Color:       "#f97316", // Orange
			IsDefaultOn: true,
		},
		{
			LayerKey:    "elderly",
			NameTh:      "ผู้สูงอายุและผู้พิการ",
			NameEn:      "Elderly & Disabled",
			Icon:        "Users",
			Color:       "#3b82f6", // Blue
			IsDefaultOn: true,
		},
		{
			LayerKey:    "elderly_assistance",
			NameTh:      "คำร้องขอความช่วยเหลือผู้สูงอายุ",
			NameEn:      "Elderly Assistance Requests",
			Icon:        "LifeBuoy",
			Color:       "#0284c7", // Sky blue
			IsDefaultOn: true,
		},
		{
			LayerKey:    "bedridden",
			NameTh:      "ผู้ป่วยติดเตียง",
			NameEn:      "Bedridden Patients",
			Icon:        "HeartPulse",
			Color:       "#a855f7", // Purple
			IsDefaultOn: true,
		},
		{
			LayerKey:    "bedridden_assistance",
			NameTh:      "คำร้องขอความช่วยเหลือผู้ป่วยติดเตียง",
			NameEn:      "Bedridden Assistance Requests",
			Icon:        "Activity",
			Color:       "#7c3aed", // Deep purple
			IsDefaultOn: true,
		},
		{
			LayerKey:    "cctv",
			NameTh:      "กล้องวงจรปิด CCTV",
			NameEn:      "CCTV Cameras",
			Icon:        "Camera",
			Color:       "#10b981", // Emerald
			IsDefaultOn: true,
		},
		{
			LayerKey:    "pet",
			NameTh:      "สัตว์เลี้ยง (สุนัข/แมว)",
			NameEn:      "Pet Registration",
			Icon:        "PawPrint",
			Color:       "#f59e0b", // Amber
			IsDefaultOn: true,
		},
		{
			LayerKey:    "pet_service",
			NameTh:      "จุดบริการ/ฉีดวัคซีนสัตว์เลี้ยง",
			NameEn:      "Pet Health Services",
			Icon:        "Syringe",
			Color:       "#d97706", // Dark Amber
			IsDefaultOn: true,
		},
		{
			LayerKey:    "waste_fee",
			NameTh:      "จุดจัดเก็บค่าธรรมเนียมขยะ",
			NameEn:      "Waste Fee Payment Points",
			Icon:        "Trash2",
			Color:       "#14b8a6", // Teal
			IsDefaultOn: true,
		},
		{
			LayerKey:    "municipality",
			NameTh:      "ที่ตั้งสำนักงานเทศบาล",
			NameEn:      "City Halls",
			Icon:        "Building2",
			Color:       "#6366f1", // Indigo
			IsDefaultOn: true,
		},
	}

	for i := range summaries {
		var cnt int64
		switch summaries[i].LayerKey {
		case "complaint":
			q := r.db.WithContext(ctx).Table("\"ModuleComplaints\"").Where(coordCond(""))
			if cityID != nil {
				q = q.Where("\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "complaint_activity":
			q := r.db.WithContext(ctx).Table("\"ModuleComplaintDepartmentAssignActivities\" AS a").
				Joins("LEFT JOIN \"ModuleComplaints\" AS c ON a.\"ModuleComplaintId\" = c.\"Id\"").
				Where(coordCond("a"))
			if cityID != nil {
				q = q.Where("c.\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "elderly":
			q := r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabled\"").Where(coordCond(""))
			if cityID != nil {
				q = q.Where("\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "elderly_assistance":
			q := r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabledAssistanceRequests\" AS r").
				Joins("LEFT JOIN \"ModuleElderlyAndDisabled\" AS e ON r.\"ModuleElderlyAndDisabledId\" = e.\"Id\"").
				Where(coordCond("r"))
			if cityID != nil {
				q = q.Where("e.\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "bedridden":
			q := r.db.WithContext(ctx).Table("\"ModuleBedriddenPatient\"").Where(coordCond(""))
			if cityID != nil {
				q = q.Where("\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "bedridden_assistance":
			q := r.db.WithContext(ctx).Table("\"ModuleBedriddenPatientAssistanceRequests\" AS r").
				Joins("LEFT JOIN \"ModuleBedriddenPatient\" AS b ON r.\"ModuleBedriddenPatientId\" = b.\"Id\"").
				Where(coordCond("r"))
			if cityID != nil {
				q = q.Where("b.\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "cctv":
			q := r.db.WithContext(ctx).Table("\"ModuleCctvCameras\" AS c").
				Joins("LEFT JOIN \"ModuleCctvCameraGroups\" AS g ON c.\"GroupId\" = g.\"Id\"").
				Where("c.\"IsDeleted\" = false AND " + coordCond("c"))
			if cityID != nil {
				q = q.Where("g.\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "pet":
			q := r.db.WithContext(ctx).Table("\"ModulePetHealthPetInformations\"").Where(coordCond(""))
			if cityID != nil {
				q = q.Where("\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "pet_service":
			q := r.db.WithContext(ctx).Table("\"ModulePetHealthPetServices\"").Where(coordCond(""))
			if cityID != nil {
				q = q.Where("\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "waste_fee":
			q := r.db.WithContext(ctx).Table("\"ModuleWasteFees\"").Where(coordCond(""))
			if cityID != nil {
				q = q.Where("\"MunicipalityId\" = ?", *cityID)
			}
			q.Count(&cnt)

		case "municipality":
			q := r.db.WithContext(ctx).Table("\"Municipalities\"").Where(coordCond(""))
			if cityID != nil {
				q = q.Where("\"Id\" = ?", *cityID)
			}
			q.Count(&cnt)
		}

		summaries[i].Count = cnt
	}

	return summaries, nil
}

func (r *gisRepository) GetPoints(ctx context.Context, filter domain.GisFilterRequest) ([]domain.GisPoint, error) {
	var points []domain.GisPoint

	layerMap := make(map[string]bool)
	if len(filter.Layers) > 0 {
		for _, l := range filter.Layers {
			lKey := strings.TrimSpace(l)
			if lKey != "" && lKey != "none" {
				layerMap[lKey] = true
			}
		}
	} else {
		// All layers default
		layerMap["complaint"] = true
		layerMap["complaint_activity"] = true
		layerMap["elderly"] = true
		layerMap["elderly_assistance"] = true
		layerMap["bedridden"] = true
		layerMap["bedridden_assistance"] = true
		layerMap["cctv"] = true
		layerMap["pet"] = true
		layerMap["pet_service"] = true
		layerMap["waste_fee"] = true
		layerMap["municipality"] = true
	}

	// If explicit empty filter passed (e.g. layers="none")
	if len(layerMap) == 0 {
		return points, nil
	}

	// 1. Complaints
	if layerMap["complaint"] {
		type complaintRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			DocumentID       *string    `gorm:"column:DocumentId"`
			Description      string     `gorm:"column:Description"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
			TypeName         *string    `gorm:"column:TypeName"`
		}

		var rows []complaintRow
		q := r.db.WithContext(ctx).Table("\"ModuleComplaints\" AS c").
			Select("c.\"Id\", c.\"DocumentId\", c.\"Description\", c.\"Status\", c.\"Latitude\", c.\"Longitude\", c.\"CreatedDate\", c.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\", t.\"NameTh\" AS \"TypeName\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON c.\"MunicipalityId\" = m.\"Id\"").
			Joins("LEFT JOIN \"ModuleTypes\" AS t ON c.\"ModuleTypeId\" = t.\"Id\"").
			Where(coordCond("c"))

		if filter.CityID != nil {
			q = q.Where("c.\"MunicipalityId\" = ?", *filter.CityID)
		}
		if filter.Search != "" {
			pattern := "%" + filter.Search + "%"
			q = q.Where("c.\"Description\" ILIKE ? OR c.\"DocumentId\" ILIKE ?", pattern, pattern)
		}

		q.Find(&rows)

		for _, row := range rows {
			docID := ""
			if row.DocumentID != nil {
				docID = *row.DocumentID
			}
			cat := "ร้องทุกข์ทั่วไป"
			if row.TypeName != nil && *row.TypeName != "" {
				cat = *row.TypeName
			}

			title := docID
			if title == "" {
				title = cat
			}

			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "complaint",
				Title:       title,
				Subtitle:    row.Description,
				Category:    cat,
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 2. Complaint Activities (ลงพื้นที่แก้ไข)
	if layerMap["complaint_activity"] {
		type actRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			Description      string     `gorm:"column:Description"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
			DocumentID       *string    `gorm:"column:DocumentId"`
		}

		var rows []actRow
		q := r.db.WithContext(ctx).Table("\"ModuleComplaintDepartmentAssignActivities\" AS a").
			Select("a.\"Id\", a.\"Description\", a.\"Status\", a.\"Latitude\", a.\"Longitude\", a.\"CreatedDate\", a.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\", a.\"DocumentId\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON a.\"MunicipalityId\" = m.\"Id\"").
			Where(coordCond("a"))

		if filter.CityID != nil {
			q = q.Where("a.\"MunicipalityId\" = ?", *filter.CityID)
		}
		q.Find(&rows)

		for _, row := range rows {
			docID := ""
			if row.DocumentID != nil {
				docID = *row.DocumentID
			}
			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "complaint_activity",
				Title:       fmt.Sprintf("ลงพื้นที่: %s", docID),
				Subtitle:    row.Description,
				Category:    "กิจกรรมลงพื้นที่แก้ไข",
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 3. Elderly & Disabled
	if layerMap["elderly"] {
		type elderlyRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			Prefix           *string    `gorm:"column:Prefix"`
			Name             string     `gorm:"column:Name"`
			LastName         string     `gorm:"column:LastName"`
			Address          *string    `gorm:"column:Address"`
			ContactNumber    *string    `gorm:"column:ContactNumber"`
			Type             *string    `gorm:"column:Type"`
			Disability       *string    `gorm:"column:Disability"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
		}

		var rows []elderlyRow
		q := r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabled\" AS e").
			Select("e.\"Id\", e.\"Prefix\", e.\"Name\", e.\"LastName\", e.\"Address\", e.\"ContactNumber\", e.\"Type\", e.\"Disability\", e.\"Status\", e.\"Latitude\", e.\"Longitude\", e.\"CreatedDate\", e.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON e.\"MunicipalityId\" = m.\"Id\"").
			Where(coordCond("e"))

		if filter.CityID != nil {
			q = q.Where("e.\"MunicipalityId\" = ?", *filter.CityID)
		}
		if filter.Search != "" {
			pattern := "%" + filter.Search + "%"
			q = q.Where("e.\"Name\" ILIKE ? OR e.\"LastName\" ILIKE ? OR e.\"Address\" ILIKE ?", pattern, pattern, pattern)
		}

		q.Find(&rows)

		for _, row := range rows {
			prefix := ""
			if row.Prefix != nil {
				prefix = *row.Prefix
			}
			addr := ""
			if row.Address != nil {
				addr = *row.Address
			}
			contact := ""
			if row.ContactNumber != nil {
				contact = *row.ContactNumber
			}
			category := "ผู้สูงอายุ"
			if row.Type != nil && *row.Type != "" {
				category = *row.Type
			}

			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "elderly",
				Title:       fmt.Sprintf("%s%s %s", prefix, row.Name, row.LastName),
				Subtitle:    addr,
				Category:    category,
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				Address:     addr,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				Contact:     contact,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 4. Elderly Assistance Requests
	if layerMap["elderly_assistance"] {
		type assistRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			DocumentID       *string    `gorm:"column:DocumentId"`
			Topic            string     `gorm:"column:Topic"`
			Description      string     `gorm:"column:Description"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
		}

		var rows []assistRow
		q := r.db.WithContext(ctx).Table("\"ModuleElderlyAndDisabledAssistanceRequests\" AS r").
			Select("r.\"Id\", r.\"DocumentId\", r.\"Topic\", r.\"Description\", r.\"Status\", r.\"Latitude\", r.\"Longitude\", r.\"CreatedDate\", e.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\"").
			Joins("LEFT JOIN \"ModuleElderlyAndDisabled\" AS e ON r.\"ModuleElderlyAndDisabledId\" = e.\"Id\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON e.\"MunicipalityId\" = m.\"Id\"").
			Where(coordCond("r"))

		if filter.CityID != nil {
			q = q.Where("e.\"MunicipalityId\" = ?", *filter.CityID)
		}
		q.Find(&rows)

		for _, row := range rows {
			docID := ""
			if row.DocumentID != nil {
				docID = *row.DocumentID
			}
			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "elderly_assistance",
				Title:       fmt.Sprintf("ขอความช่วยเหลือ: %s", row.Topic),
				Subtitle:    row.Description,
				Category:    "คำร้องขอความช่วยเหลือผู้สูงอายุ",
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				Address:     docID,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 5. Bedridden Patients
	if layerMap["bedridden"] {
		type bedriddenRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			Prefix           *string    `gorm:"column:Prefix"`
			Name             string     `gorm:"column:Name"`
			LastName         string     `gorm:"column:LastName"`
			Address          *string    `gorm:"column:Address"`
			ContactNumber    *string    `gorm:"column:ContactNumber"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			CaretakerName    *string    `gorm:"column:NameRelativeCaretaker"`
			CaretakerPhone   *string    `gorm:"column:ContactNumberRelativeCaretaker"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
		}

		var rows []bedriddenRow
		q := r.db.WithContext(ctx).Table("\"ModuleBedriddenPatient\" AS b").
			Select("b.\"Id\", b.\"Prefix\", b.\"Name\", b.\"LastName\", b.\"Address\", b.\"ContactNumber\", b.\"Status\", b.\"Latitude\", b.\"Longitude\", b.\"NameRelativeCaretaker\", b.\"ContactNumberRelativeCaretaker\", b.\"CreatedDate\", b.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON b.\"MunicipalityId\" = m.\"Id\"").
			Where(coordCond("b"))

		if filter.CityID != nil {
			q = q.Where("b.\"MunicipalityId\" = ?", *filter.CityID)
		}
		if filter.Search != "" {
			pattern := "%" + filter.Search + "%"
			q = q.Where("b.\"Name\" ILIKE ? OR b.\"LastName\" ILIKE ? OR b.\"Address\" ILIKE ?", pattern, pattern, pattern)
		}

		q.Find(&rows)

		for _, row := range rows {
			prefix := ""
			if row.Prefix != nil {
				prefix = *row.Prefix
			}
			addr := ""
			if row.Address != nil {
				addr = *row.Address
			}
			contact := ""
			if row.ContactNumber != nil {
				contact = *row.ContactNumber
			}
			subtitle := addr
			if row.CaretakerName != nil && *row.CaretakerName != "" {
				subtitle += fmt.Sprintf(" (ผู้ดูแล: %s)", *row.CaretakerName)
			}

			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "bedridden",
				Title:       fmt.Sprintf("%s%s %s", prefix, row.Name, row.LastName),
				Subtitle:    subtitle,
				Category:    "ผู้ป่วยติดเตียง",
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				Address:     addr,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				Contact:     contact,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 6. Bedridden Assistance Requests
	if layerMap["bedridden_assistance"] {
		type assistRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			DocumentID       *string    `gorm:"column:DocumentId"`
			Topic            string     `gorm:"column:Topic"`
			Description      string     `gorm:"column:Description"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
		}

		var rows []assistRow
		q := r.db.WithContext(ctx).Table("\"ModuleBedriddenPatientAssistanceRequests\" AS r").
			Select("r.\"Id\", r.\"DocumentId\", r.\"Topic\", r.\"Description\", r.\"Status\", r.\"Latitude\", r.\"Longitude\", r.\"CreatedDate\", b.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\"").
			Joins("LEFT JOIN \"ModuleBedriddenPatient\" AS b ON r.\"ModuleBedriddenPatientId\" = b.\"Id\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON b.\"MunicipalityId\" = m.\"Id\"").
			Where(coordCond("r"))

		if filter.CityID != nil {
			q = q.Where("b.\"MunicipalityId\" = ?", *filter.CityID)
		}
		q.Find(&rows)

		for _, row := range rows {
			docID := ""
			if row.DocumentID != nil {
				docID = *row.DocumentID
			}
			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "bedridden_assistance",
				Title:       fmt.Sprintf("ขอความช่วยเหลือ: %s", row.Topic),
				Subtitle:    row.Description,
				Category:    "คำร้องขอความช่วยเหลือผู้ป่วยติดเตียง",
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				Address:     docID,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 7. CCTV Cameras
	if layerMap["cctv"] {
		type cctvRow struct {
			ID               uuid.UUID `gorm:"column:Id"`
			Code             string    `gorm:"column:Code"`
			Name             string    `gorm:"column:Name"`
			DisplayStatus    string    `gorm:"column:DisplayStatus"`
			Latitude         float64   `gorm:"column:Latitude"`
			Longitude        float64   `gorm:"column:Longitude"`
			ViewURL          *string   `gorm:"column:ViewUrl"`
			GroupName        *string   `gorm:"column:GroupName"`
			MunicipalityID   uuid.UUID `gorm:"column:MunicipalityId"`
			MunicipalityName string    `gorm:"column:MunicipalityName"`
		}

		var rows []cctvRow
		q := r.db.WithContext(ctx).Table("\"ModuleCctvCameras\" AS c").
			Select("c.\"Id\", c.\"Code\", c.\"Name\", c.\"DisplayStatus\", c.\"Latitude\", c.\"Longitude\", c.\"ViewUrl\", g.\"Name\" AS \"GroupName\", g.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\"").
			Joins("LEFT JOIN \"ModuleCctvCameraGroups\" AS g ON c.\"GroupId\" = g.\"Id\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON g.\"MunicipalityId\" = m.\"Id\"").
			Where("c.\"IsDeleted\" = false AND " + coordCond("c"))

		if filter.CityID != nil {
			q = q.Where("g.\"MunicipalityId\" = ?", *filter.CityID)
		}
		if filter.Search != "" {
			pattern := "%" + filter.Search + "%"
			q = q.Where("c.\"Name\" ILIKE ? OR c.\"Code\" ILIKE ? OR g.\"Name\" ILIKE ?", pattern, pattern, pattern)
		}

		q.Find(&rows)

		for _, row := range rows {
			groupName := "ทั่วไป"
			if row.GroupName != nil && *row.GroupName != "" {
				groupName = *row.GroupName
			}

			viewURL := ""
			if row.ViewURL != nil {
				viewURL = *row.ViewURL
			}

			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "cctv",
				Title:       row.Name,
				Subtitle:    fmt.Sprintf("รหัสกล้อง: %s (กลุ่ม: %s)", row.Code, groupName),
				Category:    fmt.Sprintf("กล้อง CCTV - %s", groupName),
				Status:      row.DisplayStatus,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				PhotoURL:    viewURL,
			})
		}
	}

	// 8. Pet Registration
	if layerMap["pet"] {
		type petRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			PetName          string     `gorm:"column:PetName"`
			PetType          string     `gorm:"column:PetType"`
			Breed            *string    `gorm:"column:Breed"`
			Address          *string    `gorm:"column:Address"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
		}

		var rows []petRow
		q := r.db.WithContext(ctx).Table("\"ModulePetHealthPetInformations\" AS p").
			Select("p.\"Id\", p.\"PetName\", p.\"PetType\", p.\"Breed\", p.\"Address\", p.\"Status\", p.\"Latitude\", p.\"Longitude\", p.\"CreatedDate\", p.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON p.\"MunicipalityId\" = m.\"Id\"").
			Where(coordCond("p"))

		if filter.CityID != nil {
			q = q.Where("p.\"MunicipalityId\" = ?", *filter.CityID)
		}
		if filter.Search != "" {
			pattern := "%" + filter.Search + "%"
			q = q.Where("p.\"PetName\" ILIKE ? OR p.\"Breed\" ILIKE ? OR p.\"Address\" ILIKE ?", pattern, pattern, pattern)
		}

		q.Find(&rows)

		for _, row := range rows {
			breed := ""
			if row.Breed != nil {
				breed = *row.Breed
			}
			addr := ""
			if row.Address != nil {
				addr = *row.Address
			}

			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "pet",
				Title:       fmt.Sprintf("%s (%s)", row.PetName, row.PetType),
				Subtitle:    fmt.Sprintf("สายพันธุ์: %s | ที่อยู่: %s", breed, addr),
				Category:    fmt.Sprintf("สัตว์เลี้ยง - %s", row.PetType),
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				Address:     addr,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 9. Pet Services (จุดบริการสัตว์เลี้ยง)
	if layerMap["pet_service"] {
		type petSvcRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			ServiceType      string     `gorm:"column:ServiceType"`
			LocationName     string     `gorm:"column:LocationName"`
			Details          *string    `gorm:"column:Details"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
		}

		var rows []petSvcRow
		q := r.db.WithContext(ctx).Table("\"ModulePetHealthPetServices\" AS s").
			Select("s.\"Id\", s.\"ServiceType\", s.\"LocationName\", s.\"Details\", s.\"Status\", s.\"Latitude\", s.\"Longitude\", s.\"CreatedDate\", s.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON s.\"MunicipalityId\" = m.\"Id\"").
			Where(coordCond("s"))

		if filter.CityID != nil {
			q = q.Where("s.\"MunicipalityId\" = ?", *filter.CityID)
		}
		q.Find(&rows)

		for _, row := range rows {
			details := ""
			if row.Details != nil {
				details = *row.Details
			}
			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "pet_service",
				Title:       fmt.Sprintf("บริการ: %s", row.ServiceType),
				Subtitle:    fmt.Sprintf("สถานที่: %s | %s", row.LocationName, details),
				Category:    "จุดบริการ/ฉีดวัคซีนสัตว์เลี้ยง",
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				Address:     row.LocationName,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 10. Waste Fees (จุดจัดเก็บค่าธรรมเนียมขยะ)
	if layerMap["waste_fee"] {
		type wasteRow struct {
			ID               uuid.UUID  `gorm:"column:Id"`
			DocumentID       *string    `gorm:"column:DocumentId"`
			Name             string     `gorm:"column:Name"`
			Address          *string    `gorm:"column:Address"`
			Amount           float64    `gorm:"column:Amount"`
			Status           string     `gorm:"column:Status"`
			Latitude         float64    `gorm:"column:Latitude"`
			Longitude        float64    `gorm:"column:Longitude"`
			ContactNumber    *string    `gorm:"column:ContactNumber"`
			CreatedDate      *time.Time `gorm:"column:CreatedDate"`
			MunicipalityID   uuid.UUID  `gorm:"column:MunicipalityId"`
			MunicipalityName string     `gorm:"column:MunicipalityName"`
		}

		var rows []wasteRow
		q := r.db.WithContext(ctx).Table("\"ModuleWasteFees\" AS w").
			Select("w.\"Id\", w.\"DocumentId\", w.\"Name\", w.\"Address\", w.\"Amount\", w.\"Status\", w.\"Latitude\", w.\"Longitude\", w.\"ContactNumber\", w.\"CreatedDate\", w.\"MunicipalityId\", m.\"NameTh\" AS \"MunicipalityName\"").
			Joins("LEFT JOIN \"Municipalities\" AS m ON w.\"MunicipalityId\" = m.\"Id\"").
			Where(coordCond("w"))

		if filter.CityID != nil {
			q = q.Where("w.\"MunicipalityId\" = ?", *filter.CityID)
		}
		q.Find(&rows)

		for _, row := range rows {
			docID := ""
			if row.DocumentID != nil {
				docID = *row.DocumentID
			}
			addr := ""
			if row.Address != nil {
				addr = *row.Address
			}
			contact := ""
			if row.ContactNumber != nil {
				contact = *row.ContactNumber
			}

			points = append(points, domain.GisPoint{
				ID:          row.ID,
				LayerType:   "waste_fee",
				Title:       fmt.Sprintf("ค่าธรรมเนียมขยะ: %s", row.Name),
				Subtitle:    fmt.Sprintf("ยอดชำระ: %.2f บาท | ที่อยู่: %s (เอกสาร: %s)", row.Amount, addr, docID),
				Category:    "ค่าธรรมเนียมขยะ",
				Status:      row.Status,
				Latitude:    row.Latitude,
				Longitude:   row.Longitude,
				Address:     addr,
				CityID:      row.MunicipalityID,
				CityName:    row.MunicipalityName,
				Contact:     contact,
				CreatedDate: row.CreatedDate,
			})
		}
	}

	// 11. Municipalities
	if layerMap["municipality"] {
		type muniRow struct {
			ID        uuid.UUID `gorm:"column:Id"`
			NameTh    string    `gorm:"column:NameTh"`
			AddressTh *string   `gorm:"column:AddressTh"`
			Phone     *string   `gorm:"column:Phone"`
			Status    string    `gorm:"column:Status"`
			Latitude  float64   `gorm:"column:Latitude"`
			Longitude float64   `gorm:"column:Longitude"`
		}

		var rows []muniRow
		q := r.db.WithContext(ctx).Table("\"Municipalities\"").
			Select("\"Id\", \"NameTh\", \"AddressTh\", \"Phone\", \"Status\", \"Latitude\", \"Longitude\"").
			Where(coordCond(""))

		if filter.CityID != nil {
			q = q.Where("\"Id\" = ?", *filter.CityID)
		}
		q.Find(&rows)

		for _, row := range rows {
			addr := ""
			if row.AddressTh != nil {
				addr = *row.AddressTh
			}
			phone := ""
			if row.Phone != nil {
				phone = *row.Phone
			}

			points = append(points, domain.GisPoint{
				ID:        row.ID,
				LayerType: "municipality",
				Title:     row.NameTh,
				Subtitle:  addr,
				Category:  "สำนักงานเทศบาล",
				Status:    row.Status,
				Latitude:  row.Latitude,
				Longitude: row.Longitude,
				Address:   addr,
				CityID:    row.ID,
				CityName:  row.NameTh,
				Contact:   phone,
			})
		}
	}

	return points, nil
}
