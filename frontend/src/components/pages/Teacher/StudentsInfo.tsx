import { useState, useEffect, Fragment } from "react";
import api from "@/lib/axios";
import { Search, Download, Eye, Mail, MoreVertical, Target, CheckCircle2, Lock, User, GraduationCap, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Student {
  id: number;
  userId?: number | null;
  studentId: string;
  name: string;
  year: number;
  gpa: number;
  status: string;
  email: string;
  health_conditions?: string;
  vaccine_history?: string;
}

// Course-PLO Mapping Matrix interfaces
interface Course {
  courseCode: string;
  courseName: string;
  category: string;
  yearLevel: number;
}

interface PLOIndicator {
  ploId: string;
  subIndicators: string[];
}

// students array fetched from API

// PLO indicators with sub-indicators
const ploIndicators: PLOIndicator[] = [
  { ploId: "PLO1", subIndicators: ["1.1", "1.2", "1.3"] },
  { ploId: "PLO2", subIndicators: ["2.1", "2.2", "2.3"] },
  { ploId: "PLO3", subIndicators: ["3.1", "3.2"] },
  { ploId: "PLO4", subIndicators: ["4.1", "4.2"] },
  { ploId: "PLO5", subIndicators: ["5.1", "5.2"] },
  { ploId: "PLO6", subIndicators: ["6.1", "6.2", "6.3"] },
  { ploId: "PLO7", subIndicators: ["7.1", "7.2"] },
  { ploId: "PLO8", subIndicators: ["8.1", "8.2", "8.3"] },
];

// Courses grouped by category and year level
const courses: Course[] = [
  // ปี 1 - รายวิชา
  { courseCode: "170-101", courseName: "กายวิภาคศาสตร์และสรีรวิทยา 1", category: "หมวดวิชาพื้นฐานวิชาชีพ", yearLevel: 1 },
  { courseCode: "170-102", courseName: "กายวิภาคศาสตร์และสรีรวิทยา 2", category: "หมวดวิชาพื้นฐานวิชาชีพ", yearLevel: 1 },
  { courseCode: "170-103", courseName: "จุลชีววิทยาและปรสิตวิทยา", category: "หมวดวิชาพื้นฐานวิชาชีพ", yearLevel: 1 },
  { courseCode: "170-104", courseName: "ชีวเคมีพื้นฐาน", category: "หมวดวิชาพื้นฐานวิชาชีพ", yearLevel: 1 },
  { courseCode: "170-105", courseName: "จิตวิทยาทั่วไป", category: "หมวดวิชาศึกษาทั่วไป", yearLevel: 1 },
  { courseCode: "170-106", courseName: "ภาษาอังกฤษเพื่อการสื่อสาร", category: "หมวดวิชาศึกษาทั่วไป", yearLevel: 1 },
  // ปี 2 - รายวิชา
  { courseCode: "170-216", courseName: "เภสัชวิทยาทางการพยาบาล", category: "หมวดวิชาชีพ 1) ภาคทฤษฎี", yearLevel: 2 },
  { courseCode: "170-224", courseName: "ชีวสถิติทางสุขภาพ", category: "หมวดวิชาชีพ 1) ภาคทฤษฎี", yearLevel: 2 },
  { courseCode: "170-228", courseName: "พัฒนาการมนุษย์และการสร้างเสริมสุขภาพตามช่วงวัย", category: "หมวดวิชาชีพ 1) ภาคทฤษฎี", yearLevel: 2 },
  { courseCode: "170-229", courseName: "โภชนบำบัด", category: "หมวดวิชาชีพ 1) ภาคทฤษฎี", yearLevel: 2 },
  { courseCode: "170-230", courseName: "การพยาบาลพื้นฐาน", category: "หมวดวิชาชีพ 2) ภาคปฏิบัติ", yearLevel: 2 },
  { courseCode: "170-231", courseName: "การประเมินภาวะสุขภาพ", category: "หมวดวิชาชีพ 2) ภาคปฏิบัติ", yearLevel: 2 },
];

// Get all sub-indicators as flat array for column headers
const getAllSubIndicators = () => {
  return ploIndicators.flatMap(plo => 
    plo.subIndicators.map(sub => ({ ploId: plo.ploId, subId: sub }))
  );
};

// Pre-filled data for นายสมชาย รักเรียน - Year 1 (already completed)
const somchaiYear1Data: Record<string, Record<string, boolean>> = {
  "170-101": { "1.1": true, "1.2": true, "1.3": false, "2.1": true, "2.2": false, "2.3": false, "3.1": true, "3.2": false, "4.1": false, "4.2": false, "5.1": false, "5.2": false, "6.1": true, "6.2": false, "6.3": false, "7.1": false, "7.2": false, "8.1": true, "8.2": false, "8.3": false },
  "170-102": { "1.1": true, "1.2": true, "1.3": true, "2.1": true, "2.2": true, "2.3": false, "3.1": false, "3.2": false, "4.1": false, "4.2": false, "5.1": false, "5.2": false, "6.1": true, "6.2": true, "6.3": false, "7.1": false, "7.2": false, "8.1": true, "8.2": true, "8.3": false },
  "170-103": { "1.1": true, "1.2": false, "1.3": false, "2.1": true, "2.2": true, "2.3": true, "3.1": true, "3.2": true, "4.1": false, "4.2": false, "5.1": false, "5.2": false, "6.1": false, "6.2": false, "6.3": false, "7.1": true, "7.2": false, "8.1": false, "8.2": false, "8.3": false },
  "170-104": { "1.1": true, "1.2": true, "1.3": false, "2.1": false, "2.2": false, "2.3": false, "3.1": true, "3.2": false, "4.1": true, "4.2": false, "5.1": false, "5.2": false, "6.1": true, "6.2": false, "6.3": false, "7.1": false, "7.2": true, "8.1": true, "8.2": false, "8.3": false },
  "170-105": { "1.1": false, "1.2": false, "1.3": false, "2.1": false, "2.2": false, "2.3": false, "3.1": false, "3.2": false, "4.1": true, "4.2": true, "5.1": true, "5.2": true, "6.1": false, "6.2": false, "6.3": true, "7.1": true, "7.2": true, "8.1": false, "8.2": false, "8.3": true },
  "170-106": { "1.1": false, "1.2": false, "1.3": false, "2.1": false, "2.2": false, "2.3": false, "3.1": false, "3.2": false, "4.1": false, "4.2": false, "5.1": true, "5.2": true, "6.1": true, "6.2": true, "6.3": true, "7.1": false, "7.2": false, "8.1": false, "8.2": true, "8.3": true },
};

// Initial mapping state for a student by year
const getInitialMapping = (yearLevel: number, studentId?: string): Record<string, Record<string, boolean>> => {
  const mapping: Record<string, Record<string, boolean>> = {};
  const yearCourses = courses.filter(c => c.yearLevel === yearLevel);
  
  yearCourses.forEach(course => {
    mapping[course.courseCode] = {};
    getAllSubIndicators().forEach(({ subId }) => {
      // For สมชาย Year 1, use pre-filled data
      if (studentId === "64010001" && yearLevel === 1 && somchaiYear1Data[course.courseCode]) {
        mapping[course.courseCode][subId] = somchaiYear1Data[course.courseCode][subId] || false;
      } else {
        mapping[course.courseCode][subId] = false;
      }
    });
  });
  return mapping;
};

const StudentsInfo = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [mappingData, setMappingData] = useState<Record<string, Record<string, boolean>>>({});
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/components/Teacher/Advises/get_advises.php');
      if (res.data.status === 'success') {
        const formattedData = res.data.data.map((item: any) => ({
          ...item,
          email: item.email || `${item.studentId}@student.edu`
        }));
        setStudents(formattedData);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลนักศึกษาได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearchQuery = String(searchQuery ?? "").trim().toLowerCase();
  const matchesSearch = (value: unknown) =>
    String(value ?? "").toLowerCase().includes(normalizedSearchQuery);

  const filteredStudents = normalizedSearchQuery
    ? students.filter(
        (s) =>
          matchesSearch(s.name) ||
          matchesSearch(s.studentId) ||
          matchesSearch(s.email)
      )
    : students;

  const handleExport = () => {
    try {
      const headers = ['รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ชั้นปี', 'เกรดเฉลี่ย', 'สถานะ', 'อีเมล'];
      const csvRows = [headers.join(',')];
      
      filteredStudents.forEach(student => {
        csvRows.push([
          student.studentId,
          student.name,
          student.year,
          student.gpa,
          student.status,
          student.email
        ].join(','));
      });
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `รายชื่อนักศึกษา.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "ปกติ" || status === "normal" || status === "active") {
      return <Badge variant="outline" className="bg-success/10 text-success border-success/30">ปกติ</Badge>;
    }
    return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">{status === "normal" ? "ปกติ" : status}</Badge>;
  };

  const openStudentDetail = (student: Student) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
  };

  const mergeMappingData = (
    baseMapping: Record<string, Record<string, boolean>>,
    savedMapping: unknown
  ) => {
    if (!savedMapping || typeof savedMapping !== "object" || Array.isArray(savedMapping)) {
      return baseMapping;
    }

    const saved = savedMapping as Record<string, Record<string, boolean>>;
    const merged: Record<string, Record<string, boolean>> = {};

    Object.entries(baseMapping).forEach(([courseCode, subMapping]) => {
      merged[courseCode] = { ...subMapping };
      Object.keys(subMapping).forEach((subId) => {
        if (typeof saved[courseCode]?.[subId] === "boolean") {
          merged[courseCode][subId] = saved[courseCode][subId];
        }
      });
    });

    return merged;
  };

  const loadSavedMapping = async (student: Student, year: number) => {
    const initialMapping = getInitialMapping(year, student.studentId);
    setMappingData(initialMapping);
    setIsMappingLoading(true);

    try {
      const response = await api.get("/index.php?page=get-student-plo-mapping", {
        params: {
          student_id: student.studentId,
          year_level: year,
        },
      });
      const savedMapping = response.data?.data?.mapping;
      if (savedMapping) {
        setMappingData(mergeMappingData(initialMapping, savedMapping));
      }
    } catch (error) {
      toast({
        title: "โหลดข้อมูล PLO/CLO ไม่สำเร็จ",
        description: "จะแสดงข้อมูลเริ่มต้นให้ก่อน กรุณาลองเปิดใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsMappingLoading(false);
    }
  };

  const openMappingDialog = (student: Student | null = selectedStudent) => {
    if (!student) return;
    setSelectedStudent(student);
    // Set to current year of the student
    setSelectedYear(student.year);
    setDetailDialogOpen(false);
    setDialogOpen(true);
    loadSavedMapping(student, student.year);
  };

  const openMessageDialog = (student: Student | null = selectedStudent) => {
    if (!student) return;
    setSelectedStudent(student);
    setMessageTitle("");
    setMessageBody("");
    setDetailDialogOpen(false);
    setMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedStudent) {
      toast({
        title: "ไม่พบผู้รับข้อความ",
        description: "นักศึกษาคนนี้ยังไม่มีบัญชีผู้ใช้ที่เชื่อมกับระบบแจ้งเตือน",
        variant: "destructive",
      });
      return;
    }

    if (!messageTitle.trim() || !messageBody.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ต้องระบุหัวข้อและข้อความก่อนส่ง",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMessage(true);

    try {
      const response = await api.post("/index.php?page=send-advisor-message", {
        student_id: selectedStudent.studentId,
        title: messageTitle.trim(),
        message: messageBody.trim(),
        channel: "both",
        type: "info",
        category: "student",
        recipient_ids: [],
      });
      const sent = Number(response.data?.sent ?? 1);

      setMessageDialogOpen(false);
      setMessageTitle("");
      setMessageBody("");
      window.dispatchEvent(new Event("updateNotificationBadge"));
      toast({
        title: sent > 0 ? "ส่งข้อความสำเร็จ" : "ส่งข้อความไม่สำเร็จ",
        description:
          sent > 0
            ? `ส่งข้อความถึง ${selectedStudent.name} และเพิ่มในหน้าการแจ้งเตือนแล้ว`
            : "ผู้รับปิดการรับแจ้งเตือนหมวดนักศึกษาไว้",
        variant: sent > 0 ? undefined : "destructive",
      });
    } catch (error) {
      toast({
        title: "ส่งข้อความไม่สำเร็จ",
        description: "ไม่สามารถส่งข้อความไปยังการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
    if (selectedStudent) {
      loadSavedMapping(selectedStudent, yearNum);
    }
  };

  // Check if the selected year is read-only (previous years are locked)
  const isYearReadOnly = selectedStudent ? selectedYear < selectedStudent.year : false;

  const toggleMapping = (courseCode: string, subId: string) => {
    if (isYearReadOnly || isMappingLoading || isSavingMapping) return; // Don't allow changes for locked years or busy states
    
    setMappingData(prev => ({
      ...prev,
      [courseCode]: {
        ...prev[courseCode],
        [subId]: !prev[courseCode][subId]
      }
    }));
  };

  const saveMapping = async () => {
    if (!selectedStudent) return;

    setIsSavingMapping(true);
    try {
      await api.post("/index.php?page=save-student-plo-mapping", {
        student_id: selectedStudent.studentId,
        year_level: selectedYear,
        mapping: mappingData,
      });
    toast({
      title: "บันทึกสำเร็จ",
      description: `บันทึก Course-PLO Mapping ของ ${selectedStudent?.name} ปี ${selectedYear} เรียบร้อยแล้ว`,
    });
    setDialogOpen(false);
    } catch (error) {
      toast({
        title: "บันทึกไม่สำเร็จ",
        description: "ไม่สามารถเก็บข้อมูล PLO/CLO ได้",
        variant: "destructive",
      });
    } finally {
      setIsSavingMapping(false);
    }
  };

  // Get courses for selected year
  const yearCourses = courses.filter(c => c.yearLevel === selectedYear);

  // Group courses by category
  const coursesByCategory = yearCourses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  // Count total checked
  const getTotalChecked = () => {
    let count = 0;
    Object.values(mappingData).forEach(courseMapping => {
      Object.values(courseMapping).forEach(checked => {
        if (checked) count++;
      });
    });
    return count;
  };

  const getTotalPossible = () => {
    return yearCourses.length * getAllSubIndicators().length;
  };

  // Get available years for the student
  const getAvailableYears = () => {
    if (!selectedStudent) return [];
    return Array.from({ length: selectedStudent.year }, (_, i) => i + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">นักศึกษาในที่ปรึกษา</h1>
          <p className="text-muted-foreground mt-1">จัดการข้อมูลนักศึกษาและติดตาม PLO/YLO/CLO</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          ส่งออกรายชื่อ
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>นักศึกษา</TableHead>
              <TableHead>รหัสนักศึกษา</TableHead>
              <TableHead>ชั้นปี</TableHead>
              <TableHead>เกรดเฉลี่ย</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>PLO Mapping</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openStudentDetail(student)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{student.studentId}</TableCell>
                <TableCell className="text-muted-foreground">ปี {student.year}</TableCell>
                <TableCell>
                  <span className={student.gpa >= 3.0 ? "text-success font-medium" : "text-foreground"}>
                    {student.gpa.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(student.status)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="gap-2" onClick={(e) => { e.stopPropagation(); openMappingDialog(student); }}>
                    <Target className="h-4 w-4" />
                    ติ้ก PLO/CLO
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>แสดง {filteredStudents.length} จาก {students.length} คน</span>
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="app-dialog-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {selectedStudent?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold leading-tight">{selectedStudent?.name}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  รหัส {selectedStudent?.studentId}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5 pt-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    สถานะ
                  </div>
                  {getStatusBadge(selectedStudent.status)}
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    ชั้นปี
                  </div>
                  <p className="text-2xl font-bold">ปี {selectedStudent.year}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    GPA
                  </div>
                  <p className="text-2xl font-bold">{selectedStudent.gpa.toFixed(2)}</p>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 font-semibold">ข้อมูลทั่วไป</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">ชื่อ-นามสกุล</p>
                    <p className="font-semibold">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">รหัสนักศึกษา</p>
                    <p className="font-semibold">{selectedStudent.studentId}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">อีเมล</p>
                    <p className="font-semibold">{selectedStudent.email}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <h3 className="mb-4 font-semibold text-primary">ข้อมูลสุขภาพและวัคซีน (Health & Vaccine)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">โรคประจำตัว / ข้อควรระวัง</p>
                    <p className="font-medium whitespace-pre-wrap">{selectedStudent.health_conditions || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ประวัติการรับวัคซีน</p>
                    <p className="font-medium whitespace-pre-wrap">{selectedStudent.vaccine_history || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button variant="outline" className="gap-2" onClick={() => openMessageDialog()}>
                  <Mail className="h-4 w-4" />
                  ส่งข้อความ
                </Button>
                <Button className="gap-2" onClick={() => openMappingDialog()}>
                  <Target className="h-4 w-4" />
                  ติ๊ก PLO/CLO
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="app-dialog-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              ส่งข้อความ
            </DialogTitle>
            <DialogDescription>
              ข้อความจะถูกส่งถึง {selectedStudent?.name} และแสดงในหน้าการแจ้งเตือน
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">ผู้รับ</p>
              <p className="font-semibold">{selectedStudent?.name}</p>
              <p className="text-xs text-muted-foreground">{selectedStudent?.studentId}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-message-title">หัวข้อ</Label>
              <Input
                id="student-message-title"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="ระบุหัวข้อข้อความ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-message-body">ข้อความ</Label>
              <Textarea
                id="student-message-body"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="พิมพ์ข้อความถึงนักศึกษา..."
                className="min-h-[140px]"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)} disabled={isSendingMessage}>
              ยกเลิก
            </Button>
            <Button onClick={handleSendMessage} className="gap-2" disabled={isSendingMessage}>
              {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSendingMessage ? "กำลังส่ง..." : "ส่งข้อความ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course-PLO Mapping Matrix Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="app-dialog-screen overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedStudent?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedStudent?.name}</p>
                  <p className="text-sm text-muted-foreground font-normal">รหัส {selectedStudent?.studentId} • ปัจจุบันชั้นปี {selectedStudent?.year}</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {getTotalChecked()}/{getTotalPossible()} บรรลุ
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Course-PLO Mapping Matrix</h3>
                  <p className="text-sm text-muted-foreground">หลักสูตรพยาบาลศาสตรบัณฑิต</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isMappingLoading && (
                  <Badge variant="secondary" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    กำลังโหลด
                  </Badge>
                )}
                {isYearReadOnly && (
                  <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning border-warning/30">
                    <Lock className="h-3 w-3" />
                    ปีที่ผ่านมา (ไม่สามารถแก้ไขได้)
                  </Badge>
                )}
                <Select value={selectedYear.toString()} onValueChange={handleYearChange} disabled={isMappingLoading || isSavingMapping}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="เลือกปี" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableYears().map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        ปี {year} {year < (selectedStudent?.year || 0) && "🔒"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-[55vh] rounded-lg border">
              <div className="min-w-max">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-background">
                    {/* PLO Header Row */}
                    <TableRow className="bg-primary/5">
                      <TableHead className="sticky left-0 z-30 bg-primary/5 w-24 border-r" rowSpan={2}>
                        รหัสวิชา
                      </TableHead>
                      <TableHead className="sticky left-24 z-30 bg-primary/5 min-w-[200px] border-r" rowSpan={2}>
                        ชื่อวิชา
                      </TableHead>
                      {ploIndicators.map(plo => (
                        <TableHead 
                          key={plo.ploId} 
                          colSpan={plo.subIndicators.length}
                          className="text-center border-l bg-primary/10 text-primary font-semibold"
                        >
                          {plo.ploId}
                        </TableHead>
                      ))}
                    </TableRow>
                    {/* Sub-indicator Header Row */}
                    <TableRow className="bg-muted/50">
                      {ploIndicators.flatMap(plo => 
                        plo.subIndicators.map((sub, idx) => (
                          <TableHead 
                            key={sub} 
                            className={`text-center w-10 px-1 text-xs ${idx === 0 ? 'border-l' : ''}`}
                          >
                            {sub}
                          </TableHead>
                        ))
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
                      <Fragment key={category}>
                        {/* Category Header */}
                        <TableRow key={category} className="bg-muted/30">
                          <TableCell 
                            colSpan={2 + getAllSubIndicators().length} 
                            className="sticky left-0 font-semibold text-primary py-2"
                          >
                            {category}
                          </TableCell>
                        </TableRow>
                        {/* Course Rows */}
                        {categoryCourses.map(course => (
                          <TableRow key={course.courseCode} className={`hover:bg-muted/20 ${isYearReadOnly ? 'opacity-75' : ''}`}>
                            <TableCell className="sticky left-0 z-10 bg-background border-r font-medium">
                              {course.courseCode}
                            </TableCell>
                            <TableCell className="sticky left-24 z-10 bg-background border-r text-sm">
                              {course.courseName}
                            </TableCell>
                            {ploIndicators.flatMap(plo =>
                              plo.subIndicators.map((sub, idx) => (
                                <TableCell 
                                  key={`${course.courseCode}-${sub}`} 
                                  className={`text-center p-1 ${idx === 0 ? 'border-l' : ''}`}
                                >
                                  <Checkbox
                                    checked={mappingData[course.courseCode]?.[sub] || false}
                                    onCheckedChange={() => toggleMapping(course.courseCode, sub)}
                                    disabled={isYearReadOnly || isMappingLoading || isSavingMapping}
                                    className={`mx-auto ${isYearReadOnly || isMappingLoading || isSavingMapping ? 'cursor-not-allowed' : ''}`}
                                  />
                                </TableCell>
                              ))
                            )}
                          </TableRow>
                        ))}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
              <Button onClick={saveMapping} className="gap-2" disabled={isYearReadOnly || isMappingLoading || isSavingMapping}>
                {isSavingMapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsInfo;
