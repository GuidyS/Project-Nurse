import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import ProfilePage from "@/components/pages/ProfilePage";
import CourseStudents from "@/components/pages/Teacher/CourseStudents";
import StudentsInfo from "@/components/pages/Teacher/StudentsInfo";
import ProjectsPage from "@/components/pages/Teacher/ProjectsPage";
import CoursesPage from "@/components/pages/Teacher/CoursesPage";
import CLOPage from "@/components/pages/Teacher/CLOPage";
import PracticalPage from "@/components/pages/Teacher/PracticalPage";
import NotificationsPage from "@/components/pages/NotificationsPage";
import SettingsPage from "@/components/pages/SettingsPage";
import LoginPage from "@/components/pages/Auth/LoginPage";
import RegisterPage from "@/components/pages/Auth/RegisterPage";
import Transcript from "@/components/pages/Student/Transcript";
import CLOManagement from "@/components/pages/Teacher/CLOManagement";
import PLOYLOReport from "@/components/pages/Teacher/PLOYLOReport";
import FiveYearSummary from "@/components/pages/Teacher/FiveYearSummary";
import CourseReports from "@/components/pages/Teacher/CourseReports";
import Documents from "@/components/pages/Teacher/Documents";
import AdviseNotes from "@/components/pages/Teacher/AdviseNotes";
import AdvisorNotifications from "@/components/pages/Teacher/AdvisorNotifications";
import Advises from "@/components/pages/Teacher/Advises";
import AssignInstructors from "@/components/pages/Teacher/AssignInstructors";
import CLOMap from "@/components/pages/Teacher/CLOMap";
import Evidence from "@/components/pages/Teacher/Evidence";
import Grades from "@/components/pages/Teacher/Grades";
import MyCourses from "@/components/pages/Teacher/MyCourses";
import MyProjects from "@/components/pages/Teacher/MyProjects";
import Performance from "@/components/pages/Teacher/Performance";
import TransferRequests from "@/components/pages/Teacher/TransferRequests";
import Students from "@/components/pages/Teacher/Students";
import ScheduleTasks from "@/components/pages/Teacher/ScheduleTasks";
import ProjectReports from "@/components/pages/Teacher/ProjectReports";
import ProjectLinks from "@/components/pages/Teacher/ProjectLinks";
import ProjectDocs from "@/components/pages/Teacher/ProjectDocs";
import ProgramReports from "@/components/pages/Teacher/ProgramReports";
import PracticalStudents from "@/components/pages/Teacher/PracticalStudents";
import Approvals from "@/components/pages/Admin/Approvals";
import AuditLog from "@/components/pages/Admin/AuditLog";
import ExportData from "@/components/pages/Admin/ExportData";
import ImportData from "@/components/pages/Admin/ImportData";
import Reports from "@/components/pages/Admin/Reports";
import RolesManagement from "@/components/pages/Admin/RolesManagement";
import UsersManagement from "@/components/pages/Admin/UsersManagement";
import Dashboard from "@/components/pages/Teacher/Dashboard";
import DeanDashboard from "@/components/pages/Teacher/DeanDashboard";

const Index = () => {
  const [activeItem, setActiveItem] = useState("login");

  const renderPage = () => {
    switch (activeItem) {
      case "login":
      return <LoginPage 

      onLoginSuccess={(userData: any) => {

        console.log("Login Data Received:", userData);
  
        if (!userData) return;

        // แปลงค่าเป็นตัวเลขเพื่อป้องกันปัญหา Type Mismatch
        const roleId = Number(userData.role_id);
        const positionId = Number(userData.position_id);

        // 1. เก็บข้อมูล User และ Permissions ลง LocalStorage ทันที
        // เพื่อให้ AppSidebar ดึงไปเช็ค hasPermission ได้ถูกต้อง
        localStorage.setItem('user', JSON.stringify(userData));

          // 2. Logic การเลือกหน้าแรก (Landing Page) หลัง Login
          switch (roleId) {
            case 1: // Admin
              setActiveItem("users-management"); // หรือ "dashboard" ของ Admin
              break;

            case 2: // กลุ่มอาจารย์ (Teacher)
              // ใช้ Position ID ในการแยกหน้า Dashboard เฉพาะทาง
              switch (positionId) {
                case 1: // คณบดี (อ้างอิงจาก position.sql)
                  setActiveItem("dean-dashboard");
                  break;
                case 5: // อาจารย์ผู้รับผิดชอบหลักสูตร
                  setActiveItem("plo-ylo-report");
                  break;
                case 3: // อาจารย์ที่ปรึกษา
                  setActiveItem("advises");
                  break;
                default:
                  // ถ้าตำแหน่งอื่นที่ไม่ระบุหน้าแรกไว้ ให้ไปหน้ากลางของอาจารย์
                  setActiveItem("plo-ylo-report"); 
              }
              break;

            case 3: // Student
              setActiveItem("transcript");
              break;

            default:
              // กรณี Role อื่นๆ หรือข้อมูลไม่สมบูรณ์
              setActiveItem("profile");
          }
        }
      }

      onGoToRegister={() => setActiveItem("register")} 

      />;
      
      case "register":
        return <RegisterPage onBackToLogin={() => setActiveItem("login")} />;
      case "profile":
        return <ProfilePage />;
      case "notifications":
        return <NotificationsPage />;
      case "settings":
        return <SettingsPage />;
      case "dashboard":
        return <Dashboard />;

      // Admin
      case "approvals":
        return <Approvals />;
      case "audit-log":
        return <AuditLog />;
      case "export-data":
        return <ExportData />;
      case "import-data":
        return <ImportData />;
      case "reports":
        return <Reports />;
      case "roles-management":
        return <RolesManagement />;
      case "users-management":
        return <UsersManagement />;

      // คณบดี
      case "dean-dashboard":
        return <DeanDashboard />;

      // ผู้รับผิดชอบหลักสูตร
      case "five-year-summary":
        return <FiveYearSummary />;
      case "clo-management":
        return <CLOManagement />;
      case "clo-map":
        return <CLOMap />;
      case "plo-ylo-report":
        return <PLOYLOReport />;
      case "course-report":
        return <CourseReports />;
      case "documents":
        return <Documents />;
      case "advise-notes":
        return <AdviseNotes />;
      case "advisor-notifications":
        return <AdvisorNotifications />;
      case "advises":
        return <Advises />;
      case "assign-instructors":
        return <AssignInstructors />;
      case "evidence":
        return <Evidence />;
      case "grades":
        return <Grades />;
      case "my-courses":
        return <MyCourses />;
      case "my-projects":
        return <MyProjects />;
      case "performance":
        return <Performance />;
      case "practical-students":
        return <PracticalStudents />;
      case "program-reports":
        return <ProgramReports />;
      case "project-docs":
        return <ProjectDocs />;
      case "project-links":
        return <ProjectLinks />;
      case "project-reports":
        return <ProjectReports />;
      case "schedule-tasks":
        return <ScheduleTasks />;
      case "students":
        return <Students />;
      case "transfer-requests":
        return <TransferRequests />;
      default:
        return <ProfilePage />;
    }
  };

  // ---------------------------------------------------------
  // [จุดสำคัญ] เช็คว่าเป็นหน้า Login/Register หรือเปล่า?
  // ---------------------------------------------------------
  const isAuthPage = activeItem === "login" || activeItem === "register";

  if (isAuthPage) {
    // ถ้าเป็น Auth Page -> แสดงแค่หน้านั้นเพียวๆ เต็มจอ (ไม่มี Sidebar)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {renderPage()}
      </div>
    );
  }

  // ถ้าไม่ใช่ Auth Page -> แสดงโครงสร้าง Dashboard ปกติ (มี Sidebar)
  return (
    <MainLayout onItemClick={setActiveItem}>
        {renderPage()}
    </MainLayout>
  );
};

export default Index;
