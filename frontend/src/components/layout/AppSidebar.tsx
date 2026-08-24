import * as Icons from 'lucide-react';
import { 
  ChevronLeft,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface SidebarProps {
  onItemClick: (item: string) => void;
  activeItem: string;
}

interface SidebarUser {
  username?: string;
  full_name_th?: string;
  first_name_th?: string;
  last_name_th?: string;
  first_name_en?: string;
  last_name_en?: string;
  name?: string;
  permissions?: string[];
  [key: string]: unknown;
}

interface MenuItem {
  title: string;
  url: string;
  icon: string;
  permission?: string;
}

interface MenuSection {
  sectionTitle?: string;
  items: MenuItem[];
}

const readStoredUser = (): SidebarUser => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const getDisplayName = (user: SidebarUser) => {
  const username = typeof user.username === 'string' ? user.username.trim() : '';
  const candidates = [
    user.full_name_th,
    [user.first_name_th, user.last_name_th].filter(Boolean).join(' '),
    [user.first_name_en, user.last_name_en].filter(Boolean).join(' '),
    user.name,
  ]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value && value !== username);

  return candidates[0] || username || "ไม่ระบุชื่อ";
};

export function AppSidebar ({ onItemClick, activeItem }: SidebarProps) {

  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarUser, setSidebarUser] = useState<SidebarUser>(() => readStoredUser());
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/index.php?page=get-notifications");
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      // กรองเฉพาะการแจ้งเตือนที่ได้รับและยังไม่ได้อ่าน
      const count = data.filter((n: { direction?: string; isRead?: boolean }) => n.direction === "received" && !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread notifications count");
    }
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        // เรียก API (ตรวจสอบ Path ให้ตรงกับที่วาง index.php ไว้)
        const res = await api.get(`/index.php?page=sidebar`);
        
        console.log("Menu Data:", res.data); // ลองเปิด console ดูว่าข้อมูลมาไหม
        setMenuSections(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch menus:", error);
        toast.error("โหลดเมนูไม่สำเร็จ");
      } finally {
        setIsLoading(false); // มั่นใจว่า Loading จะหายไปแน่นอน
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/index.php?page=profile");
        if (response.data?.status !== "success" || !response.data?.data) return;

        const currentUser = readStoredUser();
        const mergedUser = {
          ...currentUser,
          ...response.data.data,
          name: getDisplayName({ ...currentUser, ...response.data.data }),
        };

        localStorage.setItem('user', JSON.stringify(mergedUser));
        setSidebarUser(mergedUser);
      } catch (error) {
        setSidebarUser(readStoredUser());
      }
    };

    fetchMenus();
    fetchUserProfile();

    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 30000);

    window.addEventListener("updateNotificationBadge", fetchUnreadCount);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("updateNotificationBadge", fetchUnreadCount);
    };
  }, []);

  // ฟังก์ชันแปลง String เป็น Component
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    return IconComponent || Icons.HelpCircle; // ถ้าหาไม่เจอให้ใช้ HelpCircle แทน
  };

  const userName = getDisplayName(sidebarUser);

  // ดึงตัวอักษรตัวแรกจากชื่อ (เช่น 'สมชาย' จะได้ 'ส') 
  // หากไม่มีชื่อจะใช้ 'U' เป็นค่าเริ่มต้น
  const userInitial = userName.trim().charAt(0) || 'U';

  const userPermissions = Array.isArray(sidebarUser.permissions) ? sidebarUser.permissions : [];

  if (isLoading) return <div className="p-4">กำลังโหลดเมนู...</div>;

  // เพิ่มฟังก์ชัน Logout ตรงนี้
  const handleLogout = () => {
    // 1. ล้างข้อมูล User และ Permissions ออกจากเครื่อง
    localStorage.removeItem('user');
    sessionStorage.clear(); // ล้าง session (ถ้ามี)

    // 3. ส่งผู้ใช้กลับไปหน้า Login และรีโหลดเพื่อล้าง State ทั้งหมด
    window.location.href = "/"; 
  };

  const hasPermission = (name?: string) => {
    if (!name) return true; // ถ้าไม่ได้ระบุสิทธิ์ ให้แสดงปกติ
    return userPermissions.includes(name);
  };

  const bottomMenuItems = [
    { title: "การแจ้งเตือน", url: "notifications", icon: "Bell", permission: "NOTIFICATION_VIEW" },
    { title: "ข้อมูลส่วนตัว", url: "profile", icon: "User", permission: "PROFILE_VIEW_SELF" },
    { title: "การตั้งค่า", url: "settings", icon: "Settings", permission: "SYSTEM_SETTINGS" },
  ];

  return (
    <Sidebar 
      collapsible="icon" 
      // ใช้สไตล์แบบแปรผันเพื่อบังคับความกว้างตอนหุบให้เป็น 72px เป๊ะๆ
      style={{ 
        "--sidebar-width-icon": "72px", 
        "--sidebar-width": "260px" 
      } as React.CSSProperties}
      className={cn(
        'border-r border-sidebar-border bg-sidebar shadow-xl',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >

      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between relative group gap-3">
          
          {/* พื้นที่ Logo */}
          <div className="relative h-10 w-10 shrink-0">
            <div className="sidebar-brand-bg flex h-full w-full items-center justify-center rounded-full overflow-hidden shadow-sm">
              <img src="../../Nurse_logo.jpg" alt="Logo" className="object-cover w-full h-full" />
            </div>

            {/* ปุ่ม Trigger ตอน "หุบ" (จะแสดงทับ Logo เป๊ะๆ เมื่อ Hover) */}
            {collapsed && (
              <SidebarTrigger className="sidebar-logo-trigger">
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </SidebarTrigger>
            )}
          </div>

          {/* ชื่อระบบ และ ปุ่ม Trigger ตอน "ขยาย" */}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-foreground leading-relaxed">Nursing</h1>
                <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap uppercase tracking-tighter">Management System</p>
              </div>
              
              {/* ปุ่ม Trigger กลับไปอยู่ที่เดิม (ขวาบน) เมื่อเปิดแถบ */}
              <SidebarTrigger className="sidebar-toggle-button">
                <ChevronLeft className="h-4 w-4" />
              </SidebarTrigger>
            </>
          )}
        </div>
      </SidebarHeader>

      {/* Main Menu with Sections */}
      <SidebarContent>
        {menuSections.map((section, idx) => {
          // 1. กรองรายการเมนูที่ต้องการซ่อนออกก่อนเก็บไว้ในตัวแปร
          const filteredItems = section.items.filter(
            (item) => !['notifications', 'profile', 'settings'].includes(item.url)
          );

          // 2. ถ้ากลุ่มนี้ไม่มีเมนูเหลืออยู่เลย (ความยาวเป็น 0) ให้ส่งค่า null เพื่อไม่เรนเดอร์ทั้ง Section
          if (filteredItems.length === 0) return null;

          return (
            <div key={idx} className="px-4 py-2">
              {/* แสดงหัวข้อกลุ่มเฉพาะตอนที่ไม่หุบ และมีเมนูในกลุ่มนั้นจริงๆ */}
              {!collapsed && section.sectionTitle && (
                <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  {section.sectionTitle}
                </p>
              )}

              <SidebarMenu>
                {filteredItems.map((item) => {
                  const Icon = getIcon(item.icon);
                  const isActive = activeItem === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton 
                        tooltip={item.title}
                        onClick={() => onItemClick(item.url)}
                        className={cn(
                          "w-full transition-all duration-200 mb-1 group",
                          "sidebar-menu-action",
                          isActive && "active",
                          "select-none"
                        )}
                      >
                        <Icon className={cn(
                          "sidebar-main-icon", 
                          isActive && "active"
                        )} />
                        {!collapsed && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          );
        })}
      </SidebarContent>

      {/* --- Bottom Menu Section --- */}
      <div className="mt-auto border-t border-sidebar-border p-4">
        <SidebarMenu>
          {bottomMenuItems
            .filter(item => hasPermission(item.permission))
            .map((item) => {
              const Icon = getIcon(item.icon);
              const isActive = activeItem === item.url;
              const isNotification = item.url === "notifications";

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    onClick={() => onItemClick(item.url)}
                    className={cn(
                      "w-full transition-all duration-200 mb-1 group",
                      "sidebar-menu-action focus-visible:ring-2",
                      isActive && "active",
                      "select-none"
                    )}
                  >
                    <Icon className={cn(
                      "sidebar-bottom-icon", 
                      isActive && "active"
                    )} />
                    {!collapsed && <span>{item.title}</span>}

                    {/* 🎯 5. ส่วนแสดงตัวเลข Badge แจ้งเตือนสีแดง */}
                    {isNotification && unreadCount > 0 && (
                      collapsed ? (
                        // กรณีหุบ Sidebar: โชว์เป็นวงกลมเล็กๆ ซ้อนบนไอคอน
                        <span className="absolute top-1 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground ring-2 ring-sidebar">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      ) : (
                        // กรณีขยาย Sidebar: โชว์เป็น Badge ตัวเลขต่อท้ายข้อความ
                        <Badge variant="destructive" className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px]">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )
                    )}

                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
        </SidebarMenu>
      </div>

      {/* --- User Profile & Logout --- */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between relative group">
          <div className="relative h-10 w-10 shrink-0">
            {/* เรียกใช้ Class จาก index.css */}
            <Avatar className="sidebar-profile-avatar">
              <AvatarFallback className="sidebar-profile-fallback">
                {userInitial}
              </AvatarFallback>
            </Avatar>

            {/* ปุ่ม Logout (แสดงทับ Avatar เมื่อ Hover) */}
            <button 
              onClick={handleLogout}
              className={cn(
                "sidebar-logout-overlay", // เรียกใช้ Class จาก index.css
                !collapsed && "hidden" 
              )}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 ml-2">
                {/* เรียกใช้ Class จาก index.css */}
                <p className="sidebar-profile-name">{ userName }</p>
              </div>
              {/* เรียกใช้ Class จาก index.css */}
              <button 
                onClick={handleLogout}
                className="sidebar-logout-btn"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
