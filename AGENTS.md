# AGENTS.md - Project Rules & Governance Policy for MueangSmart Back Office

> **คำสั่งสำคัญสูงสุด (CRITICAL DIRECTIVE):**
> อ่านและปฏิบัติตามกฎในเอกสารนี้อย่างเคร่งครัดก่อนดำเนินการคิด วางแผน หรือเขียนโค้ดใดๆ ในโปรเจค `mueangsmart-back-office` 

---

## 0. Mandatory Agent Bootstrapping Protocol (กฎเปิดแท็บ Agent ใหม่)
- **เมื่อเปิดแท็บ Agent หรือเริ่ม Session ใหม่ทุกครั้ง:** Agent **จะต้องทำตามคำสั่งนี้เสมอ** โดยการอ่านไฟล์กฎและข้อกำหนดในโปรเจคก่อนเริ่มงานอย่างน้อย 5 เอกสารหลักดังนี้:
  1. `AGENTS.md` (กฎวิศวกรรม ความปลอดภัย DB และ RBAC)
  2. `docs/SENIOR_ENGINEER_PLAN.md` (โครงสร้าง Clean Architecture และ Domain Logic)
  3. `docs/DESIGN_SYSTEM.md` (ธีม MueangSmart Light Corporate Mode)
  4. `docs/CHANGELOG.md` (ประวัติการเปลี่ยนแปลงทั้งหมด)
  5. เอกสารในโฟลเดอร์ `.agents/skills/` (`db_safety_protocol`, `user_isolation_rbac`, `go_fiber_clean_arch`, `deep_analytics_monitoring`)

---

## 1. Core Engineering Principles (หลักการวิศวกรรมซอฟต์แวร์ระดับองค์กร)

### 1.1 DB Safety & Zero-Migration Policy (กฎความปลอดภัย DB เดิมสูงสุด)
- **ห้ามสั่ง DDL Migration หรือแก้ไขโครงสร้างตารางเดิมใน PostgreSQL DB เด็ดขาด** 
- ข้อมูลใน `MueangSmart-DumpFromVM` PostgreSQL เป็นข้อมูล Production ของระบบ MueangSmart
- การเชื่อมโยงข้อมูลเดิม เช่น ตาราง `Municipalities`, `AdminUsers`, `MunicipalityModules`, `UserMunicipalities`, `ModuleElderlyAndDisabled`, `ModuleBedriddenPatient`, `ActivityLogs` จะต้องทำในลักษณะ **Read-Only หรือ Safe Transactional Query** ผ่าน Go Backend Layer เท่านั้น
- **ห้ามส่งคำสั่ง SQL Mutate (INSERT/UPDATE/DELETE) โดยตรงเข้าฐานข้อมูลโดยไม่ผ่าน Application Layer** 
- **NO RAW SQL EXECUTION BY AI (กฎเด็ดขาด: ห้าม AI รันคำสั่ง SQL เอง):** AI ถูกห้ามอย่างเด็ดขาดในการรันคำสั่ง SQL แก้ไขข้อมูล (INSERT/UPDATE/DELETE/ALTER/DROP) หรือเขียนสคริปต์ยิงแก้ไขฐานข้อมูลโดยตรง หากมีคำสั่ง SQL ที่จำเป็นต้องรัน **ให้ AI นำเสนอคำสั่ง SQL ในแชทเพื่อให้ USER เป็นคนนำไปรันเองเท่านั้น** 

### 1.2 User & Permission Domain Isolation & Naming Convention
- ระบบ SuperAdmin User และ RBAC Management ของ Back Office **ต้องแยกอิสระจากตาราง User หน้าบ้านโดยสมบูรณ์**
- **Strict Naming Pattern Alignment:** ต้องใช้ Naming Pattern เดียวกับโครงสร้าง DB เดิมใน `MueangSmart-DumpFromVM`:
  - **ชื่อตาราง (Table Names):** ใช้ **PascalCase แบบ พหูพจน์ (Plural)** และใช้ Prefix `Bo` เสมอ เช่น `BoSuperAdmins`, `BoRoles`, `BoPermissions`, `BoAuditLogs`
  - **ชื่อคอลัมน์ (Column Names):** ใช้ **PascalCase** เสมอ เช่น `Id`, `CreatedBy`, `CreatedDate`, `UpdatedBy`, `UpdatedDate`, `Email`, `PasswordHash`, `IsActive`
- ห้ามใช้ตาราง `AdminUsers` หรือ `Users` เดิมเพื่อระบุตัวตนของ SuperAdmin Back Office

### 1.3 High Performance & Zero Memory Leak Strategy
- **Go Backend (Fiber v3):**
  - เขียนด้วยหลักการ **Clean Architecture** (Domain, UseCase, Repository, Handler)
  - ห้ามสร้าง Goroutine แบบ Unbounded หรือเล็ดลอดจนเกิด Goroutine Leak
  - ใช้ `sync.Pool` สำหรับ Object ที่สร้างบ่อย และใช้ Context Cancellation เสมอเมื่อมี Request Timeout
  - ปิด Database Connections & Statement Handles อย่างเหมาะสม
- **Next.js Frontend (React 19 / Next.js 15+):**
  - **Clean UI & Modularity Rule:** บังคับใช้ **Reusable Components** (`src/components/ui/`) และ **Custom React Hooks** (`src/hooks/`) สำหรับ Data Fetching และ Business Logic แยกออกจาก UI Pages ใน `app/` เพื่อให้หน้าจอ UI Clean เรียบง่าย และไม่มี Code Cluttering
  - ใช้ **On-Demand Fetching**, React Server Components (RSC) ร่วมกับ Client Components สำหรับ Dynamic Interactivity
  - จัดการ Cleanup function ใน `useEffect` และ Event Listeners / WebSockets เสมอ ป้องกัน Client Memory Leak
  - **Strict Type-Safety:** **ห้ามใช้ `any` เด็ดขาด** ต้องระบุ Type หรือ Interface อย่างชัดเจน 100%

### 1.4 Code Cleanliness & Quality Control
- **ห้ามใส่ Comment ที่ไม่จำเป็น** ในโค้ด (เช่น Comment อธิบายคำสั่งพื้นฐาน) แต่ต้องคงไว้ซึ่ง Docstring อธิบาย Business Logic หรือ Complex Algorithms
- **Mandatory Documentation Rule (กฎการลงบันทึกเอกสาร):** ทุกครั้งที่มีการสร้าง แก้ไข หรือพัฒนาฟีเจอร์ใดๆ ต้องมีการสร้างหรืออัปเดตเอกสารกำกับในโปรเจคเสมอ (`docs/CHANGELOG.md` หรือ `docs/ARCHITECTURE_LOG.md`) โดยระบุอย่างละเอียดว่า:
  1. ทำอะไรไปบ้าง (What was built/modified)
  2. ใช้อะไรไปบ้าง (Dependencies, Libraries, Architecture Patterns used)
  3. วิธีการทดสอบและผลการตรวจสอบ (Verification & Test Results)
- **Verification Requirement:** ทุกครั้งที่มีการสร้างหรือแก้ไขโค้ด จะต้องทำการตรวจสอบคุณภาพเสมอ:
  - Backend: `go vet ./...` และ `go test ./...`
  - Frontend: `pnpm lint` และ `tsc --noEmit`

---

## 2. Dynamic Workflow & Escalation Protocol

1. **การแก้ไขข้อมูลเดิมแต่ส่งผลกระทบ:** หากมีกรณีจำเป็นต้องปรับปรุงข้อมูลเดิมที่อาจส่งผลกระทบต่อระบบ Web App หรือ Mobile App เดิม ให้ **หยุดปฏิบัติงานและสอบถาม Senior Software Engineer / User ก่อนเสมอ** ห้ามตัดสินใจทำเองโดยพละการ
2. **การทำงานร่วมกับระบบเดิม:** ใช้แนวทาง **"สร้างส่วนเชื่อมโยงเพิ่ม (Extension Layer)"** แทนการแก้ไขโค้ดหรือตารางเดิมตรงๆ
3. **การบันทึกความคืบหน้า:** ต้องอัปเดตเอกสารรายงานความคืบหน้า (Walkthrough) และสร้าง Unit Test ควบคู่กับการพัฒนาเสมอ

---

## 3. Reference Documentation & Skills Matrix

ก่อนเริ่มงานตาม Feature ต่างๆ ให้ศึกษาเอกสารประกอบเพิ่มเติมตามโฟลเดอร์ดังนี้:
- **PM Strategy Plan:** [docs/PROJECT_MANAGER_PLAN.md](/mueangsmart-back-office/docs/PROJECT_MANAGER_PLAN.md)
- **Senior Technical Architecture Plan:** [docs/SENIOR_ENGINEER_PLAN.md](/mueangsmart-back-office/docs/SENIOR_ENGINEER_PLAN.md)
- **Theme & Design System Specifications:** [docs/DESIGN_SYSTEM.md](/mueangsmart-back-office/docs/DESIGN_SYSTEM.md)
- **Specialized Skills:** โฟลเดอร์ [.agents/skills/]( /mueangsmart-back-office/.agents/skills/)
