import { ShieldAlert } from 'lucide-react';
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import ProfilePage from "@/components/pages/ProfilePage";
import CourseStudents from "@/components/pages/Teacher/CourseStudents";
import StudentsInfo from "@/components/pages/Teacher/StudentsInfo";
import ProjectsPage from "@/components/pages/Teacher/ProjectsPage";
import CoursesPage from "@/components/pages/Teacher/CoursesPage";
import CLOPage from "@/components/pages/Teacher/CLOPage";
import NotificationsPage from "@/components/pages/NotificationsPage";
import SettingsPage from "@/components/pages/SettingsPage";
import LoginPage from "@/components/pages/Auth/LoginPage";
import RegisterPage from "@/components/pages/Auth/RegisterPage";
import Transcript from "@/components/pages/Student/Transcript";
import Portfolio from "@/components/pages/Student/Portfolio";
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
import Approvals from "@/components/pages/Admin/Approvals";
import AuditLog from "@/components/pages/Admin/AuditLog";
import ExportData from "@/components/pages/Admin/ExportData";
import ImportData from "@/components/pages/Admin/ImportData";
import Reports from "@/components/pages/Admin/Reports";
import RolesManagement from "@/components/pages/Admin/RolesManagement";
import UsersManagement from "@/components/pages/Admin/UsersManagement";
import AssignStudents from "@/components/pages/Admin/AssignStudents";
import ResearchSummary from "@/components/pages/Teacher/ResearchSummary";
import DeanDashboard from "@/components/pages/Teacher/DeanDashboard";
import Retention from "@/components/pages/Teacher/Retention";
import PracticalPage from '@/components/pages/Teacher/PracticalPage';
import FacultyDimensionPage from '@/components/pages/Teacher/FacultyDimensionPage';
import ProjectAssessments from "@/components/pages/Teacher/ProjectAssessments";


import AdvisorCompetencyView from "@/components/pages/Teacher/AdvisorCompetencyView";
import AdvisorVaccinationView from "@/components/pages/Teacher/AdvisorVaccinationView";
import AdvisorHealthRecordsView from "@/components/pages/Teacher/AdvisorHealthRecordsView";
import StudentVaccinations from "@/components/pages/Student/StudentVaccinationPage";
import StudentHealthRecords from "@/components/pages/Student/StudentHealthRecordsPage";
import StudentCompetencyView from "@/components/pages/Student/StudentCompetencyView";
import CompetencyItemsManagement from "@/components/pages/Admin/CompetencyItemsManagement";

type LoginUserPayload = Record<string, unknown> & {
  role_id?: unknown;
  position_id?: unknown;
};

const Index = () => {
  const [activeItem, setActiveItem] = useState(() => {
    const urlPage = new URLSearchParams(window.location.search).get("page");
    if (urlPage) return urlPage;

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      const roleId = Number(userObj.role_id);
      const positionId = Number(userObj.position_id);

      switch (roleId) {
        case 1:
          return "users-management";
        case 2:
          if (positionId === 1) return "dean-dashboard";
          if (positionId === 2) return "my-courses";
          if (positionId === 3) return "advises";
          if (positionId === 4) return "practical-students";
          if (positionId === 5) return "clos";
          if (positionId === 6) return "my-projects";
          if (positionId === 9) return "research-summary";
          return "profile";
        case 3:
          return "transcript";
      }
      return "profile";
    }

    return "login";
  });

  useEffect(() => {
    const onNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ page?: string }>).detail;
      if (detail?.page) {
        setActiveItem(detail.page);
      }
    };
    window.addEventListener("app:navigate", onNavigate);
    return () => window.removeEventListener("app:navigate", onNavigate);
  }, []);

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
    const savedUser = localStorage.getItem('user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    const roleId = userObj ? Number(userObj.role_id) : 0;
    const positionId = userObj ? Number(userObj.position_id) : 0;
    const permissions = Array.isArray(userObj?.permissions) ? userObj.permissions : [];
    const hasPermission = (permission: string) => permissions.includes(permission);
    const canViewResearchSummary =
      roleId === 2 && (positionId === 1 || positionId === 9 || hasPermission("RESEARCH_SUMMARY_VIEW"));
    const canViewProjectPage = roleId === 1 || hasPermission("PROJECT_VIEW");
    const canViewProjectReports = roleId === 1 || hasPermission("PROJECT_REPORTS_VIEW");
    const isResearchPreviewRoute =
      import.meta.env.DEV &&
      !userObj &&
      activeItem === "research-summary" &&
      new URLSearchParams(window.location.search).get("page") === "research-summary";

    // 1. หมวดหน้า Auth
    if (activeItem === "login") {
      return (
        <LoginPage 
          onLoginSuccess={(userData: unknown) => {
            if (!userData || typeof userData !== "object") return;
            const loginUser = userData as LoginUserPayload;
            const rId = Number(loginUser.role_id);
            const pId = Number(loginUser.position_id);
            
            localStorage.setItem('user', JSON.stringify(loginUser));

            switch (rId) {
              case 1: setActiveItem("users-management"); break;
              case 2:
                if (pId === 1) setActiveItem("dean-dashboard");
                else if (pId === 2) setActiveItem("my-courses");
                else if (pId === 3) setActiveItem("advises");
                else if (pId === 4) setActiveItem("practical-students");
                else if (pId === 5) setActiveItem("clos");
                else if (pId === 6) setActiveItem("my-projects");
                else if (pId === 9) setActiveItem("research-summary");
                break;
              case 3: setActiveItem("transcript"); break;
              default: setActiveItem("profile");
            }
          }}
          onGoToRegister={() => setActiveItem("register")} 
        />
      );
    }
    
    // 2. หมวดทั่วไปที่ทุก Role เข้าถึงได้
    if (activeItem === "register") return <RegisterPage onBackToLogin={() => setActiveItem("login")} />;
    if (activeItem === "profile") return <ProfilePage />;
    if (activeItem === "notifications") return <NotificationsPage />;
    if (activeItem === "settings") return <SettingsPage />;
    if (activeItem === "my-projects") return <MyProjects />;

    // 3. 🔒 หมวดสิทธิ์ Admin (Role 1)
    const adminPages = [
      "approvals", "audit-log", "export-data", "import-data", "reports", 
      "roles-management", "users-management", "competency-items-management", "competency-items"
    ];
    if (adminPages.includes(activeItem)) {
      if (roleId !== 1 && !(roleId == 2 && positionId == 1)) return <UnauthorizedView />;
      switch (activeItem) {
        case "approvals": return <Approvals />;
        case "audit-log": return <AuditLog />;
        case "export-data": return <ExportData />;
        case "import-data": return <ImportData />;
        case "reports": return <Reports />;
        case "roles-management": return <RolesManagement />;
        case "users-management": return <UsersManagement />;
        case "competency-items-management":
        case "competency-items":
          return <CompetencyItemsManagement />;
      }
    }

    if (activeItem === "assign-students") {
      if (roleId !== 1) return <UnauthorizedView />;
      return <AssignStudents />;
    }

    const projectAdminPages = ["projectspage", "project-docs", "project-links", "project-reports"];
    if (projectAdminPages.includes(activeItem)) {
      switch (activeItem) {
        case "projectspage":
          if (!canViewProjectPage) return <UnauthorizedView />;
          return <ProjectsPage />;
        case "project-docs":
          if (roleId !== 1) return <UnauthorizedView />;
          return <ProjectDocs />;
        case "project-links":
          if (roleId !== 1) return <UnauthorizedView />;
          return <ProjectLinks />;
        case "project-reports":
          if (!canViewProjectReports) return <UnauthorizedView />;
          return <ProjectReports />;
      }
    }

    // 4. 🔒 หมวดสิทธิ์คณบดี (Role 2 + Position 1) หรือ Admin
    const deanPages = [
      "dean-dashboard", "retention", "dean-teaching-workload", "dean-research-workload",
      "dean-academic-service-workload", "dean-culture-workload"
    ];
    if (deanPages.includes(activeItem)) {
      if (roleId !== 1 && !(roleId === 2 && positionId === 1)) return <UnauthorizedView />;
      switch (activeItem) {
        case "dean-dashboard": return <DeanDashboard />;
        case "retention": return <Retention />;
        case "dean-teaching-workload": return <FacultyDimensionPage dimension="teaching" />;
        case "dean-research-workload": return <FacultyDimensionPage dimension="research" />;
        case "dean-academic-service-workload": return <FacultyDimensionPage dimension="academic-service" />;
        case "dean-culture-workload": return <FacultyDimensionPage dimension="culture" />;
      }
    }

    // 5. 🔒 หมวดสิทธิ์อาจารย์ (Teacher - Role 2) หรือ Admin
    const teacherPages = [
      "courses", "five-year-summary", "clo-management", "clos",
      "plo-ylo-report", "course-report", "course-students", "documents", "assign-instructors", "clo-map",
      "evidence", "grades", "my-courses", "performance", "practical-students",
      "program-reports", "schedule-tasks", "advise-notes", "advisor-notifications", "advises",
      "students", "students-info", "transfer-requests", "my-research", "research-summary", "project-assessments",
      // รองรับ URL จากระบบฐานข้อมูล
      "advisor-vaccination-view", "view-student-vaccinations",
      "advisor-health-records-view", "view-student-health-records",
      "advisor-competency-view", "student-competency"
    ];
    
    if (teacherPages.includes(activeItem)) {
      if (activeItem === "research-summary" && !isResearchPreviewRoute && !canViewResearchSummary) return <UnauthorizedView />;
      if (!isResearchPreviewRoute && roleId !== 1 && roleId !== 2) return <UnauthorizedView />;
      switch (activeItem) {
        case "courses": return <CoursesPage />;
        case "five-year-summary": return <FiveYearSummary />;
        case "clo-management": return <CLOManagement />;
        case "clos": return <CLOPage />;
        case "plo-ylo-report": return <PLOYLOReport />;
        case "course-report": return <CourseReports />;
        case "course-students": return <CourseStudents />;
        case "documents": return <Documents />;
        case "assign-instructors": return <AssignInstructors />;
        case "clo-map": return <CLOMap />;
        case "evidence": return <Evidence />;
        case "grades": return <Grades />;
        case "my-courses": return <MyCourses />;
        case "performance": return <Performance />;
        case "practical-students": return <PracticalPage />;
        case "program-reports": return <ProgramReports />;
        case "schedule-tasks": return <ScheduleTasks />;
        case "advise-notes": return <AdviseNotes />;
        case "advisor-notifications": return <AdvisorNotifications />;
        case "advises": return <Advises />;
        case "students": return <Students />;
        case "students-info": return <StudentsInfo />;
        case "transfer-requests": return <TransferRequests />;
        case "research-summary": return <ResearchSummary />;
        case "project-assessments": return <ProjectAssessments />;
        case "advisor-vaccination-view":
        case "view-student-vaccinations":
          return <AdvisorVaccinationView />;
        case "advisor-health-records-view":
        case "view-student-health-records":
          return <AdvisorHealthRecordsView />;
        case "advisor-competency-view":
        case "student-competency":
          return <AdvisorCompetencyView />;
      }
    }

    // 6. 🔒 หมวดสิทธิ์นักศึกษา (Student - Role 3) หรือ Admin
    const studentPages = [
      "transcript", "portfolio", 
      // รองรับ URL จากระบบฐานข้อมูล
      "student-vaccinations", 
      "student-health-records", 
      "student-competency-view", "my-competency"
    ];
    if (studentPages.includes(activeItem)) {
      if (roleId !== 1 && roleId !== 3) return <UnauthorizedView />;
      switch (activeItem) {
        case "transcript": return <Transcript />;
        case "portfolio": return <Portfolio />;
        case "student-vaccinations": return <StudentVaccinations />;
        case "student-health-records": return <StudentHealthRecords />;
        case "student-competency-view":
        case "my-competency":
          return <StudentCompetencyView />;
      }
    }

    return <ProfilePage />;
  };

  const isAuthPage = activeItem === "login" || activeItem === "register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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