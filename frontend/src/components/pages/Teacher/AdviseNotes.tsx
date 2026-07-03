import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, Search, Calendar, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface AdviseNote {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  topic: string;
  type: string;
  summary: string;
}

interface StudentOption {
  id: string;
  name: string;
}

interface AdviseStats {
  total: number;
  thisMonth: number;
  warning: number;
  critical: number;
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'academic':
      return <Badge variant="secondary">วิชาการ</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-500">ติดตาม</Badge>;
    case 'critical':
      return <Badge variant="destructive">วิกฤต</Badge>;
    case 'personal':
      return <Badge className="bg-blue-500">ส่วนตัว</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export default function AdviseNotes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<AdviseNote[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [stats, setStats] = useState<AdviseStats>({ total: 0, thisMonth: 0, warning: 0, critical: 0 });
  const [newNote, setNewNote] = useState({
    studentId: '',
    topic: '',
    type: 'academic',
    summary: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [notesRes, studentsRes] = await Promise.all([
        api.get('/index.php?page=get-advise-notes'),
        api.get('/index.php?page=get-advise-students'),
      ]);
      if (notesRes.data.status === 'success') {
        setNotes(notesRes.data.data.notes || []);
        setStats(notesRes.data.data.stats || { total: 0, thisMonth: 0, warning: 0, critical: 0 });
      }
      if (studentsRes.data.status === 'success') {
        setStudents(studentsRes.data.data || []);
      }
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูล Advice Notes ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredNotes = notes.filter(
    (note) =>
      note.studentName?.includes(searchTerm) ||
      note.studentId?.includes(searchTerm) ||
      note.topic?.includes(searchTerm)
  );

  const handleSave = async () => {
    if (!newNote.studentId || !newNote.topic || !newNote.summary) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    try {
      setIsSaving(true);
      const res = await api.post('/index.php?page=save-advise-note', newNote);
      if (res.data.status === 'success') {
        toast.success('บันทึกการให้คำปรึกษาเรียบร้อยแล้ว');
        setIsDialogOpen(false);
        setNewNote({ studentId: '', topic: '', type: 'academic', summary: '' });
        fetchData();
      } else {
        toast.error(res.data.message || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังโหลด Advice Notes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advice Notes</h1>
          <p className="text-muted-foreground">บันทึกการให้คำปรึกษานักศึกษา (FR016)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มบันทึก
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>เพิ่มบันทึกการให้คำปรึกษา</DialogTitle>
              <DialogDescription>บันทึกรายละเอียดการให้คำปรึกษานักศึกษา</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student">นักศึกษา</Label>
                <Select
                  value={newNote.studentId}
                  onValueChange={(value) => setNewNote({ ...newNote, studentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกนักศึกษา" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.id} - {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="topic">หัวข้อ</Label>
                <Input
                  id="topic"
                  value={newNote.topic}
                  onChange={(e) => setNewNote({ ...newNote, topic: e.target.value })}
                  placeholder="หัวข้อการให้คำปรึกษา"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">ประเภท</Label>
                <Select
                  value={newNote.type}
                  onValueChange={(value) => setNewNote({ ...newNote, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">วิชาการ</SelectItem>
                    <SelectItem value="personal">ส่วนตัว</SelectItem>
                    <SelectItem value="warning">ติดตาม</SelectItem>
                    <SelectItem value="critical">วิกฤต</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">รายละเอียด</Label>
                <Textarea
                  id="summary"
                  value={newNote.summary}
                  onChange={(e) => setNewNote({ ...newNote, summary: e.target.value })}
                  placeholder="บันทึกรายละเอียดการให้คำปรึกษา..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">บันทึกทั้งหมด</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เดือนนี้</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ต้องติดตาม</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">วิกฤต</CardTitle>
            <MessageSquare className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการให้คำปรึกษา</CardTitle>
          <CardDescription>บันทึกการให้คำปรึกษาทั้งหมด</CardDescription>
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
                <TableHead>วันที่</TableHead>
                <TableHead>รหัสนักศึกษา</TableHead>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead>ประเภท</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    ไม่มีบันทึกการให้คำปรึกษา
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell>{note.date}</TableCell>
                    <TableCell className="font-medium">{note.studentId}</TableCell>
                    <TableCell>{note.studentName}</TableCell>
                    <TableCell>{note.topic}</TableCell>
                    <TableCell>{getTypeBadge(note.type)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
