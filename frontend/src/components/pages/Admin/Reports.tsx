import { Fragment, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  Landmark,
  Loader2,
  Search,
  TrendingDown,
  WalletCards,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

type BudgetSource = string;

type BudgetCell = {
  amount: number;
  note?: string;
};

type BudgetBySource = Partial<Record<BudgetSource, BudgetCell>>;

type AnnualProjectReportRow = {
  id: string;
  academicYear: string;
  strategy: string;
  planName?: string;
  objective?: string;
  kpi?: string;
  projectCode?: string;
  projectName: string;
  activityName?: string;
  responsiblePerson?: string;
  proposedBudget?: BudgetBySource;
  actualBudget?: BudgetBySource;
  approvedBudgetUrl?: string;
  summaryReportUrl?: string;
  parentProjectCode?: string;
  rowType: "project" | "activity";
  proposedTotal?: number;
  actualTotal?: number;
  documentStatus?: {
    label: string;
    code: string;
  };
};

type SummaryStats = {
  totalProjects: number;
  totalActivities: number;
  proposedTotal: number;
  actualTotal: number;
  balance: number;
  completeDocuments: number;
};

type StrategySummary = {
  strategy: string;
  projects: number;
  activities: number;
  proposedTotal: number;
  actualTotal: number;
  documents: number;
};

type BudgetBreakdownItem = {
  key: BudgetSource;
  label: string;
  proposedTotal: number;
  actualTotal: number;
};

type AvailableFilters = {
  academicYears: string[];
  strategies: string[];
  responsiblePeople: string[];
};

type ReportsApiData = {
  academicYear: string;
  availableFilters: AvailableFilters;
  budgetSources: { key: BudgetSource; label: string }[];
  summary: SummaryStats;
  strategySummaries: StrategySummary[];
  budgetBreakdown: BudgetBreakdownItem[];
  rows: AnnualProjectReportRow[];
  meta?: {
    nextEndpoints?: string[];
  };
};

const fallbackAcademicYears = ["2568", "2567", "2566"];

const fallbackBudgetSources: { key: BudgetSource; label: string }[] = [
  { key: "university", label: "มหาวิทยาลัยสยาม" },
  { key: "thonburiHospital", label: "โรงพยาบาลธนบุรี" },
  { key: "nursingFaculty", label: "คณะพยาบาลศาสตร์" },
  { key: "external", label: "หน่วยงานภายนอก" },
];

const reportRows: AnnualProjectReportRow[] = [
  {
    id: "2568-p1",
    academicYear: "2568",
    strategy: "ยุทธศาสตร์ที่ 1: Future Research & Innovation",
    projectCode: "2091101 - 68001",
    projectName: "โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา",
    responsiblePerson: "ผศ.ดร.รอญ.วิภานันท์",
    rowType: "project",
  },
  {
    id: "2568-p1-a1",
    academicYear: "2568",
    strategy: "ยุทธศาสตร์ที่ 1: Future Research & Innovation",
    projectName: "ก.1 วิจัยและนวัตกรรมสาขาสูติศาสตร์",
    responsiblePerson: "อ.สุกฤตา",
    summaryReportUrl: "https://drive.google.com/file/d/18W_0OGkrBf78IV2pj50IOB62eCK-z7IT/view?usp=sharing",
    parentProjectCode: "2091101 - 68001",
    rowType: "activity",
  },
  {
    id: "2568-p4",
    academicYear: "2568",
    strategy: "ยุทธศาสตร์ที่ 1: Future Research & Innovation",
    projectCode: "2091101 - 68004",
    projectName: "โครงการ สนับสนุนการตีพิมพ์ผลงานใน SCOPUS",
    responsiblePerson: "ผศ.ดร.จรัสดาว",
    approvedBudgetUrl: "https://drive.google.com/file/d/1bLSv6NYhO1scqotgWDbNF0WA8WAs7jix/view?usp=sharing",
    rowType: "project",
  },
  {
    id: "2568-p5",
    academicYear: "2568",
    strategy: "ยุทธศาสตร์ที่ 1: Future Research & Innovation",
    projectCode: "2091101 - 68005",
    projectName: "โครงการ ตีพิมพ์เผยแพร่งานวิจัยและนวัตกรรม",
    responsiblePerson: "ผศ.ดร.ชนิดา",
    proposedBudget: { nursingFaculty: { amount: 0, note: "รออนุมัติ" } },
    summaryReportUrl: "https://drive.google.com/file/d/1w94FLnEqdbksj52cHMV9MsVdR-6_E_Kw/view?usp=sharing",
    rowType: "project",
  },
  {
    id: "2568-p9",
    academicYear: "2568",
    strategy: "ยุทธศาสตร์ที่ 2: Future Education",
    projectCode: "2091101 - 68009",
    projectName: "โครงการ ติดตามผลการดำเนินงานและพัฒนาแผนหลักสูตร",
    responsiblePerson: "ผศ.ดร.วััฒนีย์",
    approvedBudgetUrl: "https://drive.google.com/file/d/1Y-krdhtTnro_xrqtJ2KHtyWKwIGE7uBP/view?usp=sharing",
    summaryReportUrl: "https://drive.google.com/file/d/1hZ-7gOiTpa70_3Q4XFudbV2zNPgHFgPp/view?usp=sharing",
    rowType: "project",
  },
  {
    id: "2568-p12-a1",
    academicYear: "2568",
    strategy: "ยุทธศาสตร์ที่ 2: Future Education",
    projectName: "ก.1 พัฒนาทักษะภาษา ปี 1",
    responsiblePerson: "ผศ.ดร.วััฒนีย์",
    proposedBudget: { nursingFaculty: { amount: 0, note: "ไม่ใช้งบ" } },
    summaryReportUrl: "https://drive.google.com/file/d/1amSXDm9LbIryttJrEtrxsYQ2k7Wmql1F/view?usp=sharing",
    parentProjectCode: "2091101 - 68012",
    rowType: "activity",
  },
  {
    id: "2568-p27",
    academicYear: "2568",
    strategy: "ยุทธศาสตร์ที่ 4: Future System for Management",
    projectCode: "2091101 - 68027",
    projectName: "โครงการ พัฒนาระบบคุณภาพและประสิทธิภาพด้านการจัดการ MIS",
    responsiblePerson: "พจอ.ดร.ภูมเดชา",
    rowType: "project",
  },
  {
    id: "2567-p28",
    academicYear: "2567",
    strategy: "ยุทธศาสตร์ที่ 1: Future Research & Innovation",
    kpi: "KPI 1 จำนวนโครงการ วิจัย นวัตกรรมที่มีความร่วมมือและบูรณาการศาสตร์ระหว่างคณะวิชา",
    projectCode: "2091101 - 67028",
    projectName: "โครงการพัฒนางานวิจัยและนวัตกรรมแต่ละสาขา",
    responsiblePerson: "ผศ.ดร.รอญ.วิภานันท์",
    actualBudget: { university: { amount: 0 }, thonburiHospital: { amount: 0 }, nursingFaculty: { amount: 0 }, external: { amount: 12000 } },
    rowType: "project",
  },
  {
    id: "2567-p28-a1",
    academicYear: "2567",
    strategy: "ยุทธศาสตร์ที่ 1: Future Research & Innovation",
    projectName: "ก.1 วิจัยและนวัตกรรมสาขาสูติศาสตร์",
    responsiblePerson: "อ.สุกฤตา",
    actualBudget: { university: { amount: 0 }, thonburiHospital: { amount: 0 }, nursingFaculty: { amount: 0 }, external: { amount: 12000 } },
    parentProjectCode: "2091101 - 67028",
    rowType: "activity",
  },
  {
    id: "2567-p28-a2",
    academicYear: "2567",
    strategy: "ยุทธศาสตร์ที่ 1: Future Research & Innovation",
    projectName: "ก.2 วิจัยและนวัตกรรมสาขาผู้ใหญ่",
    responsiblePerson: "อ.รัตนาภรณ์",
    actualBudget: { university: { amount: 0, note: "ไม่ใช้งบ" } },
    parentProjectCode: "2091101 - 67028",
    rowType: "activity",
  },
  {
    id: "2566-p001",
    academicYear: "2566",
    strategy: "ยุทธศาสตร์ที่ 1: บัณฑิตดี มีคุณภาพ",
    planName: "แผนงานที่ 1. ด้านหลักสูตร",
    objective: "เพื่อให้หลักสูตรและการจัดการเรียนการสอนได้รับการพัฒนาอย่างต่อเนื่อง",
    kpi: "ติดตามประเมินหลักสูตรทุกรายวิชาชีพทุกภาคการศึกษา ร้อยละ 100",
    projectCode: "66.1-001",
    projectName: "ติดตามผลการดำเนินงานตามแผนหลักสูตร",
    responsiblePerson: "ผศ.ดร.วัฒนีย์",
    proposedBudget: { university: { amount: 20000 }, thonburiHospital: { amount: 0 }, nursingFaculty: { amount: 0 }, external: { amount: 0 } },
    actualBudget: { university: { amount: 18500 }, thonburiHospital: { amount: 0 }, nursingFaculty: { amount: 0 }, external: { amount: 0 } },
    rowType: "project",
  },
  {
    id: "2566-p002",
    academicYear: "2566",
    strategy: "ยุทธศาสตร์ที่ 1: บัณฑิตดี มีคุณภาพ",
    planName: "แผนงานที่ 1. ด้านหลักสูตร",
    projectCode: "66.1-002",
    projectName: "ประกันคุณภาพหลักสูตรเน้นผลลัพธ์ PLOs",
    responsiblePerson: "ผศ.ดร.สุสารี",
    proposedBudget: { university: { amount: 5720 }, thonburiHospital: { amount: 0 }, nursingFaculty: { amount: 0 }, external: { amount: 0 } },
    actualBudget: { university: { amount: 7000 }, thonburiHospital: { amount: 0 }, nursingFaculty: { amount: 0 }, external: { amount: 0 } },
    rowType: "project",
  },
  {
    id: "2566-p003",
    academicYear: "2566",
    strategy: "ยุทธศาสตร์ที่ 1: บัณฑิตดี มีคุณภาพ",
    planName: "แผนงานที่ 1. ด้านหลักสูตร",
    projectCode: "66.1-003",
    projectName: "คัดเลือกสรรหาและการเตรียมความพร้อมนักศึกษาใหม่",
    responsiblePerson: "ผศ.วารุณี",
    proposedBudget: { university: { amount: 2000 } },
    actualBudget: { university: { amount: 2000 } },
    rowType: "project",
  },
];

const upcomingApiDesign = [
  "GET /index.php?page=admin-reports&year=<year>",
  "POST /index.php?page=import-report-files",
  "GET /index.php?page=export-report&year=<year>&format=xlsx",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

const sumBudget = (budget?: BudgetBySource) =>
  fallbackBudgetSources.reduce((sum, source) => sum + (budget?.[source.key]?.amount ?? 0), 0);

const sumBudgetSource = (rows: AnnualProjectReportRow[], budgetKey: "proposedBudget" | "actualBudget", source: BudgetSource) =>
  rows.reduce((sum, row) => sum + (row[budgetKey]?.[source]?.amount ?? 0), 0);

const getBudgetNotes = (row: AnnualProjectReportRow) =>
  [...Object.values(row.proposedBudget ?? {}), ...Object.values(row.actualBudget ?? {})]
    .map((item) => item.note)
    .filter(Boolean);

const getDocumentStatus = (row: AnnualProjectReportRow) => {
  const notes = getBudgetNotes(row);
  if (notes.some((note) => note?.includes("ไม่ใช้งบ"))) return { label: "ไม่ใช้งบ", variant: "secondary" as const };
  if (row.approvedBudgetUrl && row.summaryReportUrl) return { label: "เอกสารครบ", variant: "default" as const };
  if (row.approvedBudgetUrl) return { label: "มีอนุมัติงบ", variant: "outline" as const };
  if (row.summaryReportUrl) return { label: "มีสรุปโครงการ", variant: "outline" as const };
  return { label: "ไม่มีลิงก์เอกสาร", variant: "destructive" as const };
};

const getDocumentVariant = (code?: string) => {
  if (code === "complete") return "default" as const;
  if (code === "no_budget") return "secondary" as const;
  if (code === "approved_only" || code === "summary_only") return "outline" as const;
  return "destructive" as const;
};

const downloadCsv = (rows: AnnualProjectReportRow[], academicYear: string) => {
  const headers = [
    "ปีการศึกษา",
    "ยุทธศาสตร์",
    "รหัสโครงการ",
    "โครงการ/กิจกรรมย่อย",
    "ผู้รับผิดชอบ",
    "งบเสนอรวม",
    "งบใช้จริงรวม",
    "ลิงก์อนุมัติงบ",
    "ลิงก์สรุปโครงการ",
  ];

  const csvRows = rows.map((row) => [
    row.academicYear,
    row.strategy,
    row.projectCode || row.parentProjectCode || "",
    row.projectName,
    row.responsiblePerson || "",
    sumBudget(row.proposedBudget),
    sumBudget(row.actualBudget),
    row.approvedBudgetUrl || "",
    row.summaryReportUrl || "",
  ]);

  const csv = [headers, ...csvRows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `รายงานงบประมาณและโครงการ-${academicYear}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function Reports() {
  const [academicYear, setAcademicYear] = useState("2568");
  const [selectedStrategy, setSelectedStrategy] = useState("ทั้งหมด");
  const [selectedResponsible, setSelectedResponsible] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<ReportsApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const controller = new AbortController();

    const loadReports = async () => {
      try {
        setLoading(true);
        const response = await api.get("/index.php?page=admin-reports", {
          params: {
            year: academicYear,
            strategy: selectedStrategy,
            responsible: selectedResponsible,
            search: searchTerm,
          },
          signal: controller.signal,
        });

        if (response.data?.status !== "success") {
          throw new Error(response.data?.message || "โหลดข้อมูลรายงานไม่สำเร็จ");
        }

        setReportData(response.data.data);
      } catch (error) {
        if (controller.signal.aborted) return;
        toast({
          title: "โหลดรายงานไม่สำเร็จ",
          description: error instanceof Error ? error.message : "ไม่สามารถเชื่อมต่อ API รายงานได้",
          variant: "destructive",
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => controller.abort();
  }, [academicYear, selectedStrategy, selectedResponsible, searchTerm, toast]);

  const filteredRows = reportData?.rows ?? [];
  const budgetSources = reportData?.budgetSources ?? fallbackBudgetSources;
  const academicYears = reportData?.availableFilters.academicYears?.length
    ? reportData.availableFilters.academicYears
    : fallbackAcademicYears;
  const strategies = ["ทั้งหมด", ...(reportData?.availableFilters.strategies ?? [])];
  const responsiblePeople = ["ทั้งหมด", ...(reportData?.availableFilters.responsiblePeople ?? [])];
  const summaryStats: SummaryStats = reportData?.summary ?? {
    totalProjects: 0,
    totalActivities: 0,
    proposedTotal: 0,
    actualTotal: 0,
    balance: 0,
    completeDocuments: 0,
  };
  const strategySummaries = reportData?.strategySummaries ?? [];
  const budgetBreakdown = reportData?.budgetBreakdown ?? [];
  const displayBudgetBreakdown = budgetBreakdown.length
    ? budgetBreakdown
    : budgetSources.map((source) => ({
        key: source.key,
        label: source.label,
        proposedTotal: sumBudgetSource(filteredRows, "proposedBudget", source.key),
        actualTotal: sumBudgetSource(filteredRows, "actualBudget", source.key),
      }));

  const groupedRows = useMemo(() => {
    return Array.from(new Set(filteredRows.map((row) => row.strategy))).map((strategy) => ({
      strategy,
      rows: filteredRows.filter((row) => row.strategy === strategy),
    }));
  }, [filteredRows]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">รายงานงบประมาณและโครงการ</h1>
          <p className="text-muted-foreground">
            ภาพรวมงบแผน โครงการ กิจกรรมย่อย และเอกสารประกอบของคณะพยาบาลศาสตร์
          </p>
        </div>
        <Button className="gap-2" onClick={() => downloadCsv(filteredRows, academicYear)}>
          <Download className="h-4 w-4" />
          ส่งออก CSV
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-md border px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          กำลังโหลดข้อมูลรายงานจาก API...
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ตัวกรองรายงาน</CardTitle>
          <CardDescription>เลือกปี ยุทธศาสตร์ ผู้รับผิดชอบ หรือค้นหาโครงการ/กิจกรรมย่อย</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select value={academicYear} onValueChange={(value) => {
              setAcademicYear(value);
              setSelectedStrategy("ทั้งหมด");
              setSelectedResponsible("ทั้งหมด");
            }}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>ปีการศึกษา {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
              <SelectTrigger>
                <Landmark className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
              <SelectTrigger>
                <FolderKanban className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {responsiblePeople.map((person) => (
                  <SelectItem key={person} value={person}>{person}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ค้นหารหัส/ชื่อโครงการ/กิจกรรม"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">โครงการ</p>
              <FolderKanban className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{summaryStats.totalProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">กิจกรรมย่อย</p>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{summaryStats.totalActivities}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">งบเสนอรวม</p>
            <p className="mt-2 text-xl font-bold">{formatCurrency(summaryStats.proposedTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">งบใช้จริงรวม</p>
            <p className="mt-2 text-xl font-bold">{formatCurrency(summaryStats.actualTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">ส่วนต่างงบ</p>
              <TrendingDown className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-xl font-bold">{formatCurrency(summaryStats.balance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">เอกสารครบ</p>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{summaryStats.completeDocuments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">ภาพรวมตามยุทธศาสตร์</CardTitle>
            <CardDescription>จำนวนโครงการ กิจกรรมย่อย งบประมาณ และเอกสารในแต่ละยุทธศาสตร์</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {strategySummaries.map((item) => (
              <div key={item.strategy} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.strategy}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.projects} โครงการ / {item.activities} กิจกรรมย่อย / {item.documents} รายการมีเอกสาร
                    </p>
                  </div>
                  <Badge variant="secondary">{formatCurrency(item.actualTotal || item.proposedTotal)}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">แหล่งงบประมาณ</CardTitle>
            <CardDescription>สรุปงบแยกตามแหล่งเงินจากไฟล์งบแผน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayBudgetBreakdown.map((source) => {
              return (
                <div key={source.key} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <WalletCards className="h-4 w-4 text-primary" />
                    <p className="font-medium">{source.label}</p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">งบเสนอ</p>
                      <p className="font-semibold">{formatCurrency(source.proposedTotal)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">งบใช้จริง</p>
                      <p className="font-semibold">{formatCurrency(source.actualTotal)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">ตารางโครงการและกิจกรรมย่อย</CardTitle>
            <CardDescription>
              แสดงแบบ grouped table โดยกิจกรรมย่อยจะเยื้องใต้โครงการหลัก และแสดงสถานะเอกสารตามลิงก์ในไฟล์
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-3 font-medium">รหัส</th>
                  <th className="py-3 pr-3 font-medium">โครงการ/กิจกรรมย่อย</th>
                  <th className="py-3 pr-3 font-medium">ผู้รับผิดชอบ</th>
                  <th className="py-3 pr-3 font-medium">งบเสนอ</th>
                  <th className="py-3 pr-3 font-medium">งบใช้จริง</th>
                  <th className="py-3 pr-3 font-medium">สถานะเอกสาร</th>
                  <th className="py-3 pr-3 font-medium">เอกสาร</th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map((group) => (
                  <Fragment key={group.strategy}>
                    <tr key={`${group.strategy}-header`} className="bg-muted/40">
                      <td colSpan={7} className="px-3 py-2 font-semibold">{group.strategy}</td>
                    </tr>
                    {group.rows.map((row) => {
                      const docStatus = row.documentStatus ?? getDocumentStatus(row);
                      return (
                        <tr key={row.id} className="border-b align-top last:border-0">
                          <td className="py-3 pr-3 font-medium">
                            {row.projectCode || row.parentProjectCode || "-"}
                          </td>
                          <td className="py-3 pr-3">
                            <div className={row.rowType === "activity" ? "pl-5" : ""}>
                              <div className="flex items-start gap-2">
                                {row.rowType === "activity" && <span className="mt-1 text-muted-foreground">└</span>}
                                <div>
                                  <p className="font-medium">{row.projectName}</p>
                                  {row.kpi && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.kpi}</p>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3">{row.responsiblePerson || "-"}</td>
                          <td className="py-3 pr-3">{formatCurrency(sumBudget(row.proposedBudget))}</td>
                          <td className="py-3 pr-3">{formatCurrency(sumBudget(row.actualBudget))}</td>
                          <td className="py-3 pr-3">
                            <Badge variant={"variant" in docStatus ? docStatus.variant : getDocumentVariant(docStatus.code)}>
                              {docStatus.label}
                            </Badge>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                disabled={!row.approvedBudgetUrl}
                                onClick={() => row.approvedBudgetUrl && window.open(row.approvedBudgetUrl, "_blank", "noopener,noreferrer")}
                              >
                                <ExternalLink className="h-3 w-3" />
                                อนุมัติงบ
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                disabled={!row.summaryReportUrl}
                                onClick={() => row.summaryReportUrl && window.open(row.summaryReportUrl, "_blank", "noopener,noreferrer")}
                              >
                                <FileText className="h-3 w-3" />
                                สรุป
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
