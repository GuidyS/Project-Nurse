import { 
  Users, 
  FolderKanban, 
  BookOpen, 
  FileText, 
  Bell, 
  LayoutDashboard,
  Upload,
  Download,
  Shield,
  ClipboardList,
  GraduationCap,
  ChevronLeft,
  TrendingUp,
  UserCheck,
  CalendarDays,
  MessageSquare,
  CheckSquare,
  Home,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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

interface SidebarProps {
  onItemClick: (item: string) => void;
}

interface MenuSection {
  sectionTitle?: string;
  items: MenuItem[];
}

interface RoleConfig {
  label: string;
  prefix: string;
  sections: MenuSection[];
}

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string; // เพิ่มฟิลด์นี้
}

const roleConfigs: RoleConfig[] = [
  {
    label: 'ผู้ดูแลระบบ',
    prefix: '/',
    sections: [
      {
        sectionTitle: 'จัดการระบบ',
        items: [
          { title: 'แดชบอร์ด', url: 'dashboard', icon: LayoutDashboard, permission: 'VIEW_ADMIN_DASHBOARD' },
          { title: 'จัดการผู้ใช้', url: 'users-management', icon: Users, permission: 'USERS_MANAGEMENT' },
          { title: 'จัดการ Role', url: 'roles-management', icon: Shield, permission: 'ROLES_MANAGEMENT' },
        ],
      },
      {
        sectionTitle: 'ข้อมูล',
        items: [
          { title: 'นำเข้าข้อมูล', url: 'import-data', icon: Upload, permission: 'IMPORT_DATA' },
          { title: 'ส่งออกข้อมูล', url: 'export-data', icon: Download, permission: 'EXPORT_DATA' },
          { title: 'Audit Log', url: 'audit-log', icon: ClipboardList, permission: 'AUDIT_LOG' },
          { title: 'รายงาน', url: 'reports', icon: FileText, permission: 'ADMIN_REPORTS' },
          { title: 'อนุมัติคำขอ', url: 'approvals', icon: CheckSquare, permission: 'ADMIN_APPROVALS' },
        ],
      },
    ],
  },
  // {
  //   label: 'นักศึกษา',
  //   prefix: '/student',
  //   sections: [
  //     {
  //       items: [
  //         { title: 'Portfolio', url: '/student/portfolio', icon: FolderKanban },
  //         { title: 'Transcript', url: '/student/transcript', icon: FileText },
  //       ],
  //     },
  //   ],
  // },
  {
    label: 'คณบดี',
    prefix: '/',
    sections: [
      {
        items: [
          { title: 'แดชบอร์ด KPI', url: 'dean-dashboard', icon: LayoutDashboard, permission: 'VIEW_DEAN_DASHBOARD' },
          { title: 'อัตราคงอยู่', url: 'retention', icon: UserCheck, permission: '' },
        ],
      },
    ],
  },
  // {
  //   label: 'อาจารย์ประจำ',
  //   prefix: '/instructor',
  //   sections: [
  //     {
  //       sectionTitle: 'อาจารย์ประจำ',
  //       items: [
  //         { title: 'รายชื่อนักศึกษา', url: '/instructor/students', icon: Users },
  //         { title: 'บันทึกเกรด', url: '/instructor/grades', icon: FileText },
  //       ],
  //     },
  //     {
  //       sectionTitle: 'รายงาน',
  //       items: [
  //         { title: 'รายงาน PLO/YLO', url: '/instructor/plo-ylo', icon: TrendingUp },
  //         { title: 'อัปโหลดเอกสาร', url: '/instructor/documents', icon: Upload },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   label: 'อาจารย์ประจำหลักสูตร',
  //   prefix: '/course-instructor',
  //   sections: [
  //     {
  //       sectionTitle: 'หลักสูตร',
  //       items: [
  //         { title: 'รายวิชาที่รับผิดชอบ', url: '/course-instructor/courses', icon: BookOpen },
  //         { title: 'กำหนด CLO', url: '/course-instructor/clo', icon: FileText },
  //         { title: 'รายชื่อนักศึกษา', url: '/course-instructor/students', icon: Users },
  //         { title: 'รายงานรายวิชา', url: '/course-instructor/reports', icon: FileText },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   label: 'อาจารย์รับผิดชอบโครงการ',
  //   prefix: '/project-manager',
  //   sections: [
  //     {
  //       sectionTitle: 'โครงการ',
  //       items: [
  //         { title: 'โครงการของฉัน', url: '/project-manager/projects', icon: FolderKanban },
  //         { title: 'สร้างเอกสาร', url: '/project-manager/docs', icon: FileText },
  //         { title: 'เชื่อมโยง PLO/YLO/CLO', url: '/project-manager/links', icon: TrendingUp },
  //         { title: 'รายงานสรุปโครงการ', url: '/project-manager/reports', icon: FileText },
  //       ],
  //     },
  //   ],
  // },
  {
    label: 'อาจารย์รับผิดชอบหลักสูตร',
    prefix: '/',
    sections: [
      {
        sectionTitle: 'หลักสูตร',
        items: [
          { title: 'รายงาน PLO/YLO/CLO', url: 'plo-ylo-report', icon: TrendingUp, permission: 'CURRICULUM_REPORT_VIEW' },
          { title: 'CLO Map', url: 'clo-management', icon: FileText, permission: 'CLO_DEFINE' },
          { title: 'ผลสรุป 5 ปี', url: 'five-year-summary', icon: FileText, permission: 'COURSE_EXPORT_5YEAR' },
          { title: 'รายงานรายวิชา', url: 'course-report', icon: Users, permission: 'COURSE_REPORT_CREATE' },
          { title: 'อัปโหลดงานวิจัย', url: 'documents', icon: Users, permission: 'RESEARCH_UPLOAD' },
        ],
      },
    ],
  },
  {
    label: 'อาจารย์ที่ปรึกษา',
    prefix: '/',
    sections: [
      {
        sectionTitle: 'ที่ปรึกษา',
        items: [
          { title: 'นักศึกษาในที่ปรึกษา', url: 'advises', icon: Users, permission: '' },
          { title: 'Advice Notes', url: 'advisor-notes', icon: MessageSquare, permission: '' },
          { title: 'การแจ้งเตือน', url: 'advisor-notifications', icon: Bell, permission: '' },
          { title: 'ร้องขอรับมอบ', url: 'advisor-transfers', icon: UserCheck, permission: '' },
        ],
      },
    ],
  },
  {
    label: 'อาจารย์ภาคปฏิบัติ',
    prefix: '/practical',
    sections: [
      {
        sectionTitle: 'การปฏิบัติ',
        items: [
          { title: 'นักศึกษาฝึกปฏิบัติ', url: '/practical/students', icon: GraduationCap },
          { title: 'ประเมิน Performance', url: '/practical/performance', icon: TrendingUp },
          { title: 'Schedule Task', url: '/practical/schedule', icon: CalendarDays },
          { title: 'หลักฐานการปฏิบัติ', url: '/practical/evidence', icon: CheckSquare },
        ],
      },
    ],
  },
  {
    label: 'อาจารย์สมมติ',
    prefix: '/dummy',
    sections: [
      {
        items: [
          { title: 'ข้อมูลสาธารณะ', url: '/dummy/public-info', icon: FileText },
        ],
      },
    ],
  },
];

export function AppSidebar ({ onItemClick }: SidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || "ไม่ระบุชื่อ";
  const userPermissions = user.permissions || [];
  const roleId = Number(user.role_id);
  const positionId = Number(user.position_id);

  // ค้นหาชุดเมนู (Config) ให้ตรงกับผู้ใช้
  const currentRoleConfig = roleConfigs.find(config => {
    if (roleId === 1) return config.label === 'ผู้ดูแลระบบ';
    if (roleId === 2) {
      // ถ้าเป็นคณบดี (Position 1) ให้ใช้ชุดเมนูคณบดี
      if (positionId === 1) return config.label === 'คณบดี';
      return config.label === 'อาจารย์รับผิดชอบหลักสูตร';
    }
    return false;
  }) || roleConfigs[0]; // Default เป็นตัวแรกถ้าหาไม่เจอ

  const currentRole = roleConfigs.find((r) =>
    location.pathname.startsWith(r.prefix)
  );

  const sections = currentRole?.sections ?? [];
  const roleLabel = currentRole?.label ?? '';

  // เพิ่มฟังก์ชัน Logout ตรงนี้
  const handleLogout = () => {
    // 1. ล้างข้อมูล User และ Permissions ออกจากเครื่อง
    localStorage.removeItem('user');
    sessionStorage.clear(); // ล้าง session (ถ้ามี)
    
    // 2. แสดงข้อความแจ้งเตือน (Optional)
    toast.success("ออกจากระบบเรียบร้อยแล้ว");

    // 3. ส่งผู้ใช้กลับไปหน้า Login และรีโหลดเพื่อล้าง State ทั้งหมด
    window.location.href = "/"; 
  };

  const hasPermission = (name?: string) => {
    if (!name) return true; // ถ้าไม่ได้ระบุสิทธิ์ ให้แสดงปกติ
    return userPermissions.includes(name);
  };

  return (
    <Sidebar className={cn(
      'border-r border-sidebar-border bg-sidebar sidebar-transition',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-sm font-semibold text-foreground">Faculty</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      {/* Main Menu with Sections */}
      <SidebarContent>
        {currentRoleConfig.sections.map((section, idx) => (
          <div key={idx} className="px-2 py-2">
            {/* กรองเฉพาะ Section ที่มีอย่างน้อย 1 เมนูที่ผู้ใช้มีสิทธิ์เห็น */}
            {section.items.some(item => hasPermission(item.permission)) && (
              <>
                {!collapsed && section.sectionTitle && (
                  <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    {section.sectionTitle}
                  </p>
                )}
                <SidebarMenu>
                  {section.items.map((item) => (
                    // เช็คสิทธิ์รายเมนู
                    hasPermission(item.permission) && (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          tooltip={item.title}
                          onClick={() => onItemClick(item.url)}
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  ))}
                </SidebarMenu>
              </>
            )}
          </div>
        ))}
      </SidebarContent>

      {/* Bottom Menu */}
      <div className="border-t border-sidebar-border px-2 py-2">
        <SidebarMenu>

          {hasPermission('NOTIFICATION_VIEW') && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="การแจ้งเตือน" onClick={() => onItemClick('notifications')}>
                <Bell className="h-4 w-4" />
                <span>การแจ้งเตือน</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {hasPermission('PROFILE_VIEW') && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="ข้อมูลส่วนตัว" onClick={() => onItemClick('profile')}>
                <Users className="h-4 w-4" />
                <span>ข้อมูลส่วนตัว</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {hasPermission('SETTINGS') && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="การตั้งค่า" onClick={() => onItemClick('settings')}>
                <Settings className="h-4 w-4" />
                <span>การตั้งค่า</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
        </SidebarMenu>
      </div>

      {/* User Profile + Change Role */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-warning text-warning-foreground text-sm font-semibold">
              F
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{ userName }</p>
              <p className="text-xs text-muted-foreground truncate">{roleLabel || 'ไม่ระบุ'}</p>
            </div>
          )}

          {/* ปรับปรุงปุ่ม LogOut ตรงนี้ */}
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4" />
          </button>
          
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}