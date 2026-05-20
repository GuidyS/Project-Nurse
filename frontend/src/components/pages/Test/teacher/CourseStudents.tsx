import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Download, Target } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

// Mock data
const mockStudents = [
  { id: '1', studentId: '64010001', name: 'สมชาย ใจดี', clo1: 85, clo2: 78, clo3: 90, clo4: 82, overall: 84, status: 'passed' },
  { id: '2', studentId: '64010002', name: 'สมหญิง รักเรียน', clo1: 72, clo2: 80, clo3: 85, clo4: 75, overall: 78, status: 'passed' },
  { id: '3', studentId: '65010001', name: 'มานะ ตั้งใจ', clo1: 68, clo2: 65, clo3: 70, clo4: 72, overall: 69, status: 'passed' },
  { id: '4', studentId: '65010002', name: 'มานี ขยัน', clo1: 55, clo2: 50, clo3: 60, clo4: 58, overall: 56, status: 'failed' },
  { id: '5', studentId: '66010001', name: 'ปิติ สุขใจ', clo1: 92, clo2: 88, clo3: 95, clo4: 90, overall: 91, status: 'passed' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'passed':
      return <Badge className="bg-green-500">ผ่าน</Badge>;
    case 'failed':
      return <Badge variant="destructive">ไม่ผ่าน</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function CourseStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('NUR101');

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.includes(searchTerm) ||
      student.studentId.includes(searchTerm)
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายชื่อนักศึกษา</h1>
            <p className="text-muted-foreground">นักศึกษาที่ลงทะเบียนในรายวิชาที่รับผิดชอบ</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ส่งออก
          </Button>
        </div>

        {/* Course Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="เลือกรายวิชา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NUR101">NUR101 - พื้นฐานการพยาบาล</SelectItem>
                  <SelectItem value="NUR201">NUR201 - การพยาบาลผู้ใหญ่ 1</SelectItem>
                  <SelectItem value="NUR301">NUR301 - การพยาบาลเด็ก</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหานักศึกษา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[250px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStudents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผ่าน CLO</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockStudents.filter(s => s.status === 'passed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ไม่ผ่าน CLO</CardTitle>
              <Target className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {mockStudents.filter(s => s.status === 'failed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราการผ่าน</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((mockStudents.filter(s => s.status === 'passed').length / mockStudents.length) * 100)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>ผลการประเมิน CLO รายบุคคล</CardTitle>
            <CardDescription>คะแนนผลลัพธ์การเรียนรู้ระดับรายวิชา</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-center">CLO1</TableHead>
                  <TableHead className="text-center">CLO2</TableHead>
                  <TableHead className="text-center">CLO3</TableHead>
                  <TableHead className="text-center">CLO4</TableHead>
                  <TableHead className="text-center">รวม</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className="text-center">{student.clo1}</TableCell>
                    <TableCell className="text-center">{student.clo2}</TableCell>
                    <TableCell className="text-center">{student.clo3}</TableCell>
                    <TableCell className="text-center">{student.clo4}</TableCell>
                    <TableCell className="text-center font-bold">{student.overall}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
