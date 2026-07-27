---
name: user_isolation_rbac
description: Instructions for implementing isolated SuperAdmin user management and RBAC permissions for the back-office platform.
---

# Skill: SuperAdmin Isolated User & RBAC Management

## Context & Purpose
The MueangSmart Back Office serves platform-level SuperAdmins, whereas `ms-web` serves local city admins (`AdminUsers`). SuperAdmin authentication, accounts, roles, and permissions MUST be completely separated from user/admin tables of the tenant web app.

## Implementation Standard

1. **Table Schema Scope & Naming Convention:**
   - Always map SuperAdmin entities to `BoSuperAdmins`, `BoRoles`, `BoPermissions`, and `BoAuditLogs` using PascalCase for both table and column names matching existing DB convention.
   - Never reference `AdminUsers` for SuperAdmin authentication.

2. **JWT Payload & Claims:**
   - JWT tokens issued by Back Office Go API must include a unique claim `domain: "superadmin_backoffice"`.
   - Middleware must verify that tenant tokens cannot authenticate against Back Office endpoints.

3. **Role-Based Access Control (RBAC):**
   - Implement granular permissions:
     - `city:read`, `city:write`
     - `module:toggle`
     - `analytics:view`
     - `superadmin:manage`
   - Every Fiber v3 handler must enforce RBAC middleware checks before executing business logic.
