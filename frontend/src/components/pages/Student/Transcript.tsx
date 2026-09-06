import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, GraduationCap, TrendingUp, BookOpen, Calendar, Printer, Loader2 } from "lucide-react";
import api from "@/lib/axios";

interface CourseGrade {
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoint: number;
  semester: string;
  year: string;
}

interface StudentProfile {
  student_code: string;
  student_name: string;
  faculty: string;
  major: string;
  current_year: string;
}

const gradeColors: Record<string, string> = {
  "A": "bg-green-500 text-white",
  "B+": "bg-blue-500 text-white",
  "B": "bg-blue-400 text-white",
  "C+": "bg-yellow-500 text-white",
  "C": "bg-yellow-400 text-white",
  "D+": "bg-orange-500 text-white",
  "D": "bg-orange-400 text-white",
  "F": "bg-red-500 text-white",
};

const Transcript = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  
  // States สำหรับเก็บข้อมูลที่มาจาก API
  const [studentInfo, setStudentInfo] = useState<StudentProfile | null>(null);
  const [grades, setGrades] = useState<CourseGrade[]>([]);
  
  // รายการปีการศึกษาและภาคเรียนที่มีจริงในข้อมูลเพื่อนำมาทำ Dropdown Filter แบบ Dynamic
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchTranscriptData = async () => {
      try {
        setIsLoading(true);
        // เรียกผ่าน Endpoint ที่แมปไว้ในระบบของคุณ
        const response = await api.get("/index.php?page=transcript-api");
        if (response.data.status === "success") {
          const { profile, grades: gradeList } = response.data.data;
          setStudentInfo(profile);
          setGrades(gradeList || []);

          // ดึงปีการศึกษาที่มีทั้งหมดในประวัติมาทำตัวกรอง Dropdown อัตโนมัติ
          const years: string[] = Array.from(new Set(gradeList.map((g: CourseGrade) => g.year)));
          setAvailableYears(years.sort().reverse());
        }
      } catch (error) {
        toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถโหลดข้อมูล Transcript ได้", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranscriptData();
  }, []);
  
  const filteredGrades = grades.filter((grade) => {
    const matchYear = selectedYear === "all" || grade.year === selectedYear;
    const matchSemester = selectedSemester === "all" || grade.semester === selectedSemester;
    return matchYear && matchSemester;
  });

  // คำนวณเกรดเฉลี่ยสะสม
  const totalCredits = filteredGrades.reduce((sum, g) => sum + Number(g.credits), 0);
  const totalGradePoints = filteredGrades.reduce((sum, g) => sum + (Number(g.gradePoint) * Number(g.credits)), 0);
  const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "0.00";

  // นับจำนวนภาคเรียนที่มีเกรดจริง
  const totalSemesters = Array.from(new Set(filteredGrades.map(g => `${g.year}-${g.semester}`))).length;

  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "กำลังส่งออก Transcript", description: `กำลังสร้างไฟล์ ${format.toUpperCase()}...` });
    setTimeout(() => {
      toast({ title: "ส่งออกสำเร็จ", description: `ดาวน์โหลด Transcript.${format} เรียบร้อยแล้ว` });
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">กำลังประมวลผลใบแสดงผลการเรียน...</p>
      </div>
    );
  }

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight leading-snug">ใบแสดงผลการเรียน</h1>
            <p className="text-muted-foreground">ดูและส่งออกรายงานผลการศึกษาอย่างเป็นทางการของคุณ</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => handleExport("pdf")}>
              <FileText className="h-4 w-4" /> ส่งออก PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4" /> ส่งออก Excel
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> พิมพ์
            </Button>
          </div>
        </div>

        {/* Student Info & Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">ข้อมูลนักศึกษา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">รหัสนักศึกษา</span>
                <span className="font-semibold">{studentInfo?.student_code || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">ชื่อ-นามสกุล</span>
                <span className="font-semibold">{studentInfo?.student_name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">คณะ</span>
                <span className="font-semibold">{studentInfo?.faculty || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">หลักสูตร/สาขา</span>
                <span className="font-semibold">{studentInfo?.major || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ชั้นปีปัจจุบัน</span>
                <span className="font-semibold">ชั้นปีที่ {studentInfo?.current_year || "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-2 md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{gpa}</p>
                    <p className="text-xs text-muted-foreground">เกรดเฉลี่ยสะสม (GPA)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{totalCredits}</p>
                    <p className="text-xs text-muted-foreground">หน่วยกิตสะสมที่ผ่าน</p>
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
                    <p className="text-xs text-muted-foreground">รายวิชาที่ลงทะเบียน</p>
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
                    <p className="text-3xl font-bold">{totalSemesters}</p>
                    <p className="text-xs text-muted-foreground">จำนวนภาคเรียนทั้งหมด</p>
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
                <CardTitle>ผลการตรวจสอบคะแนนและรายวิชา</CardTitle>
                <CardDescription>แสดงประวัติผลการเรียนจำแนกตามปีการศึกษา</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="ปีการศึกษา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกปีการศึกษา</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="ภาคเรียน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกภาคเรียน</SelectItem>
                    <SelectItem value="1">ภาคเรียนที่ 1</SelectItem>
                    <SelectItem value="2">ภาคเรียนที่ 2</SelectItem>
                    <SelectItem value="3">ภาคฤดูร้อน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">รหัสวิชา</TableHead>
                    <TableHead>ชื่อวิชา</TableHead>
                    <TableHead className="text-center w-[100px]">หน่วยกิต</TableHead>
                    <TableHead className="text-center w-[100px]">เกรด</TableHead>
                    <TableHead className="text-center w-[100px]">แต้มคะแนน</TableHead>
                    <TableHead className="w-[120px]">ปี/ภาคเรียน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.length > 0 ? (
                    filteredGrades.map((course) => (
                      <TableRow key={`${course.code}-${course.year}-${course.semester}`}>
                        <TableCell className="font-mono font-medium">{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${gradeColors[course.grade] || "bg-secondary text-foreground"} shadow-none`}>
                            {course.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{Number(course.gradePoint).toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">{course.year}/{course.semester}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        ไม่พบข้อมูลผลการเรียนตามเงื่อนไขที่เลือก
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Row */}
            <div className="mt-4 flex justify-end gap-8 p-4 bg-muted/40 rounded-xl border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">หน่วยกิตรวมที่เลือก</p>
                <p className="text-2xl font-black mt-0.5">{totalCredits}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">GPA ประจำช่วงที่เลือก</p>
                <p className="text-2xl font-black text-primary mt-0.5">{gpa}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default Transcript;