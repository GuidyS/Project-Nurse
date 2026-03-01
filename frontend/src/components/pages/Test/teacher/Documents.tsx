import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Upload, Download, Search, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockDocuments = [
  { id: '1', name: 'TQF 3 - NUR101', type: 'TQF 3', course: 'NUR101', uploadedAt: '2024-01-10', size: '2.5 MB', status: 'approved' },
  { id: '2', name: 'TQF 5 - NUR101', type: 'TQF 5', course: 'NUR101', uploadedAt: '2024-01-15', size: '1.8 MB', status: 'pending' },
  { id: '3', name: 'เอกสารประกอบการสอน บทที่ 1', type: 'เอกสารสอน', course: 'NUR101', uploadedAt: '2024-01-05', size: '5.2 MB', status: 'approved' },
  { id: '4', name: 'TQF 3 - NUR201', type: 'TQF 3', course: 'NUR201', uploadedAt: '2024-01-08', size: '2.8 MB', status: 'approved' },
  { id: '5', name: 'แบบฝึกหัด การพยาบาลพื้นฐาน', type: 'แบบฝึกหัด', course: 'NUR101', uploadedAt: '2024-01-12', size: '1.2 MB', status: 'approved' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">อนุมัติแล้ว</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">รอตรวจสอบ</Badge>;
    case 'rejected':
      return <Badge variant="destructive">ถูกปฏิเสธ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = mockDocuments.filter(
    (doc) =>
      doc.name.includes(searchTerm) ||
      doc.type.includes(searchTerm) ||
      doc.course.includes(searchTerm)
  );

  const handleUpload = () => {
    console.log('Opening upload dialog');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">อัปโหลดเอกสาร</h1>
            <p className="text-muted-foreground">จัดการเอกสารรายวิชาต่างๆ</p>
          </div>
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            อัปโหลดเอกสาร
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เอกสารทั้งหมด</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDocuments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockDocuments.filter(d => d.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอตรวจสอบ</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mockDocuments.filter(d => d.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TQF</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockDocuments.filter(d => d.type.includes('TQF')).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
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
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                    <TableCell>{doc.course}</TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell>{doc.uploadedAt}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
