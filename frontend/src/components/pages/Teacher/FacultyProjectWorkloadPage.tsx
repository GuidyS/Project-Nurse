import { useEffect, useMemo, useState } from "react";
import { FolderKanban, Loader2, RefreshCw, Search } from "lucide-react";
import api from "@/lib/axios";
import { useAcademicYearSelection } from "@/hooks/use-academic-year";
import { academicYearOptions } from "@/lib/academicYear";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const projectTypes = [
  { key: "academic_service", label: "บริการวิชาการ" },
  { key: "culture", label: "ทำนุบำรุงศิลปวัฒนธรรม" },
  { key: "teaching", label: "การเรียนการสอน" },
  { key: "research", label: "วิจัย" },
  { key: "quality_assurance", label: "การประกันคุณภาพ" },
  { key: "other", label: "อื่นๆ / ยังไม่จำแนก" },
] as const;

type ProjectType = (typeof projectTypes)[number]["key"];
type ProjectFilter = ProjectType | "all";

type ProjectRecord = {
  project_code: string;
  project_name: string;
  strategy: string;
};

type ProjectWorkload = { projects: number; records: ProjectRecord[] };
type FacultyRow = {
  faculty_id: string;
  name: string;
  project_workload: Record<ProjectType, ProjectWorkload>;
};
type WorkloadData = {
  academic_year: number;
  available_years: number[];
  faculty: FacultyRow[];
};

const countProjects = (faculty: FacultyRow, filter: ProjectFilter): number => {
  const codes = new Set<string>();
  for (const { key } of projectTypes) {
    if (filter !== "all" && filter !== key) continue;
    for (const record of faculty.project_workload[key]?.records || []) codes.add(record.project_code);
  }
  return codes.size;
};

export default function FacultyProjectWorkloadPage({ initialFilter = "all" }: { initialFilter?: ProjectFilter }) {
  const { currentYear, academicYear: selectedYear, setAcademicYear: setSelectedYear } = useAcademicYearSelection();
  const [data, setData] = useState<WorkloadData | null>(null);
  const [filter, setFilter] = useState<ProjectFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/index.php?page=get-faculty-workload", {
          params: selectedYear ? { year: selectedYear } : undefined,
        });
        if (response.data?.status !== "success" || !response.data?.data) {
          throw new Error(response.data?.message || "โหลดข้อมูลภาระงานโครงการไม่สำเร็จ");
        }
        if (active) {
          setData(response.data.data as WorkloadData);
          setSelectedFaculty(null);
        }
      } catch {
        if (active) setError("โหลดข้อมูลภาระงานโครงการไม่สำเร็จ กรุณาลองอีกครั้ง");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [selectedYear, reloadKey]);

  const summary = useMemo(() => {
    const codes = new Set<string>();
    let facultyCount = 0;
    for (const faculty of data?.faculty || []) {
      if (countProjects(faculty, filter) > 0) facultyCount++;
      for (const { key } of projectTypes) {
        if (filter !== "all" && filter !== key) continue;
        for (const record of faculty.project_workload[key]?.records || []) codes.add(record.project_code);
      }
    }
    return { projects: codes.size, faculty: facultyCount };
  }, [data, filter]);

  const visibleFaculty = useMemo(() => (data?.faculty || []).filter((faculty) => {
    const keyword = search.trim().toLocaleLowerCase("th-TH");
    const matchesSearch = !keyword || faculty.name.toLocaleLowerCase("th-TH").includes(keyword) || faculty.faculty_id.includes(keyword);
    const hasWorkload = countProjects(faculty, filter) > 0;
    return matchesSearch && (statusFilter === "all" || (statusFilter === "with" ? hasWorkload : !hasWorkload));
  }), [data, filter, search, statusFilter]);

  const selectedProjects = useMemo(() => {
    if (!selectedFaculty) return [];
    const byCode = new Map<string, { record: ProjectRecord; category: string }>();
    for (const { key, label } of projectTypes) {
      if (filter !== "all" && filter !== key) continue;
      for (const record of selectedFaculty.project_workload[key]?.records || []) {
        if (!byCode.has(record.project_code)) byCode.set(record.project_code, { record, category: label });
      }
    }
    return Array.from(byCode.values());
  }, [selectedFaculty, filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="app-page-header">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="app-page-title">ภาระงานโครงการ</h1>
            <p className="app-page-description">จำนวนโครงการหลักแยกตามประเภทและอาจารย์ผู้รับผิดชอบ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={String(selectedYear)} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[170px]" aria-label="ปีการศึกษา"><SelectValue /></SelectTrigger>
            <SelectContent>
              {academicYearOptions(data?.available_years || [], currentYear).map((year) => (
                <SelectItem key={year} value={String(year)}>ปีการศึกษา {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" title="รีเฟรชข้อมูล" onClick={() => setReloadKey((value) => value + 1)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="project-type-filter" className="text-sm font-medium">เลือกประเภทโครงการ</label>
        <Select value={filter} onValueChange={(value: ProjectFilter) => { setFilter(value); setSelectedFaculty(null); }}>
          <SelectTrigger id="project-type-filter" className="w-full sm:w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภท</SelectItem>
            {projectTypes.map(({ key, label }) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 p-6 text-center text-sm text-destructive" role="alert">
          {error} <Button variant="outline" size="sm" className="ml-2" onClick={() => setReloadKey((value) => value + 1)}>ลองอีกครั้ง</Button>
        </div>
      ) : loading && !data ? (
        <div className="flex h-52 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />กำลังโหลดข้อมูลภาระงาน...</div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-4 shadow-sm"><p className="text-sm text-muted-foreground">โครงการทั้งหมด</p><p className="mt-2 text-2xl font-bold">{summary.projects.toLocaleString("th-TH")} โครงการ</p><p className="mt-2 text-xs text-muted-foreground">ปีการศึกษา {data.academic_year}</p></div>
            <div className="rounded-lg border bg-card p-4 shadow-sm"><p className="text-sm text-muted-foreground">อาจารย์ผู้รับผิดชอบ</p><p className="mt-2 text-2xl font-bold">{summary.faculty.toLocaleString("th-TH")} คน</p><p className="mt-2 text-xs text-muted-foreground">จากอาจารย์ทั้งหมด {data.faculty.length} คน</p></div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อหรือรหัสอาจารย์" className="pl-9" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[220px]" aria-label="สถานะภาระงาน"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">แสดงอาจารย์ทั้งหมด</SelectItem><SelectItem value="with">มีภาระงาน</SelectItem><SelectItem value="without">ยังไม่มีข้อมูล</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <Table className="min-w-[1250px]">
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-[230px]">อาจารย์</TableHead>
                  <TableHead>โครงการ</TableHead>
                  {projectTypes.map(({ key, label }) => <TableHead key={key} className="min-w-[125px]">{label}</TableHead>)}
                  <TableHead>สถานะ</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {visibleFaculty.length === 0 ? <TableRow><TableCell colSpan={9} className="h-28 text-center text-muted-foreground">ไม่พบอาจารย์ตามเงื่อนไขที่เลือก</TableCell></TableRow> : visibleFaculty.map((faculty) => {
                    const total = countProjects(faculty, filter);
                    return <TableRow key={faculty.faculty_id} className="cursor-pointer" onClick={() => setSelectedFaculty(faculty)}>
                      <TableCell><p className="font-medium">{faculty.name}</p><p className="text-xs text-muted-foreground">{faculty.faculty_id}</p></TableCell>
                      <TableCell className="font-semibold">{total} โครงการ</TableCell>
                      {projectTypes.map(({ key }) => <TableCell key={key}>{faculty.project_workload[key]?.projects || 0}</TableCell>)}
                      <TableCell><span className={countProjects(faculty, filter) > 0 ? "text-emerald-700" : "text-muted-foreground"}>{countProjects(faculty, filter) > 0 ? "มีภาระงาน" : "ยังไม่มีข้อมูล"}</span></TableCell>
                    </TableRow>;
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="border-t px-4 py-2 text-xs text-muted-foreground">แสดง {visibleFaculty.length} จาก {data.faculty.length} คน</div>
          </div>
        </>
      ) : null}

      <Sheet open={Boolean(selectedFaculty)} onOpenChange={(open) => !open && setSelectedFaculty(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedFaculty && <>
            <SheetHeader className="text-left"><SheetTitle>{selectedFaculty.name}</SheetTitle><SheetDescription>โครงการหลักปีการศึกษา {data?.academic_year}</SheetDescription></SheetHeader>
            <div className="mt-6 space-y-2">
              {selectedProjects.length === 0 ? <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">ยังไม่มีโครงการในประเภทที่เลือก</p> : selectedProjects.map(({ record, category }) => (
                <div key={record.project_code} className="rounded-lg border p-3"><p className="font-medium">{record.project_code} · {record.project_name}</p><p className="mt-1 text-xs text-muted-foreground">{category}{record.strategy ? ` · ${record.strategy}` : ""}</p></div>
              ))}
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </div>
  );
}
