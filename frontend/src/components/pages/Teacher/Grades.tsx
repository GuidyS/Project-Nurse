import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Save, Edit, Loader2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

const gradeOptions = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', '-'];

export default function Grades() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);

  // 1. ดึงข้อมูลวิชาสอนทั้งหมดเมื่อ Component Mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/index.php?page=get_grading_data');
        if (response.data.status === 'success') {
          const coursesList = response.data.data.courses || [];
          setCourses(coursesList);
          if (coursesList.length > 0) {
            setSelectedCourse(coursesList[0].id.toString());
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลวิชาเรียนได้",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // 2. ดึงข้อมูลคะแนนนักศึกษาตามรายวิชาที่เลือก
  useEffect(() => {
    if (!selectedCourse) return;
    const fetchGrades = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/index.php?page=get_grading_data&subject_id=${selectedCourse}`);
        if (response.data.status === 'success') {
          const students = response.data.data.students || [];
          setGrades(students.map((st: any) => ({
            id: st.id,
            studentId: st.studentId,
            name: st.name,
            midterm: st.scores?.midterm !== undefined ? st.scores.midterm : '',
            final: st.scores?.final !== undefined ? st.scores.final : '',
            assignment: st.scores?.assignment !== undefined ? st.scores.assignment : '',
            total: st.total || 0,
            grade: st.grade || '-',
            isEditing: false
          })));
        } else {
          toast({
            title: "ดึงข้อมูลล้มเหลว",
            description: response.data.message || "ไม่สามารถดึงข้อมูลคะแนนได้",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ในการดึงข้อมูลนักศึกษาได้",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
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

  const handleScoreChange = (id: string, field: 'midterm' | 'final' | 'assignment', value: string) => {
    setGrades(grades.map(g => {
      if (g.id === id) {
        const updated = { ...g, [field]: value };
        const midtermVal = parseFloat(updated.midterm as string) || 0;
        const finalVal = parseFloat(updated.final as string) || 0;
        const assignmentVal = parseFloat(updated.assignment as string) || 0;
        updated.total = Number((midtermVal + finalVal + assignmentVal).toFixed(2));
        return updated;
      }
      return g;
    }));
  };

  const handleEditClick = (id: string) => {
    setGrades(grades.map(g => 
      g.id === id ? { ...g, isEditing: true } : g
    ));
  };

  const handleSaveRow = async (student: any) => {
    if (!selectedCourse) return;
    try {
      setSavingStudentId(student.id);
      const payload = {
        subject_id: selectedCourse,
        students: [{
          id: student.id,
          scores: {
            midterm: student.midterm === '' ? '' : Number(student.midterm),
            final: student.final === '' ? '' : Number(student.final),
            assignment: student.assignment === '' ? '' : Number(student.assignment)
          },
          grade: student.grade
        }]
      };
      
      const response = await api.post('/index.php?page=save_grading_data', payload);
      if (response.data.status === 'success') {
        toast({
          title: "บันทึกสำเร็จ",
          description: `บันทึกคะแนนและเกรดของ ${student.name} เรียบร้อยแล้ว`,
        });
        // ปิดสถานะแก้ไขเฉพาะของนักศึกษาคนนี้
        setGrades(grades => grades.map(g => 
          g.id === student.id ? { ...g, isEditing: false } : g
        ));
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving row:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการส่งข้อมูลไปยังเซิร์ฟเวอร์",
        variant: "destructive",
      });
    } finally {
      setSavingStudentId(null);
    }
  };

  const currentCourseCode = courses.find(c => c.id.toString() === selectedCourse)?.code || '';
  const currentCourseName = courses.find(c => c.id.toString() === selectedCourse)?.name || '';

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">บันทึกเกรด</h1>
            <p className="text-muted-foreground">บันทึกและแก้ไขผลการเรียนวิชาที่สอน</p>
          </div>
        </div>

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกรายวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={isLoading && courses.length === 0}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="เลือกรายวิชา" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
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
              ผลการเรียน - {currentCourseCode} {currentCourseName}
            </CardTitle>
            <CardDescription>คะแนนและเกรดของนักศึกษาในระบบ</CardDescription>
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
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredGrades.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                ไม่พบข้อมูลนักศึกษาในวิชานี้
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                      <TableHead className="text-center">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.studentId}</TableCell>
                        <TableCell>{grade.name}</TableCell>
                        <TableCell className="text-center">
                          {grade.isEditing ? (
                            <Input
                              type="number"
                              value={grade.midterm}
                              onChange={(e) => handleScoreChange(grade.id, 'midterm', e.target.value)}
                              className="w-[90px] mx-auto text-center h-8"
                              min="0"
                            />
                          ) : (
                            grade.midterm !== '' ? grade.midterm : '-'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {grade.isEditing ? (
                            <Input
                              type="number"
                              value={grade.final}
                              onChange={(e) => handleScoreChange(grade.id, 'final', e.target.value)}
                              className="w-[90px] mx-auto text-center h-8"
                              min="0"
                            />
                          ) : (
                            grade.final !== '' ? grade.final : '-'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {grade.isEditing ? (
                            <Input
                              type="number"
                              value={grade.assignment}
                              onChange={(e) => handleScoreChange(grade.id, 'assignment', e.target.value)}
                              className="w-[90px] mx-auto text-center h-8"
                              min="0"
                            />
                          ) : (
                            grade.assignment !== '' ? grade.assignment : '-'
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold text-primary">
                          {grade.total}
                        </TableCell>
                        <TableCell className="text-center">
                          {grade.isEditing ? (
                            <Select
                              value={grade.grade}
                              onValueChange={(value) => handleGradeChange(grade.id, value)}
                            >
                              <SelectTrigger className="w-[85px] h-8 mx-auto">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {gradeOptions.map((g) => (
                                  <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge 
                              variant={grade.grade === 'F' ? 'destructive' : 'secondary'} 
                              className="text-sm font-semibold px-2.5 py-0.5"
                            >
                              {grade.grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant={grade.isEditing ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => grade.isEditing ? handleSaveRow(grade) : handleEditClick(grade.id)}
                            className="h-8"
                            disabled={savingStudentId === grade.id}
                          >
                            {savingStudentId === grade.id ? (
                              <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                กำลังบันทึก
                              </>
                            ) : grade.isEditing ? (
                              <>
                                <Check className="mr-1.5 h-3.5 w-3.5" />
                                เสร็จสิ้น
                              </>
                            ) : (
                              <>
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                แก้ไข
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
