import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, UserPlus, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';

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
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [historyRequests, setHistoryRequests] = useState<any[]>([]);
  const [dropdowns, setDropdowns] = useState<{students: any[], advisors: any[]}>({students: [], advisors: []});

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ studentId: '', toAdvisorId: '', reason: '' });

  const fetchData = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      let facultyId = '1';
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        facultyId = userObj.faculty_id || userObj.id || userObj.username || '1';
      }

      const res = await api.get(`/components/Teacher/TransferRequests/get_transfer_requests.php?faculty_id=${facultyId}`);
      if (res.data.status === 'success') {
        setIncomingRequests(res.data.data.incoming || []);
        setOutgoingRequests(res.data.data.outgoing || []);
        setHistoryRequests(res.data.data.history || []);
        setDropdowns(res.data.data.dropdowns || {students: [], advisors: []});
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.post('/components/Teacher/TransferRequests/update_transfer_status.php', { request_id: id, status: 'approved' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openRejectDialog = (id: string) => {
    setSelectedRequestId(id);
    setRejectReason('');
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;
    try {
      await api.post('/components/Teacher/TransferRequests/update_transfer_status.php', { request_id: selectedRequestId, status: 'rejected' });
      setIsRejectDialogOpen(false);
      setSelectedRequestId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      let facultyId = '1';
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        facultyId = userObj.faculty_id || userObj.id || userObj.username || '1';
      }

      await api.post('/components/Teacher/TransferRequests/create_transfer_request.php', {
        student_id: newRequest.studentId,
        to_advisor_id: newRequest.toAdvisorId,
        reason: newRequest.reason,
        from_advisor_id: facultyId
      });
      setIsCreateDialogOpen(false);
      setNewRequest({ studentId: '', toAdvisorId: '', reason: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ร้องขอรับมอบนักศึกษา</h1>
            <p className="text-muted-foreground">จัดการคำขอรับมอบนักศึกษาระหว่างอาจารย์ที่ปรึกษา</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            สร้างคำขอย้าย
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำขอเข้า</CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incomingRequests.length}</div>
              <p className="text-xs text-muted-foreground">รอดำเนินการ</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำขอออก</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outgoingRequests.length}</div>
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
                {historyRequests.filter(r => r.status === 'approved').length}
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
                {historyRequests.filter(r => r.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="incoming">
              คำขอเข้า
              {incomingRequests.length > 0 && (
                <Badge className="ml-2 bg-primary">{incomingRequests.length}</Badge>
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
                    {incomingRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                          ไม่มีคำขอเข้า
                        </TableCell>
                      </TableRow>
                    ) : incomingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.studentId}</TableCell>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.otherAdvisor}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                        <TableCell>{request.date}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(request.id)}>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              รับ
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openRejectDialog(request.id)}>
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
                    {outgoingRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          ไม่มีคำขอออก
                        </TableCell>
                      </TableRow>
                    ) : outgoingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.studentId}</TableCell>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>{request.otherAdvisor}</TableCell>
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
                    {historyRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          ไม่มีประวัติ
                        </TableCell>
                      </TableRow>
                    ) : historyRequests.map((item) => (
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

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
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

        {/* Create Request Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>สร้างคำขอมอบนักศึกษา (ส่งออก)</DialogTitle>
              <DialogDescription>
                เลือกนักศึกษาและอาจารย์ปลายทางที่คุณต้องการมอบหมายให้
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>นักศึกษา</Label>
                <Select 
                  value={newRequest.studentId} 
                  onValueChange={(val) => setNewRequest({ ...newRequest, studentId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกนักศึกษา..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdowns.students.map(std => (
                      <SelectItem key={std.id} value={std.id.toString()}>{std.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>อาจารย์ปลายทาง</Label>
                <Select 
                  value={newRequest.toAdvisorId} 
                  onValueChange={(val) => setNewRequest({ ...newRequest, toAdvisorId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกอาจารย์..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdowns.advisors.map(adv => (
                      <SelectItem key={adv.id} value={adv.id.toString()}>{adv.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>เหตุผลการขอย้าย</Label>
                <Textarea
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  placeholder="ระบุเหตุผล..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateRequest} disabled={!newRequest.studentId || !newRequest.toAdvisorId}>
                สร้างคำขอ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
