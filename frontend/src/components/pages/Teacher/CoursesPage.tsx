import { useState, useEffect, useCallback, useMemo } from "react";
import { Edit, Loader2, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface Course {
  /** null = วิชาที่มีเฉพาะในหน้า "จัดการหลักสูตร" (ยังไม่มีในตาราง subject จึงยังลงทะเบียน/ให้คะแนนไม่ได้) */
  id: number | null;
  code: string;
  name: string;
  credits: number;
  students: number;
  semester: string;
  section: string;
  cloCount: number;
  instructor?: string;
  /** เกณฑ์ผ่านจากหน้า "จัดการหลักสูตร" (null = ใช้ค่าเริ่มต้นของระบบ) */
  pass_score?: number | string | null;
}

/** เกณฑ์ผ่านเริ่มต้น เมื่อหลักสูตรไม่ได้กำหนดไว้ */
const DEFAULT_PASS_SCORE = 70;

interface SubPlo {
  code: string;
  plo: string | null;
  description: string;
  /** คะแนนเต็ม/เกณฑ์ผ่านของข้อนี้ ตั้งไว้ที่หน้า "จัดการ CLO รายวิชา" */
  max_score: number | null;
  pass_score: number | null;
}

interface CloHeader {
  clo_id: number;
  clo_code: string;
  description: string;
  ylo: string | null;
  plos: { code: string; description: string }[];
  sub_plos: SubPlo[];
  /** ผลรวมคะแนนเต็ม/เกณฑ์ผ่านของ Sub PLO ทั้งหมดใน CLO นี้ */
  max_score: number | null;
  pass_score: number | null;
}

interface StudentGrade {
  id: number;
  studentId: string;
  name: string;
  /** คะแนนของแต่ละ CLO (key = clo_id) — null คือยังไม่ประเมิน */
  cloScores: Record<string, number | null>;
  /** คะแนน Sub PLO ที่กรอกไว้ (key = clo_id -> รหัส Sub PLO) */
  subScores: Record<string, Record<string, number>>;
  /** คะแนนรวมรายวิชา = ผลรวมคะแนน CLO ทุกตัว (เต็ม 100) */
  overall: number | null;
  status: string;
}

/** ข้อมูลที่โหลดมาแล้วของแต่ละรายวิชา (เก็บไว้สลับวิชาได้โดยไม่ต้องโหลดใหม่) */
interface CourseGradeData {
  headers: CloHeader[];
  students: StudentGrade[];
}

/** ร่างคะแนน: draft[subjectId][studentId][cloId][subCode] = ค่าที่พิมพ์ */
type ScoreDraft = Record<string, Record<string, Record<string, Record<string, string>>>>;

/** ตัดทศนิยมท้ายที่ไม่จำเป็นออก เช่น 12.50 -> 12.5 */
const formatScore = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? "-"
    : Number.isInteger(value) ? String(value) : String(Number(Number(value).toFixed(2)));

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // หน้าต่างให้คะแนน — เลือกวิชาได้จากในหน้าต่าง และคะแนนที่กรอกค้างไว้ไม่หายเมื่อสลับวิชา
  const [isScoringOpen, setIsScoringOpen] = useState(false);
  const [scoringCourseId, setScoringCourseId] = useState<string>("");
  const [courseData, setCourseData] = useState<Record<string, CourseGradeData>>({});
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [scoreSearch, setScoreSearch] = useState("");
  const [scoreDraft, setScoreDraft] = useState<ScoreDraft>({});
  const [isSavingScore, setIsSavingScore] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/index.php?page=get-my-courses");
      if (response.data && response.data.status === "success") {
        const mappedCourses = response.data.data.map((course: any) => ({
          id: course.id === null || course.id === undefined ? null : Number(course.id),
          code: course.code,
          name: course.name,
          credits: Number(course.credits),
          students: Number(course.students),
          // backend คำนวณข้อความภาคเรียนให้แล้ว ("1/2567" หรือ "-" ถ้ายังไม่กำหนด)
          // ห้าม fallback เป็นค่าคงที่ เพราะจะกลายเป็นข้อมูลปลอม
          semester: course.term_label || "-",
          section: course.section || "1",
          cloCount: Number(course.cloCount || 0),
          instructor: course.instructor,
          // เกณฑ์ผ่านจากหน้า "จัดการหลักสูตร" (null = ใช้ค่าเริ่มต้นของระบบ)
          pass_score: course.pass_score ?? null
        }));
        setCourses(mappedCourses);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถดึงข้อมูลรายวิชาได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ในการดึงข้อมูลรายวิชาได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /** สร้างร่างคะแนนเริ่มต้นของวิชาหนึ่งจากค่าที่บันทึกไว้ */
  const buildDraft = (students: StudentGrade[], headers: CloHeader[]) => {
    const draft: Record<string, Record<string, Record<string, string>>> = {};
    students.forEach((student) => {
      const perStudent: Record<string, Record<string, string>> = {};
      headers.forEach((clo) => {
        const cloKey = String(clo.clo_id);
        const saved = student.subScores?.[cloKey] || {};
        const perClo: Record<string, string> = {};
        clo.sub_plos.forEach((sub) => {
          const value = saved[sub.code];
          perClo[sub.code] = value === undefined || value === null ? "" : String(value);
        });
        perStudent[cloKey] = perClo;
      });
      draft[String(student.id)] = perStudent;
    });
    return draft;
  };

  /** โหลดข้อมูลของวิชา (ข้ามถ้าเคยโหลดแล้ว เพื่อไม่ทับร่างคะแนนที่กรอกค้างไว้) */
  const loadCourseData = useCallback(
    async (course: Course): Promise<boolean> => {
      if (course.id === null) return false;
      const key = String(course.id);
      if (courseData[key]) return true;

      setLoadingCourseId(key);
      try {
        const response = await api.get(`/index.php?page=get-course-students-clo&subject_id=${course.id}`);
        if (response.data && response.data.status === "success") {
          const payload = response.data.data || {};
          const headers: CloHeader[] = Array.isArray(payload.clo_headers) ? payload.clo_headers : [];
          const students: StudentGrade[] = (Array.isArray(payload.students) ? payload.students : []).map(
            (student: any) => ({
              id: Number(student.id),
              studentId: String(student.studentId ?? ""),
              name: student.name,
              cloScores: student.clo_scores || {},
              subScores: student.sub_scores || {},
              overall: student.overall === null || student.overall === undefined ? null : Number(student.overall),
              status: student.status || "pending",
            })
          );

          setCourseData((prev) => ({ ...prev, [key]: { headers, students } }));
          setScoreDraft((prev) => (prev[key] ? prev : { ...prev, [key]: buildDraft(students, headers) }));
          return true;
        }

        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถดึงรายชื่อนักศึกษาได้",
          variant: "destructive",
        });
        return false;
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงรายชื่อนักศึกษาได้",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoadingCourseId(null);
      }
    },
    [courseData, toast]
  );

  /** เปิดหน้าต่างให้คะแนนของวิชาที่กดมา */
  const openScoring = async (course: Course) => {
    if (course.id === null) {
      toast({
        title: "ยังให้คะแนนไม่ได้",
        description: `วิชา ${course.code} ยังไม่มีในตารางเรียนของระบบ จึงยังไม่มีนักศึกษาลงทะเบียน`,
        variant: "destructive",
      });
      return;
    }
    setScoringCourseId(String(course.id));
    setScoreSearch("");
    setIsScoringOpen(true);
    await loadCourseData(course);
  };

  /** สลับวิชาในหน้าต่าง — ร่างคะแนนของวิชาเดิมยังอยู่ */
  const switchCourse = async (nextId: string) => {
    setScoringCourseId(nextId);
    setScoreSearch("");
    const next = courses.find((c) => String(c.id) === nextId);
    if (next) await loadCourseData(next);
  };

  const scoringCourse = courses.find((c) => String(c.id) === scoringCourseId) || null;
  const activeData = courseData[scoringCourseId];
  const cloHeaders = useMemo(() => activeData?.headers ?? [], [activeData]);
  const studentGrades = useMemo(() => activeData?.students ?? [], [activeData]);

  /** CLO ที่ผูก Sub PLO ไว้แล้วเท่านั้นจึงให้คะแนนได้ */
  const scorableClos = useMemo(() => cloHeaders.filter((c) => c.sub_plos.length > 0), [cloHeaders]);

  const setDraftValue = (subjectKey: string, studentId: number, cloId: number, subCode: string, value: string) => {
    setScoreDraft((prev) => {
      const perSubject = prev[subjectKey] || {};
      const perStudent = perSubject[String(studentId)] || {};
      const perClo = perStudent[String(cloId)] || {};
      return {
        ...prev,
        [subjectKey]: {
          ...perSubject,
          [String(studentId)]: {
            ...perStudent,
            [String(cloId)]: { ...perClo, [subCode]: value },
          },
        },
      };
    });
  };

  /** คะแนน CLO = ผลรวมคะแนน Sub PLO ของ CLO นั้น (คะแนนเต็มมาจากหน้า "จัดการ CLO รายวิชา") */
  const draftCloScore = (subjectKey: string, studentId: number, clo: CloHeader): number | null => {
    if (clo.sub_plos.length === 0) return null;
    const perClo = scoreDraft[subjectKey]?.[String(studentId)]?.[String(clo.clo_id)] || {};
    let sum = 0;
    let filled = 0;
    clo.sub_plos.forEach((sub) => {
      const raw = perClo[sub.code];
      if (raw !== undefined && raw !== "") {
        sum += Number(raw) || 0;
        filled++;
      }
    });
    if (filled === 0) return null;
    return Math.round(sum * 100) / 100;
  };

  /** คะแนนรวมรายวิชาจากร่างปัจจุบัน = ผลรวมคะแนน CLO ทุกตัว */
  const draftOverall = (subjectKey: string, studentId: number, headers: CloHeader[]): number | null => {
    if (headers.length === 0) return null;
    let sum = 0;
    let filled = 0;
    headers.forEach((clo) => {
      const value = draftCloScore(subjectKey, studentId, clo);
      if (value !== null) {
        sum += value;
        filled++;
      }
    });
    if (filled === 0) return null;
    return Math.round(sum * 100) / 100;
  };

  /** รายการที่แก้ไปจากค่าที่บันทึกไว้ ของวิชาหนึ่ง */
  const collectChangedEntries = useCallback(
    (subjectKey: string) => {
      const data = courseData[subjectKey];
      if (!data) return [];

      const entries: { student_id: number; clo_id: number; scores: Record<string, number | null> }[] = [];
      data.students.forEach((student) => {
        data.headers.forEach((clo) => {
          if (clo.sub_plos.length === 0) return;
          const cloKey = String(clo.clo_id);
          const saved = student.subScores?.[cloKey] || {};
          const perClo = scoreDraft[subjectKey]?.[String(student.id)]?.[cloKey] || {};

          const scores: Record<string, number | null> = {};
          let changed = false;

          clo.sub_plos.forEach((sub) => {
            const raw = perClo[sub.code];
            const current = raw === undefined || raw === "" ? null : Number(raw);
            const before = saved[sub.code] === undefined || saved[sub.code] === null ? null : Number(saved[sub.code]);
            if (current !== before) changed = true;
            scores[sub.code] = current;
          });

          if (changed) {
            entries.push({ student_id: student.id, clo_id: clo.clo_id, scores });
          }
        });
      });
      return entries;
    },
    [courseData, scoreDraft]
  );

  /** วิชาที่ยังมีคะแนนค้างไม่ได้บันทึก (รวมวิชาที่สลับผ่านไปแล้ว) */
  const pendingSubjects = useMemo(() => {
    if (!isScoringOpen) return [];
    return Object.keys(courseData)
      .map((key) => ({ key, entries: collectChangedEntries(key) }))
      .filter((item) => item.entries.length > 0);
  }, [isScoringOpen, courseData, collectChangedEntries]);

  const changedCount = pendingSubjects.reduce((sum, item) => sum + item.entries.length, 0);

  const saveAllCloScores = async () => {
    // ตรวจช่วงคะแนนของทุกวิชาที่มีการแก้ไขก่อนส่ง
    for (const { key } of pendingSubjects) {
      const data = courseData[key];
      const course = courses.find((c) => String(c.id) === key);
      for (const student of data.students) {
        for (const clo of data.headers) {
          const perClo = scoreDraft[key]?.[String(student.id)]?.[String(clo.clo_id)] || {};
          for (const sub of clo.sub_plos) {
            const raw = perClo[sub.code];
            if (raw === undefined || raw === "") continue;
            const value = Number(raw);
            const max = sub.max_score ?? 100;
            if (Number.isNaN(value) || value < 0 || value > max) {
              toast({
                title: "คะแนนไม่ถูกต้อง",
                description: `${course?.code ?? ""} ${student.name} — Sub PLO ${sub.code} ต้องอยู่ระหว่าง 0-${formatScore(max)}`,
                variant: "destructive",
              });
              return;
            }
          }
        }
      }
    }

    if (pendingSubjects.length === 0) {
      toast({ title: "ไม่มีการเปลี่ยนแปลง", description: "ยังไม่ได้แก้ไขคะแนนใด ๆ" });
      return;
    }

    setIsSavingScore(true);
    try {
      let savedSubjects = 0;
      for (const { key, entries } of pendingSubjects) {
        const response = await api.post("/index.php?page=save-student-clo-scores", {
          subject_id: Number(key),
          entries,
        });

        if (!response.data || response.data.status !== "success") {
          const course = courses.find((c) => String(c.id) === key);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `${course?.code ?? ""} — ${response.data?.message || "ไม่สามารถบันทึกคะแนนได้"}`,
            variant: "destructive",
          });
          return;
        }

        const updated = response.data.data?.students || {};
        setCourseData((prev) => {
          const data = prev[key];
          if (!data) return prev;
          return {
            ...prev,
            [key]: {
              ...data,
              students: data.students.map((s) => {
                const result = updated[String(s.id)];
                if (!result) return s;
                return {
                  ...s,
                  cloScores: result.clo_scores || s.cloScores,
                  subScores: result.sub_scores || s.subScores,
                  overall: result.overall === null || result.overall === undefined ? null : Number(result.overall),
                };
              }),
            },
          };
        });
        savedSubjects++;
      }

      toast({
        title: "บันทึกสำเร็จ",
        description: savedSubjects > 1 ? `บันทึกคะแนนแล้ว ${savedSubjects} รายวิชา` : "บันทึกคะแนนเรียบร้อยแล้ว",
      });
      setIsScoringOpen(false);
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อบันทึกคะแนนได้",
        variant: "destructive",
      });
    } finally {
      setIsSavingScore(false);
    }
  };

  /** เกณฑ์ผ่านของวิชาที่เปิดอยู่ — ตั้งค่าที่หน้า "จัดการหลักสูตร" */
  const passScore =
    scoringCourse?.pass_score === null || scoringCourse?.pass_score === undefined || scoringCourse?.pass_score === ""
      ? DEFAULT_PASS_SCORE
      : Number(scoringCourse.pass_score);

  /** สีของคะแนนรวม: ผ่าน/ไม่ผ่านตามเกณฑ์ของรายวิชา */
  const overallClass = (value: number | null) => {
    if (value === null) return "text-muted-foreground";
    if (value >= passScore) return "text-success font-semibold";
    return "text-destructive font-semibold";
  };

  /** สีของคะแนน CLO: เทียบกับเกณฑ์ผ่านของ CLO นั้นเอง */
  const cloClass = (value: number | null, clo: CloHeader) => {
    if (value === null) return "text-muted-foreground";
    if (clo.pass_score === null) return "font-semibold";
    return value >= clo.pass_score ? "text-success font-semibold" : "text-destructive font-semibold";
  };

  const filteredScoreStudents = studentGrades.filter(
    (s) => s.name.includes(scoreSearch) || s.studentId.includes(scoreSearch)
  );

  // จำนวนคอลัมน์ทั้งหมดในตารางให้คะแนน (ใช้กับแถว "ไม่พบข้อมูล")
  const scoreColumnCount = 2 + scorableClos.reduce((sum, clo) => sum + clo.sub_plos.length + 1, 0) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">รายวิชาที่สอน {courses.length} วิชา</h1>
          <p className="app-page-description">จัดการรายวิชาและบันทึกผลการเรียน</p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>หน่วยกิต</TableHead>
              <TableHead>นักศึกษา</TableHead>
              <TableHead>ภาคเรียน</TableHead>
              <TableHead>CLO</TableHead>
              <TableHead>อาจารย์ผู้รับผิดชอบ</TableHead>
              <TableHead className="text-right">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  ไม่มีรายวิชาที่คุณรับผิดชอบ
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.code}>
                  <TableCell className="font-medium text-primary">{course.code}</TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">{course.name}</p>
                    <p className="text-xs text-muted-foreground">กลุ่ม {course.section}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{course.credits}</TableCell>
                  <TableCell className="text-muted-foreground">{course.students} คน</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.semester}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {course.cloCount} CLO
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {course.instructor ? (
                      <Badge className="bg-green-500 px-2 py-0.5 text-white">
                        {course.instructor}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="px-2 py-0.5">
                        ยังไม่มอบหมาย
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      disabled={course.id === null}
                      title={
                        course.id === null
                          ? "วิชานี้ยังไม่มีในตารางเรียนของระบบ จึงยังไม่มีนักศึกษาลงทะเบียน"
                          : "บันทึกผลการเรียน"
                      }
                      onClick={() => openScoring(course)}
                    >
                      <Edit className="h-4 w-4" /> บันทึกผลการเรียน
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* หน้าต่างให้คะแนน — Sub PLO ทุกข้อของทุก CLO อยู่ในตารางเดียว */}
      <Dialog open={isScoringOpen} onOpenChange={setIsScoringOpen}>
        {/* ตารางให้คะแนนกว้างตามจำนวน Sub PLO จึงใช้ความกว้างเต็มจอ */}
        <DialogContent
          className="app-dialog-screen flex flex-col overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex flex-wrap items-center gap-3">
              <span>บันทึกผลการเรียน</span>
              <Select value={scoringCourseId} onValueChange={switchCourse}>
                <SelectTrigger className="w-[22rem] max-w-full">
                  <SelectValue placeholder="เลือกรายวิชา" />
                </SelectTrigger>
                <SelectContent>
                  {courses
                    .filter((c) => c.id !== null)
                    .map((c) => (
                      <SelectItem key={c.code} value={String(c.id)}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {scoringCourse && (
                <span className="text-sm font-normal text-muted-foreground">
                  กลุ่ม {scoringCourse.section} · ภาคเรียน {scoringCourse.semester} · เกณฑ์ผ่าน {formatScore(passScore)} คะแนน
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              กรอกคะแนนของทุกข้อได้ในตารางเดียว เปลี่ยนรายวิชาได้โดยคะแนนที่กรอกค้างไว้จะไม่หาย แล้วกด "บันทึกทั้งหมด" ครั้งเดียวเมื่อกรอกครบ
            </DialogDescription>
          </DialogHeader>

          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={scoreSearch}
              onChange={(e) => setScoreSearch(e.target.value)}
              placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
              className="pl-9"
            />
          </div>

          {loadingCourseId === scoringCourseId ? (
            <div className="flex-1 min-h-0 flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : scorableClos.length === 0 ? (
            <div className="flex-1 min-h-0 flex items-center justify-center py-16 text-center text-muted-foreground px-6">
              รายวิชานี้ยังไม่มี CLO ที่ผูก Sub PLO และกำหนดคะแนนไว้ —
              กรุณาตั้งค่าที่หน้า "จัดการ CLO รายวิชา" ก่อน
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto overscroll-contain border rounded-lg [&>div]:overflow-visible">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead rowSpan={2} className="w-[120px] whitespace-nowrap align-bottom">รหัส นศ.</TableHead>
                    <TableHead rowSpan={2} className="min-w-[180px] whitespace-nowrap align-bottom">ชื่อ-นามสกุล</TableHead>
                    {scorableClos.map((clo) => (
                      <TableHead
                        key={clo.clo_id}
                        colSpan={clo.sub_plos.length + 1}
                        className="text-center whitespace-nowrap border-l border-border"
                      >
                        {clo.clo_code}
                        <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                          (เต็ม {formatScore(clo.max_score)})
                        </span>
                      </TableHead>
                    ))}
                    <TableHead rowSpan={2} className="text-center w-[110px] whitespace-nowrap align-bottom border-l border-border">
                      คะแนนรวม
                      <br />
                      <span className="text-[10px] font-normal text-muted-foreground">(เต็ม 100)</span>
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    {scorableClos.map((clo) => [
                      ...clo.sub_plos.map((sub) => (
                        <TableHead
                          key={`${clo.clo_id}-${sub.code}`}
                          className="text-center w-[110px] whitespace-nowrap border-l border-border"
                          title={sub.description || undefined}
                        >
                          Sub {sub.code}
                          <br />
                          <span className="text-[10px] font-normal text-muted-foreground">
                            (เต็ม {formatScore(sub.max_score)}
                            {sub.pass_score !== null ? ` / ผ่าน ${formatScore(sub.pass_score)}` : ""})
                          </span>
                        </TableHead>
                      )),
                      <TableHead
                        key={`${clo.clo_id}-total`}
                        className="text-center w-[90px] whitespace-nowrap bg-muted/40"
                      >
                        รวม
                      </TableHead>,
                    ])}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScoreStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={scoreColumnCount} className="py-8 text-center text-muted-foreground">
                        ไม่พบนักศึกษาที่ตรงกับคำค้นหา
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredScoreStudents.map((student) => {
                      const overall = draftOverall(scoringCourseId, student.id, scorableClos);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-sm whitespace-nowrap">{student.studentId}</TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{student.name}</TableCell>
                          {scorableClos.map((clo) => {
                            const cloScore = draftCloScore(scoringCourseId, student.id, clo);
                            return [
                              ...clo.sub_plos.map((sub) => (
                                <TableCell key={`${clo.clo_id}-${sub.code}`} className="text-center border-l border-border">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={sub.max_score ?? 100}
                                    placeholder="-"
                                    className="h-9 w-[5.5rem] mx-auto text-center"
                                    value={
                                      scoreDraft[scoringCourseId]?.[String(student.id)]?.[String(clo.clo_id)]?.[sub.code] ?? ""
                                    }
                                    onChange={(e) =>
                                      setDraftValue(scoringCourseId, student.id, clo.clo_id, sub.code, e.target.value)
                                    }
                                  />
                                </TableCell>
                              )),
                              <TableCell
                                key={`${clo.clo_id}-total`}
                                className={`text-center bg-muted/30 ${cloClass(cloScore, clo)}`}
                              >
                                {formatScore(cloScore)}
                              </TableCell>,
                            ];
                          })}
                          <TableCell className={`text-center border-l border-border ${overallClass(overall)}`}>
                            {formatScore(overall)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="shrink-0 gap-2 sm:justify-between">
            <span className="text-sm text-muted-foreground self-center">
              {changedCount === 0
                ? "ยังไม่มีการเปลี่ยนแปลง"
                : `มีคะแนนที่ยังไม่บันทึก ${changedCount} รายการ` +
                  (pendingSubjects.length > 1 ? ` จาก ${pendingSubjects.length} รายวิชา` : "")}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsScoringOpen(false)} disabled={isSavingScore}>
                ยกเลิก
              </Button>
              <Button onClick={saveAllCloScores} disabled={isSavingScore || changedCount === 0} className="gap-2">
                {isSavingScore ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                บันทึกทั้งหมด
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesPage;
