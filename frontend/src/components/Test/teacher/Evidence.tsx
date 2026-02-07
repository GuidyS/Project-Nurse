import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Upload, FileImage, FileText, Download, Search, Eye } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockEvidence = [
  { id: '1', studentId: '64010001', studentName: 'สมชาย ใจดี', type: 'photo', title: 'ภาพการตรวจสัญญาณชีพ', date: '2024-01-15', verified: true },
  { id: '2', studentId: '64010001', studentName: 'สมชาย ใจดี', type: 'document', title: 'รายงานการฝึกสัปดาห์ที่ 1', date: '2024-01-14', verified: true },
  { id: '3', studentId: '64010002', studentName: 'สมหญิง รักเรียน', type: 'photo', title: 'ภาพการเจาะเลือด', date: '2024-01-12', verified: false },
  { id: '4', studentId: '64010003', studentName: 'มานะ ตั้งใจ', type: 'video', title: 'วิดีโอการทำหัตถการ', date: '2024-01-10', verified: true },
  { id: '5', studentId: '64010004', studentName: 'มานี ขยัน', type: 'document', title: 'บันทึกการดูแลผู้ป่วย', date: '2024-01-08', verified: false },
  { id: '6', studentId: '64010005', studentName: 'ปิติ สุขใจ', type: 'photo', title: 'ภาพการทำแผล', date: '2024-01-11', verified: true },
];

const mockStudents = [
  { id: '64010001', name: 'สมชาย ใจดี' },
  { id: '64010002', name: 'สมหญิง รักเรียน' },
  { id: '64010003', name: 'มานะ ตั้งใจ' },
  { id: '64010004', name: 'มานี ขยัน' },
  { id: '64010005', name: 'ปิติ สุขใจ' },
];

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'photo':
      return <Badge className="bg-blue-500"><FileImage className="mr-1 h-3 w-3" />รูปภาพ</Badge>;
    case 'document':
      return <Badge className="bg-green-500"><FileText className="mr-1 h-3 w-3" />เอกสาร</Badge>;
    case 'video':
      return <Badge className="bg-purple-500">วิดีโอ</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

export default function Evidence() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    studentId: '',
    title: '',
    type: 'photo',
  });

  const filteredEvidence = mockEvidence.filter(
    (e) =>
      e.studentName.includes(searchTerm) ||
      e.studentId.includes(searchTerm) ||
      e.title.includes(searchTerm)
  );

  const stats = {
    total: mockEvidence.length,
    verified: mockEvidence.filter(e => e.verified).length,
    pending: mockEvidence.filter(e => !e.verified).length,
    photos: mockEvidence.filter(e => e.type === 'photo').length,
  };

  const handleUpload = () => {
    console.log('Uploading evidence:', newEvidence);
    setIsDialogOpen(false);
    setNewEvidence({ studentId: '', title: '', type: 'photo' });
  };

  const handleVerify = (id: string) => {
    console.log('Verifying evidence:', id);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">หลักฐานการปฏิบัติงาน</h1>
            <p className="text-muted-foreground">จัดการหลักฐานการปฏิบัติงานของนักศึกษา</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                อัปโหลดหลักฐาน
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>อัปโหลดหลักฐาน</DialogTitle>
                <DialogDescription>
                  อัปโหลดหลักฐานการปฏิบัติงานของนักศึกษา
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>นักศึกษา</Label>
                  <Select
                    value={newEvidence.studentId}
                    onValueChange={(value) => setNewEvidence({ ...newEvidence, studentId: value })}
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
                  <Label>ชื่อหลักฐาน</Label>
                  <Input
                    value={newEvidence.title}
                    onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                    placeholder="ชื่อหลักฐาน"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>ประเภท</Label>
                  <Select
                    value={newEvidence.type}
                    onValueChange={(value) => setNewEvidence({ ...newEvidence, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">รูปภาพ</SelectItem>
                      <SelectItem value="document">เอกสาร</SelectItem>
                      <SelectItem value="video">วิดีโอ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>ไฟล์</Label>
                  <Input type="file" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleUpload}>อัปโหลด</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">หลักฐานทั้งหมด</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ตรวจสอบแล้ว</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอตรวจสอบ</CardTitle>
              <CheckSquare className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รูปภาพ</CardTitle>
              <FileImage className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.photos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Evidence Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการหลักฐาน</CardTitle>
            <CardDescription>หลักฐานการปฏิบัติงานทั้งหมด</CardDescription>
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
                  <TableHead>หลักฐาน</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvidence.map((evidence) => (
                  <TableRow key={evidence.id}>
                    <TableCell className="font-medium">{evidence.studentId}</TableCell>
                    <TableCell>{evidence.studentName}</TableCell>
                    <TableCell>{evidence.title}</TableCell>
                    <TableCell>{getTypeBadge(evidence.type)}</TableCell>
                    <TableCell>{evidence.date}</TableCell>
                    <TableCell>
                      {evidence.verified ? (
                        <Badge className="bg-green-500">ตรวจสอบแล้ว</Badge>
                      ) : (
                        <Badge className="bg-yellow-500">รอตรวจสอบ</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          ดู
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-3 w-3" />
                          ดาวน์โหลด
                        </Button>
                        {!evidence.verified && (
                          <Button size="sm" onClick={() => handleVerify(evidence.id)}>
                            <CheckSquare className="mr-1 h-3 w-3" />
                            ยืนยัน
                          </Button>
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
