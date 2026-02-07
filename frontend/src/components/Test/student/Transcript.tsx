import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, GraduationCap, TrendingUp, BookOpen, Calendar, Printer } from "lucide-react";

interface CourseGrade {
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoint: number;
  semester: string;
  year: string;
}

const mockGrades: CourseGrade[] = [
  { code: "CS101", name: "Introduction to Computer Science", credits: 3, grade: "A", gradePoint: 4.0, semester: "1", year: "2567" },
  { code: "CS102", name: "Programming Fundamentals", credits: 3, grade: "A", gradePoint: 4.0, semester: "1", year: "2567" },
  { code: "MA101", name: "Calculus I", credits: 3, grade: "B+", gradePoint: 3.5, semester: "1", year: "2567" },
  { code: "EN101", name: "English for Communication", credits: 3, grade: "A", gradePoint: 4.0, semester: "1", year: "2567" },
  { code: "CS201", name: "Data Structures", credits: 3, grade: "A", gradePoint: 4.0, semester: "2", year: "2567" },
  { code: "CS202", name: "Object-Oriented Programming", credits: 3, grade: "B+", gradePoint: 3.5, semester: "2", year: "2567" },
  { code: "MA102", name: "Calculus II", credits: 3, grade: "B", gradePoint: 3.0, semester: "2", year: "2567" },
  { code: "CS301", name: "Database Systems", credits: 3, grade: "A", gradePoint: 4.0, semester: "1", year: "2568" },
  { code: "CS302", name: "Web Development", credits: 3, grade: "A", gradePoint: 4.0, semester: "1", year: "2568" },
  { code: "CS303", name: "Software Engineering", credits: 3, grade: "B+", gradePoint: 3.5, semester: "1", year: "2568" },
];

const gradeColors: Record<string, string> = {
  "A": "bg-success",
  "B+": "bg-primary",
  "B": "bg-primary",
  "C+": "bg-warning",
  "C": "bg-warning",
  "D+": "bg-orange-500",
  "D": "bg-orange-500",
  "F": "bg-destructive",
};

export default function Transcript() {
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const { toast } = useToast();

  const filteredGrades = mockGrades.filter((grade) => {
    const matchYear = selectedYear === "all" || grade.year === selectedYear;
    const matchSemester = selectedSemester === "all" || grade.semester === selectedSemester;
    return matchYear && matchSemester;
  });

  const totalCredits = filteredGrades.reduce((sum, g) => sum + g.credits, 0);
  const totalGradePoints = filteredGrades.reduce((sum, g) => sum + g.gradePoint * g.credits, 0);
  const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "0.00";

  const handleExport = (format: "pdf" | "excel") => {
    toast({
      title: "กำลังส่งออก Transcript",
      description: `กำลังสร้างไฟล์ ${format.toUpperCase()}...`,
    });

    setTimeout(() => {
      toast({
        title: "ส่งออกสำเร็จ",
        description: `ดาวน์โหลด Transcript.${format} เรียบร้อยแล้ว`,
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ใบแสดงผลการเรียน</h1>
            <p className="text-muted-foreground">ดูและส่งออก Transcript ของคุณ</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => handleExport("pdf")}>
              <FileText className="h-4 w-4" />
              ส่งออก PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4" />
              ส่งออก Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              พิมพ์
            </Button>
          </div>
        </div>

        {/* Student Info & Summary */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ข้อมูลนักศึกษา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">รหัสนักศึกษา</span>
                <span className="font-medium">64010001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ชื่อ-นามสกุล</span>
                <span className="font-medium">นายสมชาย เก่งมาก</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">คณะ</span>
                <span className="font-medium">วิศวกรรมศาสตร์</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">สาขา</span>
                <span className="font-medium">วิศวกรรมคอมพิวเตอร์</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ชั้นปี</span>
                <span className="font-medium">2</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{gpa}</p>
                    <p className="text-sm text-muted-foreground">GPA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                    <BookOpen className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{totalCredits}</p>
                    <p className="text-sm text-muted-foreground">หน่วยกิตสะสม</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                    <GraduationCap className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{filteredGrades.length}</p>
                    <p className="text-sm text-muted-foreground">รายวิชา</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">4</p>
                    <p className="text-sm text-muted-foreground">ภาคเรียน</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>ผลการเรียน</CardTitle>
                <CardDescription>รายวิชาที่ลงทะเบียนเรียนทั้งหมด</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="ปีการศึกษา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกปี</SelectItem>
                    <SelectItem value="2568">2568</SelectItem>
                    <SelectItem value="2567">2567</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="ภาคเรียน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกภาค</SelectItem>
                    <SelectItem value="1">ภาค 1</SelectItem>
                    <SelectItem value="2">ภาค 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสวิชา</TableHead>
                  <TableHead>ชื่อวิชา</TableHead>
                  <TableHead className="text-center">หน่วยกิต</TableHead>
                  <TableHead className="text-center">เกรด</TableHead>
                  <TableHead className="text-center">คะแนน</TableHead>
                  <TableHead>ปี/ภาค</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((course) => (
                  <TableRow key={`${course.code}-${course.year}-${course.semester}`}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell className="text-center">{course.credits}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={gradeColors[course.grade]}>{course.grade}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{course.gradePoint.toFixed(1)}</TableCell>
                    <TableCell className="text-muted-foreground">{course.year}/{course.semester}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Summary Row */}
            <div className="mt-4 flex justify-end gap-8 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">หน่วยกิตรวม</p>
                <p className="text-xl font-bold">{totalCredits}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">GPA</p>
                <p className="text-xl font-bold text-primary">{gpa}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
