import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FolderKanban,
  BookOpen,
  ClipboardList,
  User,
  ChevronLeft,
  LogOut,
  GraduationCap,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

interface UserData {
  id: string | number;
  title: string;
  first_name: string;
  last_name: string;
}

const menuSections = [
  {
    title: "อาจารย์ประจำ",
    items: [
      { id: "students", label: "รายชื่อนักศึกษา", icon: Users },
      { id: "courses", label: "รายวิชาที่สอน", icon: BookOpen },
    ],
  },
  {
    title: "โครงการ",
    items: [
      { id: "projects", label: "จัดการโครงการ", icon: FolderKanban },
    ],
  },
  {
    title: "หลักสูตร",
    items: [
      { id: "courses", label: "รายวิชาที่สอน", icon: BookOpen },
      { id: "clo", label: "กำหนด CLO", icon: ClipboardList },
    ],
  },
  {
    title: "การปฏิบัติ",
    items: [
      { id: "practical", label: "นักศึกษาฝึกปฏิบัติ", icon: GraduationCap },
    ],
  },
];

const bottomMenuItems = [
  { id: "notifications", label: "การแจ้งเตือน", icon: Bell },
  { id: "profile", label: "ข้อมูลส่วนตัว", icon: User },
  { id: "settings", label: "ตั้งค่า", icon: Settings },
];

/**
 * AppSidebar Component - Sidebar navigation สำหรับแอปพลิเคชัน
 * 
 * หน้าที่:
 * - แสดงเมนู navigation หลักของแอป
 * - แสดงข้อมูลผู้ใช้ (ชื่อ, avatar)
 * - รองรับการ collapse/expand sidebar
 * - จัดการ active state ของ menu items
 * 
 * Props:
 * - activeItem: ชื่อของ menu item ที่กำลัง active
 * - onItemClick: Callback function เมื่อคลิก menu item
 * 
 * Features:
 * - Collapsible sidebar (สามารถย่อ/ขยายได้)
 * - ดึงข้อมูลผู้ใช้จาก API
 * - Responsive design
 */
const AppSidebar = ({ activeItem, onItemClick }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  // ฟังก์ชันสำหรับ logout และนำทางไปหน้า Login
  const handleLogout = () => {
    // ถ้ามีการลบ token หรือ clear state เพิ่มที่นี่
    navigate("/login");
  };

  /**
   * useEffect Hook - ดึงข้อมูลผู้ใช้จาก API
   * 
   * ทำงานครั้งเดียวเมื่อ component mount
   * 
   * Flow:
   * 1. เรียก API GET /api.php?page=profile&id=6604800015
   * 2. ถ้าสำเร็จ → เก็บข้อมูลใน state (setUser)
   * 3. ถ้า error → log error ใน console
   */
  useEffect(() => {
    const userId = 6604800015;
    api
      .get("/api.php", { params: { page: "profile", id: userId } })
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  /**
   * displayName - สร้างชื่อเต็มจากข้อมูลผู้ใช้
   * Format: "title + first_name + last_name"
   */
  const displayName =
    user ? `${user.title ?? ""}${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "";
  
  /**
   * role - บทบาทของผู้ใช้ (ตอนนี้ยังว่างเปล่า)
   */
  const role = user ? "" : "";
  
  /**
   * initials - ตัวอักษรแรกของชื่อ (ใช้แสดงใน Avatar)
   */
  const initials = user && user.first_name ? user.first_name.charAt(0) : "";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "hidden")}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm">Faculty</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 mx-auto"
            onClick={() => setCollapsed(false)}
          >
            <GraduationCap className="h-5 w-5 text-primary" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 text-muted-foreground", collapsed && "hidden")}
          onClick={() => setCollapsed(true)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeItem === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="p-3 space-y-1 border-t border-sidebar-border">
        {bottomMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeItem === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer transition-colors",
            collapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
