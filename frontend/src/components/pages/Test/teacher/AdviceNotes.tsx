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
import { MessageSquare, Plus, Search, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockNotes = [
  { id: '1', studentId: '64010001', studentName: 'สมชาย ใจดี', date: '2024-01-15', topic: 'แนะนำการลงทะเบียน', type: 'academic', summary: 'นักศึกษาสอบถามเกี่ยวกับการลงทะเบียนวิชาเลือก แนะนำให้พิจารณาตามความสนใจและเวลาที่มี' },
  { id: '2', studentId: '64010002', studentName: 'สมหญิง รักเรียน', date: '2024-01-10', topic: 'ปัญหาผลการเรียน', type: 'warning', summary: 'GPA ตกลงมาในเทอมที่แล้ว แนะนำให้เข้าร่วมกลุ่มติวและพบอาจารย์ประจำวิชา' },
  { id: '3', studentId: '65010002', studentName: 'มานี ขยัน', date: '2024-01-08', topic: 'เสี่ยงรีไทร์', type: 'critical', summary: 'GPA ต่ำกว่า 2.00 สองเทอมติด ต้องติดตามใกล้ชิดและประสานงานกับผู้ปกครอง' },
  { id: '4', studentId: '66010002', studentName: 'ปิยะ มุ่งมั่น', date: '2024-01-05', topic: 'ปรับตัวปีหนึ่ง', type: 'academic', summary: 'นักศึกษาใหม่มีปัญหาในการปรับตัว แนะนำให้เข้าร่วมกิจกรรมชมรมและพบเพื่อนใหม่' },
];

const mockStudents = [
  { id: '64010001', name: 'สมชาย ใจดี' },
  { id: '64010002', name: 'สมหญิง รักเรียน' },
  { id: '65010001', name: 'มานะ ตั้งใจ' },
  { id: '65010002', name: 'มานี ขยัน' },
  { id: '66010001', name: 'ปิติ สุขใจ' },
  { id: '66010002', name: 'ปิยะ มุ่งมั่น' },
];

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

export default function AdviceNotes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    studentId: '',
    topic: '',
    type: 'academic',
    summary: '',
  });

  const filteredNotes = mockNotes.filter(
    (note) =>
      note.studentName.includes(searchTerm) ||
      note.studentId.includes(searchTerm) ||
      note.topic.includes(searchTerm)
  );

  const handleSave = () => {
    console.log('Saving note:', newNote);
    setIsDialogOpen(false);
    setNewNote({ studentId: '', topic: '', type: 'academic', summary: '' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advice Notes</h1>
            <p className="text-muted-foreground">บันทึกการให้คำปรึกษานักศึกษา</p>
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
                      {mockStudents.map((student) => (
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave}>บันทึก</Button>
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
              <div className="text-2xl font-bold">{mockNotes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เดือนนี้</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ต้องติดตาม</CardTitle>
              <MessageSquare className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">วิกฤต</CardTitle>
              <MessageSquare className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">1</div>
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
                        <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                        <Button variant="outline" size="sm">แก้ไข</Button>
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
