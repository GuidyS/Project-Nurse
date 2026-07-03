import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export default function CourseReports() {
  const { toast } = useToast();
  
  // States สำหรับเก็บข้อมูลที่ดึงจาก API
  const [filters, setFilters] = useState<{ years: string[], courses: any[] }>({ years: [], courses: [] });
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [reportData, setReportData] = useState<{ gradeDistribution: any[], cloAchievement: any[] }>({ gradeDistribution: [], cloAchievement: [] });
  
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // 1. ดึงข้อมูลปีการศึกษาและรายวิชามาใส่ Dropdown
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get('/index.php?page=get-report-filters');
        if (res.data.status === 'success') {
          const data = res.data.data;
          setFilters(data);
          if (data.years.length > 0) setSelectedYear(data.years[0]);
          if (data.courses.length > 0) setSelectedCourse(data.courses[0].subject_code);
        }
      } catch (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลตัวกรองได้', variant: 'destructive' });
      } finally {
        setIsLoadingFilters(false);
      }
    };
    fetchFilters();
  }, []);

  // 2. ดึงข้อมูลรายงานเมื่อปีการศึกษาหรือรายวิชาเปลี่ยน
  useEffect(() => {
    if (!selectedYear || !selectedCourse) return;
    
    const fetchReport = async () => {
      setIsLoadingReport(true);
      try {
        const res = await api.get(`/index.php?page=get-course-report&year=${selectedYear}&subject=${selectedCourse}`);
        if (res.data.status === 'success') {
          setReportData(res.data.data);
        }
      } catch (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลรายงานได้', variant: 'destructive' });
      } finally {
        setIsLoadingReport(false);
      }
    };
    fetchReport();
  }, [selectedYear, selectedCourse]);

  const handleExport = (format: string) => {
    if (!reportData.gradeDistribution.length) {
      toast({ title: 'ไม่มีข้อมูลให้ส่งออก', variant: 'destructive' });
      return;
    }
    if (format === 'pdf') {
      // ใช้การพิมพ์ของเบราว์เซอร์ (Save as PDF) เป็นการส่งออก PDF จริง
      window.print();
      return;
    }
    // Excel/CSV: สร้างไฟล์ CSV จริงจากข้อมูลรายงาน แล้วดาวน์โหลด
    const rows: string[][] = [
      ['รายงานผลการศึกษา'],
      ['ปีการศึกษา', String(selectedYear), 'รายวิชา', String(selectedCourse)],
      ['นักศึกษาทั้งหมด', String(totalStudents), 'อัตราการผ่าน(%)', String(passRate), 'เกรดเฉลี่ย', String(gpa)],
      [],
      ['เกรด', 'จำนวน (คน)'],
      ...reportData.gradeDistribution.map((g) => [String(g.grade), String(g.count)]),
    ];
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${c ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${selectedCourse}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'ส่งออกสำเร็จ', description: `ดาวน์โหลดไฟล์รายงานแล้ว` });
  };

  // การคำนวณตัวเลขสถิติแบบ Real-time
  const totalStudents = reportData.gradeDistribution.reduce((acc, g) => acc + g.count, 0);
  const passedStudents = reportData.gradeDistribution.filter(g => !['F'].includes(g.grade)).reduce((acc, g) => acc + g.count, 0);
  const passRate = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;
  
  // คำนวณเกรดเฉลี่ยของห้อง (GPA)
  const gradePoints: Record<string, number> = { 'A': 4, 'B+': 3.5, 'B': 3, 'C+': 2.5, 'C': 2, 'D+': 1.5, 'D': 1, 'F': 0 };
  const totalPoints = reportData.gradeDistribution.reduce((acc, g) => acc + (gradePoints[g.grade] * g.count), 0);
  const gpa = totalStudents > 0 ? (totalPoints / totalStudents).toFixed(2) : "0.00";

  if (isLoadingFilters) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายงานผลการศึกษา</h1>
            <p className="text-muted-foreground">สรุปผลการเรียนและการกระจายเกรด</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        {/* ตัวกรอง Course Selection */}
        <Card>
          <CardContent className="pt-6 flex gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกปีการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                {filters.years.map((year, index) => (
                  <SelectItem key={index} value={year.toString()}>ปีการศึกษา {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="เลือกรายวิชา" />
              </SelectTrigger>
              <SelectContent>
                {filters.courses.map((course, index) => (
                  <SelectItem key={index} value={course.subject_code}>
                    {course.subject_code} - {course.subject_name_th}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* สรุปสถิติ (Stats) */}
        {isLoadingReport ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{totalStudents}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">อัตราการผ่าน</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold text-green-600">{passRate}%</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">เกรดเฉลี่ยรวม</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{gpa}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">วิชาที่ประเมิน</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{selectedCourse}</div></CardContent>
              </Card>
            </div>

            {/* กราฟ Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" /> การกระจายเกรด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={reportData.gradeDistribution.filter(g => g.count > 0)}
                        cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="grade"
                        label={({ grade, count }) => `${grade}: ${count} คน`}
                      >
                        {reportData.gradeDistribution.filter(g => g.count > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> จำนวนนักศึกษาแบ่งตามเกรด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="จำนวน (คน)">
                        {reportData.gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}