import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Target, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import HasPermission from '../Auth/HasPermission';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'passed': return <Badge className="bg-green-500">ผ่านเกณฑ์</Badge>;
    case 'failed': return <Badge variant="destructive">ไม่ผ่านเกณฑ์</Badge>;
    default: return <Badge variant="secondary">รอดำเนินการ</Badge>;
  }
};

export default function CourseStudents() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [cloHeaders, setCloHeaders] = useState<string[]>([]);
  
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // 1. ดึงรายวิชาทั้งหมดที่อาจารย์ล็อกอินคนนี้สอน
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const res = await api.get('/index.php?page=get-course-students-clo');
        if (res.data.status === 'success') {
          const courseList = res.data.data.courses || [];
          setCourses(courseList);
          if (courseList.length > 0) {
            setSelectedCourse(courseList[0].id.toString());
          }
        }
      } catch (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดรายวิชาได้', variant: 'destructive' });
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchMyCourses();
  }, []);

  // 2. ดึงข้อมูลนักศึกษาและหัวข้อ CLO เมื่ออาจารย์สลับรายวิชา
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchStudentsCLO = async () => {
      setIsLoadingStudents(true);
      try {
        const res = await api.get(`/index.php?page=get-course-students-clo&subject_id=${selectedCourse}`);
        if (res.data.status === 'success') {
          setStudents(res.data.data.students || []);
          setCloHeaders(res.data.data.clo_headers || []);
        }
      } catch (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลคะแนน CLO ได้', variant: 'destructive' });
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudentsCLO();
  }, [selectedCourse]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.includes(searchTerm) ||
      student.studentId.includes(searchTerm)
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ผลสัมฤทธิ์ CLO รายบุคคล</h1>
          <p className="text-muted-foreground">ติดตามและประเมินคะแนน Course Learning Outcomes ของนักศึกษา</p>
        </div>

        {/* Course Selection Dropdown */}
        <Card>
          <CardHeader><CardTitle>เลือกรายวิชา</CardTitle></CardHeader>
          <CardContent>
            {isLoadingCourses ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="เลือกรายวิชาเพื่อดูข้อมูล" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Students CLO Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> รายชื่อนักศึกษาและการประเมินผล
            </CardTitle>
            <CardDescription>คะแนนเฉลี่ยร้อยละแยกตามผลลัพธ์การเรียนรู้ (CLO)</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสนักศึกษา</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    {/* 🔧 วนลูปหัวตาราง CLO แบบอัตโนมัติตามที่หลังบ้านส่งมา */}
                    {cloHeaders.map((clo) => (
                      <TableHead key={clo} className="text-center">{clo}</TableHead>
                    ))}
                    <TableHead className="text-center">ภาพรวมวิชา</TableHead>
                    <TableHead>ผลประเมิน</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5 + cloHeaders.length} className="text-center py-8 text-muted-foreground">
                        ไม่พบข้อมูลนักศึกษาในรายวิชานี้
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium font-mono">{student.studentId}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        
                        {/* 🔧 ดึงคะแนน CLO มาแสดงผลตาม Key ไดนามิก */}
                        {cloHeaders.map((clo) => (
                          <TableCell key={clo} className="text-center">
                            {student.scores && student.scores[clo] !== undefined ? `${student.scores[clo]}%` : '-'}
                          </TableCell>
                        ))}
                        
                        <TableCell className="text-center font-bold">{student.overall}%</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>
                          <HasPermission permission="manage_course_grading">
                            <Button size="sm" variant="outline">ให้เกรด CLO</Button>
                          </HasPermission>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}