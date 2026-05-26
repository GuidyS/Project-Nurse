import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Upload, FileImage, FileText, Download, Search, Eye, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

type EvidenceItem = {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  title: string;
  url: string;
  date: string;
  verified: boolean;
};

type StudentItem = {
  id: string;
  name: string;
};

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newEvidence, setNewEvidence] = useState({
    studentId: '',
    title: '',
    type: 'photo',
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedFile(null);
    }
  }, [isDialogOpen]);

  const fetchEvidence = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-evidence');
      if (response.data.status === 'success') {
        setEvidenceList(response.data.data.evidence || []);
        setStudents(response.data.data.students || []);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลหลักฐานได้", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const filteredEvidence = evidenceList.filter(
    (e) =>
      e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: evidenceList.length,
    verified: evidenceList.filter(e => e.verified).length,
    pending: evidenceList.filter(e => !e.verified).length,
    photos: evidenceList.filter(e => e.type === 'photo').length,
  };

  const handleUpload = async () => {
    if (!newEvidence.studentId || !newEvidence.title || !newEvidence.type || !selectedFile) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกข้อมูลและเลือกไฟล์ให้ครบถ้วน", variant: "destructive" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('studentId', newEvidence.studentId);
      formData.append('title', newEvidence.title);
      formData.append('type', newEvidence.type);
      formData.append('file', selectedFile);

      const response = await api.post('/index.php?page=upload-evidence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        toast({ title: "สำเร็จ", description: "บันทึกหลักฐานและอัปโหลดไฟล์เรียบร้อยแล้ว" });
        setIsDialogOpen(false);
        setNewEvidence({ studentId: '', title: '', type: 'photo' });
        setSelectedFile(null);
        fetchEvidence();
      } else {
        toast({ title: "ข้อผิดพลาด", description: response.data.message || "ไม่สามารถอัปโหลดได้", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถอัปโหลดหลักฐานได้", variant: "destructive" });
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const response = await api.post('/index.php?page=verify-evidence', { id });
      if (response.data.status === 'success') {
        toast({ title: "สำเร็จ", description: "ยืนยันการตรวจสอบหลักฐานเรียบร้อย" });
        fetchEvidence();
      } else {
        toast({ title: "ข้อผิดพลาด", description: response.data.message || "ไม่สามารถยืนยันได้", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถยืนยันหลักฐานได้", variant: "destructive" });
    }
  };
  //ฟังค์ชัน ดู

  const getFileUrl = (urlPath: string) => {
    if (!urlPath) return '#';
    if (urlPath.startsWith('http')) return urlPath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/${urlPath}`;
  };

  const handleView = (url: string) => {
    if (!url) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่พบที่อยู่ไฟล์หลักฐาน", variant: "destructive" });
      return;
    }
    window.open(getFileUrl(url), '_blank');
  };

  const handleDownload = (url: string, title: string) => {
    if (!url) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่พบที่อยู่ไฟล์หลักฐาน", variant: "destructive" });
      return;
    }
    const link = document.createElement('a');
    link.href = getFileUrl(url);
    link.setAttribute('download', title || 'download');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
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
                      {students.map((student) => (
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
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
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
                        <Button variant="outline" size="sm" onClick={() => handleView(evidence.url)}>
                          <Eye className="mr-1 h-3 w-3" />
                          ดู
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(evidence.url, evidence.title)}>
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
    </>
  );
}
