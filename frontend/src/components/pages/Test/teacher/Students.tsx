import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Download, GraduationCap } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockStudents = [
  { id: '1', studentId: '64010001', name: 'สมชาย ใจดี', year: 3, course: 'NUR101, NUR201', gpa: 3.45, status: 'active' },
  { id: '2', studentId: '64010002', name: 'สมหญิง รักเรียน', year: 3, course: 'NUR101', gpa: 3.78, status: 'active' },
  { id: '3', studentId: '65010001', name: 'มานะ ตั้งใจ', year: 2, course: 'NUR101, NUR201', gpa: 3.22, status: 'active' },
  { id: '4', studentId: '65010002', name: 'มานี ขยัน', year: 2, course: 'NUR201', gpa: 2.95, status: 'warning' },
  { id: '5', studentId: '66010001', name: 'ปิติ สุขใจ', year: 1, course: 'NUR101', gpa: 3.55, status: 'active' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">ปกติ</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-500">ต้องติดตาม</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');

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
            <p className="text-muted-foreground">นักศึกษาที่ลงทะเบียนในรายวิชาที่สอน</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ส่งออกรายชื่อ
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
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
              <CardTitle className="text-sm font-medium">สถานะปกติ</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockStudents.filter(s => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ต้องติดตาม</CardTitle>
              <Users className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mockStudents.filter(s => s.status === 'warning').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อนักศึกษา</CardTitle>
            <CardDescription>นักศึกษาทั้งหมดที่ลงทะเบียนในรายวิชาที่สอน</CardDescription>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>ชั้นปี</TableHead>
                  <TableHead>วิชาที่ลงทะเบียน</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>ปี {student.year}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.gpa.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                    </TableCell>
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
