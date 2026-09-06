import { useState, useEffect, useCallback } from "react";
import { BookOpen, Users, Edit, Eye, MoreVertical, Plus, Search } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  id: number;
  code: string;
  name: string;
  credits: number;
  students: number;
  semester: string;
  section: string;
  cloCount: number;
  instructor?: string;
}

interface SubPlo {
  code: string;
  plo: string | null;
  description: string;
}

interface CloHeader {
  clo_id: number;
  clo_code: string;
  description: string;
  ylo: string | null;
  plos: { code: string; description: string }[];
  sub_plos: SubPlo[];
}

interface StudentGrade {
  id: number;
  studentId: string;
  name: string;
  /** คะแนนของแต่ละ CLO (key = clo_id) — null คือยังไม่ประเมิน */
  cloScores: Record<string, number | null>;
  /** คะแนน Sub PLO ที่กรอกไว้ (key = clo_id -> รหัส Sub PLO) */
  subScores: Record<string, Record<string, number>>;
  /** คะแนนรวมรายวิชา = ผลรวมคะแนน CLO ÷ จำนวน CLO ทั้งหมด */
  overall: number | null;
  status: string;
}

const CoursesPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [cloHeaders, setCloHeaders] = useState<CloHeader[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // หน้าต่างให้คะแนน: สลับ CLO ได้อิสระ กรอกครบทุกคนแล้วค่อยบันทึกทีเดียว
  const [isScoringOpen, setIsScoringOpen] = useState(false);
  const [activeCloId, setActiveCloId] = useState<string>("");
  const [scoreSearch, setScoreSearch] = useState("");
  /** ร่างคะแนนทั้งหมด: draft[studentId][cloId][subCode] = ค่าที่พิมพ์ */
  const [scoreDraft, setScoreDraft] = useState<Record<string, Record<string, Record<string, string>>>>({});
  const [isSavingScore, setIsSavingScore] = useState(false);
  const { toast } = useToast();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/index.php?page=get-my-courses");
      if (response.data && response.data.status === "success") {
        const mappedCourses = response.data.data.map((course: any) => ({
          id: Number(course.id),
          code: course.code,
          name: course.name,
          credits: Number(course.credits),
          students: Number(course.students),
          // backend คำนวณข้อความภาคเรียนให้แล้ว ("1/2567" หรือ "-" ถ้ายังไม่กำหนด)
          // ห้าม fallback เป็นค่าคงที่ เพราะจะกลายเป็นข้อมูลปลอม
          semester: course.term_label || "-",
          section: course.section || "1",
          cloCount: Number(course.cloCount || 0),
          instructor: course.instructor
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

  const openGradeDialog = async (course: Course, viewMode: boolean = false) => {
    setSelectedCourse(course);
    setIsGradeDialogOpen(true);
    setViewOnly(viewMode);
    setSearchQuery("");
    setStudentGrades([]); // Clear old students
    setCloHeaders([]);

    try {
      const response = await api.get(`/index.php?page=get-course-students-clo&subject_id=${course.id}`);
      if (response.data && response.data.status === "success") {
        const payload = response.data.data || {};
        const headers: CloHeader[] = Array.isArray(payload.clo_headers) ? payload.clo_headers : [];
        setCloHeaders(headers);

        const mappedStudents: StudentGrade[] = (Array.isArray(payload.students) ? payload.students : []).map(
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
        setStudentGrades(mappedStudents);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถดึงรายชื่อนักศึกษาได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงรายชื่อนักศึกษาได้",
        variant: "destructive",
      });
    }
  };

  /** สร้างร่างคะแนนของนักศึกษาทุกคน x ทุก CLO จากค่าที่บันทึกไว้ */
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

  /** เปิดหน้าต่างให้คะแนน โดยเริ่มที่ CLO ที่กดมา */
  const openScoreDialog = (clo?: CloHeader) => {
    if (cloHeaders.length === 0) return;
    const scorable = cloHeaders.filter((c) => c.sub_plos.length > 0);
    if (scorable.length === 0) {
      toast({
        title: "ยังให้คะแนนไม่ได้",
        description: 'CLO ของรายวิชานี้ยังไม่ได้ผูก Sub PLO — กรุณาติ๊ก Sub PLO ในหน้า "จัดการ CLO รายวิชา" ก่อน',
        variant: "destructive",
      });
      return;
    }
    const start = clo && clo.sub_plos.length > 0 ? clo : scorable[0];
    setActiveCloId(String(start.clo_id));
    setScoreDraft(buildDraft(studentGrades, cloHeaders));
    setScoreSearch("");
    setIsScoringOpen(true);
  };

  const closeScoreDialog = () => {
    setIsScoringOpen(false);
    setScoreDraft({});
    setScoreSearch("");
  };

  const activeClo = cloHeaders.find((c) => String(c.clo_id) === activeCloId) || null;

  const setDraftValue = (studentId: number, cloId: number, subCode: string, value: string) => {
    setScoreDraft((prev) => ({
      ...prev,
      [String(studentId)]: {
        ...(prev[String(studentId)] || {}),
        [String(cloId)]: {
          ...((prev[String(studentId)] || {})[String(cloId)] || {}),
          [subCode]: value,
        },
      },
    }));
  };

  /**
   * คะแนน CLO = ผลรวมคะแนน Sub PLO ÷ จำนวน Sub PLO ทั้งหมดของ CLO นั้น
   * (Sub PLO ที่ยังไม่กรอกนับเป็น 0 ในตัวตั้ง แต่ยังนับเป็นตัวหาร)
   */
  const draftCloScore = (studentId: number, clo: CloHeader): number | null => {
    if (clo.sub_plos.length === 0) return null;
    const perClo = scoreDraft[String(studentId)]?.[String(clo.clo_id)] || {};
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
    return Math.round((sum / clo.sub_plos.length) * 100) / 100;
  };

  /** คะแนนรวมรายวิชาจากร่างปัจจุบัน = ผลรวมคะแนน CLO ÷ จำนวน CLO ทั้งหมด */
  const draftOverall = (studentId: number): number | null => {
    if (cloHeaders.length === 0) return null;
    let sum = 0;
    let filled = 0;
    cloHeaders.forEach((clo) => {
      const value = draftCloScore(studentId, clo);
      if (value !== null) {
        sum += value;
        filled++;
      }
    });
    if (filled === 0) return null;
    return Math.round((sum / cloHeaders.length) * 100) / 100;
  };

  /** รายการที่แก้ไปจากค่าที่บันทึกไว้ (ใช้ตัดสินว่ามีอะไรค้างต้องบันทึก) */
  const collectChangedEntries = () => {
    const entries: { student_id: number; clo_id: number; scores: Record<string, number | null> }[] = [];

    studentGrades.forEach((student) => {
      cloHeaders.forEach((clo) => {
        if (clo.sub_plos.length === 0) return;
        const cloKey = String(clo.clo_id);
        const saved = student.subScores?.[cloKey] || {};
        const perClo = scoreDraft[String(student.id)]?.[cloKey] || {};

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
  };

  const changedCount = isScoringOpen ? collectChangedEntries().length : 0;

  const saveAllCloScores = async () => {
    if (!selectedCourse) return;

    // ตรวจช่วงคะแนนทั้งหมดก่อนส่ง
    for (const student of studentGrades) {
      for (const clo of cloHeaders) {
        const perClo = scoreDraft[String(student.id)]?.[String(clo.clo_id)] || {};
        for (const sub of clo.sub_plos) {
          const raw = perClo[sub.code];
          if (raw === undefined || raw === "") continue;
          const value = Number(raw);
          if (Number.isNaN(value) || value < 0 || value > 100) {
            toast({
              title: "คะแนนไม่ถูกต้อง",
              description: `${student.name} — ${clo.clo_code} Sub PLO ${sub.code} ต้องอยู่ระหว่าง 0-100`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    const entries = collectChangedEntries();
    if (entries.length === 0) {
      toast({ title: "ไม่มีการเปลี่ยนแปลง", description: "ยังไม่ได้แก้ไขคะแนนใด ๆ" });
      return;
    }

    setIsSavingScore(true);
    try {
      const response = await api.post("/index.php?page=save-student-clo-scores", {
        subject_id: selectedCourse.id,
        entries,
      });

      if (response.data && response.data.status === "success") {
        const updated = response.data.data?.students || {};
        setStudentGrades((prev) =>
          prev.map((s) => {
            const result = updated[String(s.id)];
            if (!result) return s;
            return {
              ...s,
              cloScores: result.clo_scores || s.cloScores,
              subScores: result.sub_scores || s.subScores,
              overall:
                result.overall === null || result.overall === undefined ? null : Number(result.overall),
            };
          })
        );
        toast({ title: "บันทึกสำเร็จ", description: response.data.message });
        closeScoreDialog();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถบันทึกคะแนนได้",
          variant: "destructive",
        });
      }
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

  const filteredStudents = studentGrades.filter(
    (s) =>
      s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
  );

  /** สีของคะแนน: ≥70 ผ่านตามเกณฑ์คณะ */
  const scoreClass = (value: number | null) => {
    if (value === null) return "text-muted-foreground";
    if (value >= 70) return "text-success font-semibold";
    return "text-destructive font-semibold";
  };

  const formatScore = (value: number | null) =>
    value === null || value === undefined ? "-" : Number(value).toFixed(2).replace(/\.00$/, "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground leading-snug">รายวิชาที่สอน</h1>
          <p className="text-muted-foreground mt-1">จัดการรายวิชาและบันทึกผลการเรียน</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              <p className="text-xs text-muted-foreground">รายวิชาทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {courses.reduce((sum, c) => sum + c.students, 0)}
              </p>
              <p className="text-xs text-muted-foreground">นักศึกษาทั้งหมด</p>
            </div>
          </div>
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
            {courses.map((course) => (
              <TableRow key={course.id}>
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
                    <Badge className="bg-green-500 hover:bg-green-600 px-2 py-0.5 text-white">
                      {course.instructor}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="px-2 py-0.5">
                      ยังไม่มอบหมาย
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" onClick={() => openGradeDialog(course, false)}>
                        <Edit className="h-4 w-4" /> บันทึก/แก้ไขผลการเรียน
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => openGradeDialog(course, true)}>
                        <Eye className="h-4 w-4" /> ดูรายชื่อนักศึกษา
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Plus className="h-4 w-4" /> มอบหมาย Course Instructor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="app-dialog-5xl overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {viewOnly ? "รายชื่อนักศึกษา" : "บันทึก/แก้ไขผลการเรียน"} - {selectedCourse?.code} {selectedCourse?.name}
            </DialogTitle>
            <DialogDescription>
              กลุ่ม {selectedCourse?.section} ภาคเรียน {selectedCourse?.semester}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Grades Table */}
            <div className="flex-1 overflow-auto overscroll-contain border rounded-lg [&>div]:overflow-visible">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="w-[120px] whitespace-nowrap">รหัส นศ.</TableHead>
                    <TableHead className="whitespace-nowrap">ชื่อ-นามสกุล</TableHead>
                    {cloHeaders.map((clo) => (
                      <TableHead key={clo.clo_id} className="text-center w-[110px] whitespace-nowrap">
                        {clo.clo_code}
                        <br />
                        <span className="text-[10px] font-normal text-muted-foreground">
                          ({clo.sub_plos.length} Sub PLO)
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="text-center w-[110px] whitespace-nowrap">
                      คะแนนรวม
                      <br />
                      <span className="text-[10px] font-normal text-muted-foreground">
                        (÷ {cloHeaders.length || "-"} CLO)
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cloHeaders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                        รายวิชานี้ยังไม่ได้กำหนด CLO — กรุณาเพิ่ม CLO ในหน้า "จัดการ CLO รายวิชา" ก่อน
                      </TableCell>
                    </TableRow>
                  )}
                  {cloHeaders.length > 0 &&
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm whitespace-nowrap">{student.studentId}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        {cloHeaders.map((clo) => {
                          const value = student.cloScores?.[String(clo.clo_id)] ?? null;
                          return (
                            <TableCell key={clo.clo_id} className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={viewOnly || clo.sub_plos.length === 0}
                                onClick={() => openScoreDialog(clo)}
                                className={`h-8 w-full ${scoreClass(value)}`}
                                title={
                                  clo.sub_plos.length === 0
                                    ? "CLO นี้ยังไม่ได้ผูก Sub PLO"
                                    : `ให้คะแนน ${clo.clo_code} (${clo.sub_plos.map((s) => s.code).join(", ")})`
                                }
                              >
                                {formatScore(value)}
                              </Button>
                            </TableCell>
                          );
                        })}
                        <TableCell className={`text-center ${scoreClass(student.overall)}`}>
                          {formatScore(student.overall)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            {!viewOnly && cloHeaders.length > 0 && (
              <p className="text-xs text-muted-foreground text-left">
                คลิกที่ช่องคะแนนของ CLO หรือกดปุ่ม "ให้คะแนน" เพื่อกรอกคะแนน Sub PLO ของนักศึกษาทุกคน
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                ปิด
              </Button>
              {!viewOnly && cloHeaders.length > 0 && (
                <Button onClick={() => openScoreDialog()}>ให้คะแนน</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* หน้าต่างให้คะแนน Sub PLO — สลับ CLO ได้อิสระ กรอกครบทุกคนแล้วบันทึกทีเดียว */}
      <Dialog open={isScoringOpen} onOpenChange={(open) => { if (!open) closeScoreDialog(); }}>
        <DialogContent className="app-dialog-5xl max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>ให้คะแนน CLO — {selectedCourse?.code} {selectedCourse?.name}</DialogTitle>
            <DialogDescription>
              เลือก CLO ที่ต้องการให้คะแนน กรอกได้ทุกคนในหน้าเดียว สลับ CLO ได้โดยคะแนนที่กรอกไว้จะไม่หาย
              แล้วกด "บันทึกทั้งหมด" ครั้งเดียวเมื่อกรอกครบ
            </DialogDescription>
          </DialogHeader>

          {activeClo && (
            <div className="flex-1 overflow-hidden flex flex-col gap-3">
              {/* แถบเลือก CLO + ค้นหานักศึกษา */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium whitespace-nowrap">เลือก CLO</span>
                  <Select value={activeCloId} onValueChange={setActiveCloId}>
                    <SelectTrigger className="w-[260px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cloHeaders.map((clo) => (
                        <SelectItem
                          key={clo.clo_id}
                          value={String(clo.clo_id)}
                          disabled={clo.sub_plos.length === 0}
                        >
                          {clo.clo_code}
                          {clo.sub_plos.length === 0
                            ? " (ยังไม่ผูก Sub PLO)"
                            : ` — Sub ${clo.sub_plos.map((s) => s.code).join(", ")}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
                    value={scoreSearch}
                    onChange={(e) => setScoreSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* รายละเอียด CLO ที่กำลังให้คะแนน */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">{activeClo.clo_code}</Badge>
                  {activeClo.ylo && <Badge variant="secondary">{activeClo.ylo}</Badge>}
                  {activeClo.plos.map((plo) => (
                    <Badge key={plo.code} variant="outline">{plo.code}</Badge>
                  ))}
                  {activeClo.sub_plos.map((sub) => (
                    <Badge key={sub.code} variant="outline" className="border-amber-500 text-amber-600">
                      Sub {sub.code}
                    </Badge>
                  ))}
                </div>
                {activeClo.description && (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{activeClo.description}</p>
                )}
                <div className="space-y-1">
                  {activeClo.sub_plos.map((sub) => (
                    <p key={sub.code} className="text-xs text-muted-foreground">
                      <span className="font-medium text-amber-600">Sub {sub.code}</span>
                      {sub.plo ? ` (${sub.plo})` : ""} — {sub.description || "ไม่มีคำอธิบาย"}
                    </p>
                  ))}
                </div>
              </div>

              {/* ตารางกรอกคะแนนนักศึกษาทุกคน (เลื่อนดูได้) */}
              <div className="flex-1 overflow-auto overscroll-contain border rounded-lg [&>div]:overflow-visible">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-[120px] whitespace-nowrap">รหัส นศ.</TableHead>
                      <TableHead className="whitespace-nowrap">ชื่อ-นามสกุล</TableHead>
                      {activeClo.sub_plos.map((sub) => (
                        <TableHead key={sub.code} className="text-center w-[120px] whitespace-nowrap">
                          Sub {sub.code}
                          <br />
                          <span className="text-[10px] font-normal text-muted-foreground">(เต็ม 100)</span>
                        </TableHead>
                      ))}
                      <TableHead className="text-center w-[110px] whitespace-nowrap">
                        {activeClo.clo_code}
                        <br />
                        <span className="text-[10px] font-normal text-muted-foreground">
                          (÷ {activeClo.sub_plos.length})
                        </span>
                      </TableHead>
                      <TableHead className="text-center w-[110px] whitespace-nowrap">
                        คะแนนรวม
                        <br />
                        <span className="text-[10px] font-normal text-muted-foreground">
                          (÷ {cloHeaders.length} CLO)
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentGrades
                      .filter((s) => s.name.includes(scoreSearch) || s.studentId.includes(scoreSearch))
                      .map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-sm whitespace-nowrap">
                            {student.studentId}
                          </TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          {activeClo.sub_plos.map((sub) => (
                            <TableCell key={sub.code} className="text-center">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="-"
                                value={scoreDraft[String(student.id)]?.[activeCloId]?.[sub.code] ?? ""}
                                onChange={(e) =>
                                  setDraftValue(student.id, activeClo.clo_id, sub.code, e.target.value)
                                }
                                className="w-20 h-8 text-center mx-auto"
                              />
                            </TableCell>
                          ))}
                          <TableCell className={`text-center ${scoreClass(draftCloScore(student.id, activeClo))}`}>
                            {formatScore(draftCloScore(student.id, activeClo))}
                          </TableCell>
                          <TableCell className={`text-center ${scoreClass(draftOverall(student.id))}`}>
                            {formatScore(draftOverall(student.id))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <p className="text-xs text-left">
              {changedCount > 0 ? (
                <span className="text-warning font-medium">
                  มี {changedCount} รายการที่แก้ไขแล้วยังไม่ได้บันทึก
                </span>
              ) : (
                <span className="text-muted-foreground">ยังไม่มีการเปลี่ยนแปลง</span>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeScoreDialog} disabled={isSavingScore}>
                ยกเลิก
              </Button>
              <Button onClick={saveAllCloScores} disabled={isSavingScore || changedCount === 0}>
                {isSavingScore ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesPage;