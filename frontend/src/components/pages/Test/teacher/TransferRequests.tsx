import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserCheck, UserPlus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockIncomingRequests = [
  { id: '1', studentId: '64010005', studentName: 'วิชัย มานะ', fromAdvisor: 'อ.สมศักดิ์ รักดี', reason: 'ต้องการเปลี่ยนสาขา', date: '2024-01-08', status: 'pending' },
  { id: '2', studentId: '65010003', studentName: 'สุดา ตั้งใจ', fromAdvisor: 'อ.มานี สุขใจ', reason: 'อาจารย์ที่ปรึกษาลาออก', date: '2024-01-05', status: 'pending' },
];

const mockOutgoingRequests = [
  { id: '3', studentId: '64010002', studentName: 'สมหญิง รักเรียน', toAdvisor: 'อ.วิชัย ใจดี', reason: 'นักศึกษาต้องการที่ปรึกษาสาขาเฉพาะทาง', date: '2024-01-10', status: 'approved' },
  { id: '4', studentId: '66010001', studentName: 'ปิติ สุขใจ', toAdvisor: 'อ.สมศรี มุ่งมั่น', reason: 'ย้ายหลักสูตร', date: '2024-01-12', status: 'pending' },
];

const mockHistory = [
  { id: '5', studentId: '63010001', studentName: 'อนันต์ พัฒนา', type: 'incoming', otherAdvisor: 'อ.สมชาย เก่งกาจ', date: '2023-12-15', status: 'approved' },
  { id: '6', studentId: '63010002', studentName: 'อรุณ แสงทอง', type: 'outgoing', otherAdvisor: 'อ.มานะ สร้างสรรค์', date: '2023-11-20', status: 'rejected' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-500">รอดำเนินการ</Badge>;
    case 'approved':
      return <Badge className="bg-green-500">อนุมัติ</Badge>;
    case 'rejected':
      return <Badge variant="destructive">ปฏิเสธ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function TransferRequests() {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (id: string) => {
    console.log('Approving request:', id);
  };

  const handleReject = () => {
    console.log('Rejecting with reason:', rejectReason);
    setIsRejectDialogOpen(false);
    setRejectReason('');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ร้องขอรับมอบนักศึกษา</h1>
          <p className="text-muted-foreground">จัดการคำขอรับมอบนักศึกษาระหว่างอาจารย์ที่ปรึกษา</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำขอเข้า</CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockIncomingRequests.filter(r => r.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">รอดำเนินการ</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำขอออก</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockOutgoingRequests.filter(r => r.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">รอดำเนินการ</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {[...mockIncomingRequests, ...mockOutgoingRequests, ...mockHistory].filter(r => r.status === 'approved').length}
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
                {mockHistory.filter(r => r.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="incoming">
              คำขอเข้า
              {mockIncomingRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge className="ml-2 bg-primary">{mockIncomingRequests.filter(r => r.status === 'pending').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing">คำขอออก</TabsTrigger>
            <TabsTrigger value="history">ประวัติ</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming">
            <Card>
              <CardHeader>
                <CardTitle>คำขอรับมอบนักศึกษาเข้า</CardTitle>
                <CardDescription>นักศึกษาที่อาจารย์ท่านอื่นขอมอบมาให้</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสนักศึกษา</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>จากอาจารย์</TableHead>
                      <TableHead>เหตุผล</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockIncomingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.studentId}</TableCell>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.fromAdvisor}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                        <TableCell>{request.date}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApprove(request.id)}>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                รับ
                              </Button>
                              <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    ปฏิเสธ
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>ปฏิเสธคำขอรับมอบ</DialogTitle>
                                    <DialogDescription>
                                      กรุณาระบุเหตุผลในการปฏิเสธ
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label>เหตุผล</Label>
                                      <Textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="ระบุเหตุผลในการปฏิเสธ..."
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                                      ยกเลิก
                                    </Button>
                                    <Button variant="destructive" onClick={handleReject}>
                                      ยืนยันปฏิเสธ
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outgoing">
            <Card>
              <CardHeader>
                <CardTitle>คำขอมอบนักศึกษาออก</CardTitle>
                <CardDescription>นักศึกษาที่ขอมอบให้อาจารย์ท่านอื่น</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสนักศึกษา</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>ถึงอาจารย์</TableHead>
                      <TableHead>เหตุผล</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOutgoingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.studentId}</TableCell>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.toAdvisor}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                        <TableCell>{request.date}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>ประวัติการรับมอบ</CardTitle>
                <CardDescription>ประวัติการรับมอบนักศึกษาทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสนักศึกษา</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>อาจารย์</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.studentId}</TableCell>
                        <TableCell>{item.studentName}</TableCell>
                        <TableCell>
                          <Badge variant={item.type === 'incoming' ? 'default' : 'secondary'}>
                            {item.type === 'incoming' ? 'รับเข้า' : 'มอบออก'}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.otherAdvisor}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
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
