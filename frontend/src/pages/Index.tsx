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

/**
 * Index Component - หน้าแรกของแอปพลิเคชัน
 * 
 * หน้าที่:
 * - จัดการ navigation และแสดงหน้า pages ต่างๆ ตาม activeItem
 * - แสดง AppSidebar สำหรับ navigation
 * - Render page content ตามที่เลือก
 * 
 * State:
 * - activeItem: เก็บชื่อของหน้า page ที่กำลังแสดงอยู่ (default: "profile")
 */
const Index = () => {
  const [activeItem, setActiveItem] = useState("profile");

  /**
   * renderPage - Function สำหรับ render page component ตาม activeItem
   * 
   * หน้าที่:
   * - ตรวจสอบ activeItem และ return component ที่ตรงกัน
   * - ถ้าไม่เจอ route → แสดง ProfilePage เป็น default
   * 
   * @returns {JSX.Element} - Page component ที่ต้องการแสดง
   */
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

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar activeItem={activeItem} onItemClick={setActiveItem} />

      {/* Main Content */}
      <main className="ml-[260px] p-6 min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
};

export default Index;
