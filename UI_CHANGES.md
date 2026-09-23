# รายการไฟล์ UI ที่แก้ไข

เอกสารนี้สรุปเฉพาะไฟล์ Frontend/UI ที่แก้ตามผลทดสอบ UI และการกู้คืนหน้า UI ล่าสุดใน branch `earn-new-branch`

ไม่รวมไฟล์ Backend, API, ฐานข้อมูล หรือไฟล์ที่แก้เพื่อการตั้งค่าเครื่องมือ

อ้างอิง commit UI: `05b5b19`, `3b4a3f8`, `4c383a6`, `612d415`

> หมายเหตุ: commit `fce94d0` เป็นการกู้คืน snapshot ของ frontend ไม่ใช่การออกแบบ UI ใหม่ จึงไม่นับเป็นรายการแก้ UI เพิ่มเติมในเอกสารนี้

## Layout และองค์ประกอบกลาง

- `frontend/src/components/layout/AppSidebar.tsx`
- `frontend/src/components/layout/MainLayout.tsx`
- `frontend/src/components/ui/sonner.tsx` — ปรับ toast/แถบแจ้งเตือนมุมขวาล่าง รวมถึงขนาดที่ใหญ่ขึ้น
- `frontend/src/index.css`

## หน้าเข้าสู่ระบบ

- `frontend/src/components/pages/Auth/LoginPage.tsx`

## หน้าผู้ดูแลระบบ

- `frontend/src/components/pages/Admin/Approvals.tsx`
- `frontend/src/components/pages/Admin/AssignStudents.tsx`
- `frontend/src/components/pages/Admin/CompetencyItemsManagement.tsx`
- `frontend/src/components/pages/Admin/RolesManagement.tsx`
- `frontend/src/components/pages/Admin/UsersManagement.tsx`

## หน้านักศึกษา

- `frontend/src/components/pages/Student/Portfolio.tsx`
- `frontend/src/components/pages/Student/Transcript.tsx`
- `frontend/src/components/pages/Student/StudentCompetencyView.tsx`
- `frontend/src/components/pages/Student/StudentHealthRecordsPage.tsx`
- `frontend/src/components/pages/Student/StudentVaccinationPage.tsx`

## หน้าอาจารย์

- `frontend/src/components/pages/Teacher/AdviseNotes.tsx`
- `frontend/src/components/pages/Teacher/Advises.tsx`
- `frontend/src/components/pages/Teacher/AdvisorCompetencyView.tsx`
- `frontend/src/components/pages/Teacher/AdvisorHealthRecordsView.tsx`
- `frontend/src/components/pages/Teacher/AdvisorNotifications.tsx`
- `frontend/src/components/pages/Teacher/AdvisorVaccinationView.tsx`
- `frontend/src/components/pages/Teacher/CLOManagement.tsx`
- `frontend/src/components/pages/Teacher/CLOMap.tsx`
- `frontend/src/components/pages/Teacher/CLOPage.tsx`
- `frontend/src/components/pages/Teacher/CourseReports.tsx`
- `frontend/src/components/pages/Teacher/CourseStudents.tsx`
- `frontend/src/components/pages/Teacher/CoursesPage.tsx`
- `frontend/src/components/pages/Teacher/DeanDashboard.tsx`
- `frontend/src/components/pages/Teacher/Documents.tsx`
- `frontend/src/components/pages/Teacher/Evidence.tsx`
- `frontend/src/components/pages/Teacher/FacultyDimensionPage.tsx`
- `frontend/src/components/pages/Teacher/FiveYearSummary.tsx`
- `frontend/src/components/pages/Teacher/MyCourses.tsx`
- `frontend/src/components/pages/Teacher/MyProjects.tsx`
- `frontend/src/components/pages/Teacher/PLOYLOReport.tsx`
- `frontend/src/components/pages/Teacher/Performance.tsx`
- `frontend/src/components/pages/Teacher/PracticalPage.tsx`
- `frontend/src/components/pages/Teacher/ProgramReports.tsx`
- `frontend/src/components/pages/Teacher/ProjectAssessments.tsx`
- `frontend/src/components/pages/Teacher/ProjectLinks.tsx`
- `frontend/src/components/pages/Teacher/ProjectReports.tsx`
- `frontend/src/components/pages/Teacher/ProjectsPage.tsx`
- `frontend/src/components/pages/Teacher/ResearchSummary.tsx`
- `frontend/src/components/pages/Teacher/Retention.tsx`
- `frontend/src/components/pages/Teacher/ScheduleTasks.tsx`
- `frontend/src/components/pages/Teacher/StudentLearningOutcomesPage.tsx`
- `frontend/src/components/pages/Teacher/Students.tsx`
- `frontend/src/components/pages/Teacher/StudentsInfo.tsx`
- `frontend/src/components/pages/Teacher/TransferRequests.tsx`

## ไฟล์ UI ที่เพิ่มสำหรับหน้ารูปแบบใหม่

- `frontend/src/components/pages/Admin/AssignStudents.tsx`
- `frontend/src/components/pages/Admin/CompetencyItemsManagement.tsx`
- `frontend/src/components/pages/Student/StudentCompetencyView.tsx`
- `frontend/src/components/pages/Student/StudentHealthRecordsPage.tsx`
- `frontend/src/components/pages/Student/StudentVaccinationPage.tsx`
- `frontend/src/components/pages/Teacher/AdvisorCompetencyView.tsx`
- `frontend/src/components/pages/Teacher/AdvisorHealthRecordsView.tsx`
- `frontend/src/components/pages/Teacher/AdvisorVaccinationView.tsx`
- `frontend/src/components/pages/Teacher/ResearchSummary.tsx`
