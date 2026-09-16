import { useEffect, useState } from "react";
import { Search, Filter, Upload, Eye, MoreVertical, Star, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { Student } from "@/components/pages/Teacher/PracticalStudents";
import { StudentDetailsDialog } from "@/components/ui/StudentDetailsDialog";
import { StudentEvaluateDialog } from "@/components/ui/StudentEvaluateDialog";
import { useToast } from "@/hooks/use-toast";

export interface PracticalStudent extends Student {
  hospital: string;
  ward: string;
  performance: number | null;
  hasPerformanceEval: boolean;
  performanceComment: string;
  totalTasks: number;
}

type PracticalStudentApiRow = Student &
  Partial<Omit<PracticalStudent, "performance" | "performanceComment">> & {
    performance?: number | string | null;
    performanceComment?: string | null;
  };

const PracticalPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<PracticalStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<PracticalStudent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [evaluateScore, setEvaluateScore] = useState("");
  const [evaluateComment, setEvaluateComment] = useState("");

  const [taskName, setTaskName] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDescription, setTaskDescription] = useState("");

  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState("photo");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/index.php?page=get-practical-students");
      if (response.data.status === "success") {
        const data = Array.isArray(response.data.data)
          ? (response.data.data as PracticalStudentApiRow[])
          : [];
        const rows = data.map((s) => {
          const tasksCompleted = Number(s.tasksCompleted ?? 0);
          const tasksPending = Number(s.tasksPending ?? 0);
          const totalTasks = Number(s.totalTasks ?? tasksCompleted + tasksPending);
          const progress = Number(s.progress ?? 0);
          const hospital = s.hospital || s.workplace || "โรงพยาบาลเครือข่ายฝึกปฏิบัติ";
          const rawPerformance = s.performance;
          const performance =
            rawPerformance === null || rawPerformance === undefined || rawPerformance === ""
              ? null
              : Number(rawPerformance);
          return {
            ...s,
            id: String(s.id ?? s.studentId ?? ""),
            studentId: String(s.studentId ?? s.id ?? ""),
            name: String(s.name ?? ""),
            hospital,
            workplace: s.workplace || hospital,
            ward: s.ward || "—",
            performance: Number.isFinite(performance) ? performance : null,
            hasPerformanceEval: Boolean(s.hasPerformanceEval),
            performanceComment: String(s.performanceComment ?? ""),
            totalTasks,
            tasksCompleted,
            tasksPending,
            progress,
          } as PracticalStudent;
        });
        setStudents(rows);
      } else {
        setError(response.data.message || "โหลดข้อมูลไม่สำเร็จ");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "เชื่อมต่อ API ไม่ได้";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setEvaluateScore("");
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num > 100) setEvaluateScore("100");
      else if (num < 0) setEvaluateScore("0");
      else setEvaluateScore(num.toString());
    }
  };

  const openEvaluate = (student: PracticalStudent) => {
    setSelectedStudent(student);
    setEvaluateScore(
      student.hasPerformanceEval && student.performance !== null
        ? String(student.performance)
        : ""
    );
    setEvaluateComment(student.performanceComment || "");
    setIsEvaluateOpen(true);
  };

  const openAssign = (student: PracticalStudent) => {
    setSelectedStudent(student);
    setTaskName("");
    setTaskDueDate("");
    setTaskPriority("medium");
    setTaskDescription("");
    setIsAssignOpen(true);
  };

  const openUpload = (student: PracticalStudent | null = null) => {
    setSelectedStudent(student);
    setEvidenceTitle("");
    setEvidenceType("photo");
    setEvidenceFile(null);
    setIsUploadOpen(true);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedStudent) return;
    if (evaluateScore === "") {
      toast({ title: "แจ้งเตือน", description: "กรุณาระบุคะแนน", variant: "destructive" });
      return;
    }
    try {
      setIsSaving(true);
      const response = await api.post("/index.php?page=save-performance", {
        selectedStudent: selectedStudent.studentId,
        score: Number(evaluateScore),
        comment: evaluateComment,
      });
      if (response.data.status === "success") {
        toast({ title: "สำเร็จ", description: "บันทึกผลการประเมินเรียบร้อย" });
        setIsEvaluateOpen(false);
        fetchStudents();
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: response.data.message || "บันทึกไม่สำเร็จ",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "เชื่อมต่อ API ไม่ได้", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedStudent || !taskName.trim() || !taskDueDate) {
      toast({ title: "แจ้งเตือน", description: "กรอกชื่องานและกำหนดส่งให้ครบ", variant: "destructive" });
      return;
    }
    try {
      setIsSaving(true);
      const response = await api.post("/index.php?page=create-schedule-task", {
        studentId: selectedStudent.studentId,
        task: taskName.trim(),
        dueDate: taskDueDate,
        priority: taskPriority,
        description: taskDescription.trim() || null,
      });
      if (response.data.status === "success") {
        toast({ title: "สำเร็จ", description: "มอบหมายงานเรียบร้อย" });
        setIsAssignOpen(false);
        fetchStudents();
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: response.data.message || "มอบหมายงานไม่สำเร็จ",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "เชื่อมต่อ API ไม่ได้", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadEvidence = async () => {
    if (!selectedStudent || !evidenceTitle.trim() || !evidenceFile) {
      toast({ title: "แจ้งเตือน", description: "เลือกนักศึกษา ชื่อหลักฐาน และไฟล์ให้ครบ", variant: "destructive" });
      return;
    }
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("studentId", selectedStudent.studentId);
      formData.append("title", evidenceTitle.trim());
      formData.append("type", evidenceType);
      formData.append("file", evidenceFile);
      const response = await api.post("/index.php?page=upload-evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.status === "success") {
        toast({ title: "สำเร็จ", description: "อัปโหลดหลักฐานเรียบร้อย" });
        setIsUploadOpen(false);
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: response.data.message || "อัปโหลดไม่สำเร็จ",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "เชื่อมต่อ API ไม่ได้", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const matchesSearch = (value: unknown) =>
    String(value ?? "").toLowerCase().includes(normalizedSearchQuery);

  const filteredStudents = normalizedSearchQuery
    ? students.filter(
        (s) =>
          matchesSearch(s.name) ||
          matchesSearch(s.studentId) ||
          matchesSearch(s.hospital) ||
          matchesSearch(s.workplace)
      )
    : students;

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-success text-success-foreground">ดีเยี่ยม</Badge>;
    if (score >= 80) return <Badge className="bg-primary text-primary-foreground">ดี</Badge>;
    if (score >= 70) return <Badge variant="secondary">พอใช้</Badge>;
    return <Badge variant="destructive">ต้องปรับปรุง</Badge>;
  };

  const evaluatedStudents = students.filter((s) => s.hasPerformanceEval && s.performance !== null);
  const avgPerformance =
    evaluatedStudents.length > 0
      ? Math.round(
          evaluatedStudents.reduce((sum, s) => sum + (s.performance ?? 0), 0) /
            evaluatedStudents.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">นักศึกษาฝึกปฏิบัติ</h1>
          <p className="text-muted-foreground mt-1">จัดการและติดตามนักศึกษาที่ดูแล (1:8)</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => openUpload(null)}>
          <Upload className="h-4 w-4" />
          อัปโหลดหลักฐาน
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">Error: {error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
          <p className="text-xs text-muted-foreground">นักศึกษาทั้งหมด</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {evaluatedStudents.filter((s) => (s.performance ?? 0) >= 80).length}
          </p>
          <p className="text-xs text-muted-foreground">คะแนนดี</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">
            {students.length - evaluatedStudents.length}
          </p>
          <p className="text-xs text-muted-foreground">ยังไม่ประเมิน</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {evaluatedStudents.length > 0 ? `${avgPerformance}%` : "-"}
          </p>
          <p className="text-xs text-muted-foreground">เฉลี่ยคะแนนประเมิน</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ, รหัส หรือสถานที่ฝึก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2" disabled>
          <Filter className="h-4 w-4" />
          กรอง
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>นักศึกษา</TableHead>
              <TableHead>สถานที่ฝึก</TableHead>
              <TableHead>หอผู้ป่วย</TableHead>
              <TableHead>ความคืบหน้า</TableHead>
              <TableHead>คะแนนประเมิน</TableHead>
              <TableHead className="text-right">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  ไม่พบข้อมูลนักศึกษา
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{student.hospital}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.ward}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {student.tasksCompleted}/{student.totalTasks}
                        </span>
                      </div>
                      <Progress
                        value={student.totalTasks > 0 ? (student.tasksCompleted / student.totalTasks) * 100 : 0}
                        className="h-1.5"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {student.hasPerformanceEval && student.performance !== null ? (
                        <>
                          <span className="font-medium">{student.performance}%</span>
                          {getPerformanceBadge(student.performance)}
                        </>
                      ) : (
                        <Badge variant="outline">ยังไม่ประเมิน</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" /> ดูข้อมูล
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => openEvaluate(student)}>
                          <Star className="h-4 w-4" /> บันทึกการประเมิน
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => openAssign(student)}>
                          <Calendar className="h-4 w-4" /> มอบหมายงาน
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => openUpload(student)}>
                          <Upload className="h-4 w-4" /> อัปโหลดหลักฐาน
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StudentDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        student={selectedStudent}
      />

      <StudentEvaluateDialog
        isOpen={isEvaluateOpen}
        onOpenChange={setIsEvaluateOpen}
        student={selectedStudent}
        score={evaluateScore}
        onScoreChange={handleScoreChange}
        comment={evaluateComment}
        onCommentChange={(e) => setEvaluateComment(e.target.value)}
        onSave={handleSaveEvaluation}
        isSaving={isSaving}
      />

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="app-dialog-lg">
          <DialogHeader>
            <DialogTitle>มอบหมายงาน</DialogTitle>
            <DialogDescription>
              สร้าง Schedule Task ให้ {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>ชื่องาน</Label>
              <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="เช่น บันทึกการพยาบาล" />
            </div>
            <div className="space-y-2">
              <Label>กำหนดส่ง</Label>
              <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ความสำคัญ</Label>
              <Select value={taskPriority} onValueChange={setTaskPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">ต่ำ</SelectItem>
                  <SelectItem value="medium">ปานกลาง</SelectItem>
                  <SelectItem value="high">สูง</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>รายละเอียด</Label>
              <Textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleAssignTask} disabled={isSaving}>
              {isSaving ? "กำลังบันทึก..." : "มอบหมาย"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="app-dialog-lg">
          <DialogHeader>
            <DialogTitle>อัปโหลดหลักฐาน</DialogTitle>
            <DialogDescription>
              แนบหลักฐานการปฏิบัติงาน{selectedStudent ? ` ของ ${selectedStudent.name}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!selectedStudent && (
              <div className="space-y-2">
                <Label>นักศึกษา</Label>
                <Select
                  onValueChange={(id) => {
                    const found = students.find((s) => s.studentId === id) || null;
                    setSelectedStudent(found);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกนักศึกษา" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.studentId} value={s.studentId}>
                        {s.studentId} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>ชื่อหลักฐาน</Label>
              <Input value={evidenceTitle} onChange={(e) => setEvidenceTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ประเภท</Label>
              <Select value={evidenceType} onValueChange={setEvidenceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">รูปภาพ</SelectItem>
                  <SelectItem value="document">เอกสาร</SelectItem>
                  <SelectItem value="video">วิดีโอ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ไฟล์</Label>
              <Input
                type="file"
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleUploadEvidence} disabled={isSaving}>
              {isSaving ? "กำลังอัปโหลด..." : "อัปโหลด"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PracticalPage;
