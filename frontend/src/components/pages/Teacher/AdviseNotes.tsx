import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, Search, Calendar, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [notes, setNotes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, warning: 0, critical: 0 });
  
  const [newNote, setNewNote] = useState({
    id: '',
    studentId: '',
    topic: '',
    type: 'academic',
    summary: '',
  });

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/index.php?page=get_advise_notes', { withCredentials: true });
      if (res.data.status === 'success') {
        setNotes(res.data.data.notes);
        setStats(res.data.data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:8080/index.php?page=get_advise_students', { withCredentials: true });
      if (res.data.status === 'success') {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchStudents();
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      note.studentName?.includes(searchTerm) ||
      note.studentId?.includes(searchTerm) ||
      note.topic?.includes(searchTerm)
  );

  const handleSave = async () => {
    try {
      const res = await axios.post('http://localhost:8080/index.php?page=save_advise_note', newNote, { withCredentials: true });
      if (res.data.status === 'success') {
        setIsDialogOpen(false);
        setNewNote({ id: '', studentId: '', topic: '', type: 'academic', summary: '' });
        fetchNotes();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleEdit = (note: any) => {
    setNewNote({
      id: note.id,
      studentId: note.studentId,
      topic: note.topic,
      type: note.type,
      summary: note.summary
    });
    setIsDialogOpen(true);
  };

  const handleView = (note: any) => {
    setNewNote({
      id: note.id,
      studentId: note.studentId,
      topic: note.topic,
      type: note.type,
      summary: note.summary
    });
    setIsViewDialogOpen(true);
  };

  const openNewDialog = () => {
    setNewNote({ id: '', studentId: '', topic: '', type: 'academic', summary: '' });
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advice Notes</h1>
            <p className="text-muted-foreground">บันทึกการให้คำปรึกษานักศึกษา</p>
          </div>
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มบันทึก
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{newNote.id ? 'แก้ไขบันทึกการให้คำปรึกษา' : 'เพิ่มบันทึกการให้คำปรึกษา'}</DialogTitle>
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
                <Button onClick={handleSave}>บันทึก</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>รายละเอียดการให้คำปรึกษา</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label className="font-bold">นักศึกษา:</Label>
                  <div>{students.find(s => s.id === newNote.studentId)?.name || newNote.studentId}</div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold">หัวข้อ:</Label>
                  <div>{newNote.topic}</div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold">ประเภท:</Label>
                  <div>{getTypeBadge(newNote.type)}</div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold">รายละเอียด:</Label>
                  <div className="whitespace-pre-wrap border p-3 rounded-md bg-muted/50 min-h-[100px]">{newNote.summary}</div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>ปิด</Button>
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
                    <TableCell className="font-medium">{note.studentId}</TableCell>
                    <TableCell>{note.studentName}</TableCell>
                    <TableCell>{note.topic}</TableCell>
                    <TableCell>{getTypeBadge(note.type)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(note)}>ดูรายละเอียด</Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(note)}>แก้ไข</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredNotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">ไม่มีข้อมูล</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
