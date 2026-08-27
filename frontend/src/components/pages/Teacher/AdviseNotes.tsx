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
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [notes, setNotes] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, warning: 0, critical: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [viewNote, setViewNote] = useState<any>(null);

  const [newNote, setNewNote] = useState({
    studentId: '',
    topic: '',
    type: 'academic',
    summary: '',
  });

  // ดึงประวัติบันทึก + สถิติ
  const fetchNotes = async (withSpinner = true) => {
    if (withSpinner) setIsLoading(true);
    try {
      const res = await api.get('/index.php?page=get-advise-notes');
      if (res.data.status === 'success') {
        setNotes(res.data.data.notes || []);
        setStats(res.data.data.stats || { total: 0, thisMonth: 0, warning: 0, critical: 0 });
      }
    } catch {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดประวัติการให้คำปรึกษาได้', variant: 'destructive' });
    } finally {
      if (withSpinner) setIsLoading(false);
    }
  };

  // ดึงรายชื่อนักศึกษาในความดูแล (สำหรับ dropdown)
  const fetchStudents = async () => {
    try {
      const res = await api.get('/index.php?page=get-advise-students');
      if (res.data.status === 'success') setStudents(res.data.data || []);
    } catch { /* dropdown ว่างแต่หน้าใช้งานได้ */ }
  };

  useEffect(() => {
    fetchNotes();
    fetchStudents();
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      String(note.studentName ?? '').includes(searchTerm) ||
      String(note.studentId ?? '').includes(searchTerm) ||
      String(note.topic ?? '').includes(searchTerm)
  );

  const handleSave = async () => {
    if (!newNote.studentId || !newNote.topic || !newNote.summary) {
      toast({ title: 'แจ้งเตือน', description: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.post('/index.php?page=save-advise-note', newNote);
      if (res.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: 'บันทึกการให้คำปรึกษาเรียบร้อยแล้ว' });
        setIsDialogOpen(false);
        setNewNote({ studentId: '', topic: '', type: 'academic', summary: '' });
        fetchNotes(false); // อัปเดตรายการทันที
      } else {
        toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">บันทึกการให้คำปรึกษา</h1>
            <p className="text-muted-foreground">บันทึกการให้คำปรึกษานักศึกษา</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มบันทึก
              </Button>
            </DialogTrigger>
            {/* กันกล่องปิดเองเวลาคลิกนอก dropdown */}
            <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>เพิ่มบันทึกการให้คำปรึกษา</DialogTitle>
                <DialogDescription>
                  บันทึกรายละเอียดการให้คำปรึกษานักศึกษา
                </DialogDescription>
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
                        <SelectItem key={student.id} value={String(student.id)}>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  บันทึก
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
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

        {/* Notes Table */}
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
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                ยังไม่มีบันทึกการให้คำปรึกษา — กดปุ่ม "เพิ่มบันทึก" เพื่อเริ่มต้น
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>รหัสนักศึกษา</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>หัวข้อ</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>{note.date}</TableCell>
                      <TableCell className="font-medium font-mono">{note.studentId}</TableCell>
                      <TableCell>{note.studentName}</TableCell>
                      <TableCell>{note.topic}</TableCell>
                      <TableCell>{getTypeBadge(note.type)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setViewNote(note)}>ดูรายละเอียด</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog ดูรายละเอียด */}
      <Dialog open={!!viewNote} onOpenChange={(o) => !o && setViewNote(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewNote?.topic}</DialogTitle>
            <DialogDescription>
              {viewNote?.studentId} — {viewNote?.studentName} · วันที่ {viewNote?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>{viewNote && getTypeBadge(viewNote.type)}</div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewNote?.summary}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewNote(null)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
