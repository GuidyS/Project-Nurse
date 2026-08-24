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
import { CalendarDays, Plus, Clock, CheckCircle, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { ConfirmActionDialog } from '@/components/ui/ConfirmActionDialog';

// Interfaces สำหรับ TypeScript
interface Task {
  id: string;
  studentId: string;
  studentName: string;
  task: string;
  dueDate: string;
  status: string;
  priority: string;
  description?: string;
}

interface Student {
  id: string;
  name: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return <Badge className="bg-green-500">เสร็จสิ้น</Badge>;
    case 'in_progress': return <Badge className="bg-blue-500">กำลังทำ</Badge>;
    case 'pending': return <Badge variant="secondary">รอดำเนินการ</Badge>;
    case 'overdue': return <Badge variant="destructive">เลยกำหนด</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high': return <Badge variant="destructive">สูง</Badge>;
    case 'medium': return <Badge className="bg-yellow-500">กลาง</Badge>;
    case 'low': return <Badge variant="secondary">ต่ำ</Badge>;
    default: return <Badge variant="outline">{priority}</Badge>;
  }
};

export default function ScheduleTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newTask, setNewTask] = useState({
    studentId: '',
    task: '',
    dueDate: '',
    priority: 'medium',
    description: '',
  });

  const fetchTasksData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-schedule-tasks');
      if (response.data.status === 'success') {
        const rows = (response.data.data.tasks || []).map((task: Partial<Task>) => ({
          ...task,
          id: String(task.id ?? ''),
          studentId: String(task.studentId ?? ''),
          studentName: String(task.studentName ?? ''),
          task: String(task.task ?? ''),
          dueDate: String(task.dueDate ?? ''),
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          description: String(task.description ?? ''),
        })) as Task[];
        const studentRows = (response.data.data.students || []).map((student: Partial<Student>) => ({
          id: String(student.id ?? ''),
          name: String(student.name ?? ''),
        })) as Student[];
        setTasks(rows);
        setStudents(studentRows);
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลงานได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleEditClick = (task: Task) => {
    setNewTask({
      studentId: task.studentId,
      task: task.task,
      dueDate: task.dueDate,
      priority: task.priority,
      description: task.description || '',
    });
    setEditingTaskId(task.id);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!newTask.studentId || !newTask.task || !newTask.dueDate) {
      toast({ title: 'แจ้งเตือน', description: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingTaskId) {
        const response = await api.post('/index.php?page=update-schedule-task', {
          id: editingTaskId,
          task: newTask.task,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
          description: newTask.description,
        });
        if (response.data.status === 'success') {
          toast({ title: 'สำเร็จ', description: 'แก้ไขงานเรียบร้อยแล้ว' });
          setIsDialogOpen(false);
          setEditingTaskId(null);
          setNewTask({ studentId: '', task: '', dueDate: '', priority: 'medium', description: '' });
          fetchTasksData();
        } else {
          toast({ title: 'ข้อผิดพลาด', description: response.data.message || 'ไม่สามารถแก้ไขงานได้', variant: 'destructive' });
        }
      } else {
        const response = await api.post('/index.php?page=create-schedule-task', newTask);
        if (response.data.status === 'success') {
          toast({ title: 'สำเร็จ', description: 'มอบหมายงานใหม่เรียบร้อยแล้ว' });
          setIsDialogOpen(false);
          setNewTask({ studentId: '', task: '', dueDate: '', priority: 'medium', description: '' });
          fetchTasksData();
        } else {
          toast({ title: 'ข้อผิดพลาด', description: response.data.message || 'ไม่สามารถสร้างงานได้', variant: 'destructive' });
        }
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. ฟังก์ชันอัปเดตสถานะเป็น "เสร็จสิ้น"
  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await api.post('/index.php?page=update-task-status', { 
        taskId: taskId, 
        status: 'completed' 
      });
      if (response.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: 'อัปเดตสถานะงานเป็นเสร็จสิ้นแล้ว' });
        fetchTasksData(); // โหลดข้อมูลตารางใหม่
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถอัปเดตสถานะได้', variant: 'destructive' });
    }
  };

  // 4. ฟังก์ชันลบงาน
  const openDeleteConfirm = (taskId: string) => {
    setPendingDeleteId(taskId);
    setIsConfirmOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!pendingDeleteId) return;

    setIsDeleting(true);
    try {
      const response = await api.post('/index.php?page=delete-schedule-task', { id: pendingDeleteId });
      if (response.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: 'ลบงานเรียบร้อยแล้ว' });
        setIsConfirmOpen(false);
        setPendingDeleteId(null);
        fetchTasksData();
      } else {
        toast({ title: 'ข้อผิดพลาด', description: response.data.message || 'ไม่สามารถลบงานได้', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการลบงาน', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const matchesSearch = (value: unknown) =>
    String(value ?? '').toLowerCase().includes(normalizedSearchTerm);

  const filteredTasks = normalizedSearchTerm
    ? tasks.filter(
        (task) =>
          matchesSearch(task.studentName) ||
          matchesSearch(task.studentId) ||
          matchesSearch(task.task)
      )
    : tasks;

  const editingTask = editingTaskId
    ? tasks.find((task) => task.id === editingTaskId) || null
    : null;

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule Task</h1>
            <p className="text-muted-foreground">มอบหมายงานให้นักศึกษาฝึกปฏิบัติ</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTaskId(null);
              setNewTask({ studentId: '', task: '', dueDate: '', priority: 'medium', description: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTaskId(null);
                setNewTask({ studentId: '', task: '', dueDate: '', priority: 'medium', description: '' });
              }}>
                <Plus className="mr-2 h-4 w-4" /> สร้างงานใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="app-dialog-lg">
              <DialogHeader>
                <DialogTitle>{editingTaskId ? "แก้ไขงาน" : "สร้างงานใหม่"}</DialogTitle>
                <DialogDescription>{editingTaskId ? "แก้ไขรายละเอียดงานที่มอบหมายแล้ว" : "มอบหมายงานให้นักศึกษาฝึกปฏิบัติ"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {editingTaskId ? (
                  <div className="grid gap-2">
                    <Label>นักศึกษา</Label>
                    <Input
                      value={
                        editingTask
                          ? `${editingTask.studentId} - ${editingTask.studentName}`
                          : newTask.studentId
                      }
                      disabled
                      className="disabled:opacity-100 disabled:text-foreground"
                    />
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label>นักศึกษา</Label>
                    <Select
                      value={newTask.studentId}
                      onValueChange={(value) => setNewTask({ ...newTask, studentId: value })}
                    >
                      <SelectTrigger><SelectValue placeholder="เลือกนักศึกษา" /></SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.id} - {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                    min={new Date().toISOString().split('T')[0]}
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>ยกเลิก</Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  บันทึก
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งานทั้งหมด</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เสร็จสิ้น</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{stats.completed}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กำลังทำ</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เลยกำหนด</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{stats.overdue}</div></CardContent>
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
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
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
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.studentId}</TableCell>
                        <TableCell>{task.studentName}</TableCell>
                        <TableCell>{task.task}</TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(task)}>แก้ไข</Button>
                            <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(task.id)}>ลบ</Button>
                            {task.status !== 'completed' && (
                              <Button size="sm" onClick={() => handleCompleteTask(task.id)}>เสร็จสิ้น</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">ไม่พบข้อมูลงาน</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) setPendingDeleteId(null);
        }}
        title="ยืนยันการลบ"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?"
        onConfirm={handleDeleteTask}
        isLoading={isDeleting}
      />
    </>
  );
}
