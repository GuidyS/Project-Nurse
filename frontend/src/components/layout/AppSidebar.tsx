import * as Icons from 'lucide-react';
import { 
  ChevronLeft,
  LogOut,
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

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const getDisplayName = (user: any) => {
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

  const [menuSections, setMenuSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarUser, setSidebarUser] = useState<any>(() => readStoredUser());
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/index.php?page=get-notifications");
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      const count = data.filter((n: any) => n.direction === "received" && !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread notifications count");
    }
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.get(`/index.php?page=sidebar`);
        let data = res.data;

        const currentUser = readStoredUser();
        const roleId = Number(currentUser.role_id);

        if (Array.isArray(data)) {
          // 1. เมนูสำหรับนักศึกษา (role_id = 3)
          if (roleId === 3 && data.length > 0) {
            const hasVac = data.some((s: any) => s.items?.some((i: any) => i.url === "student-vaccinations"));
            const hasHealth = data.some((s: any) => s.items?.some((i: any) => i.url === "student-health-records"));
            const hasCompetency = data.some((s: any) => s.items?.some((i: any) => i.url === "student-competency-view"));

            const newItems = [...(data[0].items || [])];
            if (!hasVac) {
              newItems.push({
                title: "ประวัติการได้รับวัคซีน",
                url: "student-vaccinations",
                icon: "ShieldAlert",
              });
            }
            if (!hasHealth) {
              newItems.push({
                title: "ข้อมูลภาวะสุขภาพ",
                url: "student-health-records",
                icon: "Activity",
              });
            }
            if (!hasCompetency) {
              newItems.push({
                title: "ผลการประเมินสมรรถนะหลัก",
                url: "student-competency-view",
                icon: "ClipboardCheck",
              });
            }
            data[0] = { ...data[0], items: newItems };
          }

          // 2. เมนูสำหรับอาจารย์ที่ปรึกษา / Admin (role_id = 1 หรือ 2)
          if (roleId === 1 || roleId === 2) {
            data = data.map((section: any) => {
              if (section.sectionTitle === "งานที่ปรึกษา") {
                const hasVac = section.items?.some((item: any) => item.url === "advisor-vaccination-view");
                const hasHealth = section.items?.some((item: any) => item.url === "advisor-health-records-view");
                const hasCompetency = section.items?.some((item: any) => item.url === "advisor-competency-view");
                const newItems = [...(section.items || [])];

                if (!hasVac) {
                  newItems.push({
                    title: "ข้อมูลวัคซีนนักศึกษา",
                    url: "advisor-vaccination-view",
                    icon: "ShieldAlert",
                  });
                }
                if (!hasHealth) {
                  newItems.push({
                    title: "ข้อมูลสุขภาพนักศึกษา",
                    url: "advisor-health-records-view",
                    icon: "Activity",
                  });
                }
                if (!hasCompetency) {
                  newItems.push({
                    title: "ประเมินสมรรถนะหลัก",
                    url: "advisor-competency-view",
                    icon: "ClipboardCheck",
                  });
                }
                return { ...section, items: newItems };
              }
              return section;
            });
          }

          // 3. เมนูจัดการของ Admin (role_id = 1)
          if (roleId === 1) {
            data = data.map((section: any) => {
              if (
                section.sectionTitle === "จัดการระบบ" || 
                section.sectionTitle === "การจัดการระบบ" || 
                section.sectionTitle === "ผู้ดูแลระบบ"
              ) {
                const hasCompMgmt = section.items?.some((item: any) => item.url === "competency-items-management");
                if (!hasCompMgmt) {
                  const newItems = [...(section.items || [])];
                  newItems.push({
                    title: "จัดการรายการประเมินสมรรถนะ",
                    url: "competency-items-management",
                    icon: "ListChecks",
                  });
                  return { ...section, items: newItems };
                }
              }
              return section;
            });
          }
        }

        setMenuSections(data);
      } catch (error) {
        console.error("Failed to fetch menus:", error);
        toast.error("โหลดเมนูไม่สำเร็จ");
      } finally {
        setIsLoading(false);
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

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.HelpCircle;
  };

  const userName = getDisplayName(sidebarUser);
  const userInitial = userName.trim().charAt(0) || 'U';
  const userPermissions = sidebarUser.permissions || [];

  if (isLoading) return <div className="p-4">กำลังโหลดเมนู...</div>;

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.href = "/"; 
  };

  const hasPermission = (name?: string) => {
    if (!name) return true;
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
          
          <div className="relative h-10 w-10 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#8a2be2] overflow-hidden shadow-sm">
              <img src="../../Nurse_logo.jpg" alt="Logo" className="object-cover w-full h-full" />
            </div>

            {collapsed && (
              <SidebarTrigger className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#8a2be2]/80 text-white rounded-lg flex items-center justify-center border-none hover:bg-[#8a2be2]">
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </SidebarTrigger>
            )}
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-foreground leading-relaxed">Nursing</h1>
                <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap uppercase tracking-tighter">Management System</p>
              </div>
              
              <SidebarTrigger className="text-sidebar-foreground/70 hover:bg-[#8a2be2]/10 hover:text-[#8a2be2]">
                <ChevronLeft className="h-4 w-4" />
              </SidebarTrigger>
            </>
          )}
        </div>
      </SidebarHeader>

      {/* Main Menu */}
      <SidebarContent>
        {menuSections.map((section, idx) => {
          const filteredItems = (section.items || []).filter(
            (item: any) => !['notifications', 'profile', 'settings'].includes(item.url)
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={idx} className="px-4 py-2">
              {!collapsed && section.sectionTitle && (
                <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  {section.sectionTitle}
                </p>
              )}

              <SidebarMenu>
                {filteredItems.map((item: any) => {
                  const Icon = getIcon(item.icon);
                  const isActive = activeItem === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton 
                        tooltip={item.title}
                        onClick={() => onItemClick(item.url)}
                        className={cn(
                          "w-full transition-all duration-200 mb-1 group",
                          isActive 
                            ? "bg-[#8a2be2]/10 text-[#8a2be2]" 
                            : "hover:bg-[#8a2be2]/10 hover:text-[#8a2be2]",
                          "active:bg-[#8a2be2]/10 active:text-[#8a2be2]",
                          "focus:bg-[#8a2be2]/10 focus:text-[#8a2be2]",
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

      {/* Bottom Menu */}
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
                      isActive 
                        ? "bg-[#8a2be2]/10 text-[#8a2be2]" 
                        : "hover:bg-[#8a2be2]/10 hover:text-[#8a2be2]", 
                      "active:bg-[#8a2be2]/10 active:text-[#8a2be2]",
                      "focus:bg-[#8a2be2]/10 focus:text-[#8a2be2]",
                      "focus-visible:ring-2 focus-visible:ring-[#8a2be2]/50",
                      "select-none"
                    )}
                  >
                    <Icon className={cn(
                      "sidebar-bottom-icon", 
                      isActive && "active"
                    )} />
                    {!collapsed && <span>{item.title}</span>}

                    {isNotification && unreadCount > 0 && (
                      collapsed ? (
                        <span className="absolute top-1 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground ring-2 ring-sidebar">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      ) : (
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

      {/* Footer Profile */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between relative group">
          <div className="relative h-10 w-10 shrink-0">
            <Avatar className="sidebar-profile-avatar">
              <AvatarFallback className="sidebar-profile-fallback">
                {userInitial}
              </AvatarFallback>
            </Avatar>

            <button 
              onClick={handleLogout}
              className={cn(
                "sidebar-logout-overlay", 
                !collapsed && "hidden" 
              )}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 ml-2">
                <p className="sidebar-profile-name">{ userName }</p>
              </div>
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