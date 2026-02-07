import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, UserPlus, BookOpen, Edit } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockCourses = [
  { id: '1', code: 'NUR101', name: 'พื้นฐานการพยาบาล', instructor: 'อ.สมศักดิ์ รักดี', credits: 3, students: 45, semester: '2/2566' },
  { id: '2', code: 'NUR201', name: 'การพยาบาลผู้ใหญ่ 1', instructor: 'อ.มานี สุขใจ', credits: 4, students: 42, semester: '2/2566' },
  { id: '3', code: 'NUR202', name: 'การพยาบาลผู้ใหญ่ 2', instructor: null, credits: 4, students: 40, semester: '2/2566' },
  { id: '4', code: 'NUR301', name: 'การพยาบาลเด็ก', instructor: 'อ.วิชัย ตั้งใจ', credits: 3, students: 38, semester: '2/2566' },
  { id: '5', code: 'NUR302', name: 'การพยาบาลจิตเวช', instructor: null, credits: 3, students: 38, semester: '2/2566' },
  { id: '6', code: 'NUR401', name: 'การบริหารการพยาบาล', instructor: 'อ.สมหญิง มุ่งมั่น', credits: 2, students: 35, semester: '2/2566' },
];

const mockInstructors = [
  { id: '1', name: 'อ.สมศักดิ์ รักดี', courses: 2, specialization: 'การพยาบาลพื้นฐาน' },
  { id: '2', name: 'อ.มานี สุขใจ', courses: 1, specialization: 'การพยาบาลผู้ใหญ่' },
  { id: '3', name: 'อ.วิชัย ตั้งใจ', courses: 1, specialization: 'การพยาบาลเด็ก' },
  { id: '4', name: 'อ.สมหญิง มุ่งมั่น', courses: 1, specialization: 'การบริหารการพยาบาล' },
  { id: '5', name: 'อ.ปิยะ พัฒนา', courses: 0, specialization: 'การพยาบาลจิตเวช' },
  { id: '6', name: 'อ.มานะ สร้างสรรค์', courses: 0, specialization: 'การพยาบาลผู้ใหญ่' },
];

export default function AssignInstructors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');

  const filteredCourses = mockCourses.filter(
    (course) =>
      course.name.includes(searchTerm) ||
      course.code.includes(searchTerm) ||
      (course.instructor && course.instructor.includes(searchTerm))
  );

  const stats = {
    totalCourses: mockCourses.length,
    assigned: mockCourses.filter(c => c.instructor).length,
    unassigned: mockCourses.filter(c => !c.instructor).length,
    totalInstructors: mockInstructors.length,
  };

  const handleAssign = () => {
    console.log('Assigning instructor:', selectedInstructor, 'to course:', selectedCourse);
    setIsDialogOpen(false);
    setSelectedCourse(null);
    setSelectedInstructor('');
  };

  const openAssignDialog = (courseId: string) => {
    setSelectedCourse(courseId);
    setIsDialogOpen(true);
  };

  return (
    <MainLayout>
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
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">มอบหมายแล้ว</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.assigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยังไม่มอบหมาย</CardTitle>
              <Users className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.unassigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อาจารย์ทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInstructors}</div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสวิชา</TableHead>
                  <TableHead>ชื่อวิชา</TableHead>
                  <TableHead>หน่วยกิต</TableHead>
                  <TableHead>นักศึกษา</TableHead>
                  <TableHead>ภาคเรียน</TableHead>
                  <TableHead>อาจารย์ผู้สอน</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>{course.students}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>
                      {course.instructor ? (
                        <Badge className="bg-green-500">{course.instructor}</Badge>
                      ) : (
                        <Badge variant="destructive">ยังไม่มอบหมาย</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={course.instructor ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => openAssignDialog(course.id)}
                      >
                        {course.instructor ? (
                          <>
                            <Edit className="mr-1 h-3 w-3" />
                            เปลี่ยน
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1 h-3 w-3" />
                            มอบหมาย
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Instructors Overview */}
        <Card>
          <CardHeader>
            <CardTitle>ภาระงานอาจารย์</CardTitle>
            <CardDescription>จำนวนรายวิชาที่อาจารย์แต่ละท่านรับผิดชอบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {mockInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{instructor.name}</p>
                    <p className="text-sm text-muted-foreground">{instructor.specialization}</p>
                  </div>
                  <Badge variant={instructor.courses > 0 ? 'default' : 'secondary'}>
                    {instructor.courses} วิชา
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assign Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>มอบหมายอาจารย์ผู้สอน</DialogTitle>
              <DialogDescription>
                เลือกอาจารย์ที่จะรับผิดชอบรายวิชานี้
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>รายวิชา</Label>
                <p className="text-sm text-muted-foreground">
                  {mockCourses.find(c => c.id === selectedCourse)?.code} - {mockCourses.find(c => c.id === selectedCourse)?.name}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>อาจารย์ผู้สอน</Label>
                <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกอาจารย์" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInstructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name} ({instructor.courses} วิชา)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleAssign}>มอบหมาย</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
