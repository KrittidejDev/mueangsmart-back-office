package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/mueangsmart/back-office/backend/internal/domain"
	"github.com/mueangsmart/back-office/backend/pkg/security"
)

type authUseCase struct {
	adminRepo domain.SuperAdminRepository
	roleRepo  domain.RoleRepository
	jwtSecret string
	tokenTTL  time.Duration
}

func NewAuthUseCase(adminRepo domain.SuperAdminRepository, roleRepo domain.RoleRepository, jwtSecret string) domain.AuthUseCase {
	return &authUseCase{
		adminRepo: adminRepo,
		roleRepo:  roleRepo,
		jwtSecret: jwtSecret,
		tokenTTL:  24 * time.Hour,
	}
}

func (u *authUseCase) Login(ctx context.Context, username, password string) (*domain.LoginResponse, error) {
	admin, err := u.adminRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !admin.IsActive {
		return nil, errors.New("account disabled")
	}

	if !security.CheckPasswordHash(password, admin.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	role, err := u.roleRepo.FindByID(ctx, admin.RoleId)
	if err != nil {
		return nil, errors.New("role configuration error")
	}

	rawPermissions, err := u.roleRepo.GetPermissionsByRoleID(ctx, admin.RoleId)
	if err != nil {
		return nil, err
	}

	permissions := make([]domain.Permission, len(rawPermissions))
	for i, p := range rawPermissions {
		permissions[i] = domain.Permission{
			Resource: p.Resource,
			Action:   p.Action,
		}
	}

	token, err := security.GenerateSuperAdminToken(admin.Id, admin.Username, admin.RoleId, u.jwtSecret, u.tokenTTL)
	if err != nil {
		return nil, err
	}

	return &domain.LoginResponse{
		Token:        token,
		SuperAdminID: admin.Id,
		Username:     admin.Username,
		FullName:     admin.FullName,
		RoleName:     role.Name,
		Permissions:  permissions,
	}, nil
}

func (u *authUseCase) GetProfile(ctx context.Context, superAdminID uuid.UUID) (*domain.SuperAdminProfileResponse, error) {
	admin, err := u.adminRepo.FindByID(ctx, superAdminID)
	if err != nil {
		return nil, errors.New("superadmin account not found")
	}

	role, err := u.roleRepo.FindByID(ctx, admin.RoleId)
	if err != nil {
		return nil, errors.New("role configuration error")
	}

	rawPermissions, err := u.roleRepo.GetPermissionsByRoleID(ctx, admin.RoleId)
	if err != nil {
		return nil, err
	}

	permissions := make([]domain.Permission, len(rawPermissions))
	for i, p := range rawPermissions {
		permissions[i] = domain.Permission{
			Resource: p.Resource,
			Action:   p.Action,
		}
	}

	return &domain.SuperAdminProfileResponse{
		Id:          admin.Id,
		Username:    admin.Username,
		Email:       admin.Email,
		FullName:    admin.FullName,
		RoleName:    role.Name,
		IsActive:    admin.IsActive,
		CreatedDate: admin.CreatedDate,
		Permissions: permissions,
	}, nil
}

func (u *authUseCase) UpdateProfile(ctx context.Context, id uuid.UUID, req *domain.UpdateProfileRequest, updatedBy string) (*domain.SuperAdminProfileResponse, error) {
	admin, err := u.adminRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("user account not found")
	}

	if req.FullName == "" {
		return nil, errors.New("full name is required")
	}

	if req.Email == "" {
		return nil, errors.New("email is required")
	}

	if req.Email != admin.Email {
		existing, err := u.adminRepo.FindByEmail(ctx, req.Email)
		if err == nil && existing != nil && existing.Id != admin.Id {
			return nil, errors.New("email is already registered with another account")
		}
	}

	if req.NewPassword != "" {
		if len(req.NewPassword) < 6 {
			return nil, errors.New("new password must be at least 6 characters")
		}

		if req.CurrentPassword == "" {
			return nil, errors.New("current password is required to change password")
		}

		if !security.CheckPasswordHash(req.CurrentPassword, admin.PasswordHash) {
			return nil, errors.New("current password is incorrect")
		}

		hashedPassword, err := security.HashPassword(req.NewPassword)
		if err != nil {
			return nil, err
		}
		admin.PasswordHash = hashedPassword
	}

	admin.FullName = req.FullName
	admin.Email = req.Email
	admin.UpdatedBy = updatedBy
	admin.UpdatedDate = time.Now()

	if err := u.adminRepo.Update(ctx, admin); err != nil {
		return nil, err
	}

	return u.GetProfile(ctx, admin.Id)
}

func (u *authUseCase) CreateUser(ctx context.Context, req *domain.CreateSuperAdminRequest, createdBy string) error {
	hashedPassword, err := security.HashPassword(req.Password)
	if err != nil {
		return err
	}

	admin := &domain.BoSuperAdmin{
		Id:           uuid.New(),
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FullName:     req.FullName,
		RoleId:       req.RoleId,
		IsActive:     true,
		CreatedBy:    createdBy,
		CreatedDate:  time.Now(),
	}

	return u.adminRepo.Create(ctx, admin)
}

func (u *authUseCase) DeleteUser(ctx context.Context, id, currentSuperAdminID uuid.UUID) error {
	if id == currentSuperAdminID {
		return errors.New("cannot delete your own SuperAdmin account")
	}

	return u.adminRepo.Delete(ctx, id)
}

func (u *authUseCase) GetUsers(ctx context.Context) ([]domain.SuperAdminProfileResponse, error) {
	admins, err := u.adminRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	var res []domain.SuperAdminProfileResponse
	for _, admin := range admins {
		role, _ := u.roleRepo.FindByID(ctx, admin.RoleId)
		roleName := "SuperAdmin"
		if role != nil {
			roleName = role.Name
		}

		res = append(res, domain.SuperAdminProfileResponse{
			Id:          admin.Id,
			Username:    admin.Username,
			Email:       admin.Email,
			FullName:    admin.FullName,
			RoleName:    roleName,
			IsActive:    admin.IsActive,
			CreatedDate: admin.CreatedDate,
		})
	}
	return res, nil
}

func (u *authUseCase) GetRoles(ctx context.Context) ([]domain.BoRole, error) {
	return u.roleRepo.FindAll(ctx)
}
