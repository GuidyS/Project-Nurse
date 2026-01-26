import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, Mail, MoreVertical, Target, CheckCircle2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import React from "react";

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
import api from "@/lib/axios";

interface Student {
  id: number | string;
  title: string | null;
  first_name: string;
  last_name: string;
  gender: string | null;
  role: string | null;
  position: string | null;
  status: string | null;
  status_date: string | null;
  status_reason: string | null;
  description: string | null;
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

const fallbackStudents: Student[] = [
  {
    id: 6604800003,
    title: "นางสาว",
    first_name: "พรณุมาศ",
    last_name: "อ่อมน้อม",
    gender: "female",
    role: "user",
    position: "student",
    status: "Dropped",
    status_date: "2026-01-19 14:55:18",
    status_reason: null,
    description: null,
  },
  {
    id: 6604800015,
    title: "นาย",
    first_name: "สิมิลัน",
    last_name: "วิยาภรณ์",
    gender: "other",
    role: "user",
    position: "student",
    status: "Withdraw",
    status_date: "2026-01-19 14:55:09",
    status_reason: null,
    description: null,
  },
];

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

/**
 * getAllSubIndicators - แปลง PLO indicators เป็น array แบบ flat
 * 
 * หน้าที่:
 * - แปลงโครงสร้าง PLO indicators ที่มี sub-indicators เป็น array แบบ flat
 * - ใช้สำหรับสร้าง column headers ในตาราง Course-PLO Mapping Matrix
 * 
 * @returns {Array<{ploId: string, subId: string}>} - Array ของ sub-indicators พร้อม PLO ID
 * 
 * ตัวอย่างผลลัพธ์:
 * [
 *   { ploId: "PLO1", subId: "1.1" },
 *   { ploId: "PLO1", subId: "1.2" },
 *   { ploId: "PLO2", subId: "2.1" },
 *   ...
 * ]
 */
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

/**
 * getInitialMapping - สร้าง initial mapping state สำหรับ Course-PLO Matrix
 * 
 * หน้าที่:
 * - สร้างโครงสร้าง mapping สำหรับแต่ละ course และ sub-indicator
 * - ใช้ข้อมูล pre-filled สำหรับ student/ปีที่กำหนด (ถ้ามี)
 * - ค่าเริ่มต้นเป็น false (ยังไม่ได้ติ้ก)
 * 
 * @param {number} yearLevel - ชั้นปีที่ต้องการสร้าง mapping
 * @param {string} studentId - รหัสนักศึกษา (optional, ใช้สำหรับ pre-filled data)
 * @returns {Record<string, Record<string, boolean>>} - Mapping object
 * 
 * โครงสร้างผลลัพธ์:
 * {
 *   "170-101": { "1.1": false, "1.2": true, ... },
 *   "170-102": { "1.1": true, "1.2": false, ... },
 *   ...
 * }
 */
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

/**
 * StudentsPage Component - หน้าจัดการข้อมูลนักศึกษา
 * 
 * หน้าที่:
 * - แสดงรายชื่อนักศึกษาในตาราง
 * - ค้นหาและกรองนักศึกษา
 * - จัดการ Course-PLO Mapping Matrix สำหรับแต่ละนักศึกษา
 * - ดึงข้อมูลนักศึกษาจาก API
 * 
 * Features:
 * - Search/Filter นักศึกษา
 * - Course-PLO Mapping Matrix (ติ้ก checkbox เพื่อ map course กับ PLO)
 * - Dialog สำหรับดูและแก้ไข mapping
 * - Status badges สำหรับสถานะนักศึกษา
 */
const StudentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [mappingData, setMappingData] = useState<Record<string, Record<string, boolean>>>({});
  const [students, setStudents] = useState<any[]>([]);
  const { toast } = useToast();

  /**
   * getStudentKey - แปลง student ID เป็น string
   * ใช้เป็น key สำหรับ React list rendering
   */
  const getStudentKey = (s: Student) => String(s.id);
  
  /**
   * getStudentName - สร้างชื่อเต็มจากข้อมูลนักศึกษา
   * Format: "title + first_name + last_name"
   */
  const getStudentName = (s: Student) =>
    `${s.title ?? ""}${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();

  /**
   * useEffect Hook - ดึงข้อมูลนักศึกษาจาก API
   * 
   * ทำงานครั้งเดียวเมื่อ component mount
   * 
   * Flow:
   * 1. เรียก API GET 
   * 2. ถ้าสำเร็จและได้ array → เก็บข้อมูลใน state (setStudents)
   * 3. ถ้า error → log error ใน console (ใช้ fallbackStudents)
   */
  useEffect(() => {
  api
    .get("/components/StudentPage/get_student.php")
    .then((res) => {
      console.log("Data from API:", res.data);
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      }
    })
    .catch((err) => {
      console.error("Error fetching students:", err);
    });
}, []);


  /**
   * filteredStudents - กรองนักศึกษาตาม searchQuery
   * 
   * ค้นหาจาก:
   * - ชื่อนักศึกษา (getStudentName)
   * - รหัสนักศึกษา (getStudentKey)
   */
  const filteredStudents = students.filter(
    (s) =>
      getStudentName(s).includes(searchQuery) ||
      getStudentKey(s).includes(searchQuery)
  );

  /**
   * getStatusBadge - สร้าง Badge component สำหรับแสดงสถานะนักศึกษา
   * 
   * @param {string} status - สถานะนักศึกษา
   * @returns {JSX.Element} - Badge component
   */
  const getStatusBadge = (status: string) => {
    if (status === "ปกติ") {
      return <Badge variant="outline" className="bg-success/10 text-success border-success/30">ปกติ</Badge>;
    }
    return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">{status}</Badge>;
  };

  /**
   * openStudentDetail - เปิด dialog แสดงรายละเอียดและ Course-PLO Mapping
   * 
   * หน้าที่:
   * - ตั้งค่า selectedStudent
   * - ตั้งค่า selectedYear เป็นปี 1 (ค่าเริ่มต้น)
   * - สร้าง initial mapping data
   * - เปิด dialog
   * 
   * @param {Student} student - นักศึกษาที่ต้องการดูรายละเอียด
   */
  const openStudentDetail = (student: Student) => {
    setSelectedStudent(student);
    // DB ไม่มีชั้นปี -> ใช้ปี 1 เป็นค่าเริ่มต้นสำหรับ Matrix
    setSelectedYear(1);
    setMappingData(getInitialMapping(1, getStudentKey(student)));
    setDialogOpen(true);
  };

  /**
   * handleYearChange - จัดการเมื่อเปลี่ยนชั้นปีใน dialog
   * 
   * หน้าที่:
   * - อัพเดท selectedYear
   * - สร้าง mapping data ใหม่สำหรับปีที่เลือก
   * 
   * @param {string} year - ปีที่เลือก (string จาก Select component)
   */
  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
    setMappingData(getInitialMapping(yearNum, selectedStudent ? getStudentKey(selectedStudent) : undefined));
  };

  /**
   * isYearReadOnly - ตรวจสอบว่าปีที่เลือกสามารถแก้ไขได้หรือไม่
   * 
   * ตอนนี้: DB ไม่มีชั้นปี → ไม่ล็อคปี (แก้ไขได้ทุกปี)
   */
  const isYearReadOnly = false;

  /**
   * toggleMapping - สลับสถานะ checkbox ใน Course-PLO Matrix
   * 
   * หน้าที่:
   * - ติ้ก/ยกเลิกการ map ระหว่าง course กับ sub-indicator
   * - อัพเดท mappingData state
   * 
   * @param {string} courseCode - รหัสวิชา (เช่น "170-101")
   * @param {string} subId - Sub-indicator ID (เช่น "1.1")
   */
  const toggleMapping = (courseCode: string, subId: string) => {
    if (isYearReadOnly) return; // Don't allow changes for locked years
    
    setMappingData(prev => ({
      ...prev,
      [courseCode]: {
        ...prev[courseCode],
        [subId]: !prev[courseCode][subId]
      }
    }));
  };

  /**
   * saveMapping - บันทึก Course-PLO Mapping
   * 
   * หน้าที่:
   * - แสดง toast notification แจ้งว่าบันทึกสำเร็จ
   * - ปิด dialog
   * 
   * TODO: ส่งข้อมูลไป API เพื่อบันทึกลง database
   */
  const saveMapping = () => {
    toast({
      title: "บันทึกสำเร็จ",
      description: `บันทึก Course-PLO Mapping ของ ${selectedStudent ? getStudentName(selectedStudent) : ""} ปี ${selectedYear} เรียบร้อยแล้ว`,
    });
    setDialogOpen(false);
  };

  /**
   * yearCourses - รายวิชาที่อยู่ในชั้นปีที่เลือก
   */
  const yearCourses = courses.filter(c => c.yearLevel === selectedYear);

  /**
   * coursesByCategory - จัดกลุ่มรายวิชาตามหมวดหมู่
   * 
   * @returns {Record<string, Course[]>} - Object ที่ key เป็นหมวดหมู่, value เป็น array ของ courses
   */
  const coursesByCategory = yearCourses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  /**
   * getTotalChecked - นับจำนวน checkbox ที่ติ้กแล้วใน Matrix
   * 
   * @returns {number} - จำนวน checkbox ที่ติ้กแล้ว
   */
  const getTotalChecked = () => {
    let count = 0;
    Object.values(mappingData).forEach(courseMapping => {
      Object.values(courseMapping).forEach(checked => {
        if (checked) count++;
      });
    });
    return count;
  };

  /**
   * getTotalPossible - คำนวณจำนวน checkbox ทั้งหมดใน Matrix
   * 
   * สูตร: จำนวนรายวิชา × จำนวน sub-indicators
   * 
   * @returns {number} - จำนวน checkbox ทั้งหมด
   */
  const getTotalPossible = () => {
    return yearCourses.length * getAllSubIndicators().length;
  };

  /**
   * getAvailableYears - รายการปีที่สามารถเลือกได้
   * 
   * ตอนนี้: DB ไม่มีชั้นปี → แสดงปีเดียว (ปี 1)
   * 
   * @returns {number[]} - Array ของปีที่สามารถเลือกได้
   */
  const getAvailableYears = () => [1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">รายชื่อนักศึกษา</h1>
          <p className="text-muted-foreground mt-1">จัดการข้อมูลนักศึกษาและติดตาม PLO/YLO/CLO</p>
        </div>
        {/*<Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          ส่งออกรายชื่อ
        </Button>*/}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          กรอง
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>นักศึกษา</TableHead>
              <TableHead>รหัส</TableHead>
              <TableHead>เพศ</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>อัปเดตล่าสุด</TableHead>
              <TableHead>PLO Mapping</TableHead>
              <TableHead className="text-right">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={getStudentKey(student)} className="cursor-pointer hover:bg-muted/50" onClick={() => openStudentDetail(student)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                        {getStudentName(student).charAt(0) || "-"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{getStudentName(student)}</p>
                      <p className="text-xs text-muted-foreground">{student.role ?? "-"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{getStudentKey(student)}</TableCell>
                <TableCell className="text-muted-foreground">{student.gender ?? "-"}</TableCell>
                <TableCell className="text-muted-foreground">{student.position ?? "-"}</TableCell>
                <TableCell>{getStatusBadge(student.status ?? "-")}</TableCell>
                <TableCell className="text-muted-foreground">{student.status_date ?? "-"}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="gap-2" onClick={(e) => { e.stopPropagation(); openStudentDetail(student); }}>
                    <Target className="h-4 w-4" />
                    ติ้ก PLO/CLO
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" onClick={() => openStudentDetail(student)}>
                        <Eye className="h-4 w-4" /> ดูข้อมูล
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      {/* Course-PLO Mapping Matrix Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedStudent ? getStudentName(selectedStudent).charAt(0) : "-"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedStudent ? getStudentName(selectedStudent) : ""}</p>
                  <p className="text-sm text-muted-foreground font-normal">
                    รหัส {selectedStudent ? getStudentKey(selectedStudent) : "-"}
                  </p>
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
                {isYearReadOnly && (
                  <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning border-warning/30">
                    <Lock className="h-3 w-3" />
                    ปีที่ผ่านมา (ไม่สามารถแก้ไขได้)
                  </Badge>
                )}
                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="เลือกปี" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableYears().map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        ปี {year}
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
                      <React.Fragment key={category}>
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
                                    disabled={isYearReadOnly}
                                    className={`mx-auto ${isYearReadOnly ? 'cursor-not-allowed' : ''}`}
                                  />
                                </TableCell>
                              ))
                            )}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
              <Button onClick={saveMapping} className="gap-2" disabled={isYearReadOnly}>
                <CheckCircle2 className="h-4 w-4" />
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsPage;
