# รายการไฟล์ UI ที่ต่างจาก main

เอกสารนี้แสดงเฉพาะไฟล์ UI/Frontend ที่เนื้อหาใน branch `earn-new-branch` ต่างจาก branch `main` ณ เวลาที่ตรวจสอบ

ไม่รวมไฟล์ที่โค้ดเหมือน `main` แล้ว รวมถึงไม่รวม Backend, API และฐานข้อมูล

## Layout และองค์ประกอบกลาง

- `frontend/src/components/layout/AppSidebar.tsx`
- `frontend/src/components/ui/sonner.tsx` — ปรับ toast/แถบแจ้งเตือนมุมขวาล่าง รวมถึงขนาดที่ใหญ่ขึ้น

## หน้าเข้าสู่ระบบ

- `frontend/src/components/pages/Auth/LoginPage.tsx`

## หน้าผู้ดูแลระบบ

- `frontend/src/components/pages/Admin/Approvals.tsx`
- `frontend/src/components/pages/Admin/AssignStudents.tsx`
- `frontend/src/components/pages/Admin/CompetencyItemsManagement.tsx`
- `frontend/src/components/pages/Admin/RolesManagement.tsx`
- `frontend/src/components/pages/Admin/UsersManagement.tsx`

## หน้าอาจารย์

- `frontend/src/components/pages/Teacher/CLOManagement.tsx`
- `frontend/src/components/pages/Teacher/CLOPage.tsx`
- `frontend/src/components/pages/Teacher/MyProjects.tsx`
- `frontend/src/components/pages/Teacher/ProjectReports.tsx`
- `frontend/src/components/pages/Teacher/ProjectsPage.tsx`
