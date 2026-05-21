import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DialogCourse from '@/components/ui/DialogCourse';
import EditCourseDialog from '@/components/ui/EditCourseDialog';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Target, TrendingUp,Plus } from 'lucide-react';
import CLOManagePage from '@/components/ui/CLOManagePage';
import CourseDetailPage from '@/components/ui/CourseDetailPage';
import api from '@/lib/axios';

const initialCourses = [
  { id: '1', code: 'NUR101', name: 'พื้นฐานการพยาบาล', students: 45, credits: 3, semester: '2/2566', cloProgress: 75, status: 'active' },
  { id: '2', code: 'NUR201', name: 'การพยาบาลผู้ใหญ่ 1', students: 42, credits: 4, semester: '2/2566', cloProgress: 60, status: 'active' },
  { id: '3', code: 'NUR301', name: 'การพยาบาลเด็ก', students: 38, credits: 3, semester: '2/2566', cloProgress: 85, status: 'active' },
];

export default function MyCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [detailCourseCode, setDetailCourseCode] = useState<string | null>(null);
  const [cloCourseCode, setCloCourseCode] = useState<string | null>(null);
  const [cloReturnToDetailCode, setCloReturnToDetailCode] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data } = await api.get("?page=teacher-courses&action=get_courses");
        if (data.status === "success") {
          setCourses(
            data.data.map((course: any) => ({
              ...course,
              id: String(course.id),
              cloProgress: course.cloProgress ?? 0,
              status: course.status ?? "active",
            }))
          );
        }
      } catch (error) {
        console.error("Error loading my courses:", error);
      }
    };

    loadCourses();
  }, []);
  // Handler to update a course
  const handleEditCourse = (updated: any) => {
    setCourses((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
  };

  // Handler to delete a course
  const handleDeleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setEditDialogOpen(false); 
  };

  // Handler to add a new course from DialogCourse
  const handleAddCourse = (course: any) => {
    setCourses((prev) => [
      ...prev,
      {
        ...course,
        id: (prev.length + 1).toString(),
        students: 0,
        cloProgress: 0,
        status: 'active',
      },
    ]);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายวิชาที่รับผิดชอบ</h1>
          <p className="text-muted-foreground">รายวิชาทั้งหมดที่เป็นอาจารย์ประจำหลักสูตร</p>
        </div>
        <div className="flex justify-end">
          <DialogCourse onAddCourse={handleAddCourse} />
        </div>
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-bฟetween space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายวิชาทั้งหมด</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.reduce((acc, c) => acc + c.students, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">หน่วยกิตรวม</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.reduce((acc, c) => acc + c.credits, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ค่าเฉลี่ย CLO</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.cloProgress, 0) / courses.length) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge>{course.code}</Badge>
                  <Badge variant="outline">{course.semester}</Badge>
                </div>
                <CardTitle className="text-lg">{course.name}</CardTitle>
                <CardDescription>{course.credits} หน่วยกิต</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    นักศึกษา
                  </span>
                  <span className="font-medium">{course.students} คน</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>ความคืบหน้า CLO</span>
                    <span className="font-medium">{course.cloProgress}%</span>
                  </div>
                  <Progress value={course.cloProgress} />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setCloReturnToDetailCode(null);
                      setCloCourseCode(course.code);
                    }}
                  >
                    จัดการ CLO
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setDetailCourseCode(course.code)}
                  >
                    ดูรายละเอียด
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-lg"
                    onClick={() => {
                      setEditingCourse(course);
                      setEditDialogOpen(true);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
                    แก้ไข
                  </Button>
                </div>
                    <EditCourseDialog
                      course={editingCourse}
                      open={editDialogOpen}
                      onOpenChange={setEditDialogOpen}
                      onSave={handleEditCourse}
                      onDelete={handleDeleteCourse}
                    />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CourseDetailPage
        courseCode={detailCourseCode || undefined}
        onBack={() => setDetailCourseCode(null)}
        onManageCLO={(courseCode) => {
          setCloReturnToDetailCode(courseCode);
          setDetailCourseCode(null);
          setCloCourseCode(courseCode);
        }}
      />

      <CLOManagePage
        courseCode={cloCourseCode || undefined}
        onBack={() => {
          setCloCourseCode(null);
          setCloReturnToDetailCode(null);
        }}
        onBackToDetail={
          cloReturnToDetailCode
            ? () => {
                setCloCourseCode(null);
                setDetailCourseCode(cloReturnToDetailCode);
                setCloReturnToDetailCode(null);
              }
            : undefined
        }
      />
    </>
  );
}
