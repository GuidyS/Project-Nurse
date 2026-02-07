import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Eye, Plus } from 'lucide-react';

// Mock data
const mockDocs = [
  { id: '1', name: 'ข้อเสนอโครงการ', project: 'โครงการพัฒนาทักษะการพยาบาล', type: 'proposal', date: '2024-01-05', status: 'approved' },
  { id: '2', name: 'รายงานความก้าวหน้าครั้งที่ 1', project: 'โครงการพัฒนาทักษะการพยาบาล', type: 'progress', date: '2024-01-15', status: 'approved' },
  { id: '3', name: 'เอกสารการเงิน', project: 'โครงการพัฒนาทักษะการพยาบาล', type: 'financial', date: '2024-01-10', status: 'pending' },
  { id: '4', name: 'ข้อเสนอโครงการ', project: 'โครงการวิจัยการดูแลผู้สูงอายุ', type: 'proposal', date: '2023-12-20', status: 'approved' },
  { id: '5', name: 'รายงานสรุปโครงการ', project: 'โครงการอบรมเทคโนโลยีการพยาบาล', type: 'summary', date: '2024-01-10', status: 'approved' },
];

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'proposal':
      return <Badge className="bg-blue-500">ข้อเสนอ</Badge>;
    case 'progress':
      return <Badge className="bg-green-500">รายงานความก้าวหน้า</Badge>;
    case 'financial':
      return <Badge className="bg-yellow-500">การเงิน</Badge>;
    case 'summary':
      return <Badge className="bg-purple-500">สรุปโครงการ</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">อนุมัติ</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">รอตรวจสอบ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function ProjectDocs() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">สร้างเอกสารโครงการ</h1>
            <p className="text-muted-foreground">จัดการเอกสารโครงการทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              อัปโหลด
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              สร้างเอกสาร
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เอกสารทั้งหมด</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDocs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockDocs.filter(d => d.status === 'approved').length}
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
                {mockDocs.filter(d => d.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ข้อเสนอโครงการ</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockDocs.filter(d => d.type === 'proposal').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการเอกสาร</CardTitle>
            <CardDescription>เอกสารโครงการทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อเอกสาร</TableHead>
                  <TableHead>โครงการ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{doc.project}</TableCell>
                    <TableCell>{getTypeBadge(doc.type)}</TableCell>
                    <TableCell>{doc.date}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
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
