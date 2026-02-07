import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Target, TrendingUp } from 'lucide-react';

// Mock data
const mockCourses = [
  { id: '1', code: 'NUR101', name: 'พื้นฐานการพยาบาล', students: 45, credits: 3, semester: '2/2566', cloProgress: 75, status: 'active' },
  { id: '2', code: 'NUR201', name: 'การพยาบาลผู้ใหญ่ 1', students: 42, credits: 4, semester: '2/2566', cloProgress: 60, status: 'active' },
  { id: '3', code: 'NUR301', name: 'การพยาบาลเด็ก', students: 38, credits: 3, semester: '2/2566', cloProgress: 85, status: 'active' },
];

export default function MyCourses() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายวิชาที่รับผิดชอบ</h1>
          <p className="text-muted-foreground">รายวิชาทั้งหมดที่เป็นอาจารย์ประจำหลักสูตร</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายวิชาทั้งหมด</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCourses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockCourses.reduce((acc, c) => acc + c.students, 0)}
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
                {mockCourses.reduce((acc, c) => acc + c.credits, 0)}
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
                {Math.round(mockCourses.reduce((acc, c) => acc + c.cloProgress, 0) / mockCourses.length)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((course) => (
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
                  <Button variant="outline" className="flex-1">จัดการ CLO</Button>
                  <Button className="flex-1">ดูรายละเอียด</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
