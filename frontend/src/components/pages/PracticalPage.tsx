import { useState } from "react";
import { Search, Filter, Upload, Eye, Edit, MoreVertical, Star, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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

const practicalStudents = [
  { id: 1, studentId: "64010001", name: "นายสมชาย รักเรียน", hospital: "รพ.ศิริราช", ward: "อายุรกรรม", performance: 85, tasksCompleted: 12, totalTasks: 15 },
  { id: 2, studentId: "64010002", name: "นางสาวสมหญิง ใจดี", hospital: "รพ.จุฬาลงกรณ์", ward: "ศัลยกรรม", performance: 92, tasksCompleted: 14, totalTasks: 15 },
  { id: 3, studentId: "64010003", name: "นายวิชัย เก่งกล้า", hospital: "รพ.รามาธิบดี", ward: "กุมารเวชกรรม", performance: 78, tasksCompleted: 10, totalTasks: 15 },
  { id: 4, studentId: "64010004", name: "นางสาวพิมพ์ใจ สวยงาม", hospital: "รพ.ศิริราช", ward: "สูติศาสตร์", performance: 88, tasksCompleted: 13, totalTasks: 15 },
  { id: 5, studentId: "64010005", name: "นายกิตติ อดทน", hospital: "รพ.จุฬาลงกรณ์", ward: "อายุรกรรม", performance: 72, tasksCompleted: 9, totalTasks: 15 },
  { id: 6, studentId: "64010006", name: "นางสาวนภา ท้องฟ้า", hospital: "รพ.รามาธิบดี", ward: "ศัลยกรรม", performance: 95, tasksCompleted: 15, totalTasks: 15 },
  { id: 7, studentId: "64010007", name: "นายธนกฤต มั่นคง", hospital: "รพ.ศิริราช", ward: "กุมารเวชกรรม", performance: 82, tasksCompleted: 11, totalTasks: 15 },
  { id: 8, studentId: "64010008", name: "นางสาวอรุณี แสงทอง", hospital: "รพ.จุฬาลงกรณ์", ward: "สูติศาสตร์", performance: 90, tasksCompleted: 14, totalTasks: 15 },
];

/**
 * PracticalPage Component - หน้านักศึกษาฝึกปฏิบัติ
 * 
 * หน้าที่:
 * - แสดงรายชื่อนักศึกษาที่กำลังฝึกปฏิบัติ
 * - ติดตามความคืบหน้าและ performance ของนักศึกษา
 * - แสดงสถิติการฝึกปฏิบัติ
 * - ค้นหาและกรองนักศึกษา
 * 
 * Features:
 * - แสดงข้อมูลสถานที่ฝึก (โรงพยาบาล, หอผู้ป่วย)
 * - Progress bar แสดงความคืบหน้างาน
 * - Performance score และ badge
 * - Search และ filter
 */
const PracticalPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * filteredStudents - กรองนักศึกษาตาม searchQuery
   * 
   * ค้นหาจาก:
   * - ชื่อนักศึกษา
   * - รหัสนักศึกษา
   * - สถานที่ฝึก (โรงพยาบาล)
   */
  const filteredStudents = practicalStudents.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.studentId.includes(searchQuery) ||
      s.hospital.includes(searchQuery)
  );

  /**
   * getPerformanceBadge - สร้าง Badge component สำหรับแสดง performance
   * 
   * เกณฑ์:
   * - >= 90: ดีเยี่ยม (success)
   * - >= 80: ดี (primary)
   * - >= 70: พอใช้ (secondary)
   * - < 70: ต้องปรับปรุง (destructive)
   * 
   * @param {number} score - คะแนน performance (0-100)
   * @returns {JSX.Element} - Badge component
   */
  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-success text-success-foreground">ดีเยี่ยม</Badge>;
    if (score >= 80) return <Badge className="bg-primary text-primary-foreground">ดี</Badge>;
    if (score >= 70) return <Badge variant="secondary">พอใช้</Badge>;
    return <Badge variant="destructive">ต้องปรับปรุง</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">นักศึกษาฝึกปฏิบัติ</h1>
          <p className="text-muted-foreground mt-1">จัดการและติดตามนักศึกษาที่ดูแล (1:8)</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          อัปโหลดหลักฐาน
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{practicalStudents.length}</p>
          <p className="text-xs text-muted-foreground">นักศึกษาทั้งหมด</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {practicalStudents.filter((s) => s.performance >= 80).length}
          </p>
          <p className="text-xs text-muted-foreground">ผลงานดี</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">
            {practicalStudents.filter((s) => s.performance < 80 && s.performance >= 70).length}
          </p>
          <p className="text-xs text-muted-foreground">ต้องติดตาม</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {Math.round(practicalStudents.reduce((sum, s) => sum + s.performance, 0) / practicalStudents.length)}%
          </p>
          <p className="text-xs text-muted-foreground">เฉลี่ย Performance</p>
        </div>
      </div>

      {/* Search & Filter */}
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
              <TableHead>สถานที่ฝึก</TableHead>
              <TableHead>หอผู้ป่วย</TableHead>
              <TableHead>ความคืบหน้า</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
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
                      <span className="text-muted-foreground">{student.tasksCompleted}/{student.totalTasks}</span>
                    </div>
                    <Progress value={(student.tasksCompleted / student.totalTasks) * 100} className="h-1.5" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{student.performance}%</span>
                    {getPerformanceBadge(student.performance)}
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
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" /> ดูข้อมูล
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Star className="h-4 w-4" /> บันทึก Performance
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Calendar className="h-4 w-4" /> มอบหมายงาน
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Upload className="h-4 w-4" /> อัปโหลดหลักฐาน
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PracticalPage;
