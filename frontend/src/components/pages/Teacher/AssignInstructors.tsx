import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, UserPlus, BookOpen, Edit, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export default function AssignInstructors() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');

  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-assign-data');
      if (response.data.status === 'success') {
        setCoursesList(response.data.data.courses || []);
        setInstructorsList(response.data.data.instructors || []);
      } else {
        toast({
          title: "ดึงข้อมูลล้มเหลว",
          description: response.data.message || "ไม่สามารถดึงข้อมูลภาระงานอาจารย์ได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching assign data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ในการดึงข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCourses = coursesList.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    totalCourses: coursesList.length,
    assigned: coursesList.filter(c => c.instructor_id).length,
    unassigned: coursesList.filter(c => !c.instructor_id).length,
    totalInstructors: instructorsList.length,
  };

  const handleAssign = async () => {
    if (!selectedCourse || !selectedInstructor) {
      toast({
        title: "แจ้งเตือน",
        description: "กรุณาเลือกอาจารย์ผู้รับผิดชอบรายวิชานี้",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.post('/index.php?page=save-assign-instructor', {
        subject_code: selectedCourse,
        faculty_id: selectedInstructor
      });

      if (response.data.status === 'success') {
        toast({
          title: "สำเร็จ",
          description: "มอบหมายอาจารย์ผู้รับผิดชอบรายวิชาเรียบร้อยแล้ว"
        });
        setIsDialogOpen(false);
        setSelectedCourse(null);
        setSelectedInstructor('');
        fetchData();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error assigning instructor:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการส่งคำสั่งมอบหมายไปยังเซิร์ฟเวอร์",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnassign = async () => {
    if (!selectedCourse) return;

    try {
      setIsSaving(true);
      const response = await api.post('/index.php?page=save-assign-instructor', {
        subject_code: selectedCourse,
        faculty_id: "" // ส่งค่าว่างเพื่อยกเลิกการมอบหมาย
      });

      if (response.data.status === 'success') {
        toast({
          title: "สำเร็จ",
          description: "ยกเลิกการมอบหมายอาจารย์เรียบร้อยแล้ว"
        });
        setIsDialogOpen(false);
        setSelectedCourse(null);
        setSelectedInstructor('');
        fetchData();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถยกเลิกการมอบหมายได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error unassigning instructor:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการส่งคำสั่งไปยังเซิร์ฟเวอร์",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openAssignDialog = (courseId: string) => {
    setSelectedCourse(courseId);
    // ดึงค่าอาจารย์คนเดิมที่สอนอยู่ออกมารอใน dropdown ถ้ามี
    const currentCourse = coursesList.find(c => c.id === courseId);
    setSelectedInstructor(currentCourse?.instructor_id || '');
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">มอบหมาย Course Instructor</h1>
          <p className="text-muted-foreground">มอบหมายอาจารย์ประจำวิชาให้กับรายวิชาในหลักสูตร</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายวิชาทั้งหมด</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "-" : stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">มอบหมายแล้ว</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{isLoading ? "-" : stats.assigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยังไม่มอบหมาย</CardTitle>
              <Users className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{isLoading ? "-" : stats.unassigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อาจารย์ทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "-" : stats.totalInstructors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายวิชาในหลักสูตร</CardTitle>
            <CardDescription>รายวิชาทั้งหมดและอาจารย์ผู้รับผิดชอบ</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหารหัสวิชา, ชื่อวิชา หรืออาจารย์..."
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
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                ไม่พบวิชาตามเงื่อนไขที่สืบค้น
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">รหัสวิชา</TableHead>
                    <TableHead>ชื่อวิชา</TableHead>
                    <TableHead className="text-center">หน่วยกิต</TableHead>
                    <TableHead className="text-center">อาจารย์ประจำวิชา</TableHead>
                    <TableHead className="text-center">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium whitespace-nowrap">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                      <TableCell className="text-center">
                        {course.instructor ? (
                          <Badge className="bg-green-500 hover:bg-green-600 px-2.5 py-0.5">{course.instructor}</Badge>
                        ) : (
                          <Badge variant="destructive" className="px-2.5 py-0.5">ยังไม่มอบหมาย</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant={course.instructor ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => openAssignDialog(course.id)}
                          className="h-8"
                        >
                          {course.instructor ? (
                            <>
                              <Edit className="mr-1.5 h-3.5 w-3.5" />
                              เปลี่ยน
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                              มอบหมาย
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Instructors Overview */}
        <Card>
          <CardHeader>
            <CardTitle>ภาระงานอาจารย์</CardTitle>
            <CardDescription>จำนวนรายวิชาที่อาจารย์แต่ละท่านรับผิดชอบ</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : instructorsList.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">ไม่พบข้อมูลอาจารย์</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {instructorsList.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="flex items-center justify-between rounded-lg border p-4 bg-card shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{instructor.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">รหัส: {instructor.id}</p>
                    </div>
                    <Badge variant={instructor.courses_count > 0 ? 'default' : 'secondary'} className="text-xs">
                      {instructor.courses_count} วิชา
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assign Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="app-dialog-lg">
            <DialogHeader>
              <DialogTitle>มอบหมายอาจารย์ผู้รับผิดชอบรายวิชา</DialogTitle>
              <DialogDescription>
                เลือกอาจารย์ผู้ที่จะดูแลรับผิดชอบหลักสูตรในรายวิชานี้
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2 border-b pb-3">
                <Label className="font-semibold">รายวิชา</Label>
                <p className="text-sm font-medium text-foreground bg-muted p-2 rounded">
                  {coursesList.find(c => c.id === selectedCourse)?.code} - {coursesList.find(c => c.id === selectedCourse)?.name}
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">อาจารย์ประจำวิชา</Label>
                <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                  <SelectTrigger>
                    <SelectValue placeholder="กรุณาเลือกอาจารย์..." />
                  </SelectTrigger>
                  <SelectContent>
                    {instructorsList.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name} ({instructor.courses_count} วิชา)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2">
              {coursesList.find(c => c.id === selectedCourse)?.instructor_id ? (
                <Button
                  variant="destructive"
                  onClick={handleUnassign}
                  disabled={isSaving}
                  className="sm:mr-auto w-full sm:w-auto"
                >
                  {isSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  ยกเลิกการมอบหมาย
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end sm:ml-auto">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="w-full sm:w-auto">
                  ยกเลิก
                </Button>
                <Button onClick={handleAssign} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  มอบหมาย
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
