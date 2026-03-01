import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { useState } from 'react';

// Mock data for advisees
const mockAdvisees = [
  { id: '1', studentId: '64010001', name: 'สมชาย ใจดี', year: 3, gpa: 3.45, status: 'normal', lastContact: '2024-01-15', needsAdvice: false },
  { id: '2', studentId: '64010002', name: 'สมหญิง รักเรียน', year: 3, gpa: 2.85, status: 'warning', lastContact: '2024-01-10', needsAdvice: true },
  { id: '3', studentId: '65010001', name: 'มานะ ตั้งใจ', year: 2, gpa: 3.78, status: 'normal', lastContact: '2024-01-12', needsAdvice: false },
  { id: '4', studentId: '65010002', name: 'มานี ขยัน', year: 2, gpa: 1.95, status: 'critical', lastContact: '2024-01-08', needsAdvice: true },
  { id: '5', studentId: '66010001', name: 'ปิติ สุขใจ', year: 1, gpa: 3.25, status: 'normal', lastContact: '2024-01-14', needsAdvice: false },
  { id: '6', studentId: '66010002', name: 'ปิยะ มุ่งมั่น', year: 1, gpa: 2.45, status: 'warning', lastContact: '2024-01-05', needsAdvice: true },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'normal':
      return <Badge className="bg-green-500">ปกติ</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-500">ต้องติดตาม</Badge>;
    case 'critical':
      return <Badge variant="destructive">วิกฤต</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Advisees() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAdvisees = mockAdvisees.filter(
    (student) =>
      student.name.includes(searchTerm) ||
      student.studentId.includes(searchTerm)
  );

  const stats = {
    total: mockAdvisees.length,
    maxCapacity: 12,
    needsAdvice: mockAdvisees.filter(s => s.needsAdvice).length,
    critical: mockAdvisees.filter(s => s.status === 'critical').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">นักศึกษาในที่ปรึกษา</h1>
          <p className="text-muted-foreground">จัดการนักศึกษาที่อยู่ในความดูแล (สัดส่วน 1:12)</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนนักศึกษา</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}/{stats.maxCapacity}</div>
              <p className="text-xs text-muted-foreground">คน (สูงสุด 12 คน)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ต้องการคำปรึกษา</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.needsAdvice}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะวิกฤต</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะปกติ</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockAdvisees.filter(s => s.status === 'normal').length}
              </div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อนักศึกษา</CardTitle>
            <CardDescription>นักศึกษาทั้งหมดที่อยู่ในความดูแล</CardDescription>
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
                  <TableHead>GPA</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ติดต่อล่าสุด</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvisees.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>ปี {student.year}</TableCell>
                    <TableCell>{student.gpa.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>{student.lastContact}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">ดูโปรไฟล์</Button>
                        <Button size="sm">บันทึกคำปรึกษา</Button>
                      </div>
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
