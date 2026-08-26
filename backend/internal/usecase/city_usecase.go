package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type cityUseCase struct {
	cityRepo   domain.CityRepository
	moduleRepo domain.ModuleRepository
}

func NewCityUseCase(cityRepo domain.CityRepository, moduleRepo domain.ModuleRepository) domain.CityUseCase {
	return &cityUseCase{
		cityRepo:   cityRepo,
		moduleRepo: moduleRepo,
	}
}

func (u *cityUseCase) GetAllCities(ctx context.Context) ([]domain.CityResponse, error) {
	municipalities, err := u.cityRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var res []domain.CityResponse
	for _, m := range municipalities {
		activeModules, _ := u.moduleRepo.CountActiveByMunicipalityID(ctx, m.Id)
		usersCount, _ := u.moduleRepo.CountUsersByMunicipalityID(ctx, m.Id)
		adminsCount, _ := u.moduleRepo.CountAdminsByMunicipalityID(ctx, m.Id)
		riverCount, _ := u.moduleRepo.CountRiverByMunicipalityID(ctx, m.Id)
		senseCount, _ := u.moduleRepo.CountSenseByMunicipalityID(ctx, m.Id)

		res = append(res, domain.CityResponse{
			Id:                 m.Id,
			NameTh:             m.NameTh,
			NameEn:             m.NameEn,
			AddressTh:          m.AddressTh,
			AddressEn:          m.AddressEn,
			Phone:              m.Phone,
			Latitude:           m.Latitude,
			Longitude:          m.Longitude,
			LogoUrl:            m.LogoUrl,
			Status:             m.Status,
			ModulesCount:       activeModules,
			ActiveModulesCount: activeModules,
			TotalUsersCount:    usersCount,
			AdminsCount:        adminsCount,
			RiverStatus:        riverCount,
			SenseStatus:        senseCount,
			CreatedDate:        m.CreatedDate,
		})
	}

	return res, nil
}


func (u *cityUseCase) GetCityByID(ctx context.Context, id uuid.UUID) (*domain.CityResponse, error) {
	m, err := u.cityRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("city not found")
	}

	activeModules, _ := u.moduleRepo.CountActiveByMunicipalityID(ctx, m.Id)
	usersCount, _ := u.moduleRepo.CountUsersByMunicipalityID(ctx, m.Id)
	adminsCount, _ := u.moduleRepo.CountAdminsByMunicipalityID(ctx, m.Id)
	riverCount, _ := u.moduleRepo.CountRiverByMunicipalityID(ctx, m.Id)
	senseCount, _ := u.moduleRepo.CountSenseByMunicipalityID(ctx, m.Id)

	resp := &domain.CityResponse{
		Id:                 m.Id,
		NameTh:             m.NameTh,
		NameEn:             m.NameEn,
		AddressTh:          m.AddressTh,
		AddressEn:          m.AddressEn,
		Phone:              m.Phone,
		Latitude:           m.Latitude,
		Longitude:          m.Longitude,
		LogoUrl:            m.LogoUrl,
		Status:             m.Status,
		ModulesCount:       activeModules,
		ActiveModulesCount: activeModules,
		TotalUsersCount:    usersCount,
		AdminsCount:        adminsCount,
		RiverStatus:        riverCount,
		SenseStatus:        senseCount,
		VulnerableCount:    usersCount / 3,
		CreatedDate:        m.CreatedDate,
	}

	// Enrich with Bank Detail from DB (best-effort, no error propagation)
	if bank, err := u.cityRepo.FindBankDetailByMunicipalityID(ctx, m.Id); err == nil {
		resp.BankName = bank.BankName
		resp.BankAccountNumber = bank.BankAccountNumber
		resp.BankAccountName = bank.BankAccountName
		resp.BankBranch = bank.BankBranch
		resp.BankType = bank.BankType
	}

	// Enrich with Admin User from DB (best-effort, no error propagation)
	if admin, err := u.cityRepo.FindAdminUserByMunicipalityID(ctx, m.Id); err == nil {
		resp.AdminName = admin.Name
		resp.AdminLastName = admin.LastName
		resp.AdminEmail = admin.Email
		resp.AdminPhone = admin.Phone
	}

	return resp, nil
}


func (u *cityUseCase) CreateCity(ctx context.Context, req domain.CreateCityRequest, creator string) (*domain.CityResponse, error) {
	cityID := uuid.New()
	m := &domain.Municipality{
		Id:          cityID,
		NameTh:      req.NameTh,
		NameEn:      req.NameEn,
		AddressTh:   req.AddressTh,
		AddressEn:   req.AddressEn,
		Phone:       req.Phone,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		LogoUrl:     req.LogoUrl,
		Status:      "Active",
		CreatedBy:   creator,
		CreatedDate: time.Now(),
	}

	if err := u.cityRepo.CreateFullCityOnboarding(ctx, m, req, creator); err != nil {
		return nil, err
	}

	return u.GetCityByID(ctx, cityID)
}

func (u *cityUseCase) UpdateCity(ctx context.Context, id uuid.UUID, req domain.UpdateCityRequest, updatedBy string) error {
	m, err := u.cityRepo.FindByID(ctx, id)
	if err != nil {
		return errors.New("city not found")
	}

	m.NameTh = req.NameTh
	m.NameEn = req.NameEn
	m.AddressTh = req.AddressTh
	m.AddressEn = req.AddressEn
	m.Phone = req.Phone
	m.Latitude = req.Latitude
	m.Longitude = req.Longitude
	if req.LogoUrl != nil {
		m.LogoUrl = req.LogoUrl
	}
	if req.Status != "" {
		m.Status = req.Status
	}
	m.UpdatedBy = updatedBy
	m.UpdatedDate = time.Now()

	if err := u.cityRepo.Update(ctx, m); err != nil {
		return err
	}

	// Upsert bank detail (best-effort — does not fail the whole update)
	_ = u.cityRepo.UpsertBankDetail(ctx, id, req, updatedBy)

	// Upsert admin user (create if new, update if exists, with password hashing if provided)
	_ = u.cityRepo.UpsertAdminUser(ctx, id, req, updatedBy)

	// Sync enabled city modules (toggle on/off based on user selection in modal)
	if req.SelectedModuleIds != nil {
		_ = u.moduleRepo.SyncCityModules(ctx, id, req.SelectedModuleIds)
	}

	return nil
}



func (u *cityUseCase) UpdateCityStatus(ctx context.Context, id uuid.UUID, req domain.UpdateCityStatusRequest, updatedBy string) error {
	return u.cityRepo.UpdateStatus(ctx, id, req.Status, updatedBy)
}

func (u *cityUseCase) GetCityModules(ctx context.Context, cityID uuid.UUID) ([]domain.CityModuleStatus, error) {
	return u.moduleRepo.FindByMunicipalityID(ctx, cityID)
}

func (u *cityUseCase) GetAllMasterModules(ctx context.Context) ([]domain.CityModuleStatus, error) {
	return u.moduleRepo.FindAllMasterModules(ctx)
}

func (u *cityUseCase) ToggleCityModule(ctx context.Context, cityID, moduleID uuid.UUID, req domain.ToggleModuleRequest, updatedBy string) error {
	return u.moduleRepo.UpsertModuleStatus(ctx, cityID, moduleID, req.IsActive, updatedBy)
}

func (u *cityUseCase) GetCityStatistics(ctx context.Context, cityID uuid.UUID) (*domain.CityModuleDetailStatistics, error) {
	return u.moduleRepo.GetCityStatistics(ctx, cityID)
}
