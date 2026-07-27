# 🏢 MueangSmart Back Office System (ระบบบริหารจัดการเมืองสำหรับผู้ดูแลระบบ)

ระบบ Back Office บริหารจัดการเมือง MueangSmart สำหรับ SuperAdmin, Admin และผู้บริหารระบบเทศบาล พัฒนาด้วยสถาปัตยกรรม **Clean Architecture** (Go Fiber v3 Backend + Next.js 15+ React 19 Frontend) ธีม **MueangSmart Corporate Light Mode** (No Dark Mode)

---

## 🤖 คำสั่งสำคัญสำหรับ AI / Agent (Mandatory Agent Bootstrapping Protocol)

> [!IMPORTANT]
> **เมื่อเปิดแท็บ Agent หรือเริ่ม Session ใหม่ทุกครั้ง:** Agent ทุกตัว **ต้องปฏิบัติตามกฎนี้อย่างเคร่งครัด** โดยเข้าอ่านไฟล์กฎระเบียบและสถาปัตยกรรมที่สร้างไว้ในโปรเจคก่อนคิด วางแผน หรือเขียนโค้ดเสมอ:
> 1. 📄 [`AGENTS.md`](./AGENTS.md) - กฎวิศวกรรม Zero-Migration, DB Safety & RBAC Domain Isolation
> 2. 📄 [`docs/SENIOR_ENGINEER_PLAN.md`](./docs/SENIOR_ENGINEER_PLAN.md) - สถาปัตยกรรมระบบ Clean Architecture
> 3. 📄 [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) - ธีม corporate light mode และ Reusable Components Specs
> 4. 📄 [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) - บันทึกประวัติการพัฒนาและฟีเจอร์ทั้งหมด
> 5. 🛠️ โฟลเดอร์ [`/.agents/skills/`](./.agents/skills/) - คำสั่งและคู่มือเฉพาะทาง (`db_safety_protocol`, `user_isolation_rbac`, `go_fiber_clean_arch`, `deep_analytics_monitoring`)

---

## 🚀 วิธีการรันระบบระหว่างการพัฒนา (Development Setup Guide)

### 1. การรันส่วน Go Backend (Port `:8080`)

```bash
# 1. ย้ายเข้าไปที่โฟลเดอร์ backend
cd backend

# 2. ตรวจสอบไฟล์คอนฟิก .env (รวมไว้ในโปรเจคสำหรับ Dev)
# DATABASE_URL="postgres://smartcity_uat_user:uat_SmartCity%232026%21Secured@122.155.169.235:5433/smart-city?schema=public"

# 3. รันคำสั่งเปิดเซิร์ฟเวอร์ Go Fiber v3
go run cmd/server/main.go
```

Backend จะเริ่มต้นรันที่ URL: `http://localhost:8080` (พร้อม Auto Seeding 3-Tier Roles & SuperAdmin user)

---

### 2. การรันส่วน Next.js Frontend (Port `:3000`)

```bash
# 1. เปิด Terminal ใหม่ ย้ายเข้าไปที่โฟลเดอร์ frontend
cd frontend

# 2. ติดตั้ง dependencies (หากยังไม่ได้ติดตั้ง)
pnpm install

# 3. รันคำสั่งเปิดระบบ Next.js Dev Server
pnpm run dev
```

Frontend จะเริ่มต้นรันที่ URL: `http://localhost:3000`

---

## 🔑 ข้อมูลการเข้าสู่ระบบ (Development Credentials)

- **URL:** `http://localhost:3000/login`
- **Username:** `superadmin`
- **Password:** `Admin1234!`
- **Role:** SuperAdmin (สิทธิเข้าถึงครบทุกเมนู และระบบจัดการผู้ใช้งาน/Audit Logs)

---

## ⚙️ โครงสร้างโปรเจค (Repository Structure)

```
mueangsmart-back-office/
├── AGENTS.md                  # กฎระเบียบและ governance policy ของโปรเจค
├── README.md                  # คู่มือการติดตั้ง รัน และข้อกำหนด Agent
├── docs/                      # เอกสารสถาปัตยกรรม ออกแบบ และ CHANGELOG
│   ├── ARCHITECTURE_LOG.md
│   ├── CHANGELOG.md
│   ├── DESIGN_SYSTEM.md
│   ├── PROJECT_MANAGER_PLAN.md
│   └── SENIOR_ENGINEER_PLAN.md
├── backend/                   # Go 1.25+ Fiber v3 Clean Architecture
│   ├── .env                   # Environment config (สำหรับ Dev)
│   ├── cmd/server/main.go     # Server Entry Point
│   ├── internal/              # Domain, UseCase, Repository, Handler
│   ├── pkg/                   # Middleware (Audit Interceptor, AuthGuard), Security
│   └── config/                # DB Connection & Seeder
└── frontend/                  # Next.js 15+ React 19 Light Corporate Theme
    ├── .env.local             # Frontend environment config
    ├── src/
    │   ├── app/               # Next.js App Router (Dashboard, Cities, SuperAdmins, Audit-Logs, 403)
    │   ├── components/        # Reusable UI & Layout Components (Sidebar, Header, Modal, MetricCard)
    │   ├── hooks/             # Custom React Hooks (useAnalytics, useCities, useSuperAdmins, useAuditLogs)
    │   └── store/             # Zustand State Management with Hydration Fix
    └── package.json
```

---

## 🔒 กฎความปลอดภัยและนโยบายฐานข้อมูล (Database Policy)

1. **Zero-Migration Policy:** ห้ามสั่ง DDL Migration หรือปรับเปลี่ยนโครงสร้างตารางเดิมใน PostgreSQL DB (`MueangSmart-DumpFromVM`) เด็ดขาด
2. **Domain Isolation:** ตาราง SuperAdmin และ RBAC ของ Back Office (`BoSuperAdmins`, `BoRoles`, `BoPermissions`, `BoAuditLogs`) ถูกแยกเป็นอิสระจากตาราง User หน้าบ้านโดยสมบูรณ์
3. **Environment Files Included:** อนุญาตให้อัพโหลดไฟล์ `.env` และ `.env.local` สำหรับการพัฒนา (Dev Environment) เพื่ออำนวยความสะดวกในการ setup ระบบระหว่างทีมงาน
