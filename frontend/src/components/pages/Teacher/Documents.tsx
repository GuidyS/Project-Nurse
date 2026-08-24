import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { FileText, Upload, Download, Search, Eye, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  course: string;
  uploadedAt: string;
  status: string;
  fileUrl?: string;
  downloadUrl?: string;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved': return <Badge className="bg-green-500 hover:bg-green-600">อนุมัติแล้ว</Badge>;
    case 'pending': return <Badge className="bg-yellow-500 hover:bg-yellow-600">รอตรวจสอบ</Badge>;
    case 'rejected': return <Badge variant="destructive">ถูกปฏิเสธ</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Documents() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [courses, setCourses] = useState<{ subject_code: string, subject_name_th: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newDocument, setNewDocument] = useState<{
    name: string;
    type: string;
    course: string;
    academic_year: string;
    semester: string;
    file: File | null;
  }>({
    name: '', type: '', course: '', academic_year: '2567', semester: '1', file: null
  });

  // 🌟 ดึงข้อมูลจาก API เมื่อเปิดหน้าเว็บ
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-documents');
      if (response.data.status === 'success') {
        const payload = response.data.data;
        if (Array.isArray(payload)) {
          setDocuments(payload);
          setCourses([]);
        } else if (payload && typeof payload === 'object') {
          setDocuments(Array.isArray(payload.documents) ? payload.documents : []);
          setCourses(Array.isArray(payload.courses) ? payload.courses : []);
        } else {
          setDocuments([]);
          setCourses([]);
        }
      }
    } catch (error) {
      setDocuments([]);
      setCourses([]);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลเอกสารได้", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const safeDocuments = Array.isArray(documents) ? documents : [];

  const filteredDocuments = safeDocuments.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (doc.name || '').toLowerCase().includes(searchLower) ||
      (doc.type || '').toLowerCase().includes(searchLower) ||
      (doc.course || '').toLowerCase().includes(searchLower)
    );
  });

  // 🌟 ฟังก์ชันส่งข้อมูลอัปโหลดไปบันทึก
  const handleUpload = async () => {
    if (!newDocument.name || !newDocument.type || !newDocument.course || !newDocument.file) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกข้อมูลและแนบไฟล์ให้ครบถ้วน", variant: "destructive" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newDocument.name);
      formData.append('type', newDocument.type);
      formData.append('course', newDocument.course);
      formData.append('academic_year', newDocument.academic_year);
      formData.append('semester', newDocument.semester);
      formData.append('file', newDocument.file);

      const response = await api.post('/index.php?page=upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === 'success') {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูลเอกสารเรียบร้อยแล้ว" });
        setIsDialogOpen(false);
        setNewDocument({ name: '', type: '', course: '', academic_year: '2567', semester: '1', file: null });
        fetchDocuments(); // รีเฟรชข้อมูล
      } else {
        toast({ title: "ข้อผิดพลาด", description: response.data.message || "ไม่สามารถอัปโหลดได้", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "ข้อผิดพลาด", description: error.response?.data?.message || "ไม่สามารถอัปโหลดได้", variant: "destructive" });
    }
  };

  // 🌟 ฟังก์ชันลบเอกสาร
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await api.post('/index.php?page=delete-document', { document_id: deleteId });
      if (response.data.status === 'success') {
        toast({ title: "สำเร็จ", description: "ลบเอกสารออกจากระบบแล้ว" });
        fetchDocuments(); // รีเฟรชข้อมูล
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถลบเอกสารได้", variant: "destructive" });
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">อัปโหลดเอกสาร</h1>
            <p className="text-muted-foreground">จัดการเอกสารรายวิชาต่างๆ</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                อัปโหลดเอกสาร
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>อัปโหลดเอกสาร</DialogTitle>
                <DialogDescription>
                  กรุณากรอกข้อมูลเอกสารที่ต้องการอัปโหลด
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>ปีการศึกษา</Label>
                    <Input
                      type="number"
                      value={newDocument.academic_year}
                      onChange={(e) => setNewDocument({ ...newDocument, academic_year: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>ภาคการศึกษา</Label>
                    <Select value={newDocument.semester} onValueChange={(v) => setNewDocument({ ...newDocument, semester: v })}>
                      <SelectTrigger><SelectValue placeholder="เลือกเทอม" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">เทอม 1</SelectItem>
                        <SelectItem value="2">เทอม 2</SelectItem>
                        <SelectItem value="3">เทอม 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>รายวิชา</Label>
                  <Select value={newDocument.course} onValueChange={(v) => setNewDocument({ ...newDocument, course: v })}>
                    <SelectTrigger><SelectValue placeholder="เลือกรายวิชา" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.subject_code} value={c.subject_code}>
                          {c.subject_code} - {c.subject_name_th}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>ประเภท</Label>
                  <Select value={newDocument.type} onValueChange={(v) => setNewDocument({ ...newDocument, type: v })}>
                    <SelectTrigger><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="มคอ.3">มคอ.3 (รายละเอียดของรายวิชา)</SelectItem>
                      <SelectItem value="มคอ.4">มคอ.4 (รายละเอียดประสบการณ์ภาคสนาม)</SelectItem>
                      <SelectItem value="มคอ.5">มคอ.5 (รายงานผลการดำเนินการรายวิชา)</SelectItem>
                      <SelectItem value="มคอ.6">มคอ.6 (รายงานผลการดำเนินการประสบการณ์ภาคสนาม)</SelectItem>
                      <SelectItem value="other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>ชื่อเอกสาร (Optional)</Label>
                  <Input
                    value={newDocument.name || ''}
                    onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                    placeholder="เช่น มคอ.3 - NUR101"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>ไฟล์เอกสาร</Label>
                  <Input 
                    type="file" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        setNewDocument({ ...newDocument, file, name: newDocument.name || file.name });
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">เอกสารทั้งหมด</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {safeDocuments.filter(d => d.status === 'approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">รอตรวจสอบ</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {safeDocuments.filter(d => d.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">TQF</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter(d => d.type.includes('TQF')).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการเอกสาร</CardTitle>
            <CardDescription>เอกสารรายวิชาทั้งหมด</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเอกสาร..."
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
                  <TableHead>ชื่อเอกสาร</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>รายวิชา</TableHead>
                  <TableHead>วันที่อัปโหลด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                      <TableCell>{doc.course}</TableCell>
                      <TableCell>{doc.uploadedAt}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            disabled={!doc.fileUrl}
                            onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            disabled={!doc.downloadUrl && !doc.fileUrl}
                            onClick={() => {
                              const url = doc.downloadUrl || doc.fileUrl;
                              if (url) {
                                // use an invisible iframe or just window.location for downloads so we don't open blank tabs
                                window.location.href = url;
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-red-100 hover:text-red-600 border-red-200" onClick={() => { setDeleteId(doc.id); setIsDeleteOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">ไม่พบข้อมูลเอกสารที่คุณค้นหา</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้? การลบจะไม่สามารถย้อนกลับได้</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={handleDelete}>ลบ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
