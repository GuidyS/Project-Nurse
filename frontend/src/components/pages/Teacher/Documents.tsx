import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { FileText, Upload, Download, Search, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  course: string;
  uploadedAt: string;
  size: string;
  status: string;
};

const initialDocuments: DocumentItem[] = [
  { id: '1', name: 'TQF 3 - NUR101', type: 'TQF 3', course: 'NUR101', uploadedAt: '2024-01-10', size: '2.5 MB', status: 'approved' },
  { id: '2', name: 'TQF 5 - NUR101', type: 'TQF 5', course: 'NUR101', uploadedAt: '2024-01-15', size: '1.8 MB', status: 'pending' },
  { id: '3', name: 'เอกสารประกอบการสอน บทที่ 1', type: 'เอกสารสอน', course: 'NUR101', uploadedAt: '2024-01-05', size: '5.2 MB', status: 'approved' },
  { id: '4', name: 'TQF 3 - NUR201', type: 'TQF 3', course: 'NUR201', uploadedAt: '2024-01-08', size: '2.8 MB', status: 'approved' },
  { id: '5', name: 'แบบฝึกหัด การพยาบาลพื้นฐาน', type: 'แบบฝึกหัด', course: 'NUR101', uploadedAt: '2024-01-12', size: '1.2 MB', status: 'approved' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500 hover:bg-green-600">อนุมัติแล้ว</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">รอตรวจสอบ</Badge>;
    case 'rejected':
      return <Badge variant="destructive">ถูกปฏิเสธ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<Partial<DocumentItem>>({
    name: '',
    type: '',
    course: '',
  });

  // ปรับการค้นหาให้ไม่สนใจตัวพิมพ์เล็ก-ใหญ่ (Case-insensitive)
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      doc.name.toLowerCase().includes(searchLower) ||
      doc.type.toLowerCase().includes(searchLower) ||
      doc.course.toLowerCase().includes(searchLower)
    );
  });

  const handleUpload = () => {
    // mock add document
    const id = Date.now().toString();
    setDocuments((prev) => [
      ...prev,
      {
        id,
        name: newDocument.name || 'Unnamed',
        type: newDocument.type || 'Other',
        course: newDocument.course || 'N/A',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: '0 KB',
        status: 'pending',
      } as DocumentItem,
    ]);
    setIsDialogOpen(false);
    setNewDocument({ name: '', type: '', course: '' });
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

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
                <div className="grid gap-2">
                  <Label>ชื่อเอกสาร</Label>
                  <Input
                    value={newDocument.name || ''}
                    onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                    placeholder="เช่น TQF 3 - NUR101"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>ประเภท</Label>
                  <Input
                    value={newDocument.type || ''}
                    onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                    placeholder="เช่น TQF 3, เอกสารสอน"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>รายวิชา</Label>
                  <Input
                    value={newDocument.course || ''}
                    onChange={(e) => setNewDocument({ ...newDocument, course: e.target.value })}
                    placeholder="เช่น NUR101"
                  />
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
                {documents.filter(d => d.status === 'approved').length}
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
                {documents.filter(d => d.status === 'pending').length}
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
                  <TableHead>ขนาด</TableHead>
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
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{doc.uploadedAt}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 border-red-200"
                            onClick={() => handleDeleteConfirm(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      ไม่พบข้อมูลเอกสารที่คุณค้นหา
                    </TableCell>
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
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้? การลบจะไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="secondary" className="border border-gray-300" onClick={() => setIsDeleteOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId) {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }
                setIsDeleteOpen(false);
              }}
            >
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}