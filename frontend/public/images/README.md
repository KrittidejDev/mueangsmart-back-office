# MueangSmart Public Image Assets Directory

โฟลเดอร์นี้จัดเก็บไฟล์รูปภาพและโลโก้หลักของระบบ (Static Image Assets) 

## 📁 โครงสร้างตำแหน่งไฟล์ (File Paths)

| ชื่อไฟล์ | ตำแหน่งที่อยู่จริง (Local Path) | URL อ้างอิงในโค้ด | คำอธิบาย / ขนาดที่แนะนำ |
|---|---|---|---|
| **Logo** | `frontend/public/images/logo.png` (หรือ `logo.svg`) | `/images/logo.png` | โลโก้แบรนด์หลัก (ขนาดแนะนำ: 512x512px หรือไฟล์ SVG) |
| **Login Background** | `frontend/public/images/login-bg.jpg` (หรือ `login-bg.png` / `login-bg.svg`) | `/images/login-bg.jpg` | ภาพพื้นหลังหน้า Login (ขนาดแนะนำ: 1920x1080px) |
| **Favicon / App Icon** | `frontend/public/favicon.ico` | `/favicon.ico` | ไอคอนเว็บบราวเซอร์ (ขนาด 32x32px) |

---

## 💡 วิธีการเปลี่ยนภาพโลโก้และพื้นหลัง

1. **การเปลี่ยนโลโก้:**
   - นำไฟล์โลโก้ใหม่ตั้งชื่อเป็น `logo.png` หรือ `logo.svg`
   - นำมาวางทับที่โฟลเดอร์ `frontend/public/images/logo.svg` (หรือ `logo.png`)
   - ใน Next.js โค้ดจะเรียกผ่านแท็ก `<img src="/images/logo.svg" alt="MueangSmart Logo" />`

2. **การเปลี่ยนภาพพื้นหลังหน้า Login:**
   - นำไฟล์ภาพพื้นหลังใหม่ตั้งชื่อเป็น `login-bg.jpg` (หรือ `login-bg.svg`)
   - นำมาวางทับที่โฟลเดอร์ `frontend/public/images/login-bg.jpg` (หรือ `login-bg.svg`)
   - ใน Next.js โค้ดจะเรียกผ่านสไตล์ `backgroundImage: "url('/images/login-bg.svg')"`
