# MueangSmart Enterprise Design System & UI Specifications

**Project:** MueangSmart SuperAdmin Back Office  
**Reference Theme:** MueangSmart Web (`ms-web`) Clean & Modern Corporate Dark/Light Palette  

---

## 1. Design Philosophy & Core Aesthetics

ระบบ Back Office จะต้องให้ความรู้สึก **Enterprise High-End, High-Performance, Sleek & Modern** โดยสืบทอดโทนสี หลักการจัดวาง และ Typography มาจาก `ms-web` เพื่อสร้างความคุ้นเคยและเป็นอันหนึ่งอันเดียวกัน แต่ยกระดับการแสดงผลข้อมูลวิเคราะห์ (Analytics & Charts) ให้คมชัด ทันสมัย รองรับทั้ง Light & Dark Mode

---

## 2. Color System & Theme Tokens

### 2.1 Primary & Accent Palette
- **Primary Blue (สีหลัก MueangSmart):** `#0284C7` (Sky-600) / `#0EA5E9` (Sky-500)
- **Primary Hover / Active:** `#0369A1` (Sky-700) / `#0284C7` (Sky-600)
- **Secondary Slate:** `#475569` (Slate-600) / `#334155` (Slate-700)

### 2.2 Functional Status Colors
- **Success / Active City:** `#10B981` (Emerald-500) / Dynamic Soft Emerald Tint `#ECFDF5`
- **Warning / Pending Approval:** `#F59E0B` (Amber-500) / Dynamic Soft Amber Tint `#FEF3C7`
- **Danger / Suspended / Rejected:** `#EF4444` (Red-500) / Dynamic Soft Red Tint `#FEE2E2`
- **Info / Analytics Accent:** `#6366F1` (Indigo-500) / `#8B5CF6` (Violet-500)

### 2.3 Background & Surface (Dark & Light Glassmorphism Support)
- **Light Mode Surface:** `#F8FAFC` (Slate-50), Card `#FFFFFF`, Border `#E2E8F0`
- **Dark Mode Surface:** `#0F172A` (Slate-900), Card `#1E293B`, Border `#334155`
- **Glassmorphism Effect:** `backdrop-blur-md bg-white/80 dark:bg-slate-900/80`

---

## 3. Typography & Micro-Animations

- **Font Family:** Google Font **'Inter'**, **'Prompt'** หรือ **'Kanit'** สำหรับภาษาไทยและตัวเลข
- **Typography Scale:**
  - Page Heading: `text-2xl font-bold text-slate-900 dark:text-white`
  - Section Title: `text-lg font-semibold text-slate-800 dark:text-slate-100`
  - Body Text: `text-sm text-slate-600 dark:text-slate-300`
  - Caption / Metric Label: `text-xs text-slate-400 dark:text-slate-500`
- **Micro-Animations:**
  - Transition duration: `transition-all duration-200 ease-in-out`
  - Button Hover Scale: `hover:scale-[1.02] active:scale-[0.98]`
  - Smooth Table & Chart Loading Skeleton states

---

## 4. Reusable Layout & Frontend Component Architecture

### 4.1 Reusable UI Component Standards (`src/components/ui/`)
- **MetricCard Component (`MetricCard.tsx`):** แสดงตัวเลขสถิติ KPI พร้อม Icon, Subtitle และ Status Color Accents
- **Badge Component (`Badge.tsx`):** แสดงป้ายสถานะ (Success, Warning, Danger, Info) คลีน สไตล์ Corporate
- **LoadingSpinner Component (`LoadingSpinner.tsx`):** สปินเนอร์หมุนโหลดข้อมูลมาตรฐาน
- **Modal Dialog Component (`Modal.tsx`):** หน้าต่างลอยแสดงรายละเอียด JSON และการยืนยันคำสั่ง

### 4.3 Full Responsive Layout System (Mobile, Tablet, Desktop)
- **Mobile Navigation Drawer:** ปุ่ม Hamburger Menu Toggle บน Header บาร์มือถือ (`lg:hidden`) พร้อมเมนูลอยแบบ Slide-Over Backdrop
- **Desktop Navigation:** Sticky Sidebar ด้านซ้ายคงที่ยามใช้งานบนจอใหญ่ (`lg:block`)
- **Responsive Fluid Grids:** ปรับเปลี่ยนเลย์เอาต์ตามขนาดหน้าจอ (Mobile: 1 คอลัมน์ -> Tablet: 2 คอลัมน์ -> Desktop: 4 คอลัมน์)
- **Mobile Horizontal Scroll Tables:** ตารางข้อมูลทุกหน้ามาพร้อม `overflow-x-auto` ป้องกันตารางล้นจอแสดงผลบนมือถือ
