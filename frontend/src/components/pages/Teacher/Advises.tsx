import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { navigateToPage } from '@/lib/projectNavigation';

export default function Advises() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [advisees, setAdvisees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const fetchAdvisees = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/index.php?page=get-advises');
      if (res.data.status === 'success') {
        const data = res.data.data || [];
        setAdvisees(data);
        const initialRemarks: Record<string, string> = {};
        data.forEach((student: any) => {
          initialRemarks[student.studentId] = student.statusDetails || '';
        });
        setRemarks(initialRemarks);
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

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    const student = advisees.find((s) => s.studentId === studentId);
    if (!student) return;

    if (newStatus === 'ปกติ') {
      try {
        setSavingStudentId(studentId);
        const res = await api.post('/index.php?page=save-advisor-status', {
          studentId,
          status: 'ปกติ',
          statusDetails: ''
        });
        if (res.data.status === 'success') {
          toast({ title: 'สำเร็จ', description: `อัปเดตสถานะของ ${student.name} เป็นปกติเรียบร้อยแล้ว` });
          setAdvisees((prev) =>
            prev.map((s) =>
              s.studentId === studentId
                ? {
                    ...s,
                    status: 'normal',
                    advisor_status: 'ปกติ',
                    advisor_status_raw: 'ปกติ',
                    statusDetails: '',
                    needsAdvice: false
                  }
                : s
            )
          );
          setRemarks((prev) => ({ ...prev, [studentId]: '' }));
        } else {
          toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
        }
      } catch (error: any) {
        toast({
          title: 'ข้อผิดพลาด',
          description: error.response?.data?.message || 'ไม่สามารถบันทึกสถานะได้',
          variant: 'destructive'
        });
      } finally {
        setSavingStudentId(null);
      }
    } else {
      // เปลี่ยนเป็น "ไม่ปกติ" - ต้องระบุหมายเหตุ
      setAdvisees((prev) =>
        prev.map((s) =>
          s.studentId === studentId
            ? {
                ...s,
                status: 'critical',
                advisor_status: 'ไม่ปกติ',
                advisor_status_raw: 'ไม่ปกติ',
                needsAdvice: true
              }
            : s
        )
      );
      toast({
        title: 'สถานะไม่ปกติ',
        description: 'กรุณาระบุหมายเหตุในช่องหมายเหตุและกดบันทึก'
      });
    }
  };

  const handleSaveRemark = async (studentId: string) => {
    const student = advisees.find((s) => s.studentId === studentId);
    if (!student) return;

    const note = (remarks[studentId] ?? student.statusDetails ?? '').trim();
    if (!note) {
      toast({
        title: 'กรุณาระบุหมายเหตุ',
        description: 'สถานะไม่ปกติต้องระบุหมายเหตุด้วย',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSavingStudentId(studentId);
      const res = await api.post('/index.php?page=save-advisor-status', {
        studentId,
        status: 'ไม่ปกติ',
        statusDetails: note
      });
      if (res.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: `บันทึกหมายเหตุของ ${student.name} เรียบร้อยแล้ว` });
        setAdvisees((prev) =>
          prev.map((s) =>
            s.studentId === studentId
              ? {
                  ...s,
                  status: 'critical',
                  advisor_status: 'ไม่ปกติ',
                  advisor_status_raw: 'ไม่ปกติ',
                  statusDetails: note,
                  needsAdvice: true
                }
              : s
          )
        );
      } else {
        toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({
        title: 'ข้อผิดพลาด',
        description: error.response?.data?.message || 'ไม่สามารถบันทึกหมายเหตุได้',
        variant: 'destructive'
      });
    } finally {
      setSavingStudentId(null);
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
    normal: advisees.filter(
      (s) => (s.advisor_status || (s.status === 'critical' ? 'ไม่ปกติ' : 'ปกติ')) === 'ปกติ'
    ).length,
    critical: advisees.filter(
      (s) => (s.advisor_status || (s.status === 'critical' ? 'ไม่ปกติ' : 'ปกติ')) === 'ไม่ปกติ'
    ).length
  };

  return (
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
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.normal}
            </div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สถานะไม่ปกติ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
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
                  <TableHead className="text-center w-[140px]">สถานะ</TableHead>
                  <TableHead className="min-w-[240px]">หมายเหตุ</TableHead>
                  <TableHead className="text-center">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvisees.map((student) => {
                  const currentStatus =
                    student.advisor_status ||
                    (student.status === 'critical' ? 'ไม่ปกติ' : 'ปกติ');
                  const currentRemark =
                    remarks[student.studentId] ?? student.statusDetails ?? '';

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium font-mono">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">ปี {student.year}</TableCell>
                      <TableCell className="text-center font-semibold">{student.gpa.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Select
                            value={currentStatus}
                            onValueChange={(val) => handleStatusChange(student.studentId, val)}
                            disabled={savingStudentId === student.studentId}
                          >
                            <SelectTrigger
                              className={`h-7 w-[98px] text-xs font-medium rounded-full px-2.5 transition-all shadow-none border ${
                                currentStatus === 'ปกติ'
                                  ? 'border-emerald-300 bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                  : 'border-rose-300 bg-rose-50/90 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="center" className="min-w-[105px]">
                              <SelectItem value="ปกติ" className="text-xs font-medium text-emerald-700 dark:text-emerald-300 focus:bg-emerald-50 dark:focus:bg-emerald-950/50">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                  <span>ปกติ</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="ไม่ปกติ" className="text-xs font-medium text-rose-700 dark:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-950/50">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                                  <span>ไม่ปกติ</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        {currentStatus === 'ไม่ปกติ' ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={currentRemark}
                              onChange={(e) =>
                                setRemarks((prev) => ({
                                  ...prev,
                                  [student.studentId]: e.target.value
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveRemark(student.studentId);
                                }
                              }}
                              placeholder="ระบุหมายเหตุ (จำเป็น)..."
                              className={`h-8 text-xs ${
                                !currentRemark.trim()
                                  ? 'border-destructive focus-visible:ring-destructive placeholder:text-destructive/60'
                                  : ''
                              }`}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs shrink-0 font-medium"
                              onClick={() => handleSaveRemark(student.studentId)}
                              disabled={savingStudentId === student.studentId}
                            >
                              {savingStudentId === student.studentId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                'บันทึก'
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-sm">-</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() =>
                            navigateToPage('advise-notes', { studentId: student.studentId })
                          }
                        >
                          บันทึกคำปรึกษา
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
