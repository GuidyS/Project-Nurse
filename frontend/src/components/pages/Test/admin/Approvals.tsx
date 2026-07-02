import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, FileText, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockApprovals = [
  { id: '1', type: 'grade_change', requester: 'อ.สมศักดิ์ รักดี', description: 'ขอแก้ไขเกรดนักศึกษา 64010001 วิชา NUR101', date: '2024-01-15', status: 'pending' },
  { id: '2', type: 'student_transfer', requester: 'อ.มานี สุขใจ', description: 'ขอรับมอบนักศึกษา 65010002 จากอาจารย์ที่ปรึกษาเดิม', date: '2024-01-14', status: 'pending' },
  { id: '3', type: 'project_request', requester: 'อ.วิชัย ตั้งใจ', description: 'ขอเปิดโครงการวิจัย: การพัฒนาทักษะการพยาบาล', date: '2024-01-12', status: 'pending' },
  { id: '4', type: 'document_approve', requester: 'อ.สมหญิง มุ่งมั่น', description: 'ขออนุมัติเอกสาร TQF 3 รายวิชา NUR301', date: '2024-01-10', status: 'approved' },
  { id: '5', type: 'grade_change', requester: 'อ.ปิยะ พัฒนา', description: 'ขอแก้ไขเกรดนักศึกษา 63010005 วิชา NUR401', date: '2024-01-08', status: 'rejected' },
];

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'grade_change':
      return <Badge className="bg-blue-500">แก้ไขเกรด</Badge>;
    case 'student_transfer':
      return <Badge className="bg-purple-500">รับมอบนักศึกษา</Badge>;
    case 'project_request':
      return <Badge className="bg-green-500">โครงการ</Badge>;
    case 'document_approve':
      return <Badge className="bg-orange-500">เอกสาร</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Clock className="mr-1 h-3 w-3" />รอดำเนินการ</Badge>;
    case 'approved':
      return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />อนุมัติ</Badge>;
    case 'rejected':
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />ปฏิเสธ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function Approvals() {
  const [approvals, setApprovals] = useState(mockApprovals);

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  const handleApprove = (id: string) => {
    setApprovals(approvals.map(a => 
      a.id === id ? { ...a, status: 'approved' } : a
    ));
  };

  const handleReject = (id: string) => {
    setApprovals(approvals.map(a => 
      a.id === id ? { ...a, status: 'rejected' } : a
    ));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">อนุมัติคำขอ</h1>
          <p className="text-muted-foreground">ดำเนินการตามคำขอจากอาจารย์</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approvals.filter(a => a.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ปฏิเสธ</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {approvals.filter(a => a.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvals.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              รอดำเนินการ
              {pendingCount > 0 && <Badge className="ml-2">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>คำขอที่รอดำเนินการ</CardTitle>
                <CardDescription>คำขอที่รอการอนุมัติจากผู้ดูแลระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>ผู้ร้องขอ</TableHead>
                      <TableHead>รายละเอียด</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.filter(a => a.status === 'pending').map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>{getTypeBadge(approval.type)}</TableCell>
                        <TableCell className="font-medium">{approval.requester}</TableCell>
                        <TableCell className="max-w-[300px]">{approval.description}</TableCell>
                        <TableCell>{approval.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(approval.id)}>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              อนุมัติ
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleReject(approval.id)}>
                              <XCircle className="mr-1 h-3 w-3" />
                              ปฏิเสธ
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>คำขอทั้งหมด</CardTitle>
                <CardDescription>ประวัติคำขอทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>ผู้ร้องขอ</TableHead>
                      <TableHead>รายละเอียด</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>{getTypeBadge(approval.type)}</TableCell>
                        <TableCell className="font-medium">{approval.requester}</TableCell>
                        <TableCell className="max-w-[300px]">{approval.description}</TableCell>
                        <TableCell>{approval.date}</TableCell>
                        <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
