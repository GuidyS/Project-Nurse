import ProjectMergeWorkbench from '@/components/pages/Admin/ProjectMergeWorkbench';
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
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { useAcademicYearSelection } from "@/hooks/use-academic-year";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { academicYearOptions } from "@/lib/academicYear";

type ReportDocument = {
  id: number | string;
  name: string;
  date?: string | null;
  file_path?: string | null;
  report_document_type?: string;
};

type AttachmentKind = "url" | "file";
type ReportAttachment = ReportDocument & { href: string; kind: AttachmentKind };

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
  budgetDocumentUrl?: string;
  summaryReportUrl?: string;
  documents?: ReportDocument[] | null;
  parentProjectCode?: string;
  rowType: "project" | "activity";
  totalBudget?: number | null;
  documentStatus?: {
    label: string;
    code: string;
  };
};

const hasControlCharacters = (value: string) => Array.from(value).some(character => {
  const code = character.charCodeAt(0);
  return code < 32 || code === 127;
});

const getReportAttachment = (path?: string | null): { href: string; kind: AttachmentKind } | null => {
  const value = path?.trim();
  if (!value || value.includes("\\") || hasControlCharacters(value)) return null;
  try {
    if (/^https?:\/\//i.test(value)) {
      return { href: new URL(value).href, kind: "url" };
    }
    // Only resolve uploaded document paths against the API, never against the SPA.
    if (!/^\/?uploads\//.test(value)) return null;
    const segments = value.replace(/^\//, "").split("/").map(decodeURIComponent);
    if (segments[1] === "imports" || segments.some(segment =>
      !segment || segment === "." || segment === ".." || /[\\/?#%]/.test(segment) || hasControlCharacters(segment)
    )) return null;
    if (!/\.(pdf|docx?|png|jpe?g)$/i.test(segments[segments.length - 1])) return null;
    const baseUrl = api.defaults.baseURL || "http://localhost:8080";
    const href = new URL(segments.map(encodeURIComponent).join("/"), `${baseUrl.replace(/\/+$/, "")}/`).href;
    return { href, kind: "file" };
  } catch {
    return null;
  }
};

const isGoogleDriveHref = (href: string) => {
  try {
    return ["drive.google.com", "docs.google.com"].includes(new URL(href).hostname.replace(/\.$/, "").toLowerCase());
  } catch {
    return false;
  }
};

const getReportAttachments = (row: AnnualProjectReportRow): ReportAttachment[] => {
  const documents = row.documents ?? [
    { id: "legacy-summary", name: "สรุปโครงการ", file_path: row.summaryReportUrl, report_document_type: "summary_report" },
    { id: "legacy-budget", name: "เอกสารงบประมาณ", file_path: row.budgetDocumentUrl, report_document_type: "budget_document" },
  ];
  const seen = new Set<string>();
  return documents.flatMap(document => {
    const attachment = getReportAttachment(document.file_path);
    // Google Drive is a separate attachment source, not a website URL.
    const isGoogleDrive = attachment?.kind === "url" && isGoogleDriveHref(attachment.href);
    if (!attachment || isGoogleDrive || seen.has(attachment.href)) return [];
    seen.add(attachment.href);
    return [{ ...document, ...attachment }];
  });
};

const getSummaryGoogleDriveAttachment = (row: AnnualProjectReportRow) => {
  const summaryDocument = (row.documents ?? []).find(document => {
    if (document.report_document_type !== "summary_report") return false;
    const attachment = getReportAttachment(document.file_path);
    return attachment?.kind === "url" && isGoogleDriveHref(attachment.href);
  });
  const attachment = getReportAttachment(summaryDocument?.file_path ?? row.summaryReportUrl);
  return attachment?.kind === "url" && isGoogleDriveHref(attachment.href) ? attachment : null;
};

type SummaryStats = {
  totalProjects: number;
  totalActivities: number;
  totalBudget: number | null;
  completeDocuments: number;
};

type StrategySummary = {
  strategy: string;
  projects: number;
  activities: number;
  totalBudget: number | null;
  documents: number;
};

type AvailableFilters = {
  academicYears: string[];
  strategies: string[];
  responsiblePeople: string[];
};

type ReportsApiData = {
  periodStatus?: string;
  academicYear: string;
  availableFilters: AvailableFilters;
  summary: SummaryStats;
  strategySummaries: StrategySummary[];
  rows: AnnualProjectReportRow[];
  meta?: {
    nextEndpoints?: string[];
  };
};


const upcomingApiDesign = [
  "GET /index.php?page=admin-reports&year=<year>",
  "POST /index.php?page=import-report-files",
  "GET /index.php?page=export-report&year=<year>&format=xlsx",
];

const formatCurrency = (value: number | null | undefined) => value === null || value === undefined ? "ยังไม่ระบุ" :
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

const getDocumentStatus = (row: AnnualProjectReportRow) => {
  const hasBudgetDocument = Boolean(row.budgetDocumentUrl);
  if (hasBudgetDocument && row.summaryReportUrl) return { label: "เอกสารครบ", variant: "default" as const };
  if (hasBudgetDocument) return { label: "มีเอกสารงบประมาณ", variant: "outline" as const };
  if (row.summaryReportUrl) return { label: "มีสรุปโครงการ", variant: "outline" as const };
  return { label: "รอดำเนินการ", variant: "destructive" as const };
};

const getDocumentVariant = (code?: string) => {
  if (code === "complete") return "default" as const;
  if (code === "no_budget") return "secondary" as const;
  if (code === "budget_only" || code === "summary_only") return "outline" as const;
  return "destructive" as const;
};

const downloadCsv = (rows: AnnualProjectReportRow[], academicYear: string) => {
  const headers = [
    "ปีการศึกษา",
    "ยุทธศาสตร์",
    "รหัสโครงการ",
    "โครงการ/กิจกรรมย่อย",
    "ผู้รับผิดชอบ",
    "งบรวมทั้งหมด",
    "สถานะเอกสาร",
    "ลิงก์สรุปโครงการ",
  ];

  const csvRows = rows.map((row) => [
    row.academicYear,
    row.strategy,
    row.projectCode || row.parentProjectCode || "",
    row.projectName,
    row.responsiblePerson || "",
    row.totalBudget ?? "ยังไม่ระบุ",
    getDocumentStatus(row).label,
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
  const { currentYear, academicYear, setAcademicYear } = useAcademicYearSelection();
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState("ทั้งหมด");
  const [selectedResponsible, setSelectedResponsible] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const requestKey = JSON.stringify([academicYear, selectedStrategy, selectedResponsible, searchTerm, refreshVersion]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportsApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const controller = new AbortController();

    if (searchTerm !== debouncedSearch) return () => controller.abort();
    const loadReports = async () => {
      try {
        setLoading(true);
        const response = await api.get("/index.php?page=admin-reports", {
          params: {
            year: academicYear,
            strategy: selectedStrategy,
            responsible: selectedResponsible,
            search: debouncedSearch,
          },
          signal: controller.signal,
        });

        if (response.data?.status !== "success") {
          throw new Error(response.data?.message || "โหลดข้อมูลรายงานไม่สำเร็จ");
        }

        if (controller.signal.aborted) return;
        setReportData(response.data.data);
        setLoadedKey(requestKey);
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
  }, [academicYear, selectedStrategy, selectedResponsible, searchTerm, debouncedSearch, requestKey, toast, refreshVersion]);

  const resultsPending = loading || requestKey !== loadedKey;

  const filteredRows = useMemo(() => reportData?.rows ?? [], [reportData?.rows]);
  const academicYears = academicYearOptions([...(reportData?.availableFilters.academicYears ?? []), academicYear], currentYear);
  const strategies = ["ทั้งหมด", ...(reportData?.availableFilters.strategies ?? [])];
  const responsiblePeople = ["ทั้งหมด", ...(reportData?.availableFilters.responsiblePeople ?? [])];
  const summaryStats: SummaryStats = reportData?.summary ?? {
    totalProjects: 0,
    totalActivities: 0,
    totalBudget: 0,
    completeDocuments: 0,
  };
  const strategySummaries = reportData?.strategySummaries ?? [];

  const groupedRows = useMemo(() => {
    return Array.from(new Set(filteredRows.map((row) => row.strategy))).map((strategy) => ({
      strategy,
      rows: filteredRows.filter((row) => row.strategy === strategy),
    }));
  }, [filteredRows]);

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">รายงานงบประมาณและโครงการ</h1>
          <p className="app-page-description">
            ภาพรวมงบแผน โครงการ กิจกรรมย่อย และเอกสารประกอบของคณะพยาบาลศาสตร์
          </p>
        </div>
        <Button className="gap-2" disabled={resultsPending || !reportData} onClick={() => downloadCsv(filteredRows, academicYear)}>
          <Download className="h-4 w-4" />
          ส่งออก CSV
        </Button>
      </div>

      <ProjectMergeWorkbench year={academicYear} onChanged={() => setRefreshVersion(v => v + 1)} />

      <Card className="app-section-card">
        <CardHeader>
          <CardTitle className="text-base">ตัวกรองรายงาน</CardTitle>
          <CardDescription role="status" aria-live="polite" className="h-10 sm:h-5">
            {loading ? "กำลังอัปเดตผลลัพธ์…" : resultsPending ? "ผลลัพธ์ยังไม่พร้อมสำหรับตัวกรองปัจจุบัน" : "เลือกปี ยุทธศาสตร์ ผู้รับผิดชอบ หรือค้นหาโครงการ/กิจกรรมย่อย"}
          </CardDescription>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="app-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">โครงการ</p>
              <FolderKanban className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{summaryStats.totalProjects}</p>
          </CardContent>
        </Card>
        <Card className="app-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">กิจกรรมย่อย</p>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{summaryStats.totalActivities}</p>
          </CardContent>
        </Card>
        <Card className="app-stat-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">งบรวมทั้งหมด</p>
            <p className="mt-2 text-xl font-bold">{formatCurrency(summaryStats.totalBudget)}</p>
          </CardContent>
        </Card>
        <Card className="app-stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">เอกสารครบ</p>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{summaryStats.completeDocuments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card className="app-section-card">
          <CardHeader>
            <CardTitle className="text-base">ภาพรวมตามยุทธศาสตร์</CardTitle>
            <CardDescription>จำนวนโครงการ กิจกรรมย่อย งบประมาณ และเอกสารในแต่ละยุทธศาสตร์</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {strategySummaries.map((item) => (
              <div key={item.strategy} className="app-interactive-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.strategy}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.projects} โครงการ / {item.activities} กิจกรรมย่อย / {item.documents} รายการมีเอกสาร
                    </p>
                  </div>
                  <Badge variant="secondary">{formatCurrency(item.totalBudget)}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      <Card className="app-section-card">
        <CardHeader>
          <div>
            <CardTitle className="text-base">ตารางโครงการและกิจกรรมย่อย</CardTitle>
            <CardDescription>
              กิจกรรมย่อยแสดงใต้โครงการหลัก สถานะเอกสารอ่านจากเอกสารโครงการร่วม
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-3 font-medium whitespace-nowrap">รหัส</th>
                  <th className="py-3 pr-3 font-medium">โครงการ/กิจกรรมย่อย</th>
                  <th className="py-3 pr-3 font-medium whitespace-nowrap">ผู้รับผิดชอบ</th>
                  <th className="py-3 px-3 font-medium whitespace-nowrap text-right">งบรวมทั้งหมด</th>
                  <th className="py-3 px-3 font-medium whitespace-nowrap text-center">สถานะเอกสาร</th>
                  <th className="py-3 pl-3 font-medium whitespace-nowrap text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map((group) => (
                  <Fragment key={group.strategy}>
                    <tr key={`${group.strategy}-header`} className="bg-primary/10 border-y border-primary/20">
                      <td colSpan={6} className="px-4 py-3 text-base font-bold text-primary">{group.strategy}</td>
                    </tr>
                    {group.rows.map((row) => {
                      const docStatus = row.documentStatus ?? getDocumentStatus(row);
                      const attachments = getReportAttachments(row);
                      const summaryAttachment = getSummaryGoogleDriveAttachment(row);
                      return (
                        <tr key={row.id} className="border-b align-top last:border-0">
                          <td className="py-3 pr-3 font-medium whitespace-nowrap">
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
                          <td className="py-3 pr-3 whitespace-nowrap">{row.responsiblePerson || "-"}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">{formatCurrency(row.totalBudget ?? null)}</td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <Badge variant={"variant" in docStatus ? docStatus.variant : getDocumentVariant(docStatus.code)}>
                              {docStatus.label}
                            </Badge>
                          </td>
                          <td className="py-3 pl-3">
                            <div className="flex flex-wrap justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                disabled={resultsPending || !summaryAttachment}
                                onClick={() => summaryAttachment && window.open(summaryAttachment.href, "_blank", "noopener,noreferrer")}
                              >
                                <FileText className="h-3 w-3" />
                                สรุป
                              </Button>
                              {(["url", "file"] as const).map(kind => {
                                const attachment = attachments.find(document => document.kind === kind);
                                return (
                                  <Button
                                    key={kind}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1 whitespace-nowrap"
                                    disabled={resultsPending || !attachment}
                                    onClick={() => attachment && window.open(attachment.href, "_blank", "noopener,noreferrer")}
                                  >
                                    {kind === "url" ? <ExternalLink className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                    {kind === "url" ? "ดู URL" : "ดูไฟล์แนบ"}
                                  </Button>
                                );
                              })}
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
