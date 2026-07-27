# Senior Software Engineer Technical Architecture Plan

**System:** MueangSmart SuperAdmin Back Office Core  
**Tech Stack:** Go 1.25+ (Fiber v3 Framework) + Next.js 15+ (React 19, TypeScript) + PostgreSQL (Shared DB with Schema Isolation)  
**Author:** Senior Software Architect  

---

## 1. System Architecture Overview & Clean Architecture Design

ระบบ MueangSmart Back Office ออกแบบภายใต้หลักการ **Clean Architecture & Domain-Driven Design (DDD)** แยกเลเยอร์การทำงานอย่างเด็ดขาดเพื่อรองรับ Ultra-High Performance, Scalability และ Zero Memory Leak

```
                 +-------------------------------------------------+
                 |  Next.js 15+ Frontend (React 19 / TypeScript)  |
                 |  - Reusable UI Components (src/components/ui)   |
                 |  - Custom React Hooks (src/hooks)               |
                 +-----------------------+-------------------------+
                                         | REST / JSON / Server Action
                                         v
                 +-------------------------------------------------+
                 |       Go 1.25+ Fiber v3 Web Framework Layer     |
                 +-----------------------+-------------------------+
                                         |
            +----------------------------+----------------------------+
            |                                                         |
            v                                                         v
+-----------------------+                                 +-----------------------+
|  Domain & UseCases    |                                 |  Analytics Aggregator |
|  (Clean Architecture) |                                 |  (On-Demand Cache)    |
+-----------+-----------+                                 +-----------+-----------+
            |                                                         |
            v                                                         v
+---------------------------------------------------------------------------------+
|                        PostgreSQL Shared Database                               |
|  +--------------------------------+   +--------------------------------------+  |
|  |  bo_* Tables (Isolated Scope)  |   |  Existing MueangSmart Tables        |  |
|  |  - bo_super_admins             |   |  - Municipalities                    |  |
|  |  - bo_roles / bo_permissions   |   |  - MunicipalityModules               |  |
|  |  - bo_audit_logs               |   |  - ModuleBedriddenPatient            |  |
|  +--------------------------------+   |  - ModuleElderlyAndDisabled          |  |
|                                       |  - AdminUsers & ActivityLogs         |  |
|                                       +--------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 2. Go Backend Architecture Specs (Fiber v3)

### 2.1 Directory Layout (Clean Architecture Pattern)
```
backend/
├── cmd/
│   └── server/main.go                 # Entry point, Fiber app init, Graceful shutdown
├── internal/
│   ├── config/                        # Env & DB connection pool setup
│   ├── domain/                        # Pure Entities & Interface Contracts
│   ├── handler/                       # Fiber v3 HTTP Handlers (Input validation, Response format)
│   ├── repository/                    # GORM / Direct SQL Repositories
│   └── usecase/                       # Business Logic Implementation
├── pkg/
│   ├── logger/                        # Structured JSON Logger (Zero Memory Leak)
│   └── middleware/                    # JWT Auth, Rate Limiter, Panic Recovery
└── tests/                             # Integration & Unit Tests
```

### 2.2 Memory Leak Prevention & High Performance Guidelines in Go
1. **Goroutine Lifecycle Management:** ทุกๆ Goroutine ต้องรับ `context.Context` และตรวจจับ `ctx.Done()` เพื่อให้สามารถ Terminate ได้เสมอเมื่อ Timeout
2. **Connection Pool Management:**
   ```go
   db.DB().SetMaxOpenConns(50)
   db.DB().SetMaxIdleConns(10)
   db.DB().SetConnMaxLifetime(30 * time.Minute)
   ```
3. **Response Buffering & Allocation:** ใช้ `fiber.Ctx` memory buffers โดยตรง หลีกเลี่ยงการ String concats ซ้ำซ้อน หรือใช้ `sync.Pool` สำหรับ JSON encoder/decoder

---

## 3. Database Schema Isolation & Data Access Layer Strategy

### 3.1 Isolated Back-Office Schema (`Bo` Prefix & PascalCase Convention)
เพื่อไม่กระทบกับตารางเดิมใน Production ตารางใหม่สำหรับจัดการ SuperAdmin จะสร้างด้วย Prefix `Bo` และใช้ Naming Pattern (PascalCase & Plural) เดียวกับ DB เดิม 100%:

```sql
-- SuperAdmin Users Table
CREATE TABLE IF NOT EXISTS "BoSuperAdmins" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Username" VARCHAR(100) UNIQUE NOT NULL,
    "Email" VARCHAR(255) UNIQUE NOT NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "FullName" VARCHAR(255) NOT NULL,
    "RoleId" UUID NOT NULL,
    "IsActive" BOOLEAN DEFAULT TRUE,
    "CreatedBy" VARCHAR(255) DEFAULT '',
    "CreatedDate" TIMESTAMPTZ DEFAULT NOW(),
    "UpdatedBy" VARCHAR(255) DEFAULT '',
    "UpdatedDate" TIMESTAMPTZ DEFAULT NOW()
);

-- SuperAdmin Roles Table
CREATE TABLE IF NOT EXISTS "BoRoles" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" VARCHAR(100) UNIQUE NOT NULL,
    "Description" TEXT,
    "CreatedBy" VARCHAR(255) DEFAULT '',
    "CreatedDate" TIMESTAMPTZ DEFAULT NOW(),
    "UpdatedBy" VARCHAR(255) DEFAULT '',
    "UpdatedDate" TIMESTAMPTZ DEFAULT NOW()
);

-- SuperAdmin Permissions Table
CREATE TABLE IF NOT EXISTS "BoPermissions" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "RoleId" UUID NOT NULL REFERENCES "BoRoles"("Id") ON DELETE CASCADE,
    "Resource" VARCHAR(100) NOT NULL, -- e.g., 'City', 'Module', 'Analytics', 'SuperAdmin'
    "Action" VARCHAR(50) NOT NULL,     -- e.g., 'Read', 'Write', 'Delete', 'Approve'
    CONSTRAINT "PK_BoPermissions" PRIMARY KEY ("Id"),
    CONSTRAINT "UQ_BoPermissions_Role_Resource_Action" UNIQUE ("RoleId", "Resource", "Action")
);

-- Audit Logs Table for Back Office
CREATE TABLE IF NOT EXISTS "BoAuditLogs" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "SuperAdminId" UUID NOT NULL,
    "Action" VARCHAR(100) NOT NULL,
    "Details" JSONB,
    "IpAddress" VARCHAR(45),
    "CreatedDate" TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Safe Access Strategy for Existing Tables
- **Read-Only Models for Analytics:** ในตาราง `Municipalities`, `ModuleElderlyAndDisabled`, `ModuleBedriddenPatient`, `UserMunicipalities`, `ActivityLogs` จะใช้ Struct ที่สร้างขึ้นสำหรับอ่านค่าเพื่อทำ Aggregation Analytics 
- **Safe Transaction for City Onboarding:** การเพิ่มเมืองใหม่ หรือสวิตช์เปิดปิดโมดูล จะดำเนินการด้วย **Explicit DB Transaction (`BEGIN ... COMMIT`)** ใน Go Backend พร้อม Rollback อัตโนมัติเมื่อเกิดข้อผิดพลาด

---

## 4. Platform Analytics & Monitoring Aggregation Pipeline

เพื่อดึงสถิติประชากร ผู้ป่วยติดเตียง การอนุมัติผู้ใช้ และ Traffic โดยไม่รบกวน DB Performance:

1. **Vulnerable Group Aggregation Query Strategy:**
   - รวมยอดผู้สูงอายุ ผู้พิการ ผู้ป่วยติดเตียง จำแนกตาม `MunicipalityId`
   - ใช้ Index บน `MunicipalityId` และ `Status`
2. **Approval Status Aggregation:**
   - นับจำนวนผู้ใช้งานใน `UserMunicipalities` แยกตาม Status (`Approved`, `Pending`, `Rejected`)
3. **On-Demand Memory Caching:**
   - ใช้ In-Memory Cache (เช่น Ristretto หรือ Go-Cache) พร้อม TTL 60 วินาที สำหรับหน้า Dashboard Monitoring เพื่อลด I/O ของ Database

---

## 5. Quality Enforcement & Testing Framework

1. **Type Safety:** 100% Go Struct Types และ TypeScript Interfaces (Strict Mode `noImplicitAny: true`)
2. **Linting Check:**
   - Backend: `golangci-lint run ./...`
   - Frontend: `eslint` และ `tsc --noEmit`
3. **Automated Unit Testing:**
   - บังคับสร้าง Unit Test สำหรับ UseCases และ Utility Helpers ใน Go
