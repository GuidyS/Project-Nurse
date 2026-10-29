import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarRange,
  CheckCircle2,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Target,
  TrendingUp,
  UserRoundCheck,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
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
import { Progress } from "@/components/ui/progress";
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
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    budget: number;
    spent: number;
    burn_rate: number;
    difference: number | null;
    over_budget: number;
    top_projects: { name: string; budget: number; spent: number; progress?: number }[];
  };
  curriculum_qa: {
    active_cycle: { id: number; start_year: number; end_year: number } | null;
    subjects: number;
    tqf_documents: number;
    documented_subjects: number;
    tqf_coverage_rate: number;
  };
}

interface OutcomeValue {
  assessed: number;
  passed: number;
  rate: number;
}

interface OutcomeData {
  academic_year: number;
  summary: {
    students: number;
    courses: number;
    students_assessed: number;
    students_passed: number;
    ylo_assessed: number;
    plo_assessed: number;
    clo_assessed: number;
    clo_defined: number;
  };
  students: { ylo: OutcomeValue; plo: OutcomeValue; clo: OutcomeValue & { defined: number } }[];
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
const formatCurrency = (value: number | null) => value == null ? "ยังไม่ระบุ" :
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const formatCompactCurrency = (value: number | null) => value == null ? "ยังไม่ระบุ" :
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
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground" title={detail}>{detail}</p>
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
  icon: Icon,
  title,
  description,
  children,
  className = "",
}: {
  id: string;
  icon: typeof Users;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card id={id} className={`scroll-mt-24 overflow-hidden border-border/70 shadow-sm ${className}`}>
      <CardHeader className="border-b bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-1 text-xs leading-5">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function MiniMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
      {detail && <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</p>}
    </div>
  );
}

export default function DeanDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [outcomes, setOutcomes] = useState<OutcomeData | null>(null);
  const [fiveYear, setFiveYear] = useState<FiveYearData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceWarnings, setSourceWarnings] = useState<string[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const loadDashboard = useCallback(async () => {
    void reloadKey;
    setLoading(true);
    setError(null);
    const params = selectedYear ? { year: selectedYear } : undefined;

    const [dashboardResult, outcomeResult, fiveYearResult] = await Promise.allSettled([
      api.get("/index.php?page=get-dean-dashboard", { params }),
      api.get("/index.php?page=get-student-learning-outcomes", { params }),
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

    const warnings: string[] = [];
    if (outcomeResult.status === "fulfilled" && outcomeResult.value.data?.status === "success") {
      setOutcomes(outcomeResult.value.data.data as OutcomeData);
    } else {
      setOutcomes(null);
      warnings.push("ผลลัพธ์การเรียนรู้ PLO/YLO/CLO");
    }

    if (fiveYearResult.status === "fulfilled" && fiveYearResult.value.data?.status === "success") {
      setFiveYear(fiveYearResult.value.data.data as FiveYearData);
    } else {
      setFiveYear(null);
      warnings.push("ผลสอบใบประกอบวิชาชีพ");
    }

    setSourceWarnings(warnings);
    setLoading(false);
  }, [reloadKey, selectedYear]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const outcomeChart = useMemo(() => {
    if (!outcomes) return [];
    const aggregate = (key: "ylo" | "plo" | "clo") => {
      const totals = outcomes.students.reduce(
        (sum, student) => ({
          assessed: sum.assessed + Number(student[key]?.assessed || 0),
          passed: sum.passed + Number(student[key]?.passed || 0),
        }),
        { assessed: 0, passed: 0 },
      );
      return totals.assessed > 0 ? Number(((totals.passed / totals.assessed) * 100).toFixed(1)) : 0;
    };
    return [
      { name: "YLO", actual: aggregate("ylo"), target: 70 },
      { name: "PLO", actual: aggregate("plo"), target: 70 },
      { name: "CLO", actual: aggregate("clo"), target: 70 },
    ];
  }, [outcomes]);

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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  const quickLinks = [
    ["students", "นักศึกษา"],
    ["outcomes", "PLO/YLO/CLO"],
    ["license", "ใบประกอบวิชาชีพ"],
    ["practical", "ความพร้อมขึ้นฝึก"],
    ["faculty", "อาจารย์และบุคลากร"],
    ["research", "งานวิจัย"],
    ["projects", "โครงการและงบประมาณ"],
    ["curriculum", "หลักสูตรและ QA"],
    ["advising", "งานอาจารย์ที่ปรึกษา"],
  ];

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      <div className="app-page-header">
        <div className="min-w-0">
          <h1 className="app-page-title">แดชบอร์ดคณบดี</h1>
          <p className="app-page-description">
            ภาพรวมคณะพยาบาลศาสตร์ในหน้าเดียว สำหรับติดตามนักศึกษา ผลลัพธ์การเรียนรู้ บุคลากร งานวิจัย โครงการ และคุณภาพหลักสูตร
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Select value={String(data.academic_year)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <CalendarRange className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.available_years.map((year) => (
                <SelectItem key={year} value={String(year)}>ปีการศึกษา {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            title="รีเฟรชข้อมูล"
            disabled={loading}
            onClick={() => setReloadKey((value) => value + 1)}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <ExportButton reportName={`Dean-Dashboard-${data.academic_year}`} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-xl border bg-card p-2 shadow-sm">
        {quickLinks.map(([id, label], index) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {index + 2}. {label}
          </button>
        ))}
      </div>

      <section id="overview" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">1. ภาพรวมคณะ</h2>
            <p className="text-sm text-muted-foreground">ตัวชี้วัดสำคัญประจำปีการศึกษา {data.academic_year}</p>
          </div>
          <Badge variant="outline" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />ข้อมูลสำหรับผู้บริหาร</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <KpiCard icon={GraduationCap} label="นักศึกษาปัจจุบัน" value={`${formatNumber(data.stats.total_students)} คน`} detail={`จากระเบียนทั้งหมด ${formatNumber(data.stats.total_student_records)} คน`} tone="bg-blue-500/10 text-blue-600" />
          <KpiCard icon={TrendingUp} label="อัตราคงอยู่" value={`${data.stats.retention_rate}%`} detail={`สำเร็จการศึกษารวม ${data.stats.graduation_rate}%`} tone="bg-emerald-500/10 text-emerald-600" />
          <KpiCard icon={Users} label="อาจารย์ประจำ" value={`${formatNumber(data.stats.total_faculty)} คน`} detail={`มีเลขใบอนุญาต ${data.faculty_license.coverage_rate}%`} tone="bg-violet-500/10 text-violet-600" />
          <KpiCard icon={WalletCards} label="งบเสนอโครงการ" value={formatCompactCurrency(data.stats.total_budget)} detail={data.projects.burn_rate == null ? "งบใช้จริงยังไม่ระบุ" : `สัดส่วนใช้จริงต่องบเสนอ ${data.projects.burn_rate}%`} tone="bg-amber-500/10 text-amber-600" />
          <KpiCard icon={BriefcaseBusiness} label="โครงการปีนี้" value={`${formatNumber(data.projects.total)} โครงการ`} detail={`ดำเนินการ ${data.projects.active} · เสร็จ ${data.projects.completed}`} tone="bg-sky-500/10 text-sky-600" />
          <KpiCard icon={AlertTriangle} label="รายการเฝ้าระวัง" value={`${formatNumber(data.stats.alerts)} รายการ`} detail={`นักศึกษาต้องติดตาม ${data.stats.student_attention} คน`} tone="bg-rose-500/10 text-rose-600" />
        </div>

        {(data.alerts.length > 0 || sourceWarnings.length > 0) && (
          <div className="grid gap-2 lg:grid-cols-2">
            {data.alerts.map((alert) => (
              <div key={alert.label} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${alert.tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                <AlertTriangle className="h-4 w-4 shrink-0" />{alert.label}
              </div>
            ))}
            {sourceWarnings.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <AlertCircle className="h-4 w-4 shrink-0" />โหลดข้อมูลบางส่วนไม่ได้: {sourceWarnings.join(", ")}
              </div>
            )}
          </div>
        )}
      </section>

      <SectionCard id="students" icon={GraduationCap} title="2. นักศึกษา" description="Cohort funnel สถานะการคงอยู่ และการกระจายตามชั้นปี" className="xl:col-span-2">
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
          <div className="space-y-3">
            {data.students.funnel.map((item, index) => {
              const max = data.students.funnel[0]?.value || 1;
              const width = item.value > 0 ? Math.max((item.value / max) * 100, 18) : 8;
              return (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold">{formatNumber(item.value)} คน</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-md bg-muted/50">
                    <div className="flex h-full items-center rounded-md px-3 text-xs font-medium text-white transition-all" style={{ width: `${width}%`, backgroundColor: COLORS[index % COLORS.length] }}>
                      {Math.round((item.value / max) * 100)}%
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              <span className="font-semibold">การจบตรงเวลา:</span> {data.students.on_time_note}
            </div>
          </div>
          <div>
            {data.students_by_year.length === 0 ? <EmptyState label="ยังไม่มีข้อมูลนักศึกษาแยกชั้นปี" /> : (
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-4 gap-2 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
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
        <SectionCard id="outcomes" icon={Target} title="3. ผลลัพธ์การเรียนรู้ PLO / YLO / CLO" description="เปรียบเทียบผลจริงกับเป้าหมาย 70% จากหน้าผลลัพธ์การเรียนรู้เดิม">
          <div className="grid gap-3 sm:grid-cols-3">
            {outcomeChart.map((item) => (
              <MiniMetric key={item.name} label={`ผลประเมิน ${item.name}`} value={`${item.actual}%`} detail={`เป้าหมาย ${item.target}%`} />
            ))}
          </div>
          <div className="mt-4 h-[250px]">
            {outcomeChart.length === 0 ? <EmptyState label="ยังไม่มีข้อมูลผลลัพธ์การเรียนรู้" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "ผลจริง"]} />
                  <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="5 5" label="เป้าหมาย 70%" />
                  <Bar dataKey="actual" name="ผลจริง" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">นักศึกษาที่มีผลประเมิน {formatNumber(outcomes?.summary.students_assessed || 0)} คน · รายวิชา {formatNumber(outcomes?.summary.courses || 0)} วิชา</p>
        </SectionCard>

        <SectionCard id="license" icon={BadgeCheck} title="4. การสอบใบประกอบวิชาชีพ" description="จำนวนผู้ผ่านครั้งแรกและผ่านภายใน 1 ปี จากหน้าผลสรุป 5 ปี">
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

        <SectionCard id="practical" icon={Stethoscope} title="5. ความพร้อมขึ้นฝึกปฏิบัติ" description="ความครบถ้วนวัคซีนหลักแยกชั้นปี และสัดส่วนอาจารย์ปฏิบัติ 1:8">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="นักศึกษาที่มอบหมาย" value={`${formatNumber(data.practical.assignments.students)} คน`} />
            <MiniMetric label="เฉลี่ยต่ออาจารย์ปฏิบัติ" value={`${data.practical.assignments.average_students_per_faculty} คน`} detail="เกณฑ์ไม่เกิน 8 คน" />
            <MiniMetric label="งานฝึกที่เสร็จ" value={`${data.practical.assignments.task_completion_rate}%`} />
          </div>
          <div className="mt-4 h-[260px]">
            {data.practical.vaccination_by_year.length === 0 ? <EmptyState label="ยังไม่มีข้อมูลวัคซีนสำหรับสรุปความพร้อม" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.practical.vaccination_by_year}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "พร้อมขึ้นฝึก"]} />
                  <Bar dataKey="rate" name="วัคซีนครบ" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard id="faculty" icon={Users} title="6. อาจารย์และบุคลากร" description="ตำแหน่งวิชาการและสถานะใบอนุญาตประกอบวิชาชีพของอาจารย์">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="มีเลขใบอนุญาต" value={`${formatNumber(data.faculty_license.registered)} คน`} detail={`${data.faculty_license.coverage_rate}% ของอาจารย์ประจำ`} />
            <MiniMetric label="ใกล้หมดอายุ 6 เดือน" value={`${formatNumber(data.faculty_license.expiring_within_6_months)} คน`} />
            <MiniMetric label="หมดอายุแล้ว" value={`${formatNumber(data.faculty_license.expired)} คน`} />
          </div>
          <div className="mt-4 h-[260px]">
            {data.faculty_by_position.length === 0 ? <EmptyState label="ยังไม่มีข้อมูลตำแหน่งอาจารย์" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.faculty_by_position} dataKey="total" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={2}>
                    {data.faculty_by_position.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard id="research" icon={FlaskConical} title="7. วิจัยและผลงานวิชาการ" description="ผลงานในปีที่เลือก แยกตามฐานข้อมูลหรือระดับผลงานที่บันทึกไว้">
          <div className="grid gap-3 sm:grid-cols-4">
            <MiniMetric label="ผลงานทั้งหมด" value={`${formatNumber(data.research.outputs)} ผลงาน`} />
            <MiniMetric label="Scopus" value={formatNumber(data.research.scopus)} />
            <MiniMetric label="TCI" value={formatNumber(data.research.tci)} />
            <MiniMetric label="ผลงานต่ออาจารย์" value={data.research.ratio_per_faculty.toFixed(2)} />
          </div>
          <div className="mt-4 h-[250px]">
            {data.research.by_database.length === 0 ? <EmptyState label={`ยังไม่มีผลงานวิจัยในปีการศึกษา ${data.academic_year}`} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.research.by_database} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" name="ผลงาน" fill="#8b5cf6" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard id="projects" icon={BriefcaseBusiness} title="8. โครงการและงบประมาณ" description="ยอดโครงการรวมกิจกรรมแล้ว ใช้ข้อมูลร่วมกับหน้ารายงานโครงการ">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="งบเสนอ" value={formatCurrency(data.projects.budget)} />
            <MiniMetric label="งบใช้จริง" value={formatCurrency(data.projects.spent)} />
            <MiniMetric label="ส่วนต่างงบเสนอ − ใช้จริง" value={formatCurrency(data.projects.difference)} detail={`เกินงบ ${data.projects.over_budget} โครงการ`} />
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
                  <Bar dataKey="budget" name="งบเสนอ" fill="#4f46e5" radius={[0, 5, 5, 0]} />
                  <Bar dataKey="spent" name="เบิกจ่าย" fill="#f59e0b" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard id="curriculum" icon={BookOpenCheck} title="9. หลักสูตรและเอกสาร QA" description="ความครอบคลุมเอกสาร มคอ. ของรายวิชาในหลักสูตรที่ใช้งาน">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="หลักสูตรที่ใช้งาน" value={data.curriculum_qa.active_cycle ? `${data.curriculum_qa.active_cycle.start_year}–${data.curriculum_qa.active_cycle.end_year}` : "ยังไม่กำหนด"} />
            <MiniMetric label="รายวิชาในหลักสูตร" value={`${formatNumber(data.curriculum_qa.subjects)} วิชา`} />
            <MiniMetric label="เอกสาร มคอ." value={`${formatNumber(data.curriculum_qa.tqf_documents)} รายการ`} />
          </div>
          <div className="mt-5 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">TQF coverage</p>
                <p className="mt-1 text-xs text-muted-foreground">มีเอกสาร {data.curriculum_qa.documented_subjects} จาก {data.curriculum_qa.subjects} รายวิชา</p>
              </div>
              <span className="text-2xl font-bold text-primary">{data.curriculum_qa.tqf_coverage_rate}%</span>
            </div>
            <Progress value={data.curriculum_qa.tqf_coverage_rate} className="mt-4 h-2.5" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
            <FileCheck2 className="h-4 w-4 shrink-0" />คำนวณจากจำนวนรายวิชาที่มีเอกสาร มคอ. อย่างน้อย 1 รายการในปีที่เลือก
          </div>
        </SectionCard>

        <SectionCard id="advising" icon={UserRoundCheck} title="10. งานอาจารย์ที่ปรึกษา" description="สัดส่วนนักศึกษาต่ออาจารย์ที่ปรึกษาและรายการเกินเกณฑ์ 1:12">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="นักศึกษาที่มอบหมาย" value={`${formatNumber(data.advising.students)} คน`} />
            <MiniMetric label="อาจารย์ที่ปรึกษา" value={`${formatNumber(data.advising.faculty)} คน`} />
            <MiniMetric label="เฉลี่ยต่ออาจารย์" value={`${data.advising.average_students_per_faculty} คน`} detail={`เกณฑ์ไม่เกิน ${data.advising.capacity} คน`} />
          </div>
          <div className="mt-5 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">การใช้ความจุเฉลี่ย</p>
                <p className="mt-1 text-xs text-muted-foreground">อาจารย์เกินเกณฑ์ {data.advising.over_capacity_faculty} คน</p>
              </div>
              <span className="text-2xl font-bold text-primary">
                {Math.min(100, Math.round((data.advising.average_students_per_faculty / Math.max(data.advising.capacity, 1)) * 100))}%
              </span>
            </div>
            <Progress value={(data.advising.average_students_per_faculty / Math.max(data.advising.capacity, 1)) * 100} className="mt-4 h-2.5" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg border p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-500" />เชื่อมจากการมอบหมายอาจารย์ที่ปรึกษา</div>
            <div className="flex items-center gap-2 rounded-lg border p-3 text-sm"><HeartPulse className="h-4 w-4 text-rose-500" />นักศึกษาต้องติดตาม {data.stats.student_attention} คน</div>
          </div>
        </SectionCard>
      </div>

    </div>
  );
}
