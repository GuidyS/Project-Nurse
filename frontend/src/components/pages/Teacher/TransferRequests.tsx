import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, UserPlus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TransferRequests() {
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [dropdowns, setDropdowns] = useState({ students: [], advisors: [] });
  
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  // Form States
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [reason, setReason] = useState('');

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/get_transfer_requests.php')
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setIncomingRequests(res.data.incoming);
          setOutgoingRequests(res.data.outgoing);
          setHistory(res.data.history);
          setDropdowns(res.data.dropdowns);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("โหลดข้อมูลผิดพลาด:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = (id: number, status: 'approved' | 'rejected') => {
    fetch('/api/update_transfer_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: id, status })
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          alert('ดำเนินการเสร็จสิ้น');
          fetchRequests();
        } else {
          alert('เกิดข้อผิดพลาด: ' + res.message);
        }
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/create_transfer_request.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: selectedStudent,
        to_advisor_id: selectedAdvisor,
        reason: reason
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          alert('ส่งคำขอสลับเปลี่ยนสำเร็จ');
          setOpenDialog(false);
          setSelectedStudent('');
          setSelectedAdvisor('');
          setReason('');
          fetchRequests();
        } else {
          alert('เกิดข้อผิดพลาด: ' + res.message);
        }
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-yellow-600 bg-yellow-50">รอพิจารณา</Badge>;
      case 'approved': return <Badge variant="outline" className="text-green-600 bg-green-50">อนุมัติแล้ว</Badge>;
      case 'rejected': return <Badge variant="outline" className="text-red-600 bg-red-50">ปฏิเสธ</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">กำลังโหลดรายการคำขอ...</div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">จัดการคำขอสลับเปลี่ยนนักศึกษา</h1>
            <p className="text-muted-foreground">อนุมัติคำขอรับเข้าหรือส่งคำขอโอนย้ายนักศึกษาในความดูแล</p>
          </div>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                สร้างคำขอส่งออก
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>สร้างคำขอสลับเปลี่ยนอาจารย์ที่ปรึกษา</DialogTitle>
                <DialogDescription>เลือกนักศึกษาและอาจารย์ปลายทางที่ต้องการโอนย้ายดูแล</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>เลือกนักศึกษา</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger><SelectValue placeholder="เลือกนักศึกษา" /></SelectTrigger>
                    <SelectContent>
                      {dropdowns.students.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>รหัส: {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>โอนย้ายไปให้อาจารย์</Label>
                  <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
                    <SelectTrigger><SelectValue placeholder="เลือกอาจารย์ปลายทาง" /></SelectTrigger>
                    <SelectContent>
                      {dropdowns.advisors.map((a: any) => (
                        <SelectItem key={a.id} value={a.id.toString()}>อาจารย์ ID: {a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>เหตุผลการย้าย</Label>
                  <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="ระบุเหตุผลความจำเป็น..." required />
                </div>
                <DialogFooter>
                  <Button type="submit">ส่งคำขอ</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="incoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="incoming">คำขอรับเข้า ({incomingRequests.length})</TabsTrigger>
            <TabsTrigger value="outgoing">คำขอส่งออก ({outgoingRequests.length})</TabsTrigger>
            <TabsTrigger value="history">ประวัติการทำรายการ ({history.length})</TabsTrigger>
          </TabsList>

          {/* ตารางคำขอรับเข้า */}
          <TabsContent value="incoming">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสนักศึกษา</TableHead>
                      <TableHead>จากอาจารย์ (ID)</TableHead>
                      <TableHead>เหตุผล</TableHead>
                      <TableHead>วันที่ส่งคำขอ</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomingRequests.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">ไม่มีคำขอรับเข้าในขณะนี้</TableCell></TableRow>
                    ) : (
                      incomingRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.studentId}</TableCell>
                          <TableCell>{req.otherAdvisor}</TableCell>
                          <TableCell>{req.reason}</TableCell>
                          <TableCell>{req.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(req.id, 'approved')}>อนุมัติ</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, 'rejected')}>ปฏิเสธ</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ตารางคำขอส่งออก */}
          <TabsContent value="outgoing">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสนักศึกษา</TableHead>
                      <TableHead>ไปยังอาจารย์ (ID)</TableHead>
                      <TableHead>เหตุผล</TableHead>
                      <TableHead>วันที่ส่งคำขอ</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outgoingRequests.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">ไม่มีคำขอส่งออกในขณะนี้</TableCell></TableRow>
                    ) : (
                      outgoingRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.studentId}</TableCell>
                          <TableCell>{req.otherAdvisor}</TableCell>
                          <TableCell>{req.reason}</TableCell>
                          <TableCell>{req.date}</TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ตารางประวัติการทำรายการ */}
          <TabsContent value="history">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสนักศึกษา</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>อาจารย์คู่กรณี (ID)</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>สถานะผลลัพธ์</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">ไม่มีประวัติรายการ</TableCell></TableRow>
                    ) : (
                      history.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.studentId}</TableCell>
                          <TableCell>
                            <Badge variant={req.type === 'incoming' ? 'default' : 'secondary'}>
                              {req.type === 'incoming' ? 'รับเข้า' : 'มอบออก'}
                            </Badge>
                          </TableCell>
                          <TableCell>{req.otherAdvisor}</TableCell>
                          <TableCell>{req.date}</TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}