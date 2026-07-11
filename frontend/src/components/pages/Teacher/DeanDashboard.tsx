import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudentKPIChart, TeacherKPIChart, RetentionChart, ExitReasonsChart } from "@/components/dashboard/KPIChart";
import { FinancialReport, ExecutiveSummary } from "@/components/dashboard/FinancialReport";
import ExportButton from "@/components/dashboard/ExportButton";
import { Users, GraduationCap, UserCheck, TrendingUp, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/axios";

// ต้องตรงกับ JSON ที่ get_dean_dashboard.php ส่งกลับมา
interface DashboardStats {
  total_students: number;
  retention_rate: number;
  total_faculty: number;
  total_budget: number;
}

interface RetentionItem {
  name: string;
  value: number;
}

interface ProjectBudgetItem {
  name: string;
  budget: number;
}

interface GradeItem {
  grade: string;
  count: number;
}

interface DashboardData {
  stats: DashboardStats;
  retention: RetentionItem[];
  financial: { projects: ProjectBudgetItem[] };
  grades: GradeItem[];
  students_by_year?: { name: string; total: number }[];
  faculty_by_position?: { name: string; total: number }[];
}

export default function DeanDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        // ใช้ axios client กลางของโปรเจกต์ (base URL จาก .env + ส่ง session cookie ให้อัตโนมัติ)
        const res = await api.get("/index.php?page=get-dean-dashboard");

        if (res.data.status !== "success" || !res.data.data) {
          throw new Error(res.data.message || "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
        }

        if (isMounted) setData(res.data.data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);

  const formatNumber = (value: number) => new Intl.NumberFormat("th-TH").format(value);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>กำลังโหลดข้อมูลแดชบอร์ด...</span>
      </div>
    );
  }

  // --- Error state ---
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>{error || "ไม่พบข้อมูล"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดคณบดี</h1>
            <p className="text-muted-foreground">ภาพรวม KPI และรายงานสำหรับผู้บริหาร</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>ปีการศึกษา 2568</span>
            </div>
            <ExportButton reportName="Dashboard-KPI-Report" />
          </div>
        </div>

        {/* Stat Cards - ใช้ข้อมูลจริงจาก API */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="นักศึกษาทั้งหมด"
            value={formatNumber(data.stats.total_students)}
            subtitle="กำลังศึกษาอยู่ในปัจจุบัน"
            icon={GraduationCap}
          />
          <StatCard
            title="อาจารย์ทั้งหมด"
            value={formatNumber(data.stats.total_faculty)}
            subtitle="อาจารย์ที่มีสถานะ Active"
            icon={Users}
          />
          <StatCard
            title="อัตราคงอยู่"
            value={`${data.stats.retention_rate}%`}
            subtitle="กำลังศึกษา + สำเร็จการศึกษา / ทั้งหมด"
            icon={UserCheck}
          />
          <StatCard
            title="งบประมาณโครงการรวม"
            value={formatCurrency(data.stats.total_budget)}
            subtitle="รวมทุกปีงบประมาณ"
            icon={TrendingUp}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="kpi" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
            <TabsTrigger value="retention">การคงอยู่</TabsTrigger>
            <TabsTrigger value="financial">รายงานการเงิน</TabsTrigger>
          </TabsList>

          {/* KPI Tab — กราฟข้อมูลจริงจาก API */}
          <TabsContent value="kpi" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <StudentKPIChart data={data.students_by_year || []} />
              <TeacherKPIChart data={data.faculty_by_position || []} />
            </div>
          </TabsContent>

          {/* Retention Tab */}
          <TabsContent value="retention" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <RetentionChart data={data.retention || []} />
              <ExitReasonsChart grades={data.grades || []} />
            </div>
          </TabsContent>

          {/* Financial Tab - Sensitive */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FinancialReport projects={data.financial?.projects || []} />
              </div>
              <div>
                <ExecutiveSummary stats={data.stats} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
