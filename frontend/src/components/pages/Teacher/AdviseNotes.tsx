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



const translateSummary = (summary: string) => {
  if (!summary) return '';
  return summary
    // ลบส่วนที่แปลประเภทออก เพราะไม่ได้ใช้แล้ว แต่เผื่อของเก่ามีอยู่ ก็ปล่อยไว้
    .replace('ประเภท: academic', 'ประเภท: วิชาการ')
    .replace('ประเภท: warning', 'ประเภท: ติดตาม')
    .replace('ประเภท: critical', 'ประเภท: วิกฤต')
    .replace('ประเภท: personal', 'ประเภท: ส่วนตัว');
};

export default function AdviseNotes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewNote, setViewNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 });
  const [students, setStudents] = useState<any[]>([]);
  
  const urlStudentId = new URLSearchParams(window.location.search).get("studentId");
  
  const [newNote, setNewNote] = useState({
    adviceId: '',
    studentId: urlStudentId || '',
    topic: '',
    summary: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resNotes, resStudents] = await Promise.all([
        api.get('/index.php?page=get-advise-notes'),
        api.get('/index.php?page=get-advises')
      ]);
      
      if (resNotes.data.status === 'success') {
        setNotes(resNotes.data.data.notes || []);
        setStats(resNotes.data.data.stats || { total: 0, thisMonth: 0 });
      }
      if (resStudents.data.status === 'success') {
        setStudents(resStudents.data.data || []);
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      note.studentName.includes(searchTerm) ||
      note.studentId.includes(searchTerm) ||
      note.topic.includes(searchTerm)
  );

  const handleSave = async () => {
    try {
      const res = await api.post('/index.php?page=save-advise-note', newNote);
      if (res.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: 'บันทึกการให้คำปรึกษาเรียบร้อยแล้ว' });
        setIsDialogOpen(false);
        setNewNote({ adviceId: '', studentId: '', topic: '', summary: '' });
        fetchData(); // Reload data
      } else {
        toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
    }
  };

  const handleEdit = (note: any) => {
    let topic = note.topic;
    let detail = note.summary;
    
    // Parse the actual data from the combined advice_note string
    if (note.summary && note.summary.startsWith('หัวข้อ: ')) {
      const topicMatch = note.summary.match(/หัวข้อ: (.*)\n/);
      const detailMatch = note.summary.match(/รายละเอียด: ([\s\S]*)/);
      
      if (topicMatch) topic = topicMatch[1];
      if (detailMatch) detail = detailMatch[1];
    }
    
    setNewNote({
      adviceId: note.id,
      studentId: note.studentId,
      topic,
      summary: detail
    });
    setIsDialogOpen(true);
  };

  const handleView = (note: any) => {
    setViewNote(note);
    setIsViewDialogOpen(true);
  };

  const handleAdd = () => {
    setNewNote({ adviceId: '', studentId: urlStudentId || '', topic: '', summary: '' });
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มบันทึก
            </Button>
            <DialogContent className="sm:max-w-[600px]">
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
                        <SelectItem key={student.studentId} value={student.studentId}>
                          {student.studentId} - {student.name}
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
              {viewNote && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="font-semibold text-right">นักศึกษา:</span>
                    <span className="col-span-3">{viewNote.studentId} - {viewNote.studentName}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="font-semibold text-right">วันที่:</span>
                    <span className="col-span-3">{viewNote.date}</span>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <span className="font-semibold text-right">บันทึก:</span>
                    <div className="col-span-3 whitespace-pre-wrap rounded-md border p-4 bg-muted/50">
                      {translateSummary(viewNote.summary)}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewDialogOpen(false)}>ปิด</Button>
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
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                ไม่มีประวัติการให้คำปรึกษา
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>รหัสนักศึกษา</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>หัวข้อ</TableHead>
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
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleView(note)}>ดูรายละเอียด</Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(note)}>แก้ไข</Button>
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
