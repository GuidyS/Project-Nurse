import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  ChevronRight,
  FlaskConical,
  Landmark,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import api from "@/lib/axios";
import StudentLearningOutcomesPage from "@/components/pages/Teacher/StudentLearningOutcomesPage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type FacultyDimension = "teaching" | "research" | "academic-service" | "culture";

interface SubjectWorkload {
  code: string;
  name: string;
  clo: number;
  plo: number;
  ylo: number;
}

interface ResearchRecord {
  id: string;
  title: string;
  year: number;
  category: string;
}

interface ProjectRecord {
  id: string;
  project_name: string;
  activity_name: string | null;
  row_type: "project" | "activity";
  strategy: string;
}

interface ProjectWorkload {
  projects: number;
  activities: number;
  items: number;
  records: ProjectRecord[];
}

interface FacultyWorkload {
  faculty_id: string;
  name: string;
  profile_picture: string | null;
  teaching: {
    courses: number;
    clo: number;
    plo: number;
    ylo: number;
    subjects: SubjectWorkload[];
  };
  research: {
    count: number;
    meets_criterion: boolean;
    records: ResearchRecord[];
  };
  academic_service: ProjectWorkload;
  culture: ProjectWorkload;
}

interface WorkloadData {
  academic_year: number;
  available_years: number[];
  research_target_per_faculty: number;
  summary: {
    total_faculty: number;
    teaching: { faculty: number; courses: number; clo: number; plo: number; ylo: number };
    research: {
      outputs: number;
      faculty: number;
      ratio: number;
      meeting_target: number;
      below_target: number;
    };
    academic_service: { projects: number; items: number; faculty: number };
    culture: { projects: number; items: number; faculty: number };
  };
  faculty: FacultyWorkload[];
}

const dimensionConfig = {
  teaching: {
    title: "ภาระงานด้านการเรียนการสอน",
    description: "รายวิชาที่รับผิดชอบและการเชื่อมโยงผลลัพธ์การเรียนรู้ YLO, PLO และ CLO รายบุคคล",
    icon: BookOpenCheck,
    iconTone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  research: {
    title: "ภาระงานด้านงานวิจัย",
    description: "ผลงานวิจัยรายบุคคล โดยนับเจ้าของผลงานหลักเพียง 1 คนต่อ 1 ผลงาน",
    icon: FlaskConical,
    iconTone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  "academic-service": {
    title: "ภาระงานด้านบริการวิชาการ",
    description: "โครงการและกิจกรรมบริการวิชาการ แยกตามอาจารย์ผู้รับผิดชอบ",
    icon: Users,
    iconTone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  culture: {
    title: "ภาระงานด้านทำนุบำรุงศิลปวัฒนธรรม",
    description: "โครงการและกิจกรรมทำนุบำรุงศิลปวัฒนธรรม แยกตามอาจารย์ผู้รับผิดชอบ",
    icon: Landmark,
    iconTone: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
} satisfies Record<FacultyDimension, {
  title: string;
  description: string;
  icon: typeof BookOpenCheck;
  iconTone: string;
}>;

const formatNumber = (value: number) => new Intl.NumberFormat("th-TH").format(value);

const initials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return `${words.at(-2)?.charAt(0) || ""}${words.at(-1)?.charAt(0) || ""}` || "อ";
};

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

function FacultyIdentity({ faculty }: { faculty: FacultyWorkload }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 border">
        {faculty.profile_picture && <AvatarImage src={faculty.profile_picture} alt={faculty.name} />}
        <AvatarFallback className="text-xs">{initials(faculty.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{faculty.name}</p>
        <p className="text-xs text-muted-foreground">{faculty.faculty_id}</p>
      </div>
    </div>
  );
}

function WorkloadStatus({ hasWorkload, dimension }: { hasWorkload: boolean; dimension: FacultyDimension }) {
  const label = dimension === "research"
    ? (hasWorkload ? "ผ่านเกณฑ์" : "ต่ำกว่าเกณฑ์")
    : (hasWorkload ? "มีภาระงาน" : "ยังไม่มีข้อมูล");

  return (
    <Badge
      variant="outline"
      className={`rounded-md ${
        hasWorkload
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
      }`}
    >
      {label}
    </Badge>
  );
}

function facultyHasWorkload(faculty: FacultyWorkload, dimension: FacultyDimension) {
  if (dimension === "teaching") return faculty.teaching.courses > 0;
  if (dimension === "research") return faculty.research.meets_criterion;
  if (dimension === "academic-service") return faculty.academic_service.items > 0;
  return faculty.culture.items > 0;
}

export default function FacultyDimensionPage({ dimension }: { dimension: FacultyDimension }) {
  if (dimension === "teaching") {
    return <StudentLearningOutcomesPage />;
  }

  return <FacultyDimensionContent dimension={dimension} />;
}

function FacultyDimensionContent({ dimension }: { dimension: FacultyDimension }) {
  const config = dimensionConfig[dimension];
  const Icon = config.icon;
  const [data, setData] = useState<WorkloadData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyWorkload | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/index.php?page=get-faculty-workload", {
          params: selectedYear ? { year: selectedYear } : undefined,
        });
        if (response.data?.status !== "success" || !response.data?.data) {
          throw new Error(response.data?.message || "ไม่สามารถโหลดข้อมูลภาระงานได้");
        }
        if (!mounted) return;
        const nextData = response.data.data as WorkloadData;
        setData(nextData);
        setSelectedYear((current) => current ?? nextData.academic_year);
        setSelectedFaculty((current) =>
          current ? nextData.faculty.find((item) => item.faculty_id === current.faculty_id) || null : null,
        );
      } catch (requestError) {
        if (mounted) {
          setError(requestError instanceof Error ? requestError.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [selectedYear, reloadKey]);

  const filteredFaculty = useMemo(() => {
    if (!data) return [];
    const keyword = search.trim().toLocaleLowerCase("th-TH");
    return data.faculty.filter((faculty) => {
      const matchesSearch =
        keyword === "" ||
        faculty.name.toLocaleLowerCase("th-TH").includes(keyword) ||
        faculty.faculty_id.includes(keyword);
      const active = facultyHasWorkload(faculty, dimension);
      const matchesStatus = statusFilter === "all" || (statusFilter === "with" ? active : !active);
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter, dimension]);

  if (loading && !data) {
    return (
      <div className="flex h-72 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>กำลังโหลดข้อมูลภาระงาน...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
        <p className="text-sm text-destructive">{error || "ไม่พบข้อมูลภาระงาน"}</p>
        <Button variant="outline" size="sm" onClick={() => setReloadKey((value) => value + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" /> โหลดอีกครั้ง
        </Button>
      </div>
    );
  }

  const projectSummary = dimension === "academic-service" ? data.summary.academic_service : data.summary.culture;
  const projectKey = dimension === "academic-service" ? "academic_service" : "culture";
  const researchProgress = data.summary.total_faculty
    ? (data.summary.research.meeting_target / data.summary.total_faculty) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${config.iconTone}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[170px]">
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
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {dimension === "teaching" && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="รายวิชาที่มอบหมาย" value={`${formatNumber(data.summary.teaching.courses)} วิชา`} detail={`อาจารย์ผู้สอน ${data.summary.teaching.faculty} คน`} />
          <Metric label="อาจารย์ทั้งหมด" value={`${formatNumber(data.summary.total_faculty)} คน`} detail={`มีรายวิชา ${data.summary.teaching.faculty} คน`} />
          <Metric label="YLO ที่เชื่อมโยง" value={formatNumber(data.summary.teaching.ylo)} detail="นับรหัสไม่ซ้ำรายบุคคล" />
          <Metric label="PLO ที่เชื่อมโยง" value={formatNumber(data.summary.teaching.plo)} detail="นับรหัสไม่ซ้ำรายบุคคล" />
          <Metric label="CLO ที่กำหนด" value={formatNumber(data.summary.teaching.clo)} detail="นับรหัสไม่ซ้ำรายบุคคล" />
        </div>
      )}

      {dimension === "research" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="ผลงานวิจัย" value={`${formatNumber(data.summary.research.outputs)} ผลงาน`} detail="นับเจ้าของผลงานหลักคนเดียว" />
            <Metric label="สัดส่วนผลงานต่ออาจารย์" value={data.summary.research.ratio.toFixed(2)} detail={`เกณฑ์ ${data.research_target_per_faculty} ผลงาน/คน/ปี`} />
            <Metric label="ผ่านเกณฑ์" value={`${formatNumber(data.summary.research.meeting_target)} คน`} detail={`จากอาจารย์ ${data.summary.total_faculty} คน`} />
            <Metric label="ต่ำกว่าเกณฑ์" value={`${formatNumber(data.summary.research.below_target)} คน`} detail="ใช้สำหรับติดตามแผนพัฒนาผลงาน" />
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">อาจารย์ที่ผ่านเกณฑ์งานวิจัย</span>
              <span className="font-semibold">{researchProgress.toFixed(1)}%</span>
            </div>
            <Progress value={researchProgress} className="mt-3 h-2" />
          </div>
        </>
      )}

      {(dimension === "academic-service" || dimension === "culture") && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="โครงการทั้งหมด" value={`${formatNumber(projectSummary.projects)} โครงการ`} detail={`ปีการศึกษา ${data.academic_year}`} />
          <Metric label="โครงการ/กิจกรรม" value={`${formatNumber(projectSummary.items)} รายการ`} detail="รวมรายการที่ระบุผู้รับผิดชอบ" />
          <Metric label="อาจารย์ผู้รับผิดชอบ" value={`${formatNumber(projectSummary.faculty)} คน`} detail={`จากอาจารย์ทั้งหมด ${data.summary.total_faculty} คน`} />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาชื่อหรือรหัสอาจารย์"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">แสดงอาจารย์ทั้งหมด</SelectItem>
              <SelectItem value="with">{dimension === "research" ? "ผ่านเกณฑ์" : "มีภาระงาน"}</SelectItem>
              <SelectItem value="without">{dimension === "research" ? "ต่ำกว่าเกณฑ์" : "ยังไม่มีข้อมูล"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[300px]">อาจารย์</TableHead>
                  {dimension === "teaching" && <>
                    <TableHead>รายวิชา</TableHead><TableHead>YLO</TableHead><TableHead>PLO</TableHead><TableHead>CLO</TableHead>
                  </>}
                  {dimension === "research" && <>
                    <TableHead>ผลงานวิจัย</TableHead><TableHead>เกณฑ์ต่อปี</TableHead><TableHead>สถานะ</TableHead>
                  </>}
                  {(dimension === "academic-service" || dimension === "culture") && <>
                    <TableHead>โครงการ</TableHead><TableHead>กิจกรรม</TableHead><TableHead>รวมรายการ</TableHead>
                  </>}
                  {dimension !== "research" && <TableHead>สถานะ</TableHead>}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">ไม่พบอาจารย์ตามเงื่อนไขที่เลือก</TableCell>
                  </TableRow>
                ) : filteredFaculty.map((faculty) => {
                  const projectWorkload = faculty[projectKey] as ProjectWorkload;
                  const active = facultyHasWorkload(faculty, dimension);
                  return (
                    <TableRow key={faculty.faculty_id} className="cursor-pointer" onClick={() => setSelectedFaculty(faculty)}>
                      <TableCell><FacultyIdentity faculty={faculty} /></TableCell>
                      {dimension === "teaching" && <>
                        <TableCell className="font-semibold">{faculty.teaching.courses} วิชา</TableCell>
                        <TableCell>{faculty.teaching.ylo}</TableCell>
                        <TableCell>{faculty.teaching.plo}</TableCell>
                        <TableCell>{faculty.teaching.clo}</TableCell>
                      </>}
                      {dimension === "research" && <>
                        <TableCell className="font-semibold">{faculty.research.count} ผลงาน</TableCell>
                        <TableCell>{faculty.research.count}/{data.research_target_per_faculty}</TableCell>
                        <TableCell><WorkloadStatus hasWorkload={active} dimension={dimension} /></TableCell>
                      </>}
                      {(dimension === "academic-service" || dimension === "culture") && <>
                        <TableCell className="font-semibold">{projectWorkload.projects} โครงการ</TableCell>
                        <TableCell>{projectWorkload.activities} กิจกรรม</TableCell>
                        <TableCell>{projectWorkload.items} รายการ</TableCell>
                      </>}
                      {dimension !== "research" && <TableCell><WorkloadStatus hasWorkload={active} dimension={dimension} /></TableCell>}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={`ดูรายละเอียดของ ${faculty.name}`}
                          onClick={(event) => { event.stopPropagation(); setSelectedFaculty(faculty); }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            แสดง {formatNumber(filteredFaculty.length)} จาก {formatNumber(data.faculty.length)} คน
          </div>
        </div>
      </div>

      <Sheet open={Boolean(selectedFaculty)} onOpenChange={(open) => !open && setSelectedFaculty(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedFaculty && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle>{selectedFaculty.name}</SheetTitle>
                <SheetDescription>รหัส {selectedFaculty.faculty_id} · ปีการศึกษา {data.academic_year}</SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                {dimension === "teaching" && (
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold"><BookOpenCheck className="h-4 w-4 text-blue-500" />รายวิชาและผลลัพธ์การเรียนรู้</h3>
                    {selectedFaculty.teaching.subjects.length === 0 ? (
                      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">ยังไม่มีรายวิชาที่ได้รับมอบหมาย</p>
                    ) : (
                      <div className="divide-y rounded-lg border">
                        {selectedFaculty.teaching.subjects.map((subject) => (
                          <div key={subject.code} className="p-3">
                            <p className="text-sm font-medium">{subject.code} · {subject.name}</p>
                            <div className="mt-2 flex gap-1.5">
                              <Badge variant="secondary" className="rounded-md">YLO {subject.ylo}</Badge>
                              <Badge variant="secondary" className="rounded-md">PLO {subject.plo}</Badge>
                              <Badge variant="secondary" className="rounded-md">CLO {subject.clo}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {dimension === "research" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold"><FlaskConical className="h-4 w-4 text-emerald-500" />ผลงานวิจัยที่เป็นเจ้าของหลัก</h3>
                      <WorkloadStatus hasWorkload={selectedFaculty.research.meets_criterion} dimension={dimension} />
                    </div>
                    {selectedFaculty.research.records.length === 0 ? (
                      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">ยังไม่มีผลงานวิจัยในปีที่เลือก</p>
                    ) : (
                      <div className="divide-y rounded-lg border">
                        {selectedFaculty.research.records.map((record) => (
                          <div key={record.id} className="p-3">
                            <p className="text-sm font-medium">{record.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{record.category} · {record.year}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(dimension === "academic-service" || dimension === "culture") && (() => {
                  const records = selectedFaculty[projectKey].records;
                  return (
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <Sparkles className={`h-4 w-4 ${dimension === "culture" ? "text-rose-500" : "text-amber-500"}`} />
                        รายการโครงการและกิจกรรม
                      </h3>
                      {records.length === 0 ? (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">ยังไม่มีโครงการในปีที่เลือก</p>
                      ) : (
                        <div className="divide-y rounded-lg border">
                          {records.map((record) => (
                            <div key={record.id} className="p-3">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-medium">{record.activity_name || record.project_name}</p>
                                <Badge variant="outline" className="shrink-0 rounded-md text-[10px]">{record.row_type === "activity" ? "กิจกรรม" : "โครงการ"}</Badge>
                              </div>
                              {record.activity_name && <p className="mt-1 text-xs text-muted-foreground">{record.project_name}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
