import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Download, GraduationCap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios'; // 🔧 เรียกใช้โมดูล Axios หลักของระบบคุณ
import { useToast } from '@/hooks/use-toast';

interface StudentData {
  id: string;
  studentId: string;
  name: string;
  year: number;
  course: string;
  gpa: number;
  status: 'active' | 'warning';
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500 text-white border-none">ปกติ</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-500 text-white border-none">ต้องติดตาม</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Students() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, warning: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันยิง API เชื่อมโยงข้อมูลตู้คอนเทนเนอร์หลังบ้าน
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-students');
      if (response.data.status === 'success') {
        setStudents(response.data.data.students || []);
        setStats(response.data.data.stats || { total: 0, active: 0, warning: 0 });
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดรายชื่อนักศึกษาพยาบาลได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      (student.name || '').includes(searchTerm) ||
      (student.studentId || '').toString().includes(searchTerm)
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายชื่อนักศึกษา</h1>
            <p className="text-muted-foreground">นักศึกษาทั้งหมดในระบบฐานข้อมูลคณะพยาบาลศาสตร์</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> ส่งออกรายชื่อ
          </Button>
        </div>

        {/* Stats Summary ข้อมูลจริงจาก Database */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
              <p className="text-xs text-muted-foreground">คนในคณะพยาบาล</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะปกติ</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : stats.active}</div>
              <p className="text-xs text-muted-foreground">คน (สภาวะการเรียนปกติ)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ต้องติดตาม</CardTitle>
              <Users className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{isLoading ? '...' : stats.warning}</div>
              <p className="text-xs text-muted-foreground">คน (เกรดเฉลี่ย GPA &lt; 2.50)</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อนักศึกษา</CardTitle>
            <CardDescription>แสดงรายชื่อนักศึกษาพยาบาลจำแนกตามโครงสร้างปัจจุบัน</CardDescription>
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
                  <TableHead className="text-center">ชั้นปี</TableHead>
                  <TableHead className="text-center">วิชาที่ลงทะเบียน</TableHead>
                  <TableHead className="text-center">GPA</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                  <TableHead className="text-center">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">ไม่พบข้อมูลรายชื่อนักศึกษา</TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium font-mono">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">ปี {student.year}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{student.course}</TableCell>
                      <TableCell className="text-center font-semibold">{student.gpa.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}