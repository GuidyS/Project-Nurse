import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Plus, Clock, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockTasks = [
  { id: '1', studentId: '64010001', studentName: 'สมชาย ใจดี', task: 'ฝึกตรวจสัญญาณชีพ', dueDate: '2024-01-20', status: 'in_progress', priority: 'high' },
  { id: '2', studentId: '64010002', studentName: 'สมหญิง รักเรียน', task: 'เขียนรายงานการฝึก', dueDate: '2024-01-18', status: 'completed', priority: 'medium' },
  { id: '3', studentId: '64010003', studentName: 'มานะ ตั้งใจ', task: 'นำเสนอกรณีศึกษา', dueDate: '2024-01-25', status: 'pending', priority: 'high' },
  { id: '4', studentId: '64010004', studentName: 'มานี ขยัน', task: 'ทบทวนขั้นตอนการดูแลผู้ป่วย', dueDate: '2024-01-15', status: 'overdue', priority: 'high' },
  { id: '5', studentId: '64010005', studentName: 'ปิติ สุขใจ', task: 'ฝึกการเจาะเลือด', dueDate: '2024-01-22', status: 'in_progress', priority: 'medium' },
  { id: '6', studentId: '64010006', studentName: 'ปิยะ มุ่งมั่น', task: 'สังเกตการณ์ผ่าตัด', dueDate: '2024-01-28', status: 'pending', priority: 'low' },
];

const mockStudents = [
  { id: '64010001', name: 'สมชาย ใจดี' },
  { id: '64010002', name: 'สมหญิง รักเรียน' },
  { id: '64010003', name: 'มานะ ตั้งใจ' },
  { id: '64010004', name: 'มานี ขยัน' },
  { id: '64010005', name: 'ปิติ สุขใจ' },
  { id: '64010006', name: 'ปิยะ มุ่งมั่น' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500">เสร็จสิ้น</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-500">กำลังทำ</Badge>;
    case 'pending':
      return <Badge variant="secondary">รอดำเนินการ</Badge>;
    case 'overdue':
      return <Badge variant="destructive">เลยกำหนด</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive">สูง</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500">กลาง</Badge>;
    case 'low':
      return <Badge variant="secondary">ต่ำ</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export default function ScheduleTasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    studentId: '',
    task: '',
    dueDate: '',
    priority: 'medium',
    description: '',
  });

  const filteredTasks = mockTasks.filter(
    (task) =>
      task.studentName.includes(searchTerm) ||
      task.studentId.includes(searchTerm) ||
      task.task.includes(searchTerm)
  );

  const stats = {
    total: mockTasks.length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
    inProgress: mockTasks.filter(t => t.status === 'in_progress').length,
    overdue: mockTasks.filter(t => t.status === 'overdue').length,
  };

  const handleSave = () => {
    console.log('Creating task:', newTask);
    setIsDialogOpen(false);
    setNewTask({ studentId: '', task: '', dueDate: '', priority: 'medium', description: '' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule Task</h1>
            <p className="text-muted-foreground">มอบหมายงานให้นักศึกษาฝึกปฏิบัติ</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                สร้างงานใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>สร้างงานใหม่</DialogTitle>
                <DialogDescription>
                  มอบหมายงานให้นักศึกษาฝึกปฏิบัติ
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>นักศึกษา</Label>
                  <Select
                    value={newTask.studentId}
                    onValueChange={(value) => setNewTask({ ...newTask, studentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกนักศึกษา" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.id} - {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>ชื่องาน</Label>
                  <Input
                    value={newTask.task}
                    onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    placeholder="ชื่องานที่มอบหมาย"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>กำหนดส่ง</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>ความสำคัญ</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">สูง</SelectItem>
                      <SelectItem value="medium">กลาง</SelectItem>
                      <SelectItem value="low">ต่ำ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>รายละเอียด</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="รายละเอียดงาน..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave}>สร้างงาน</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานทั้งหมด</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เสร็จสิ้น</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กำลังทำ</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เลยกำหนด</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการงาน</CardTitle>
            <CardDescription>งานที่มอบหมายทั้งหมด</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา..."
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
                  <TableHead>งาน</TableHead>
                  <TableHead>กำหนดส่ง</TableHead>
                  <TableHead>ความสำคัญ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.studentId}</TableCell>
                    <TableCell>{task.studentName}</TableCell>
                    <TableCell>{task.task}</TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">แก้ไข</Button>
                        {task.status !== 'completed' && (
                          <Button size="sm">เสร็จสิ้น</Button>
                        )}
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
