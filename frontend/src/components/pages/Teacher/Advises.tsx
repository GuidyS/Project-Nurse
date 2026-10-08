import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Search, AlertTriangle, CheckCircle, Loader2, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { navigateToPage } from '@/lib/projectNavigation';

const getStatusBadge = (status: string, details?: string) => {
  switch (status) {
    case 'normal':
      return <Badge className="bg-green-500" title={details}>ปกติ</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-500" title={details}>ต้องติดตาม</Badge>;
    case 'critical':
      return <Badge variant="destructive" title={details}>ไม่ปกติ</Badge>;
    default:
      return <Badge variant="secondary" title={details}>{status}</Badge>;
  }
};

export default function Advises() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [advisees, setAdvisees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<string>('ปกติ');
  const [editDetails, setEditDetails] = useState<string>('');

  const fetchAdvisees = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/index.php?page=get-advises');
      if (res.data.status === 'success') {
        setAdvisees(res.data.data || []);
      } else {
        toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลนักศึกษาได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisees();
  }, []);

  const openEditDialog = (student: any) => {
    setEditingStudent(student);
    setEditStatus(student.status === 'critical' ? 'ไม่ปกติ' : 'ปกติ');
    setEditDetails(student.statusDetails || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!editingStudent) return;
    try {
      const res = await api.post('/index.php?page=save-advisor-status', {
        studentId: editingStudent.studentId,
        status: editStatus,
        statusDetails: editStatus === 'ไม่ปกติ' ? editDetails : ''
      });
      if (res.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: 'บันทึกสถานะเรียบร้อยแล้ว' });
        setIsEditDialogOpen(false);
        fetchAdvisees();
      } else {
        toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'ข้อผิดพลาด', description: error.response?.data?.message || 'ไม่สามารถบันทึกสถานะได้', variant: 'destructive' });
    }
  };

  // String(... ?? '') กันค่า null/ตัวเลข ไม่ให้หน้าจอพังตอนค้นหา
  const filteredAdvisees = advisees.filter(
    (student) =>
      String(student.name ?? '').includes(searchTerm) ||
      String(student.studentId ?? '').includes(searchTerm)
  );

  const stats = {
    total: advisees.length,
    maxCapacity: 12, // (เกณฑ์สัดส่วน อาจารย์ 1 คน ต่อ นศ. 12 คน)
    needsAdvice: advisees.filter(s => s.needsAdvice).length,
    critical: advisees.filter(s => s.status === 'critical').length,
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="app-page-header">
          <div className="min-w-0">
          <h1 className="app-page-title">นักศึกษาในความดูแล</h1>
          <p className="app-page-description">จัดการนักศึกษาที่อยู่ในความดูแล (สัดส่วน 1:12)</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนนักศึกษา</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}/{stats.maxCapacity}</div>
              <p className="text-xs text-muted-foreground">คน (สูงสุด 12 คน)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะปกติ</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {advisees.filter(s => s.status === 'normal').length}
              </div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะไม่ปกติ</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อนักศึกษา</CardTitle>
            <CardDescription>นักศึกษาทั้งหมดที่อยู่ในความดูแล</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAdvisees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                ไม่มีข้อมูลนักศึกษาในความดูแล
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสนักศึกษา</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead className="text-center">ชั้นปี</TableHead>
                    <TableHead className="text-center">GPA</TableHead>
                    <TableHead className="text-center">สถานะ</TableHead>
                    <TableHead className="text-center">ติดต่อล่าสุด</TableHead>
                    <TableHead className="text-center">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdvisees.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium font-mono">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">ปี {student.year}</TableCell>
                      <TableCell className="text-center font-semibold">{student.gpa.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusBadge(student.status, student.statusDetails)}
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(student)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">{student.lastContact}</TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" onClick={() => navigateToPage("advise-notes", { studentId: student.studentId })}>
                          บันทึกคำปรึกษา
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขสถานะนักศึกษา</DialogTitle>
            <DialogDescription>
              อัปเดตสถานะของ {editingStudent?.name} ({editingStudent?.studentId})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">สถานะ</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ปกติ">ปกติ</SelectItem>
                  <SelectItem value="ไม่ปกติ">ไม่ปกติ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editStatus === 'ไม่ปกติ' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">รายละเอียด (ระบุสาเหตุ)</label>
                <Textarea 
                  placeholder="กรอกรายละเอียดสาเหตุที่ทำให้สถานะไม่ปกติ..." 
                  value={editDetails} 
                  onChange={(e) => setEditDetails(e.target.value)} 
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSaveStatus}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
