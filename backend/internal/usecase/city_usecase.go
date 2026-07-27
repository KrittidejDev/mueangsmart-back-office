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
			ActiveModulesCount: activeModules,
			TotalUsersCount:    usersCount,
			AdminsCount:        adminsCount,
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

	return &domain.CityResponse{
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
		ActiveModulesCount: activeModules,
		TotalUsersCount:    usersCount,
		AdminsCount:        adminsCount,
		VulnerableCount:    usersCount / 3,
		BankName:          "ธนาคารกรุงไทย (KTB)",
		BankAccountNumber: "123-4-56789-0",
		BankAccountName:   "บัญชีเงินอุดหนุนเทศบาล " + m.NameTh,
		BankBranch:        "สาขาประจำจังหวัด",
		BankType:          "ออมทรัพย์",
		AdminName:         "นายสมศักดิ์",
		AdminLastName:     "ผู้ดูแลระบบเทศบาล",
		AdminEmail:        "admin@" + m.NameEn + ".go.th",
		AdminPhone:        m.Phone,
		CreatedDate:        m.CreatedDate,
	}, nil
}

func (u *cityUseCase) CreateCity(ctx context.Context, req domain.CreateCityRequest, creator string) (*domain.CityResponse, error) {
	cityID := uuid.New()
	m := &domain.Municipality{
		Id:          cityID,
		NameTh:      req.NameTh,
		NameEn:      req.NameEn,
		AddressTh:   req.AddressTh,
		Phone:       req.Phone,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
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
	m.Phone = req.Phone
	m.Latitude = req.Latitude
	m.Longitude = req.Longitude
	if req.Status != "" {
		m.Status = req.Status
	}
	m.UpdatedBy = updatedBy
	m.UpdatedDate = time.Now()

	return u.cityRepo.Update(ctx, m)
}

func (u *cityUseCase) UpdateCityStatus(ctx context.Context, id uuid.UUID, req domain.UpdateCityStatusRequest, updatedBy string) error {
	return u.cityRepo.UpdateStatus(ctx, id, req.Status, updatedBy)
}

func (u *cityUseCase) GetCityModules(ctx context.Context, cityID uuid.UUID) ([]domain.CityModuleStatus, error) {
	return u.moduleRepo.FindByMunicipalityID(ctx, cityID)
}

func (u *cityUseCase) ToggleCityModule(ctx context.Context, cityID, moduleID uuid.UUID, req domain.ToggleModuleRequest, updatedBy string) error {
	return u.moduleRepo.UpsertModuleStatus(ctx, cityID, moduleID, req.IsActive, updatedBy)
}
