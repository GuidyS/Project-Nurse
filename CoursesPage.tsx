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
  grade: string;
}

const courses: Course[] = [
  { id: 1, code: "CS101", name: "การเขียนโปรแกรมเบื้องต้น", credits: 3, students: 45, semester: "1/2568", section: "1", cloCount: 5 },
  { id: 2, code: "CS201", name: "โครงสร้างข้อมูลและอัลกอริทึม", credits: 3, students: 38, semester: "1/2568", section: "1", cloCount: 6 },
  { id: 3, code: "CS301", name: "ปัญญาประดิษฐ์", credits: 3, students: 32, semester: "1/2568", section: "1", cloCount: 4 },
  { id: 4, code: "CS401", name: "Machine Learning", credits: 3, students: 28, semester: "1/2568", section: "1", cloCount: 5 },
];

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
        if (Array.isArray(res.data)) {
          const mapped: StudentGrade[] = res.data.map((s: any) => ({
            id: Number(s.id),
            studentId: String(s.id),
            name: `${s.title || ""}${s.first_name} ${s.last_name}`.trim(),
            grade: "-",
          }));
          setStudentGrades(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const openGradeDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsGradeDialogOpen(true);
  };

  const startEditing = (student: StudentGrade) => {
    setEditingId(student.id);
    setEditValues({ grade: student.grade });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveGrade = (studentId: number) => {
    setStudentGrades((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, grade: editValues.grade || s.grade } : s
      )
    );
    setEditingId(null);
    setEditValues({});
    toast({ title: "บันทึกสำเร็จ", description: "บันทึกเกรดเรียบร้อยแล้ว" });
  };

  const filteredStudents = studentGrades.filter(
    (s) => s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
  );

  const getGradeBadge = (grade: string) => {
    if (grade.startsWith("A")) return <Badge className="bg-success text-success-foreground">{grade}</Badge>;
    if (grade.startsWith("B")) return <Badge className="bg-primary text-primary-foreground">{grade}</Badge>;
    if (grade.startsWith("C")) return <Badge variant="secondary">{grade}</Badge>;
    if (grade.startsWith("D")) return <Badge className="bg-warning text-warning-foreground">{grade}</Badge>;
    return <Badge variant="destructive">{grade}</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">รายวิชาที่สอน</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl">
          <BookOpen /> {courses.length} รายวิชา
        </div>
        <div className="bg-card p-4 rounded-xl">
          <Users /> {courses.reduce((s, c) => s + c.students, 0)} คน
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสวิชา</TableHead>
            <TableHead>ชื่อวิชา</TableHead>
            <TableHead>หน่วยกิต</TableHead>
            <TableHead>นักศึกษา</TableHead>
            <TableHead>CLO</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.code}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.credits}</TableCell>
              <TableCell>{c.students}</TableCell>
              <TableCell>{c.cloCount}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => openGradeDialog(c)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              บันทึกเกรด - {selectedCourse?.code} {selectedCourse?.name}
            </DialogTitle>
            <DialogDescription>
              กลุ่ม {selectedCourse?.section} ภาคเรียน {selectedCourse?.semester}
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="ค้นหานักศึกษา"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส นศ.</TableHead>
                <TableHead>ชื่อ</TableHead>
                <TableHead className="text-center">เกรด</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.studentId}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="text-center">
                    {editingId === s.id ? (
                      <Select
                        value={editValues.grade}
                        onValueChange={(v) => setEditValues({ grade: v })}
                      >
                        <SelectTrigger className="w-16 mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["A","A-","B+","B","B-","C+","C","C-","D+","D","F"].map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      getGradeBadge(s.grade)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === s.id ? (
                      <>
                        <Button size="icon" onClick={() => saveGrade(s.id)}><Save /></Button>
                        <Button size="icon" variant="destructive" onClick={cancelEditing}><X /></Button>
                      </>
                    ) : (
                      <Button size="icon" onClick={() => startEditing(s)}><Edit /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesPage;
