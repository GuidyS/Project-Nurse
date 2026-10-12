import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, AlertTriangle, CheckCircle, Loader2, GraduationCap } from 'lucide-react';
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
  const [employedMap, setEmployedMap] = useState<Record<string, boolean>>({});

  const fetchAdvisees = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/index.php?page=get-advises');
      if (res.data.status === 'success') {
        const data = res.data.data || [];
        setAdvisees(data);
        const initialRemarks: Record<string, string> = {};
        const initialEmployed: Record<string, boolean> = {};

        data.forEach((student: any) => {
          initialRemarks[student.studentId] = student.statusDetails || '';
          initialEmployed[student.studentId] = !!student.is_employed;
        });

        setRemarks(initialRemarks);
        setEmployedMap(initialEmployed);
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
          statusDetails: '',
          isEmployed: false
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
                    is_employed: false,
                    needsAdvice: false
                  }
                : s
            )
          );
          setRemarks((prev) => ({ ...prev, [studentId]: '' }));
          setEmployedMap((prev) => ({ ...prev, [studentId]: false }));
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
    } else if (newStatus === 'จบการศึกษา') {
      setAdvisees((prev) =>
        prev.map((s) =>
          s.studentId === studentId
            ? {
                ...s,
                status: 'graduated',
                advisor_status: 'จบการศึกษา',
                advisor_status_raw: 'จบการศึกษา',
                needsAdvice: false
              }
            : s
        )
      );
      toast({
        title: 'สถานะจบการศึกษา',
        description: 'หากติ๊ก "มีงานทำ" จำเป็นต้องระบุสถานที่ทำงาน/หมายเหตุด้วย'
      });
    } else {
      // ไม่ปกติ
      setAdvisees((prev) =>
        prev.map((s) =>
          s.studentId === studentId
            ? {
                ...s,
                status: 'critical',
                advisor_status: 'ไม่ปกติ',
                advisor_status_raw: 'ไม่ปกติ',
                is_employed: false,
                needsAdvice: true
              }
            : s
        )
      );
      setEmployedMap((prev) => ({ ...prev, [studentId]: false }));
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

    const targetStatus =
      student.advisor_status ||
      (student.status === 'critical'
        ? 'ไม่ปกติ'
        : student.status === 'graduated'
        ? 'จบการศึกษา'
        : 'ปกติ');

    const isEmployed = targetStatus === 'จบการศึกษา' ? (employedMap[studentId] ?? !!student.is_employed) : false;

    // ตรวจสอบเงื่อนไขการบังคับกรอกหมายเหตุ
    if (targetStatus === 'ไม่ปกติ' && !note) {
      toast({
        title: 'กรุณาระบุหมายเหตุ',
        description: 'สถานะไม่ปกติต้องระบุหมายเหตุด้วย',
        variant: 'destructive'
      });
      return;
    }

    if (targetStatus === 'จบการศึกษา' && isEmployed && !note) {
      toast({
        title: 'กรุณาระบุสถานที่ทำงาน/หมายเหตุ',
        description: 'กรณีมีงานทำ จำเป็นต้องระบุหมายเหตุด้วย',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSavingStudentId(studentId);
      const res = await api.post('/index.php?page=save-advisor-status', {
        studentId,
        status: targetStatus,
        statusDetails: note,
        isEmployed
      });
      if (res.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: `บันทึกข้อมูลของ ${student.name} เรียบร้อยแล้ว` });
        setRemarks((prev) => ({ ...prev, [studentId]: note }));
        setAdvisees((prev) =>
          prev.map((s) =>
            s.studentId === studentId
              ? {
                  ...s,
                  status:
                    targetStatus === 'ไม่ปกติ'
                      ? 'critical'
                      : targetStatus === 'จบการศึกษา'
                      ? 'graduated'
                      : 'normal',
                  advisor_status: targetStatus,
                  advisor_status_raw: targetStatus,
                  statusDetails: note,
                  is_employed: isEmployed,
                  needsAdvice: targetStatus === 'ไม่ปกติ'
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
        description: error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้',
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
      (s) =>
        (s.advisor_status ||
          (s.status === 'critical'
            ? 'ไม่ปกติ'
            : s.status === 'graduated'
            ? 'จบการศึกษา'
            : 'ปกติ')) === 'ปกติ'
    ).length,
    critical: advisees.filter(
      (s) =>
        (s.advisor_status ||
          (s.status === 'critical'
            ? 'ไม่ปกติ'
            : s.status === 'graduated'
            ? 'จบการศึกษา'
            : 'ปกติ')) === 'ไม่ปกติ'
    ).length,
    graduated: advisees.filter(
      (s) =>
        (s.advisor_status ||
          (s.status === 'critical'
            ? 'ไม่ปกติ'
            : s.status === 'graduated'
            ? 'จบการศึกษา'
            : 'ปกติ')) === 'จบการศึกษา'
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จบการศึกษา</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.graduated}</div>
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
                  <TableHead className="text-center w-[135px]">สถานะ</TableHead>
                  <TableHead className="text-center w-[110px]">มีงานทำ</TableHead>
                  <TableHead className="min-w-[260px]">หมายเหตุ</TableHead>
                  <TableHead className="text-center">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvisees.map((student) => {
                  const currentStatus =
                    student.advisor_status ||
                    (student.status === 'critical'
                      ? 'ไม่ปกติ'
                      : student.status === 'graduated'
                      ? 'จบการศึกษา'
                      : 'ปกติ');

                  const currentRemark =
                    remarks[student.studentId] ?? student.statusDetails ?? '';

                  const isEmployed =
                    employedMap[student.studentId] ?? !!student.is_employed;

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium font-mono">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">ปี {student.year}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {student.gpa !== undefined && student.gpa !== null && !isNaN(Number(student.gpa))
                          ? Number(student.gpa).toFixed(2)
                          : '-'}
                      </TableCell>

                      {/* สถานะ */}
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Select
                            value={currentStatus}
                            onValueChange={(val) => handleStatusChange(student.studentId, val)}
                            disabled={savingStudentId === student.studentId}
                          >
                            <SelectTrigger
                              className={`h-7 w-[115px] whitespace-nowrap text-xs font-medium rounded-full px-2.5 transition-all shadow-none border ${
                                currentStatus === 'ปกติ'
                                  ? 'border-emerald-300 bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                  : currentStatus === 'จบการศึกษา'
                                  ? 'border-blue-300 bg-blue-50/90 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                  : 'border-rose-300 bg-rose-50/90 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="center" className="min-w-[115px]">
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
                              <SelectItem value="จบการศึกษา" className="text-xs font-medium text-blue-700 dark:text-blue-300 focus:bg-blue-50 dark:focus:bg-blue-950/50">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                  <span>จบการศึกษา</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>

                      {/* มีงานทำ (Checkbox เฉพาะ จบการศึกษา) */}
                      <TableCell className="text-center">
                        {currentStatus === 'จบการศึกษา' ? (
                          <div className="flex items-center justify-center">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                              <Checkbox
                                checked={isEmployed}
                                onCheckedChange={(checked) =>
                                  setEmployedMap((prev) => ({
                                    ...prev,
                                    [student.studentId]: !!checked
                                  }))
                                }
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-sm">-</div>
                        )}
                      </TableCell>

                      {/* หมายเหตุ */}
                      <TableCell>
                        {currentStatus === 'ไม่ปกติ' || currentStatus === 'จบการศึกษา' ? (
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
                              placeholder={
                                currentStatus === 'จบการศึกษา'
                                  ? isEmployed
                                    ? 'ระบุสถานที่ทำงาน/หมายเหตุ (จำเป็น)...'
                                    : 'ระบุหมายเหตุเพิ่มเติม (ถ้ามี)...'
                                  : 'ระบุหมายเหตุ (จำเป็น)...'
                              }
                              className={`h-8 text-xs ${
                                (currentStatus === 'ไม่ปกติ' || (currentStatus === 'จบการศึกษา' && isEmployed)) &&
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