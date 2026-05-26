import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Target, TrendingUp, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

// กำหนด Interface ให้ TypeScript รู้จักโครงสร้างข้อมูล
interface Course {
  id: string;
  code: string;
  name: string;
  students: number;
  credits: number;
  semester: string;
  cloProgress: number;
  status: string;
}

export default function MyCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลรายวิชาจาก API
  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get_teacher_courses_overview');
      if (response.data.status === 'success') {
        setCourses(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถดึงข้อมูลรายวิชาได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // คำนวณสถิติรวมสำหรับ Cards
  const totalStudents = courses.reduce((acc, c) => acc + c.students, 0);
  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const avgProgress = courses.length > 0 
    ? Math.round(courses.reduce((acc, c) => acc + c.cloProgress, 0) / courses.length) 
    : 0;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายวิชาที่รับผิดชอบ</h1>
          <p className="text-muted-foreground">รายวิชาทั้งหมดที่คุณเป็นผู้สอนหรือรับผิดชอบหลักสูตร</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">หน่วยกิตรวม</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ความคืบหน้าการให้คะแนน</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProgress}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Cards */}
        {courses.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">ไม่พบรายวิชาที่คุณรับผิดชอบในภาคการศึกษานี้</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge>{course.code}</Badge>
                    <Badge variant="outline">เทอม {course.semester}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
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
                      <span>ความคืบหน้าการประเมิน CLO</span>
                      <span className="font-medium">{course.cloProgress}%</span>
                    </div>
                    <Progress value={course.cloProgress} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    {/* ปุ่มสามารถปรับ URL ให้ลิงก์ไปหน้าตัดเกรด หรือกำหนด CLO ได้ภายหลัง */}
                    <Button variant="outline" className="flex-1">จัดการ CLO</Button>
                    <Button className="flex-1">ให้คะแนน</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}