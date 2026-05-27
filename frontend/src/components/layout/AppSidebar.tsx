import * as Icons from 'lucide-react';
import {
  ChevronLeft,
  LogOut,
} from 'lucide-react';
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

// const roleConfigs: RoleConfig[] = [
//   {
//     label: 'ผู้ดูแลระบบ',
//     prefix: '/',
//     sections: [
//       {
//         sectionTitle: 'จัดการระบบ',
//         items: [
//           { title: 'แดชบอร์ด', url: 'dashboard', icon: LayoutDashboard, permission: 'VIEW_ADMIN_DASHBOARD' },
//           { title: 'จัดการผู้ใช้', url: 'users-management', icon: Users, permission: 'USERS_MANAGEMENT' },
//           { title: 'จัดการ Role', url: 'roles-management', icon: Shield, permission: 'ROLES_MANAGEMENT' },
//         ],
//       },
//       {
//         sectionTitle: 'ข้อมูล',
//         items: [
//           { title: 'นำเข้าข้อมูล', url: 'import-data', icon: Upload, permission: 'IMPORT_DATA' },
//           { title: 'ส่งออกข้อมูล', url: 'export-data', icon: Download, permission: 'EXPORT_DATA' },
//           { title: 'Audit Log', url: 'audit-log', icon: ClipboardList, permission: 'AUDIT_LOG' },
//           { title: 'รายงาน', url: 'reports', icon: FileText, permission: 'ADMIN_REPORTS' },
//           { title: 'อนุมัติคำขอ', url: 'approvals', icon: CheckSquare, permission: 'ADMIN_APPROVALS' },
//         ],
//       },
//     ],
//   },
//   // {
//   //   label: 'นักศึกษา',
//   //   prefix: '/student',
//   //   sections: [
//   //     {
//   //       items: [
//   //         { title: 'Portfolio', url: '/student/portfolio', icon: FolderKanban },
//   //         { title: 'Transcript', url: '/student/transcript', icon: FileText },
//   //       ],
//   //     },
//   //   ],
//   // },
//   {
//     label: 'คณบดี',
//     prefix: '/',
//     sections: [
//       {
//         items: [
//           { title: 'แดชบอร์ด KPI', url: 'dean-dashboard', icon: LayoutDashboard, permission: 'VIEW_DEAN_DASHBOARD' },
//           { title: 'อัตราคงอยู่', url: 'retention', icon: UserCheck, permission: 'VIEW_RETENTION' },
//         ],
//       },
//     ],
//   },
//   // {
//   //   label: 'อาจารย์ประจำ',
//   //   prefix: '/instructor',
//   //   sections: [
//   //     {
//   //       sectionTitle: 'อาจารย์ประจำ',
//   //       items: [
//   //         { title: 'รายชื่อนักศึกษา', url: '/instructor/students', icon: Users },
//   //         { title: 'บันทึกเกรด', url: '/instructor/grades', icon: FileText },
//   //       ],
//   //     },
//   //     {
//   //       sectionTitle: 'รายงาน',
//   //       items: [
//   //         { title: 'รายงาน PLO/YLO', url: '/instructor/plo-ylo', icon: TrendingUp },
//   //         { title: 'อัปโหลดเอกสาร', url: '/instructor/documents', icon: Upload },
//   //       ],
//   //     },
//   //   ],
//   // },
//   // {
//   //   label: 'อาจารย์ประจำหลักสูตร',
//   //   prefix: '/course-instructor',
//   //   sections: [
//   //     {
//   //       sectionTitle: 'หลักสูตร',
//   //       items: [
//   //         { title: 'รายวิชาที่รับผิดชอบ', url: '/course-instructor/courses', icon: BookOpen },
//   //         { title: 'กำหนด CLO', url: '/course-instructor/clo', icon: FileText },
//   //         { title: 'รายชื่อนักศึกษา', url: '/course-instructor/students', icon: Users },
//   //         { title: 'รายงานรายวิชา', url: '/course-instructor/reports', icon: FileText },
//   //       ],
//   //     },
//   //   ],
//   // },
//   // {
//   //   label: 'อาจารย์รับผิดชอบโครงการ',
//   //   prefix: '/project-manager',
//   //   sections: [
//   //     {
//   //       sectionTitle: 'โครงการ',
//   //       items: [
//   //         { title: 'โครงการของฉัน', url: '/project-manager/projects', icon: FolderKanban },
//   //         { title: 'สร้างเอกสาร', url: '/project-manager/docs', icon: FileText },
//   //         { title: 'เชื่อมโยง PLO/YLO/CLO', url: '/project-manager/links', icon: TrendingUp },
//   //         { title: 'รายงานสรุปโครงการ', url: '/project-manager/reports', icon: FileText },
//   //       ],
//   //     },
//   //   ],
//   // },
//   {
//     label: 'อาจารย์รับผิดชอบหลักสูตร',
//     prefix: '/',
//     sections: [
//       {
//         sectionTitle: 'หลักสูตร',
//         items: [
//           { title: 'รายงาน PLO/YLO/CLO', url: 'plo-ylo-report', icon: TrendingUp, permission: 'CURRICULUM_REPORT_VIEW' },
//           { title: 'CLO Map', url: 'clo-management', icon: FileText, permission: 'CLO_DEFINE' },
//           { title: 'ผลสรุป 5 ปี', url: 'five-year-summary', icon: FileText, permission: 'COURSE_EXPORT_5YEAR' },
//           { title: 'รายงานรายวิชา', url: 'course-report', icon: Users, permission: 'COURSE_REPORT_CREATE' },
//           { title: 'อัปโหลดงานวิจัย', url: 'documents', icon: Users, permission: 'RESEARCH_UPLOAD' },
//         ],
//       },
//     ],
//   },
//   {
//     label: 'อาจารย์ที่ปรึกษา',
//     prefix: '/',
//     sections: [
//       {
//         sectionTitle: 'ที่ปรึกษา',
//         items: [
//           { title: 'นักศึกษาในที่ปรึกษา', url: 'advises', icon: Users, permission: '' },
//           { title: 'Advice Notes', url: 'advisor-notes', icon: MessageSquare, permission: '' },
//           { title: 'การแจ้งเตือน', url: 'advisor-notifications', icon: Bell, permission: '' },
//           { title: 'ร้องขอรับมอบ', url: 'advisor-transfers', icon: UserCheck, permission: '' },
//         ],
//       },
//     ],
//   },
//   {
//     label: 'อาจารย์ภาคปฏิบัติ',
//     prefix: '/practical',
//     sections: [
//       {
//         sectionTitle: 'การปฏิบัติ',
//         items: [
//           { title: 'นักศึกษาฝึกปฏิบัติ', url: '/practical/students', icon: GraduationCap },
//           { title: 'ประเมิน Performance', url: '/practical/performance', icon: TrendingUp },
//           { title: 'Schedule Task', url: '/practical/schedule', icon: CalendarDays },
//           { title: 'หลักฐานการปฏิบัติ', url: '/practical/evidence', icon: CheckSquare },
//         ],
//       },
//     ],
//   },

export function AppSidebar({ onItemClick, activeItem }: SidebarProps) {

  const [menuSections, setMenuSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // เรียก API (ตรวจสอบ Path ให้ตรงกับที่วาง index.php ไว้)
        const res = await api.get(`/index.php?page=sidebar`);

        console.log("Menu Data:", res.data); // ลองเปิด console ดูว่าข้อมูลมาไหม
        setMenuSections(res.data);
      } catch (error) {
        console.error("Failed to fetch menus:", error);
        toast.error("โหลดเมนูไม่สำเร็จ");
      } finally {
        setIsLoading(false); // มั่นใจว่า Loading จะหายไปแน่นอน
      }
    };

    fetchMenus();
  }, []);

  if (isLoading) return <div className="p-4">กำลังโหลดเมนู...</div>;

  // ฟังก์ชันแปลง String เป็น Component
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.HelpCircle; // ถ้าหาไม่เจอให้ใช้ HelpCircle แทน
  };

  const menuTitleByUrl: Record<string, string> = {
    transcript: "ผลการเรียน",
    portfolio: "Portfolio",
    notifications: "การแจ้งเตือน",
    profile: "ข้อมูลส่วนตัว",
    settings: "การตั้งค่า",
  };

  const sectionTitleByUrl: Record<string, string> = {
    transcript: "นักศึกษา",
    portfolio: "นักศึกษา",
  };

  const getMenuTitle = (item: any) => menuTitleByUrl[item.url] || item.title;

  const getSectionTitle = (section: any, items: any[]) => {
    const matchedItem = items.find((item) => sectionTitleByUrl[item.url]);
    return matchedItem ? sectionTitleByUrl[matchedItem.url] : section.sectionTitle;
  };

  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || "ไม่ระบุชื่อ";

  // ดึงตัวอักษรตัวแรกจากชื่อ (เช่น 'สมชาย' จะได้ 'ส') 
  // หากไม่มีชื่อจะใช้ 'U' เป็นค่าเริ่มต้น
  const userInitial = userName.trim().charAt(0) || 'U';

  const userPermissions = user.permissions || [];

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
        'border-r border-sidebar-border bg-sidebar transition-all duration-300 shadow-xl',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >

      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between relative group gap-3">

          {/* พื้นที่ Logo */}
          <div className="relative h-10 w-10 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#8a2be2] overflow-hidden shadow-sm">
              <img src="../../Nurse_logo.jpg" alt="Logo" className="object-cover w-full h-full" />
            </div>

            {/* ปุ่ม Trigger ตอน "หุบ" (จะแสดงทับ Logo เป๊ะๆ เมื่อ Hover) */}
            {collapsed && (
              <SidebarTrigger className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#8a2be2]/80 text-white rounded-lg flex items-center justify-center border-none hover:bg-[#8a2be2]">
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </SidebarTrigger>
            )}
          </div>

          {/* ชื่อระบบ และ ปุ่ม Trigger ตอน "ขยาย" */}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-slate-700 leading-relaxed">Nursing</h1>
                <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap uppercase tracking-tighter">Management System</p>
              </div>

              {/* ปุ่ม Trigger กลับไปอยู่ที่เดิม (ขวาบน) เมื่อเปิดแถบ */}
              <SidebarTrigger className="text-slate-500 hover:bg-[#8a2be2]/10 hover:text-[#8a2be2]">
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
            (item: any) => !['notifications', 'profile', 'settings'].includes(item.url)
          );

          // 2. ถ้ากลุ่มนี้ไม่มีเมนูเหลืออยู่เลย (ความยาวเป็น 0) ให้ส่งค่า null เพื่อไม่เรนเดอร์ทั้ง Section
          if (filteredItems.length === 0) return null;
          const sectionTitle = getSectionTitle(section, filteredItems);

          return (
            <div key={idx} className="px-4 py-2">
              {/* แสดงหัวข้อกลุ่มเฉพาะตอนที่ไม่หุบ และมีเมนูในกลุ่มนั้นจริงๆ */}
              {!collapsed && sectionTitle && (
                <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  {sectionTitle}
                </p>
              )}

              <SidebarMenu>
                {filteredItems.map((item: any) => {
                  const Icon = getIcon(item.icon);
                  const title = getMenuTitle(item);
                  const isActive = activeItem === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        tooltip={title}
                        onClick={() => onItemClick(item.url)}
                        className={cn(
                          "w-full transition-all duration-200 mb-1 group",
                          isActive
                            ? "bg-[#8a2be2]/25 text-white"
                            : "hover:bg-[#8a2be2]/10 hover:text-[#8a2be2]",
                          "active:bg-[#8a2be2]/25 active:text-white",
                          "focus:bg-[#8a2be2]/25 focus:text-white",
                          "select-none"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-slate-600 hover:text-[#8a2be2]"
                        )} />
                        {!collapsed && <span>{title}</span>}
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
            .filter(item => hasPermission(item.permission)) // เช็คสิทธิ์ก่อนแสดงผลเหมือนเมนูหลัก
            .map((item) => {
              const Icon = getIcon(item.icon); // ใช้ฟังก์ชันแปลงไอคอนเดียวกัน
              const title = getMenuTitle(item);
              const isActive = activeItem === item.url; // เช็คสถานะ Active เดียวกัน

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    tooltip={title}
                    onClick={() => onItemClick(item.url)}
                    // ใช้ ClassName และ Logic สีชุดเดียวกับ Main Menu
                    className={cn(
                      "w-full transition-all duration-200 mb-1 group",
                      isActive
                        ? "bg-[#8a2be2]/25 text-white"
                        : "text-slate-600 hover:bg-[#8a2be2]/5 hover:text-[#8a2be2]",
                      "active:bg-[#8a2be2]/25 active:text-white",
                      "focus:bg-[#8a2be2]/25 focus:text-white",
                      "focus-visible:ring-2 focus-visible:ring-[#8a2be2]/50",
                      "select-none"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-600 hover:text-[#8a2be2]"
                      )} />
                    {!collapsed && <span>{title}</span>}
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
            <Avatar className="h-full w-full border border-[#8a2be2]/20">
              <AvatarFallback
                style={{ backgroundColor: '#ad71e6' }}
                className="text-white text-sm font-semibold"
              >
                {userInitial}
              </AvatarFallback>
            </Avatar>

            {/* ปุ่ม Logout (แสดงทับ Avatar เมื่อ Hover) */}
            <button
              onClick={handleLogout}
              className={cn(
                "absolute inset-0 h-full w-full flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600/80 text-white",
                !collapsed && "hidden"
              )}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 ml-2">
                <p className="text-sm font-bold text-slate-700 truncate">{userName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-slate-500 hover:text-red-600 hover:bg-[#dd1d1d]/10 rounded-lg transition-colors"
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
