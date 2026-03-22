import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Search, Clock, CheckCircle, AlertTriangle, Upload, X, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

// Mock data
const mockStudents = [
  { id: '1', studentId: '64010001', name: 'สมชาย ใจดี', workplace: 'โรงพยาบาลกรุงเทพ', progress: 85, tasksCompleted: 17, tasksPending: 3, status: 'active' },
  { id: '2', studentId: '64010002', name: 'สมหญิง รักเรียน', workplace: 'โรงพยาบาลศิริราช', progress: 70, tasksCompleted: 14, tasksPending: 6, status: 'active' },
  { id: '3', studentId: '64010003', name: 'มานะ ตั้งใจ', workplace: 'คลินิกชุมชน สุขภาพดี', progress: 95, tasksCompleted: 19, tasksPending: 1, status: 'active' },
  { id: '4', studentId: '64010004', name: 'มานี ขยัน', workplace: 'โรงพยาบาลรามาธิบดี', progress: 45, tasksCompleted: 9, tasksPending: 11, status: 'warning' },
  { id: '5', studentId: '64010005', name: 'ปิติ สุขใจ', workplace: 'สถานีอนามัย ตำบลสุข', progress: 60, tasksCompleted: 12, tasksPending: 8, status: 'active' },
  { id: '6', studentId: '64010006', name: 'ปิยะ มุ่งมั่น', workplace: 'โรงพยาบาลจุฬาลงกรณ์', progress: 30, tasksCompleted: 6, tasksPending: 14, status: 'critical' },
  { id: '7', studentId: '64010007', name: 'วิชัย สร้างสรรค์', workplace: 'โรงพยาบาลธรรมศาสตร์', progress: 75, tasksCompleted: 15, tasksPending: 5, status: 'active' },
  { id: '8', studentId: '64010008', name: 'วิไล พัฒนา', workplace: 'คลินิกเอกชน สุขภาพดี', progress: 55, tasksCompleted: 11, tasksPending: 9, status: 'warning' },
];

const getStatusBadge = (status: string) => {
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (!file) return;
    // TODO: เชื่อม API จริง
    setFile(null);
    setDescription('');
    setUploadOpen(false);
  };

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.includes(searchTerm) ||
      student.studentId.includes(searchTerm) ||
      student.workplace.includes(searchTerm)
  );

  const stats = {
    total: mockStudents.length,
    maxCapacity: 8,
    onTrack: mockStudents.filter(s => s.status === 'active').length,
    needsAttention: mockStudents.filter(s => s.status !== 'active').length,
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">นักศึกษาฝึกปฏิบัติ</h1>
            <p className="text-muted-foreground">จัดการนักศึกษาฝึกปฏิบัติที่อยู่ในความดูแล (สัดส่วน 1:8)</p>
          </div>
          <Button variant="outline" onClick={() => setUploadOpen(true)} className="text-gray-500 border-gray-300 hover:!bg-orange-500 hover:!text-white hover:!border-orange-500">
            <Upload className="mr-2 h-4 w-4" />
            อัปโหลดหลักฐาน
          </Button>
        </div>

        {/* Upload Evidence Dialog */}
        <Dialog open={uploadOpen} onOpenChange={(v) => { if (!v) { setFile(null); setDescription(''); } setUploadOpen(v); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>อัปโหลดหลักฐาน</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-2 rounded-full p-1 hover:bg-muted">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">คลิกหรือลากไฟล์มาวางที่นี่</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG (สูงสุด 20MB)</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="evidence-desc">หมายเหตุ (ไม่บังคับ)</Label>
                <Input
                  id="evidence-desc"
                  placeholder="ระบุรายละเอียดหลักฐาน"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleUpload} disabled={!file}>
                <Upload className="mr-1 h-4 w-4" />
                อัปโหลด
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                {Math.round(mockStudents.reduce((acc, s) => acc + s.progress, 0) / mockStudents.length)}%
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
                {filteredStudents.map((student) => (
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
                        <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                        <Button size="sm">ประเมิน</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}