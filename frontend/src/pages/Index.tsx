import { ShieldAlert } from 'lucide-react';
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
import Retention from "@/components/pages/Teacher/Retention";

const Index = () => {
  const [activeItem, setActiveItem] = useState(() => {
    const urlPage = new URLSearchParams(window.location.search).get("page");
    if (urlPage) return urlPage;

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      const roleId = Number(userObj.role_id);
      const positionId = Number(userObj.position_id);

      if (roleId === 1) return "users-management";
      if (roleId === 2) {
        if (positionId === 1) return "dean-dashboard";
        if (positionId === 3) return "advises";
        return "plo-ylo-report";
      }
      if (roleId === 3) return "transcript";

      return "profile";
    }

    return "login";
  });

  // คอมโพเนนต์หน้าจอเมื่อไม่มีสิทธิ์เข้าถึง (Unauthorized)
  const UnauthorizedView = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
      <div className="p-4 bg-red-100 rounded-full text-red-600">
        <ShieldAlert className="w-16 h-16" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">ปฏิเสธการเข้าถึง (Access Denied)</h2>
      <p className="text-muted-foreground">คุณไม่มีสิทธิ์ในการเข้าถึงหน้าจอนี้ หรือสิทธิ์การใช้งานไม่ถูกต้อง</p>
    </div>
  );

  const renderPage = () => {
    // 1. ดึงข้อมูลสิทธิ์ปัจจุบันเสมอ เมื่อมีการเรนเดอร์หน้าใหม่
    const savedUser = localStorage.getItem('user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    const roleId = userObj ? Number(userObj.role_id) : 0;
    const positionId = userObj ? Number(userObj.position_id) : 0;

    // 2. หมวดทั่วไปที่ทุกคนเข้าถึงได้ (Public / All Roles)
    if (activeItem === "login") {
      return (
        <LoginPage
          onLoginSuccess={(userData: any) => {
            if (!userData) return;
            const rId = Number(userData.role_id);
            const pId = Number(userData.position_id);

            localStorage.setItem('user', JSON.stringify(userData));

            switch (rId) {
              case 1: setActiveItem("users-management"); break;
              case 2:
                if (pId === 1) setActiveItem("dean-dashboard");
                else if (pId === 5) setActiveItem("plo-ylo-report");
                else if (pId === 3) setActiveItem("advises");
                else setActiveItem("plo-ylo-report");
                break;
              case 3: setActiveItem("transcript"); break;
              default: setActiveItem("profile");
            }
          }}
          onGoToRegister={() => setActiveItem("register")}
        />
      );
    }

    if (activeItem === "register") return <RegisterPage onBackToLogin={() => setActiveItem("login")} />;
    if (activeItem === "profile") return <ProfilePage />;
    if (activeItem === "notifications") return <NotificationsPage />;
    if (activeItem === "settings") return <SettingsPage />;

    // 3. 🔒 หมวดสิทธิ์ผู้ดูแลระบบ (Admin - Role 1)
    const adminPages = ["approvals", "audit-log", "export-data", "import-data", "reports", "roles-management", "users-management"];
    if (adminPages.includes(activeItem)) {
      if (roleId !== 1) return <UnauthorizedView />;
      switch (activeItem) {
        case "approvals": return <Approvals />;
        case "audit-log": return <AuditLog />;
        case "export-data": return <ExportData />;
        case "import-data": return <ImportData />;
        case "reports": return <Reports />;
        case "roles-management": return <RolesManagement />;
        case "users-management": return <UsersManagement />;
      }
    }

    // 4. 🔒 หมวดสิทธิ์คณบดี (Role 2 + Position 1) หรือ Admin
    const deanPages = ["dean-dashboard", "retention"];
    if (deanPages.includes(activeItem)) {
      if (roleId !== 1 && !(roleId === 2 && positionId === 1)) return <UnauthorizedView />;
      switch (activeItem) {
        case "dean-dashboard": return <DeanDashboard />;
        case "retention": return <Retention />;
      }
    }

    // 5. 🔒 หมวดสิทธิ์อาจารย์และคณะกรรมการ (Teacher - Role 2) หรือ Admin
    const teacherPages = [
      "teacher-dashboard", "courses", "five-year-summary", "clo-management", "clos",
      "plo-ylo-report", "course-report", "documents", "assign-instructors", "clo-map",
      "evidence", "grades", "my-courses", "performance", "practical-students",
      "program-reports", "schedule-tasks", "projectspage", "my-projects", "project-docs",
      "project-links", "project-reports", "advise-notes", "advisor-notifications", "advises",
      "students", "transfer-requests"
    ];

    if (teacherPages.includes(activeItem)) {
      if (roleId !== 1 && roleId !== 2) return <UnauthorizedView />;
      switch (activeItem) {
        case "teacher-dashboard": return <Dashboard />;
        case "courses": return <CoursesPage />;
        case "five-year-summary": return <FiveYearSummary />;
        case "clo-management": //นวย
        case "clos": return <CLOPage />; // แก้ไขให้ใช้ CLOPage หน้าเดียว นวย
        case "plo-ylo-report": return <PLOYLOReport />;
        case "course-report": return <CourseReports />;
        case "documents": return <Documents />; //นวย
        case "assign-instructors": return <AssignInstructors />;
        case "clo-map": return <CLOMap />;//นวย
        case "evidence": return <Evidence />; //เอิน
        case "grades": return <Grades />;
        case "my-courses": return <MyCourses />;//นวย
        case "performance": return <Performance />;//
        case "practical-students": return <PracticalStudents />;
        case "program-reports": return <ProgramReports />;
        case "schedule-tasks": return <ScheduleTasks />;//
        case "projectspage": return <ProjectsPage />; //เอิน
        case "my-projects": return <MyProjects />;//เอิน
        case "project-docs": return <ProjectDocs />;//
        case "project-links": return <ProjectLinks />;//
        case "project-reports": return <ProjectReports />;//
        case "advise-notes": return <AdviseNotes />;
        case "advisor-notifications": return <AdvisorNotifications />;
        case "advises": return <Advises />;
        case "students": return <Students />;//
        case "transfer-requests": return <TransferRequests />;
      }
    }

    // 6. 🔒 หมวดสิทธิ์นักศึกษา (Student - Role 3) หรือ Admin
    const studentPages = ["transcript"];
    if (studentPages.includes(activeItem)) {
      if (roleId !== 1 && roleId !== 3) return <UnauthorizedView />;
      switch (activeItem) {
        case "transcript": return <Transcript />;
      }
    }

    // ถ้าพิมพ์เมนูแปลกๆ เข้ามาที่ไม่มีในระบบ ให้โยนกลับไปหน้า Profile
    return <ProfilePage />;
  };

  const isAuthPage = activeItem === "login" || activeItem === "register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {renderPage()}
      </div>
    );
  }

  return (
    <MainLayout
      onItemClick={setActiveItem}
      activeItem={activeItem}
    >
      {renderPage()}
    </MainLayout>
  );
};

export default Index;