import { useState, useEffect } from "react";
import { BookOpen, Users, Edit, Eye, MoreVertical, Plus, Save, X, Search } from "lucide-react";
import api from "@/lib/axios";
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
  id: number;
  studentId: string;
  name: string;
  midterm: number | null;
  final: number | null;
  assignment: number | null;
  total: number | null;
  grade: string;
}

const courses: Course[] = [
  { id: 1, code: "CS101", name: "การเขียนโปรแกรมเบื้องต้น", credits: 3, students: 45, semester: "1/2568", section: "1", cloCount: 5 },
  { id: 2, code: "CS201", name: "โครงสร้างข้อมูลและอัลกอริทึม", credits: 3, students: 38, semester: "1/2568", section: "1", cloCount: 6 },
  { id: 3, code: "CS301", name: "ปัญญาประดิษฐ์", credits: 3, students: 32, semester: "1/2568", section: "1", cloCount: 4 },
  { id: 4, code: "CS401", name: "Machine Learning", credits: 3, students: 28, semester: "1/2568", section: "1", cloCount: 5 },
];


/**
 * CoursesPage Component - หน้ารายวิชาที่สอน
 * 
 * หน้าที่:
 * - แสดงรายการรายวิชาที่สอน
 * - บันทึกและแก้ไขผลการเรียนของนักศึกษา
 * - แสดงสถิติรายวิชาและจำนวนนักศึกษา
 * 
 * Features:
 * - แสดงตารางรายวิชาพร้อมข้อมูล (รหัส, ชื่อ, หน่วยกิต, จำนวนนักศึกษา, CLO)
 * - Dialog สำหรับบันทึก/แก้ไขผลการเรียน (กลางภาค, ปลายภาค, งาน, เกรด)
 * - ค้นหานักศึกษาใน dialog
 * - แก้ไขผลการเรียนแบบ inline editing
 */
const CoursesPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<StudentGrade>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    api
      .get("/components/StudentPage/students.php")
      .then((res) => {
        console.log("Data from API:", res.data);
        if (Array.isArray(res.data)) {
          const mappedStudents: StudentGrade[] = res.data.map((student: any) => ({
            id: Number(student.id),
            studentId: String(student.id),
            name: `${student.title || ''}${student.first_name} ${student.last_name}`.trim(),
            midterm: null,
            final: null,
            assignment: null,
            total: null,
            grade: "-"
          }));
          setStudentGrades(mappedStudents);
        }
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
      });
  }, []);

  /**
   * openGradeDialog - เปิด dialog สำหรับบันทึก/แก้ไขผลการเรียน
   * 
   * หน้าที่:
   * - ตั้งค่า selectedCourse เป็นรายวิชาที่เลือก
   * - เปิด dialog
   * 
   * @param {Course} course - รายวิชาที่ต้องการบันทึกผลการเรียน
   */
  const openGradeDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsGradeDialogOpen(true);
  };

  /**
   * startEditing - เริ่มต้นการแก้ไขผลการเรียนของนักศึกษา
   * 
   * หน้าที่:
   * - ตั้งค่า editingId เป็น ID ของนักศึกษาที่กำลังแก้ไข
   * - ตั้งค่า editValues จากข้อมูลปัจจุบันของนักศึกษา
   * 
   * @param {StudentGrade} student - นักศึกษาที่ต้องการแก้ไข
   */
  const startEditing = (student: StudentGrade) => {
    setEditingId(student.id);
    setEditValues({
      midterm: student.midterm,
      final: student.final,
      assignment: student.assignment,
      grade: student.grade,
    });
  };

  /**
   * cancelEditing - ยกเลิกการแก้ไขผลการเรียน
   * 
   * หน้าที่:
   * - รีเซ็ต editingId เป็น null
   * - ล้าง editValues
   */
  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  /**
   * saveGrade - บันทึกผลการเรียนที่แก้ไข
   * 
   * หน้าที่:
   * - คำนวณคะแนนรวม (midterm + final + assignment)
   * - อัพเดทข้อมูลนักศึกษาใน state
   * - รีเซ็ต editing state
   * - แสดง toast notification
   * 
   * @param {number} studentId - ID ของนักศึกษาที่ต้องการบันทึก
   */
  const saveGrade = (studentId: number) => {
    const midterm = editValues.midterm ?? 0;
    const final = editValues.final ?? 0;
    const assignment = editValues.assignment ?? 0;
    const total = midterm + final + assignment;

    setStudentGrades(
      studentGrades.map((s) =>
        s.id === studentId
          ? {
              ...s,
              midterm,
              final,
              assignment,
              total,
              grade: editValues.grade || s.grade,
            }
          : s
      )
    );
    setEditingId(null);
    setEditValues({});
    toast({
      title: "บันทึกสำเร็จ",
      description: "บันทึกผลการเรียนเรียบร้อยแล้ว",
    });
  };

  /**
   * filteredStudents - กรองนักศึกษาตาม searchQuery
   * 
   * ค้นหาจาก:
   * - ชื่อนักศึกษา
   * - รหัสนักศึกษา
   */
  const filteredStudents = studentGrades.filter(
    (s) =>
      s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
  );

  /**
   * getGradeBadge - สร้าง Badge component สำหรับแสดงเกรด
   * 
   * ใช้สีที่แตกต่างกันตามเกรด:
   * - A: สีเขียว (success)
   * - B: สีหลัก (primary)
   * - C: สีรอง (secondary)
   * - D: สีเหลือง (warning)
   * - F: สีแดง (destructive)
   * 
   * @param {string} grade - เกรดที่ต้องการแสดง
   * @returns {JSX.Element} - Badge component
   */
  const getGradeBadge = (grade: string) => {
    if (grade.startsWith("A")) {
      return <Badge className="bg-success text-success-foreground">{grade}</Badge>;
    }
    if (grade.startsWith("B")) {
      return <Badge className="bg-primary text-primary-foreground">{grade}</Badge>;
    }
    if (grade.startsWith("C")) {
      return <Badge variant="secondary">{grade}</Badge>;
    }
    if (grade.startsWith("D")) {
      return <Badge className="bg-warning text-warning-foreground">{grade}</Badge>;
    }
    return <Badge variant="destructive">{grade}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">รายวิชาที่สอน</h1>
          <p className="text-muted-foreground mt-1">จัดการรายวิชาและบันทึกผลการเรียน (FR009)</p>
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
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
      </div>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              บันทึก/แก้ไขผลการเรียน - {selectedCourse?.code} {selectedCourse?.name}
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
            <div className="flex-1 overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="w-[100px]">รหัส นศ.</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead className="text-center w-[80px]">กลางภาค<br />(50)</TableHead>
                    <TableHead className="text-center w-[80px]">ปลายภาค<br />(50)</TableHead>
                    <TableHead className="text-center w-[80px]">งาน<br />(20)</TableHead>
                    <TableHead className="text-center w-[80px]">รวม</TableHead>
                    <TableHead className="text-center w-[80px]">เกรด</TableHead>
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
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            value={editValues.midterm ?? ""}
                            onChange={(e) =>
                              setEditValues({ ...editValues, midterm: Number(e.target.value) })
                            }
                            className="w-16 h-8 text-center mx-auto"
                          />
                        ) : (
                          student.midterm ?? "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === student.id ? (
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            value={editValues.final ?? ""}
                            onChange={(e) =>
                              setEditValues({ ...editValues, final: Number(e.target.value) })
                            }
                            className="w-16 h-8 text-center mx-auto"
                          />
                        ) : (
                          student.final ?? "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === student.id ? (
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={editValues.assignment ?? ""}
                            onChange={(e) =>
                              setEditValues({ ...editValues, assignment: Number(e.target.value) })
                            }
                            className="w-16 h-8 text-center mx-auto"
                          />
                        ) : (
                          student.assignment ?? "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {editingId === student.id
                          ? (editValues.midterm ?? 0) +
                            (editValues.final ?? 0) +
                            (editValues.assignment ?? 0)
                          : student.total ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === student.id ? (
                          <Select
                            value={editValues.grade}
                            onValueChange={(value) =>
                              setEditValues({ ...editValues, grade: value })
                            }
                          >
                            <SelectTrigger className="w-16 h-8 mx-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"].map(
                                (g) => (
                                  <SelectItem key={g} value={g}>
                                    {g}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          getGradeBadge(student.grade)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === student.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-success"
                              onClick={() => saveGrade(student.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => startEditing(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
              ปิด
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "บันทึกทั้งหมดสำเร็จ",
                  description: "บันทึกผลการเรียนทั้งหมดเรียบร้อยแล้ว",
                });
                setIsGradeDialogOpen(false);
              }}
            >
              บันทึกทั้งหมด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesPage;
