import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  Target,
  XCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface OutcomeItem {
  code: string;
  subject_code?: string;
  score: number | null;
  passed: boolean;
}

interface OutcomeResult {
  assessed: number;
  passed: number;
  rate: number;
  codes?: string[];
  scores?: Record<string, number>;
  items?: OutcomeItem[];
}

interface StudentOutcome {
  student_id: string;
  student_code: string;
  name: string;
  year_level: number;
  student_status: string;
  enrolled_courses: number;
  ylo: OutcomeResult;
  plo: OutcomeResult;
  clo: OutcomeResult & { defined: number };
  outcome_status: "pending" | "passed" | "at_risk";
}

interface StudentOutcomeData {
  academic_year: number;
  available_years: number[];
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
  students: StudentOutcome[];
}

const formatNumber = (value: number) => new Intl.NumberFormat("th-TH").format(value);

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function OutcomeValue({ outcome, defined }: { outcome: OutcomeResult; defined?: number }) {
  if (outcome.assessed === 0) {
    return (
      <div>
        <p className="font-medium text-foreground">0/{defined ?? 0}</p>
        <p className="text-xs text-muted-foreground">ยังไม่มีผลประเมิน</p>
      </div>
    );
  }

  const scoreText = Object.entries(outcome.scores ?? {})
    .map(([code, score]) => `${code} ${score}%`)
    .join(" · ");

  return (
    <div>
      <p className="font-medium text-foreground">{outcome.passed}/{outcome.assessed}</p>
      <p className="max-w-[220px] text-xs text-muted-foreground">{scoreText || `ผ่าน ${outcome.rate}%`}</p>
    </div>
  );
}

function OutcomeItemList({ items }: { items?: OutcomeItem[] }) {
  if (!items?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
      {items.map((item) => {
        const ItemIcon = item.passed ? CheckCircle2 : XCircle;
        return (
          <Badge
            key={`${item.subject_code ?? "outcome"}-${item.code}`}
            variant="outline"
            className={item.passed
              ? "gap-1.5 rounded-md border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "gap-1.5 rounded-md border-red-500/30 bg-red-500/10 text-red-600"}
          >
            <ItemIcon className="h-3.5 w-3.5" />
            {item.subject_code ? `${item.subject_code} · ` : ""}{item.code}
            {item.score !== null ? ` · ${item.score}%` : ""}
            · {item.passed ? "ผ่าน" : "ไม่ผ่าน"}
          </Badge>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: StudentOutcome["outcome_status"] }) {
  if (status === "passed") {
    return <Badge className="rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">ผ่านเกณฑ์</Badge>;
  }
  if (status === "at_risk") {
    return <Badge className="rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/10">ต้องติดตาม</Badge>;
  }
  return <Badge variant="outline" className="rounded-md text-muted-foreground">ยังไม่มีผลประเมิน</Badge>;
}

export default function StudentLearningOutcomesPage() {
  const [data, setData] = useState<StudentOutcomeData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentOutcome | null>(null);
  const [search, setSearch] = useState("");
  const [yearLevel, setYearLevel] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/index.php?page=get-student-learning-outcomes", {
          params: selectedYear ? { year: selectedYear } : undefined,
        });
        if (response.data?.status !== "success" || !response.data?.data) {
          throw new Error(response.data?.message || "ไม่สามารถโหลดผลลัพธ์การเรียนรู้ได้");
        }
        if (!mounted) return;
        const nextData = response.data.data as StudentOutcomeData;
        setData(nextData);
        setSelectedYear((current) => current ?? nextData.academic_year);
        setSelectedStudent((current) =>
          current ? nextData.students.find((student) => student.student_id === current.student_id) || null : null,
        );
      } catch (requestError) {
        if (mounted) setError(requestError instanceof Error ? requestError.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [selectedYear, reloadKey]);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const keyword = search.trim().toLocaleLowerCase("th-TH");
    return data.students.filter((student) => {
      const matchesSearch = keyword === "" ||
        student.name.toLocaleLowerCase("th-TH").includes(keyword) ||
        student.student_id.includes(keyword) ||
        student.student_code.toLocaleLowerCase().includes(keyword);
      const matchesLevel = yearLevel === "all" || student.year_level === Number(yearLevel);
      return matchesSearch && matchesLevel;
    });
  }, [data, search, yearLevel]);

  if (loading && !data) {
    return <div className="flex h-72 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />กำลังโหลดรายชื่อนักศึกษา...</div>;
  }

  if (error || !data) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
        <p className="text-sm text-destructive">{error || "ไม่พบข้อมูลนักศึกษา"}</p>
        <Button variant="outline" size="sm" onClick={() => setReloadKey((value) => value + 1)}><RefreshCw className="mr-2 h-4 w-4" />โหลดอีกครั้ง</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-500"><GraduationCap className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ผลลัพธ์การเรียนรู้รายบุคคล</h1>
            <p className="mt-1 text-sm text-muted-foreground">ติดตาม YLO, PLO และ CLO ของนักศึกษาที่ลงทะเบียนในปีการศึกษาที่เลือก</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>{data.available_years.map((year) => <SelectItem key={year} value={String(year)}>ปีการศึกษา {year}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="icon" title="รีเฟรชข้อมูล" onClick={() => setReloadKey((value) => value + 1)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="นักศึกษาที่ลงทะเบียน" value={`${formatNumber(data.summary.students)} คน`} detail={`ปีการศึกษา ${data.academic_year}`} />
        <Metric label="รายวิชาที่เปิดสอน" value={`${formatNumber(data.summary.courses)} วิชา`} detail="นับรายวิชาที่มีการลงทะเบียน" />
        <Metric label="ผลประเมิน YLO" value={formatNumber(data.summary.ylo_assessed)} detail={`นักศึกษาที่มีผล ${data.summary.students_assessed} คน`} />
        <Metric label="ผลประเมิน PLO" value={formatNumber(data.summary.plo_assessed)} detail={`ผ่านภาพรวม ${data.summary.students_passed} คน`} />
        <Metric label="ผลประเมิน CLO" value={formatNumber(data.summary.clo_assessed)} detail={`CLO ที่เชื่อมโยง ${formatNumber(data.summary.clo_defined)} รายการ`} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อหรือรหัสนักศึกษา" className="pl-9" /></div>
          <Select value={yearLevel} onValueChange={setYearLevel}>
            <SelectTrigger className="w-full md:w-[190px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">ชั้นปีทั้งหมด</SelectItem>{[1,2,3,4].map((level) => <SelectItem key={level} value={String(level)}>ชั้นปี {level}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40"><TableHead className="w-[320px]">นักศึกษา</TableHead><TableHead>ชั้นปี</TableHead><TableHead>รายวิชา</TableHead><TableHead>YLO</TableHead><TableHead>PLO</TableHead><TableHead>CLO</TableHead><TableHead>สถานะ</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? <TableRow><TableCell colSpan={8} className="h-28 text-center text-muted-foreground">ไม่พบนักศึกษาในปีการศึกษาหรือเงื่อนไขที่เลือก</TableCell></TableRow> : filteredStudents.map((student) => (
                  <TableRow key={student.student_id} className="cursor-pointer" onClick={() => setSelectedStudent(student)}>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9 border"><AvatarFallback className="text-xs">{student.name.trim().charAt(0) || "น"}</AvatarFallback></Avatar><div><p className="text-sm font-medium text-foreground">{student.name}</p><p className="text-xs text-muted-foreground">{student.student_id}</p></div></div></TableCell>
                    <TableCell>{student.year_level || "-"}</TableCell>
                    <TableCell className="font-medium">{student.enrolled_courses} วิชา</TableCell>
                    <TableCell><OutcomeValue outcome={student.ylo} /></TableCell>
                    <TableCell><OutcomeValue outcome={student.plo} /></TableCell>
                    <TableCell><OutcomeValue outcome={student.clo} defined={student.clo.defined} /></TableCell>
                    <TableCell><StatusBadge status={student.outcome_status} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" title={`ดูผลลัพธ์ของ ${student.name}`} onClick={(event) => { event.stopPropagation(); setSelectedStudent(student); }}><ChevronRight className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">แสดง {formatNumber(filteredStudents.length)} จาก {formatNumber(data.students.length)} คน</div>
        </div>
      </div>

      <Sheet open={Boolean(selectedStudent)} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedStudent && <><SheetHeader className="text-left"><SheetTitle>{selectedStudent.name}</SheetTitle><SheetDescription>รหัสนักศึกษา {selectedStudent.student_id} · ชั้นปี {selectedStudent.year_level || "-"}</SheetDescription></SheetHeader><div className="mt-6 space-y-4">
            <div className="rounded-lg border p-4"><div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-500" /><h3 className="text-sm font-semibold">การลงทะเบียนเรียน</h3></div><p className="mt-3 text-2xl font-bold">{selectedStudent.enrolled_courses} รายวิชา</p><p className="mt-1 text-xs text-muted-foreground">ปีการศึกษา {data.academic_year}</p></div>
            {[["YLO", selectedStudent.ylo, Target], ["PLO", selectedStudent.plo, Layers3]].map(([label, outcome, OutcomeIcon]) => { const result = outcome as OutcomeResult; const Icon = OutcomeIcon as typeof Target; return <div key={label as string} className="rounded-lg border p-4"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-blue-500" /><h3 className="text-sm font-semibold">ผลประเมิน {label as string}</h3></div><p className="mt-3 text-lg font-semibold">ผ่าน {result.passed} จาก {result.assessed} รายการ</p><p className="mt-1 text-xs text-muted-foreground">{result.assessed > 0 ? `คิดเป็น ${result.rate}%` : "ยังไม่มีผลประเมินที่บันทึกในระบบ"}</p><OutcomeItemList items={result.items} /></div>; })}
            <div className="rounded-lg border p-4"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /><h3 className="text-sm font-semibold">ผลประเมิน CLO</h3></div><p className="mt-3 text-lg font-semibold">ผ่าน {selectedStudent.clo.passed} จาก {selectedStudent.clo.assessed} รายการ</p><p className="mt-1 text-xs text-muted-foreground">{selectedStudent.clo.assessed > 0 ? `คิดเป็น ${selectedStudent.clo.rate}% จาก CLO ที่กำหนดไว้ ${selectedStudent.clo.defined} รายการ` : `ยังไม่มีผลประเมิน จาก CLO ที่กำหนดไว้ ${selectedStudent.clo.defined} รายการ`}</p><OutcomeItemList items={selectedStudent.clo.items} /></div>
          </div></>}
        </SheetContent>
      </Sheet>
    </div>
  );
}
