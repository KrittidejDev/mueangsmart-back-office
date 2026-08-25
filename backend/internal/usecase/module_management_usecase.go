package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
)

type moduleManagementUseCase struct {
	repo domain.ModuleManagementRepository
}

// NewModuleManagementUseCase creates a new instance of domain.ModuleManagementUseCase.
func NewModuleManagementUseCase(repo domain.ModuleManagementRepository) domain.ModuleManagementUseCase {
	return &moduleManagementUseCase{repo: repo}
}

func (u *moduleManagementUseCase) GetAllModules(ctx context.Context) ([]domain.SystemModuleResponse, error) {
	modules, err := u.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]domain.SystemModuleResponse, 0, len(modules))
	for _, m := range modules {
		res = append(res, mapEntityToResponse(&m))
	}
	return res, nil
}

func (u *moduleManagementUseCase) GetModuleByID(ctx context.Context, id uuid.UUID) (*domain.SystemModuleResponse, error) {
	module, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	res := mapEntityToResponse(module)
	return &res, nil
}

func (u *moduleManagementUseCase) CreateModule(ctx context.Context, req domain.CreateModuleRequest, createdBy string) (*domain.SystemModuleResponse, error) {
	if strings.TrimSpace(req.NameTh) == "" {
		return nil, errors.New("ชื่อโมดูล (ภาษาไทย) จำเป็นต้องระบุ")
	}
	if strings.TrimSpace(req.NameEn) == "" {
		return nil, errors.New("ชื่อโมดูล (ภาษาอังกฤษ) จำเป็นต้องระบุ")
	}
	if createdBy == "" {
		createdBy = "superadmin"
	}

	now := time.Now()
	newID := uuid.New()
	seq := req.SortOrder

	entity := domain.Module{
		Id:                                 newID,
		NameTh:                             req.NameTh,
		NameEn:                             req.NameEn,
		CreatedBy:                          createdBy,
		CreatedDate:                        now,
		UpdatedBy:                          createdBy,
		UpdatedDate:                        now,
		IsUsedForUserRegistrationOnly:       req.VerifyIdentity,
		CanBeSelectedWithAdminUserSettings: req.Department,
		IsAdminOnly:                        req.AdminOnly,
		Sequence:                           &seq,
		IsDashboard:                        req.ShowDashboard,
	}

	if req.Key != "" {
		entity.Key = &req.Key
	}
	if req.DashboardNameTh != "" {
		entity.DashboardNameTh = &req.DashboardNameTh
	}
	if req.DashboardNameEn != "" {
		entity.DashboardNameEn = &req.DashboardNameEn
	}

	if err := u.repo.Create(ctx, &entity); err != nil {
		return nil, err
	}

	res := mapEntityToResponse(&entity)
	return &res, nil
}

func (u *moduleManagementUseCase) UpdateModule(ctx context.Context, id uuid.UUID, req domain.UpdateModuleRequest, updatedBy string) (*domain.SystemModuleResponse, error) {
	if strings.TrimSpace(req.NameTh) == "" {
		return nil, errors.New("ชื่อโมดูล (ภาษาไทย) จำเป็นต้องระบุ")
	}
	if strings.TrimSpace(req.NameEn) == "" {
		return nil, errors.New("ชื่อโมดูล (ภาษาอังกฤษ) จำเป็นต้องระบุ")
	}
	if updatedBy == "" {
		updatedBy = "superadmin"
	}

	updatedEntity, err := u.repo.Update(ctx, id, req, updatedBy)
	if err != nil {
		return nil, err
	}

	res := mapEntityToResponse(updatedEntity)
	return &res, nil
}

func mapEntityToResponse(m *domain.Module) domain.SystemModuleResponse {
	sortOrder := 0
	if m.Sequence != nil {
		sortOrder = *m.Sequence
	}

	dashboardTh := m.NameTh
	if m.DashboardNameTh != nil && *m.DashboardNameTh != "" {
		dashboardTh = *m.DashboardNameTh
	}

	dashboardEn := m.NameEn
	if m.DashboardNameEn != nil && *m.DashboardNameEn != "" {
		dashboardEn = *m.DashboardNameEn
	}

	key := ""
	if m.Key != nil {
		key = *m.Key
	}

	return domain.SystemModuleResponse{
		ID:              m.Id,
		SortOrder:       sortOrder,
		NameTh:          m.NameTh,
		NameEn:          m.NameEn,
		DashboardNameTh: dashboardTh,
		DashboardNameEn: dashboardEn,
		VerifyIdentity:  m.IsUsedForUserRegistrationOnly,
		Department:      m.CanBeSelectedWithAdminUserSettings,
		AdminOnly:       m.IsAdminOnly,
		ShowDashboard:   m.IsDashboard,
		Key:             key,
	}
}
