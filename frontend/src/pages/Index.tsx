import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ProfilePage from "@/components/pages/ProfilePage";
import TeacherPage from "@/components/pages/Teacher/TeacherPage";
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
import NOJhefjs from "@/components/pages/Student/Transcript";

const Index = () => {
  const [activeItem, setActiveItem] = useState("login");

  const renderPage = () => {
    switch (activeItem) {
      case "login":
      return <LoginPage 

      onLoginSuccess={(roleId) => {
          if(roleId == 1) {
            setActiveItem("dashboard");
          } else if(roleId == 2) {
            setActiveItem("teacher");
          } else if(roleId == 3) {
            setActiveItem("transcript");
          }
        }
      }

      onGoToRegister={() => setActiveItem("register")} 

      />;
      case "register":
      return <RegisterPage onBackToLogin={() => setActiveItem("login")} />;
      case "profile":
        return <ProfilePage />;
      case "teacher":
        return <TeacherPage />;
      case "students-info":
        return <StudentsInfo />;
      case "transcript":
        return <Transcript />;
      case "projects":
        return <ProjectsPage />;
      case "courses":
        return <CoursesPage />;
      case "clo":
        return <CLOPage />;
      case "practical":
        return <PracticalPage />;
      case "notifications":
        return <NotificationsPage />;
      case "settings":
        return <SettingsPage />;
      case "settings":
        return <SettingsPage />;
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
    <div className="min-h-screen bg-background flex"> {/* เพิ่ม flex เพื่อให้ Sidebar ชิดซ้าย Content ชิดขวา */}
      
      {/* Sidebar ส่ง setActiveItem เข้าไปเพื่อใช้เปลี่ยนหน้า */}
      <AppSidebar activeItem={activeItem} onItemClick={setActiveItem} />

      {/* Main Content (เว้นระยะซ้ายให้ Sidebar) */}
      <main className="flex-1 ml-[80px] md:ml-[260px] p-6 min-h-screen transition-all duration-300">
        {renderPage()}
      </main>
    </div>
  );
};

export default Index;
