import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  GraduationCap,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "@/lib/axios";
import ExportButton from "@/components/dashboard/ExportButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardData {
  academic_year: number;
  available_years: number[];
  stats: {
    total_students: number;
    total_student_records: number;
    retention_rate: number;
    graduation_rate: number;
    total_faculty: number;
    total_budget: number;
    student_attention: number;
    alerts: number;
  };
  alerts: { tone: "danger" | "warning"; label: string }[];
  students: {
    studying: number;
    graduated: number;
    dropped: number;
    retention_rate: number;
    graduation_rate: number;
    on_time_graduation_rate: number | null;
    on_time_note: string;
    funnel: { name: string; value: number }[];
  };
  retention: { name: string; value: number }[];
  students_by_year: {
    name: string;
    total: number;
    studying: number;
    graduated: number;
    dropped: number;
  }[];
  faculty_by_position: { name: string; total: number }[];
  faculty_license: {
    registered: number;
    valid: number;
    expiring_within_6_months: number;
    expired: number;
    coverage_rate: number;
  };
  practical: {
    vaccination_by_year: { year: string; total: number; ready: number; rate: number }[];
    assignments: {
      students: number;
      faculty: number;
      average_students_per_faculty: number;
      over_capacity_faculty: number;
      task_completion_rate: number;
    };
  };
  advising: {
    students: number;
    faculty: number;
    average_students_per_faculty: number;
    over_capacity_faculty: number;
    capacity: number;
  };
  research: {
    outputs: number;
    faculty: number;
    ratio_per_faculty: number;
    scopus: number;
    tci: number;
    by_database: { name: string; total: number }[];
    summary: {
      kpi: number;
      co_author: number;
      academic: number;
    };
    trend: {
      year: string;
      kpi: number;
      co_author: number;
      academic: number;
    }[];
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    budget: number;
    spent: number;
    burn_rate: number;
    average_progress: number;
    over_budget: number;
    top_projects: { name: string; budget: number; spent: number; progress: number }[];
  };
  curriculum_qa: {
    active_cycle: { id: number; start_year: number; end_year: number } | null;
    subjects: number;
    tqf_documents: number;
    documented_subjects: number;
    tqf_coverage_rate: number;
  };
}

interface FiveYearData {
  yearlyData: {
    year: string;
    graduates: number;
    licenseFirstAttemptPassed: number;
    licenseWithinOneYearPassed: number;
  }[];
}

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

const formatNumber = (value: number) => new Intl.NumberFormat("th-TH").format(Number(value || 0));
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("th-TH", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground" title={detail}>{detail}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  id,
  title,
  description,
  children,
  action,
  className = "",
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card id={id} className={`scroll-mt-24 overflow-hidden border-border/70 shadow-sm ${className}`}>
      <CardHeader className="border-b bg-muted/20 p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm leading-6">{description}</CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function MiniMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
      {detail && <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>}
    </div>
  );
}

export default function DeanDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fiveYear, setFiveYear] = useState<FiveYearData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadDashboard = useCallback(async () => {
    void reloadKey;
    setLoading(true);
    setError(null);
    const params = selectedYear ? { year: selectedYear } : undefined;

    const [dashboardResult, fiveYearResult] = await Promise.allSettled([
      api.get("/index.php?page=get-dean-dashboard", { params }),
      api.get("/index.php?page=get-five-year-summary"),
    ]);

    if (dashboardResult.status === "rejected") {
      const requestError = dashboardResult.reason;
      setError(requestError instanceof Error ? requestError.message : "ไม่สามารถโหลดแดชบอร์ดคณบดีได้");
      setLoading(false);
      return;
    }

    const dashboardPayload = dashboardResult.value.data;
    if (dashboardPayload?.status !== "success" || !dashboardPayload?.data) {
      setError(dashboardPayload?.message || "ไม่สามารถโหลดแดชบอร์ดคณบดีได้");
      setLoading(false);
      return;
    }

    const nextData = dashboardPayload.data as DashboardData;
    setData(nextData);
    if (selectedYear === null) setSelectedYear(nextData.academic_year);

    if (fiveYearResult.status === "fulfilled" && fiveYearResult.value.data?.status === "success") {
      setFiveYear(fiveYearResult.value.data.data as FiveYearData);
    } else {
      setFiveYear(null);
    }

    setLoading(false);
  }, [reloadKey, selectedYear]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const licenseRows = useMemo(
    () => (fiveYear?.yearlyData || []).map((row) => ({
      ...row,
      licenseFirstAttemptPassed: Number(row.licenseFirstAttemptPassed || 0),
      licenseWithinOneYearPassed: Number(row.licenseWithinOneYearPassed || 0),
    })),
    [fiveYear],
  );

  const licenseTotals = useMemo(
    () => licenseRows.reduce(
      (sum, row) => ({
        first: sum.first + row.licenseFirstAttemptPassed,
        withinYear: sum.withinYear + row.licenseWithinOneYearPassed,
      }),
      { first: 0, withinYear: 0 },
    ),
    [licenseRows],
  );

  if (loading && !data) {
    return (
      <div className="flex h-80 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>กำลังรวบรวมข้อมูลผู้บริหาร...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
        <AlertCircle className="h-9 w-9 text-destructive" />
        <p className="text-sm text-destructive">{error || "ไม่พบข้อมูลแดชบอร์ด"}</p>
        <Button variant="outline" size="sm" onClick={() => setReloadKey((value) => value + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" />ลองอีกครั้ง
        </Button>
      </div>
    );
  }

  const exportData = [
    { หัวข้อ: "นักศึกษาปัจจุบัน", ค่า: data.stats.total_students, รายละเอียด: `จากระเบียนทั้งหมด ${data.stats.total_student_records} คน` },
    { หัวข้อ: "อัตราคงอยู่", ค่า: `${data.stats.retention_rate}%`, รายละเอียด: `สำเร็จการศึกษารวม ${data.stats.graduation_rate}%` },
    { หัวข้อ: "อาจารย์ทั้งหมด", ค่า: data.stats.total_faculty, รายละเอียด: `มีเลขใบอนุญาต ${data.faculty_license.coverage_rate}%` },
    { หัวข้อ: "รายการเฝ้าระวัง", ค่า: data.stats.alerts, รายละเอียด: `นักศึกษาต้องติดตาม ${data.stats.student_attention} คน` },
    { หัวข้อ: "งานวิจัยนับ KPI", ค่า: data.research.summary.kpi, รายละเอียด: "นับเฉพาะ Head" },
    { หัวข้อ: "งานวิจัยชื่อร่วม", ค่า: data.research.summary.co_author, รายละเอียด: "นับภาระงาน ไม่นับ KPI" },
    { หัวข้อ: "วิชาการ/ตำรา", ค่า: data.research.summary.academic, รายละเอียด: "แยกจาก KPI วิจัย" },
    { หัวข้อ: "จำนวนโครงการ", ค่า: data.projects.total, รายละเอียด: `ดำเนินการ ${data.projects.active} · เสร็จ ${data.projects.completed}` },
    { หัวข้อ: "งบประมาณโครงการ", ค่า: data.projects.budget, รายละเอียด: `เบิกจ่าย ${data.projects.spent} บาท` },
  ];

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      <div className="app-page-header">
        <div className="min-w-0">
          <h1 className="app-page-title">แดชบอร์ดคณบดี</h1>
          <p className="app-page-description">
            ภาพรวมคณะพยาบาลศาสตร์ในหน้าเดียว สำหรับติดตามนักศึกษา บุคลากร งานวิจัย โครงการ และงบประมาณ
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            size="icon"
            title="รีเฟรชข้อมูล"
            disabled={loading}
            onClick={() => setReloadKey((value) => value + 1)}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <ExportButton data={exportData} reportName={`Dean-Dashboard-${data.academic_year}`} />
        </div>
      </div>

      <section id="overview" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">ภาพรวมคณะ</h2>
            <p className="text-base text-muted-foreground">ตัวชี้วัดสำคัญประจำปีการศึกษา {data.academic_year}</p>
          </div>
          <Badge variant="outline" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />ข้อมูลสำหรับผู้บริหาร</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard icon={GraduationCap} label="นักศึกษาปัจจุบัน" value={`${formatNumber(data.stats.total_students)} คน`} detail={`จากระเบียนทั้งหมด ${formatNumber(data.stats.total_student_records)} คน`} tone="bg-blue-500/10 text-blue-600" />
          <KpiCard icon={TrendingUp} label="อัตราคงอยู่" value={`${data.stats.retention_rate}%`} detail={`สำเร็จการศึกษารวม ${data.stats.graduation_rate}%`} tone="bg-emerald-500/10 text-emerald-600" />
          <KpiCard icon={Users} label="อาจารย์ประจำ" value={`${formatNumber(data.stats.total_faculty)} คน`} detail={`มีเลขใบอนุญาต ${data.faculty_license.coverage_rate}%`} tone="bg-violet-500/10 text-violet-600" />
          <KpiCard icon={AlertTriangle} label="รายการเฝ้าระวัง" value={`${formatNumber(data.stats.alerts)} รายการ`} detail={`นักศึกษาต้องติดตาม ${data.stats.student_attention} คน`} tone="bg-rose-500/10 text-rose-600" />
        </div>
      </section>

      <SectionCard id="students" title="นักศึกษา" description="Cohort funnel สถานะการคงอยู่ และการกระจายตามชั้นปี" className="xl:col-span-2">
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
          <div className="space-y-3">
            {data.students.funnel
              .filter((item) => item.name !== "คงอยู่หรือสำเร็จการศึกษา")
              .map((item, index) => {
              const max = data.students.funnel[0]?.value || 1;
              const width = item.value > 0 ? Math.max((item.value / max) * 100, 18) : 8;
              return (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold">{formatNumber(item.value)} คน</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-md bg-muted/50">
                    <div className="flex h-full items-center rounded-md px-3 text-sm font-medium text-white transition-all" style={{ width: `${width}%`, backgroundColor: COLORS[index % COLORS.length] }}>
                      {Math.round((item.value / max) * 100)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            {data.students_by_year.length === 0 ? <EmptyState label="ยังไม่มีข้อมูลนักศึกษาแยกชั้นปี" /> : (
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-4 gap-2 border-b bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground">
                  <span>ชั้นปี</span>
                  <span className="text-center">กำลังศึกษา</span>
                  <span className="text-center">สำเร็จการศึกษา</span>
                  <span className="text-center">พ้นสภาพ/ลาออก</span>
                </div>
                {data.students_by_year.map((row) => (
                  <div key={row.name} className="grid grid-cols-4 items-center gap-2 border-b px-4 py-4 last:border-b-0">
                    <span className="text-sm font-medium">{row.name}</span>
                    <span className="text-center text-xl font-semibold">{formatNumber(row.studying)}</span>
                    <span className="text-center text-xl font-semibold">{formatNumber(row.graduated)}</span>
                    <span className="text-center text-xl font-semibold">{formatNumber(row.dropped)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard id="license" title="การสอบใบประกอบวิชาชีพ" description="จำนวนผู้ผ่านครั้งแรกและผ่านภายใน 1 ปี จากหน้าผลสรุป 5 ปี">
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniMetric label="ผ่านครั้งแรก รวม 5 ปี" value={`${formatNumber(licenseTotals.first)} คน`} />
            <MiniMetric label="ผ่านภายใน 1 ปี รวม 5 ปี" value={`${formatNumber(licenseTotals.withinYear)} คน`} />
          </div>
          <div className="mt-4 h-[280px]">
            {licenseRows.length === 0 ? <EmptyState label="ยังไม่มีข้อมูลผลสอบใบประกอบวิชาชีพ" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={licenseRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="licenseFirstAttemptPassed" name="ผ่านครั้งแรก" fill="#0ea5e9" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="licenseWithinOneYearPassed" name="ผ่านภายใน 1 ปี" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard id="faculty" title="อาจารย์และบุคลากร" description="ภาพรวมอาจารย์และสถานะใบอนุญาตประกอบวิชาชีพ">
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniMetric label="อาจารย์ทั้งหมด" value={`${formatNumber(data.stats.total_faculty)} คน`} />
            <MiniMetric label="มีเลขใบอนุญาต" value={`${formatNumber(data.faculty_license.registered)} คน`} detail={`${data.faculty_license.coverage_rate}% ของอาจารย์ประจำ`} />
            <MiniMetric label="ใกล้หมดอายุ 6 เดือน" value={`${formatNumber(data.faculty_license.expiring_within_6_months)} คน`} />
            <MiniMetric label="หมดอายุแล้ว" value={`${formatNumber(data.faculty_license.expired)} คน`} />
          </div>
        </SectionCard>

        <SectionCard id="research" title="วิจัยและผลงานวิชาการ" description="แนวโน้มผลงานตามรอบปี โดยใช้หลักการนับเดียวกับหน้าสรุปงานวิจัย">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="นับ KPI" value={formatNumber(data.research.summary.kpi)} detail="นับเฉพาะ Head" />
            <MiniMetric label="ชื่อร่วม" value={formatNumber(data.research.summary.co_author)} detail="นับภาระงาน ไม่นับ KPI" />
            <MiniMetric label="วิชาการ/ตำรา" value={formatNumber(data.research.summary.academic)} detail="แยกจาก KPI วิจัย" />
          </div>
          <div className="mt-4 h-[280px]">
            {data.research.trend.length === 0 ? <EmptyState label="ยังไม่มีข้อมูลแนวโน้มผลงานตามรอบปี" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.research.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kpi" name="นับ KPI" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="co_author" name="ชื่อร่วม" fill="#27272a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="academic" name="วิชาการ/ตำรา" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard
          id="projects"
          title="โครงการและงบประมาณ"
          description="งบประมาณ การเบิกจ่าย และจำนวนโครงการในปีการศึกษาที่เลือก"
          action={(
            <Select value={String(data.academic_year)} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="เลือกปีการศึกษา">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.available_years.map((year) => (
                  <SelectItem key={year} value={String(year)}>ปีการศึกษา {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="งบประมาณโครงการ" value={formatCurrency(data.projects.budget)} />
            <MiniMetric label="เบิกจ่าย" value={formatCurrency(data.projects.spent)} detail={`Burn rate ${data.projects.burn_rate}%`} />
            <MiniMetric label="จำนวนโครงการ" value={`${formatNumber(data.projects.total)} โครงการ`} detail={`ดำเนินการ ${data.projects.active} · เสร็จ ${data.projects.completed}`} />
          </div>
          <div className="mt-4 h-[280px]">
            {data.projects.top_projects.length === 0 ? <EmptyState label={`ยังไม่มีโครงการในปีการศึกษา ${data.academic_year}`} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.projects.top_projects} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={formatCompactCurrency} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="budget" name="งบประมาณ" fill="#4f46e5" radius={[0, 5, 5, 0]} />
                  <Bar dataKey="spent" name="เบิกจ่าย" fill="#f59e0b" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>

    </div>
  );
}
