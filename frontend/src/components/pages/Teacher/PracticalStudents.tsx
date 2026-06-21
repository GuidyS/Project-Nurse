import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Users, Search, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-blue-500">กำลังฝึก</Badge>;
    case 'completed':
      return <Badge className="bg-green-500">เสร็จสิ้น</Badge>;
    case 'issue':
      return <Badge variant="destructive">มีปัญหา</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function PracticalStudents() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPracticalStudents = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/index.php?page=get-practical-students');
        if (res.data.status === 'success') {
          setStudents(res.data.data || []);
        } else {
          toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลนักศึกษาได้', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPracticalStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name.includes(searchTerm) ||
      student.studentId.includes(searchTerm)
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">นักศึกษาฝึกปฏิบัติ</h1>
          <p className="text-muted-foreground">ติดตามความคืบหน้าและการฝึกปฏิบัติงานในสถานที่จริง</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายชื่อนักศึกษาฝึกปฏิบัติ</CardTitle>
            <CardDescription>ข้อมูลนักศึกษาพยาบาลที่กำลังฝึกงานในสถานที่ต่างๆ</CardDescription>
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
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                ไม่พบข้อมูลนักศึกษาฝึกปฏิบัติในความดูแลของคุณ
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสนักศึกษา</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>สถานที่ฝึก</TableHead>
                    <TableHead>ความคืบหน้า</TableHead>
                    <TableHead>งานที่ส่งแล้ว</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium font-mono">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{student.workplace}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="w-[100px]" />
                          <span className="text-sm font-medium">{student.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{student.tasksCompleted}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span>{student.tasksCompleted + student.tasksPending}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                          <Button size="sm">ประเมิน</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}