import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ProfilePage from "@/components/pages/ProfilePage";
import StudentsPage from "@/components/pages/StudentsPage";
import ProjectsPage from "@/components/pages/ProjectsPage";
import CoursesPage from "@/components/pages/CoursesPage";
import CLOPage from "@/components/pages/CLOPage";
import PracticalPage from "@/components/pages/PracticalPage";
import NotificationsPage from "@/components/pages/NotificationsPage";
import SettingsPage from "@/components/pages/SettingsPage";

const Index = () => {
  const [activeItem, setActiveItem] = useState("profile");

  const renderPage = () => {
    switch (activeItem) {
      case "profile":
        return <ProfilePage />;
      case "students":
        return <StudentsPage />;
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
