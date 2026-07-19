import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Save, Edit, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

const gradeOptions = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', '-'];

export default function Grades() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [grades, setGrades] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. โหลดรายวิชาทั้งหมดที่อาจารย์คนนี้สอน
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/index.php?page=get-grading-data');
        if (res.data.status === 'success') {
          const courseList = res.data.data.courses || [];
          setCourses(courseList);
          if (courseList.length > 0) {
            setSelectedCourse(courseList[0].id.toString());
          }
        }
      } catch (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดรายวิชาได้', variant: 'destructive' });
      }
    };
    fetchCourses();
  }, []);

  // 2. โหลดรายชื่อนักศึกษาเมื่อเปลี่ยนวิชา
  useEffect(() => {
    if (!selectedCourse) return;
    
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/index.php?page=get-grading-data&subject_id=${selectedCourse}`);
        if (res.data.status === 'success') {
          setGrades(res.data.data.students || []);
        }
      } catch (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดรายชื่อนักศึกษาได้', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedCourse]);

  const filteredGrades = grades.filter(
    (grade) =>
      grade.name.includes(searchTerm) ||
      grade.studentId.includes(searchTerm)
  );

  const handleGradeChange = (id: string, newGrade: string) => {
    setGrades(grades.map(g => 
      g.id === id ? { ...g, grade: newGrade } : g
    ));
  };

  // 3. บันทึกเกรดทั้งหมด
  const handleSaveAll = async () => {
    if (!selectedCourse || grades.length === 0) return;
    
    setIsSaving(true);
    try {
      const res = await api.post('/index.php?page=save-grading-data', {
        subject_id: selectedCourse,
        students: grades
      });
      
      if (res.data.status === 'success') {
        toast({ title: 'บันทึกสำเร็จ', description: 'บันทึกผลการเรียนทั้งหมดเรียบร้อยแล้ว' });
      } else {
        toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกเกรดได้', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">บันทึกเกรด</h1>
            <p className="text-muted-foreground">บันทึกและแก้ไขผลการเรียนวิชาที่สอน</p>
          </div>
          <Button onClick={handleSaveAll} disabled={isSaving || grades.length === 0}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            บันทึกทั้งหมด
          </Button>
        </div>

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกรายวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="เลือกรายวิชา" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ผลการเรียน
            </CardTitle>
            <CardDescription>คะแนนและเกรดของนักศึกษา</CardDescription>
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
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสนักศึกษา</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead className="text-center">สอบกลางภาค (30%)</TableHead>
                    <TableHead className="text-center">สอบปลายภาค (40%)</TableHead>
                    <TableHead className="text-center">งานมอบหมาย (30%)</TableHead>
                    <TableHead className="text-center">รวม</TableHead>
                    <TableHead className="text-center">เกรด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">ไม่มีข้อมูลนักศึกษาในวิชานี้</TableCell>
                    </TableRow>
                  ) : (
                    filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium font-mono">{grade.studentId}</TableCell>
                        <TableCell>{grade.name}</TableCell>
                        <TableCell className="text-center text-muted-foreground">-</TableCell>
                        <TableCell className="text-center text-muted-foreground">-</TableCell>
                        <TableCell className="text-center text-muted-foreground">-</TableCell>
                        <TableCell className="text-center font-bold text-muted-foreground">-</TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={grade.grade === null ? '-' : grade.grade}
                            onValueChange={(value) => handleGradeChange(grade.id, value)}
                          >
                            <SelectTrigger className="w-[80px] mx-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {gradeOptions.map((g) => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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