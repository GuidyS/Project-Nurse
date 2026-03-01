import { NavLink } from 'react-router-dom';
import { 
  Shield, 
  GraduationCap, 
  BookOpen, 
  Users, 
  FolderKanban, 
  TrendingUp, 
  MessageSquare, 
  CalendarDays, 
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface RoleCard {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const roles: RoleCard[] = [
  {
    title: 'ผู้ดูแลระบบ (Admin)',
    description: 'จัดการผู้ใช้, Role, Import/Export, Audit Log, รายงาน',
    path: '/admin/dashboard',
    icon: Shield,
    color: 'bg-red-500/10 text-red-600',
  },
  {
    title: 'นักศึกษา (Student)',
    description: 'Portfolio, Transcript',
    path: '/student/portfolio',
    icon: GraduationCap,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'คณบดี (Dean)',
    description: 'Dashboard KPI, อัตราคงอยู่, รายงานการเงิน',
    path: '/dean/dashboard',
    icon: LayoutDashboard,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: 'อาจารย์ประจำ (Instructor)',
    description: 'รายชื่อนักศึกษา, บันทึกเกรด, PLO/YLO, เอกสาร',
    path: '/instructor/students',
    icon: BookOpen,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'อาจารย์ประจำหลักสูตร',
    description: 'กำหนด CLO, รายวิชา, รายงานรายวิชา',
    path: '/course-instructor/courses',
    icon: FileText,
    color: 'bg-teal-500/10 text-teal-600',
  },
  {
    title: 'อาจารย์รับผิดชอบโครงการ',
    description: 'จัดการโครงการ, เอกสาร, เชื่อมโยง PLO/YLO/CLO',
    path: '/project-manager/projects',
    icon: FolderKanban,
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    title: 'อาจารย์รับผิดชอบหลักสูตร',
    description: 'รายงาน PLO/YLO/CLO, CLO Map, ผลสรุป 5 ปี',
    path: '/program-manager/reports',
    icon: TrendingUp,
    color: 'bg-indigo-500/10 text-indigo-600',
  },
  {
    title: 'อาจารย์ที่ปรึกษา (Advisor)',
    description: 'ดูแลนักศึกษา 1:12, Advice Notes, แจ้งเตือน',
    path: '/advisor/advisees',
    icon: MessageSquare,
    color: 'bg-pink-500/10 text-pink-600',
  },
  {
    title: 'อาจารย์ภาคปฏิบัติ',
    description: 'ดูแลนักศึกษา 1:8, ประเมิน Performance, Schedule',
    path: '/practical/students',
    icon: CalendarDays,
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    title: 'อาจารย์สมมติ (Dummy)',
    description: 'ข้อมูลสาธารณะเท่านั้น',
    path: '/dummy/public-info',
    icon: Users,
    color: 'bg-gray-500/10 text-gray-600',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="h-9 w-9" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Faculty Management System</h1>
          <p className="mt-2 text-muted-foreground">ระบบบริหารจัดการคณะ — เลือก Role เพื่อเข้าสู่ระบบ</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <NavLink key={role.path} to={role.path} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/40 group-hover:-translate-y-0.5">
                <CardHeader>
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${role.color}`}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{role.title}</CardTitle>
                  <CardDescription className="text-sm">{role.description}</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
