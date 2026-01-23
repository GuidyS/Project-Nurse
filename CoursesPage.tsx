import { useState, useEffect } from "react";
import { BookOpen, Users, Edit, Eye, MoreVertical, Plus, Save, X, Search, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// กำหนด Path ไปหาไฟล์ API
const API_PATH = "/components/CoursesPage/api.php";

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  students: number;
  semester: string;
  section: string;
  cloCount: number;
}

interface StudentGrade {
  id: number; // enrollment_id
  studentId: string;
  name: string;
  grade: string;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editGrade, setEditGrade] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Loading States
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  
  const { toast } = useToast();

  // 1. ดึงข้อมูล "รายวิชา" ทันทีที่โหลดหน้าเว็บ
  useEffect(() => {
    setIsLoadingCourses(true);
    api.get(`${API_PATH}?action=get_courses`)
      .then((res) => {
        if (res.data.status === "success") {
          setCourses(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลรายวิชาได้", variant: "destructive" });
      })
      .finally(() => setIsLoadingCourses(false));
  }, [toast]);

  // 2. ดึงข้อมูล "นักศึกษา" เฉพาะเมื่อกดเลือกรายวิชา
  const openGradeDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsGradeDialogOpen(true);
    setIsLoadingStudents(true);
    setSearchQuery("");

    api.get(`${API_PATH}?action=get_students&course_id=${course.id}`)
      .then((res) => {
        if (res.data.status === "success") {
          setStudentGrades(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลนักศึกษาได้", variant: "destructive" });
      })
      .finally(() => setIsLoadingStudents(false));
  };

  const startEditing = (student: StudentGrade) => {
    setEditingId(student.id);
    setEditGrade(student.grade);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditGrade("");
  };

  // 3. บันทึก "เกรด" ไปยังฐานข้อมูล
  const saveGrade = (studentId: number) => {
    api.post(`${API_PATH}?action=update_grade`, { id: studentId, grade: editGrade })
      .then((res) => {
        if (res.data.status === "success") {
          setStudentGrades(
            studentGrades.map((s) => s.id === studentId ? { ...s, grade: editGrade || s.grade } : s)
          );
          setEditingId(null);
          setEditGrade("");
          toast({ title: "บันทึกสำเร็จ", description: "บันทึกผลการเรียนเรียบร้อยแล้ว" });
        }
      })
      .catch((err) => {
        console.error("Error saving grade:", err);
        toast({ title: "บันทึกไม่สำเร็จ", description: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล", variant: "destructive" });
      });
  };

  const filteredStudents = studentGrades.filter(
    (s) => s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
  );

  const getGradeBadge = (grade: string) => {
    if (grade.startsWith("A")) return <Badge className="bg-success text-success-foreground">{grade}</Badge>;
    if (grade.startsWith("B")) return <Badge className="bg-primary text-primary-foreground">{grade}</Badge>;
    if (grade.startsWith("C")) return <Badge variant="secondary">{grade}</Badge>;
    if (grade.startsWith("D")) return <Badge className="bg-warning text-warning-foreground">{grade}</Badge>;
    if (grade === "-") return <Badge variant="outline">ยังไม่มีเกรด</Badge>;
    return <Badge variant="destructive">{grade}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">รายวิชาที่สอน</h1>
          <p className="text-muted-foreground mt-1">จัดการรายวิชาและบันทึกผลการเรียน (FR009)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{isLoadingCourses ? "..." : courses.length}</p>
              <p className="text-xs text-muted-foreground">รายวิชาทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoadingCourses ? "..." : courses.reduce((sum, c) => sum + c.students, 0)}
              </p>
              <p className="text-xs text-muted-foreground">นักศึกษาทั้งหมด</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
        {isLoadingCourses ? (
          <div className="p-8 text-center text-muted-foreground flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> กำลังโหลดข้อมูลรายวิชา...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสวิชา</TableHead>
                <TableHead>ชื่อวิชา</TableHead>
                <TableHead>หน่วยกิต</TableHead>
                <TableHead>นักศึกษา</TableHead>
                <TableHead>ภาคเรียน</TableHead>
                <TableHead>CLO</TableHead>
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
                  <TableCell><Badge variant="secondary">{course.semester}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">{course.cloCount} CLO</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => openGradeDialog(course)}>
                          <Edit className="h-4 w-4" /> บันทึก/แก้ไขผลการเรียน
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
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
        )}
      </div>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>บันทึก/แก้ไขผลการเรียน - {selectedCourse?.code} {selectedCourse?.name}</DialogTitle>
            <DialogDescription>กลุ่ม {selectedCourse?.section} ภาคเรียน {selectedCourse?.semester}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            <div className="flex-1 overflow-auto border rounded-lg">
              {isLoadingStudents ? (
                <div className="p-8 text-center text-muted-foreground flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> กำลังโหลดรายชื่อ...
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-[120px]">รหัส นศ.</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead className="text-center w-[100px]">เกรด</TableHead>
                      <TableHead className="text-right w-[100px]">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-center">
                          {editingId === student.id ? (
                            <Select value={editGrade} onValueChange={setEditGrade}>
                              <SelectTrigger className="w-20 h-8 mx-auto"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["A", "B+", "B", "C+", "C", "D+", "D", "F", "-"].map((g) => (
                                  <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (getGradeBadge(student.grade))}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === student.id ? (
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={() => saveGrade(student.id)}><Save className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={cancelEditing}><X className="h-4 w-4" /></Button>
                            </div>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEditing(student)}><Edit className="h-4 w-4" /></Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesPage;

