import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Users, Search, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { StudentDetailsDialog } from '@/components/ui/StudentDetailsDialog';
import { StudentEvaluateDialog } from '@/components/ui/StudentEvaluateDialog';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  workplace: string;
  progress: number;
  tasksCompleted: number;
  tasksPending: number;
  status: string;
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">ปกติ</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-500">ต้องติดตาม</Badge>;
    case 'critical':
      return <Badge variant="destructive">ล่าช้า</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function PracticalStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  
  const [evaluateScore, setEvaluateScore] = useState<string>('');
  const [evaluateComment, setEvaluateComment] = useState<string>('');

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setEvaluateScore('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num > 100) setEvaluateScore('100');
      else if (num < 0) setEvaluateScore('0');
      else setEvaluateScore(num.toString());
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/index.php?page=get-practical-students');
        if (response.data.status === 'success') {
          setStudents(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name.includes(searchTerm) ||
      student.studentId.includes(searchTerm) ||
      student.workplace.includes(searchTerm)
  );

  const stats = {
    total: students.length,
    maxCapacity: 8,
    onTrack: students.filter(s => s.status === 'active' || s.status === 'completed').length,
    needsAttention: students.filter(s => s.status === 'warning' || s.status === 'issue' || s.status === 'critical').length,
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">นักศึกษาฝึกปฏิบัติ</h1>
          <p className="text-muted-foreground">จัดการนักศึกษาฝึกปฏิบัติที่อยู่ในความดูแล (สัดส่วน 1:8)</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            Error: {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนนักศึกษา</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}/{stats.maxCapacity}</div>
              <p className="text-xs text-muted-foreground">คน (สูงสุด 8 คน)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ตามแผน</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ต้องติดตาม</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ค่าเฉลี่ยความคืบหน้า</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.length > 0 
                  ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อนักศึกษาฝึกปฏิบัติ</CardTitle>
            <CardDescription>นักศึกษาทั้งหมดที่อยู่ในความดูแล</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อ, รหัส หรือสถานที่ฝึก..."
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
                  <TableHead>สถานที่ฝึก</TableHead>
                  <TableHead>ความคืบหน้า</TableHead>
                  <TableHead>งานที่ทำ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      กำลังโหลดข้อมูล...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      ไม่พบข้อมูลนักศึกษา
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{student.workplace}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="w-[100px]" />
                          <span className="text-sm">{student.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600">{student.tasksCompleted}</span>
                        <span className="text-muted-foreground">/</span>
                        <span>{student.tasksCompleted + student.tasksPending}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setSelectedStudent(student); setIsDetailsOpen(true); }}
                          >
                            ดูรายละเอียด
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => { 
                              setSelectedStudent(student); 
                              setEvaluateScore('');
                              setEvaluateComment('');
                              setIsEvaluateOpen(true); 
                            }}
                          >
                            ประเมิน
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <StudentDetailsDialog 
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          student={selectedStudent}
        />

        <StudentEvaluateDialog 
          isOpen={isEvaluateOpen}
          onOpenChange={setIsEvaluateOpen}
          student={selectedStudent}
          score={evaluateScore}
          onScoreChange={handleScoreChange}
          comment={evaluateComment}
          onCommentChange={(e) => setEvaluateComment(e.target.value)}
          onSave={() => console.log('Saving evaluation', { selectedStudent, evaluateScore, evaluateComment })}
        />

      </div>
    </>
  );
}