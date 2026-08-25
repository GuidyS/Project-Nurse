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
  UserRoundCheck,
  Users,
} from "lucide-react";
import api from "@/lib/axios";
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
  project_code: string;
  project_name: string;
  activity_name: string | null;
  row_type: "project" | "activity";
  strategy: string;
  responsible_person: string;
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
  active_dimensions: number;
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

const formatNumber = (value: number) => new Intl.NumberFormat("th-TH").format(value);

const initials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return `${words.at(-2)?.charAt(0) || ""}${words.at(-1)?.charAt(0) || ""}` || "อ";
};

function SummaryMetric({
  icon: Icon,
  title,
  value,
  detail,
  tone,
}: {
  icon: typeof BookOpenCheck;
  title: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

function ProjectRecordList({ records, emptyLabel }: { records: ProjectRecord[]; emptyLabel: string }) {
  if (records.length === 0) {
    return <p className="py-3 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="divide-y">
      {records.map((record) => (
        <div key={record.id} className="py-3 first:pt-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-5 text-foreground">{record.activity_name || record.project_name}</p>
            <Badge variant="outline" className="shrink-0 rounded-md text-[10px]">
              {record.row_type === "activity" ? "กิจกรรม" : "โครงการ"}
            </Badge>
          </div>
          {record.activity_name && (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{record.project_name}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FacultyWorkloadDashboard() {
  const [data, setData] = useState<WorkloadData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyWorkload | null>(null);
  const [search, setSearch] = useState("");
  const [researchStatus, setResearchStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadWorkload = async () => {
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
        if (!mounted) return;
        setError(requestError instanceof Error ? requestError.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadWorkload();
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
      const matchesStatus =
        researchStatus === "all" ||
        (researchStatus === "met" && faculty.research.meets_criterion) ||
        (researchStatus === "below" && !faculty.research.meets_criterion);

      return matchesSearch && matchesStatus;
    });
  }, [data, researchStatus, search]);

  if (loading && !data) {
    return (
      <div className="flex h-72 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>กำลังประมวลผลภาระงานอาจารย์...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
        <p className="text-sm text-destructive">{error || "ไม่พบข้อมูลภาระงาน"}</p>
        <Button variant="outline" size="sm" onClick={() => setReloadKey((value) => value + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          โหลดอีกครั้ง
        </Button>
      </div>
    );
  }

  const researchProgress = data.summary.total_faculty
    ? (data.summary.research.meeting_target / data.summary.total_faculty) * 100
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">ภาพรวมภาระงานอาจารย์ทั้งคณะ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            อาจารย์ประจำ {formatNumber(data.summary.total_faculty)} คน · เกณฑ์วิจัย {data.research_target_per_faculty} ผลงาน/คน/ปี
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder="ปีการศึกษา" />
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
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric
          icon={BookOpenCheck}
          title="การเรียนการสอน"
          value={`${formatNumber(data.summary.teaching.courses)} รายวิชา`}
          detail={`${formatNumber(data.summary.teaching.faculty)} คน · YLO ${data.summary.teaching.ylo} · PLO ${data.summary.teaching.plo} · CLO ${data.summary.teaching.clo}`}
          tone="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <SummaryMetric
          icon={FlaskConical}
          title="งานวิจัย"
          value={`${formatNumber(data.summary.research.outputs)} ผลงาน`}
          detail={`${formatNumber(data.summary.research.meeting_target)} คนผ่านเกณฑ์ · สัดส่วน ${data.summary.research.ratio.toFixed(2)} ผลงาน/คน`}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <SummaryMetric
          icon={Users}
          title="บริการวิชาการ"
          value={`${formatNumber(data.summary.academic_service.projects)} โครงการ`}
          detail={`${formatNumber(data.summary.academic_service.items)} โครงการ/กิจกรรม · ผู้รับผิดชอบ ${data.summary.academic_service.faculty} คน`}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <SummaryMetric
          icon={Landmark}
          title="ทำนุบำรุงศิลปวัฒนธรรม"
          value={`${formatNumber(data.summary.culture.projects)} โครงการ`}
          detail={`${formatNumber(data.summary.culture.items)} โครงการ/กิจกรรม · ผู้รับผิดชอบ ${data.summary.culture.faculty} คน`}
          tone="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserRoundCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">สัดส่วนอาจารย์ที่ผ่านเกณฑ์ผลงานวิจัย</p>
              <p className="text-xs text-muted-foreground">นับเจ้าของผลงานหลักเพียง 1 คนต่อผลงาน</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xl font-bold text-foreground">{researchProgress.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              ผ่าน {data.summary.research.meeting_target} · ต่ำกว่าเกณฑ์ {data.summary.research.below_target} คน
            </p>
          </div>
        </div>
        <Progress value={researchProgress} className="mt-4 h-2" />
      </div>

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
          <Select value={researchStatus} onValueChange={setResearchStatus}>
            <SelectTrigger className="w-full md:w-[210px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">สถานะวิจัยทั้งหมด</SelectItem>
              <SelectItem value="met">ผ่านเกณฑ์วิจัย</SelectItem>
              <SelectItem value="below">ต่ำกว่าเกณฑ์วิจัย</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[260px]">อาจารย์</TableHead>
                  <TableHead>การสอน</TableHead>
                  <TableHead>วิจัย</TableHead>
                  <TableHead>บริการวิชาการ</TableHead>
                  <TableHead>ศิลปวัฒนธรรม</TableHead>
                  <TableHead>เกณฑ์วิจัย</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                      ไม่พบอาจารย์ตามเงื่อนไขที่เลือก
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaculty.map((faculty) => (
                    <TableRow
                      key={faculty.faculty_id}
                      className="cursor-pointer"
                      tabIndex={0}
                      onClick={() => setSelectedFaculty(faculty)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setSelectedFaculty(faculty);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            {faculty.profile_picture && <AvatarImage src={faculty.profile_picture} alt={faculty.name} />}
                            <AvatarFallback className="text-xs">{initials(faculty.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{faculty.name}</p>
                            <p className="text-xs text-muted-foreground">{faculty.faculty_id} · {faculty.active_dimensions}/4 ด้าน</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-foreground">{faculty.teaching.courses} วิชา</p>
                        <p className="text-xs text-muted-foreground">Y {faculty.teaching.ylo} · P {faculty.teaching.plo} · C {faculty.teaching.clo}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-foreground">{faculty.research.count} ผลงาน</p>
                        <p className="text-xs text-muted-foreground">เจ้าของผลงานหลัก</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-foreground">{faculty.academic_service.projects} โครงการ</p>
                        <p className="text-xs text-muted-foreground">{faculty.academic_service.activities} กิจกรรม</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-foreground">{faculty.culture.projects} โครงการ</p>
                        <p className="text-xs text-muted-foreground">{faculty.culture.activities} กิจกรรม</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-md ${
                            faculty.research.meets_criterion
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {faculty.research.meets_criterion ? "ผ่านเกณฑ์" : "ต่ำกว่าเกณฑ์"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={`ดูภาระงานของ ${faculty.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedFaculty(faculty);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
                <div className="flex items-center gap-3 pr-8">
                  <Avatar className="h-12 w-12 border">
                    {selectedFaculty.profile_picture && (
                      <AvatarImage src={selectedFaculty.profile_picture} alt={selectedFaculty.name} />
                    )}
                    <AvatarFallback>{initials(selectedFaculty.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-lg">{selectedFaculty.name}</SheetTitle>
                    <SheetDescription>
                      รหัส {selectedFaculty.faculty_id} · ปีการศึกษา {data.academic_year}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["การสอน", `${selectedFaculty.teaching.courses} วิชา`],
                  ["วิจัย", `${selectedFaculty.research.count} ผลงาน`],
                  ["บริการวิชาการ", `${selectedFaculty.academic_service.projects} โครงการ`],
                  ["ศิลปวัฒนธรรม", `${selectedFaculty.culture.projects} โครงการ`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-6">
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpenCheck className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-semibold">การเรียนการสอน (YLO, PLO, CLO)</h3>
                  </div>
                  {selectedFaculty.teaching.subjects.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">ยังไม่มีรายวิชาที่ได้รับมอบหมาย</p>
                  ) : (
                    <div className="divide-y rounded-lg border">
                      {selectedFaculty.teaching.subjects.map((subject) => (
                        <div key={subject.code} className="p-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-medium">{subject.code}</p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">{subject.name}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <Badge variant="secondary" className="rounded-md">YLO {subject.ylo}</Badge>
                              <Badge variant="secondary" className="rounded-md">PLO {subject.plo}</Badge>
                              <Badge variant="secondary" className="rounded-md">CLO {subject.clo}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-sm font-semibold">งานวิจัย</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-md ${
                        selectedFaculty.research.meets_criterion
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedFaculty.research.count}/{data.research_target_per_faculty} ผลงาน
                    </Badge>
                  </div>
                  {selectedFaculty.research.records.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">ยังไม่มีผลงานวิจัยในปีที่เลือก</p>
                  ) : (
                    <div className="divide-y rounded-lg border">
                      {selectedFaculty.research.records.map((record) => (
                        <div key={record.id} className="p-3">
                          <p className="text-sm font-medium leading-5">{record.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{record.category} · {record.year}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold">บริการวิชาการ</h3>
                  </div>
                  <div className="rounded-lg border p-3">
                    <ProjectRecordList
                      records={selectedFaculty.academic_service.records}
                      emptyLabel="ยังไม่มีโครงการบริการวิชาการในปีที่เลือก"
                    />
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-rose-500" />
                    <h3 className="text-sm font-semibold">ทำนุบำรุงศิลปวัฒนธรรม</h3>
                  </div>
                  <div className="rounded-lg border p-3">
                    <ProjectRecordList
                      records={selectedFaculty.culture.records}
                      emptyLabel="ยังไม่มีโครงการทำนุบำรุงศิลปวัฒนธรรมในปีที่เลือก"
                    />
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
