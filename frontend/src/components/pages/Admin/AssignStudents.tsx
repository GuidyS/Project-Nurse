import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, Users, Loader2, Check, ChevronsUpDown, UserCheck } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  name: string;
  assigned_count: number;
}

interface Student {
  id: string;
  student_code: string;
  name: string;
  gender: string | null;
  year_level: number | null;
  assigned_faculty_id: string | null;
  assigned_faculty_name: string | null;
}

interface TypeOption {
  value: string;
  label: string;
  limit: number;
}

export default function AssignStudents() {
  const { toast } = useToast();

  const [advisorType, setAdvisorType] = useState('advisor');
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [limit, setLimit] = useState(12);
  const [typeLabel, setTypeLabel] = useState('อาจารย์ที่ปรึกษา');

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [yearLevels, setYearLevels] = useState<number[]>([]);

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherPickerOpen, setTeacherPickerOpen] = useState(false);

  const [studentSearch, setStudentSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  /** รหัสนักศึกษาที่ติ๊กไว้สำหรับอาจารย์ที่เลือกอยู่ */
  const [checked, setChecked] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async (type: string, keepTeacher = true) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/index.php?page=get-assign-students&advisor_type=${type}`);
      if (res.data.status === 'success') {
        const d = res.data.data;
        setTeachers(d.teachers || []);
        setStudents(d.students || []);
        setYearLevels(d.year_levels || []);
        setTypes(d.types || []);
        setLimit(Number(d.limit) || 0);
        setTypeLabel(d.type_label || '');
        if (!keepTeacher) {
          setSelectedTeacher('');
          setChecked([]);
        }
      } else {
        toast({ title: 'เกิดข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(advisorType, false);
  }, [advisorType, fetchData]);

  // เมื่อเลือกอาจารย์ ให้ติ๊กนักศึกษาที่ท่านนั้นถืออยู่แล้วให้อัตโนมัติ
  useEffect(() => {
    if (!selectedTeacher) {
      setChecked([]);
      return;
    }
    setChecked(students.filter((s) => s.assigned_faculty_id === selectedTeacher).map((s) => s.id));
  }, [selectedTeacher, students]);

  const filteredTeachers = teachers.filter((t) => {
    const kw = teacherSearch.trim().toLowerCase();
    if (!kw) return true;
    return t.name.toLowerCase().includes(kw) || t.id.toLowerCase().includes(kw);
  });

  const filteredStudents = students.filter((s) => {
    const kw = studentSearch.trim().toLowerCase();
    const matchKeyword =
      !kw || s.name.toLowerCase().includes(kw) || s.student_code.toLowerCase().includes(kw);
    const matchYear = yearFilter === 'all' || String(s.year_level) === yearFilter;
    return matchKeyword && matchYear;
  });

  const selectedTeacherLabel = (() => {
    const found = teachers.find((t) => t.id === selectedTeacher);
    return found ? `${found.name} (${found.assigned_count}/${limit} คน)` : '';
  })();

  const toggleStudent = (studentId: string, value: boolean) => {
    setChecked((prev) => {
      if (value) {
        if (prev.includes(studentId)) return prev;
        if (prev.length >= limit) {
          toast({
            title: 'เกินโควตา',
            description: `${typeLabel} 1 ท่าน รับนักศึกษาได้ไม่เกิน ${limit} คน`,
            variant: 'destructive',
          });
          return prev;
        }
        return [...prev, studentId];
      }
      return prev.filter((id) => id !== studentId);
    });
  };

  const handleSave = async () => {
    if (!selectedTeacher) {
      toast({ title: 'แจ้งเตือน', description: 'กรุณาเลือกอาจารย์ก่อน', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post('/index.php?page=save-assign-students', {
        advisor_type: advisorType,
        faculty_id: selectedTeacher,
        student_ids: checked,
      });

      if (res.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: res.data.message });
        await fetchData(advisorType);
      } else {
        toast({ title: 'เกิดข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.response?.data?.message || 'ไม่สามารถบันทึกได้',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight leading-snug">จัดการนักศึกษา</h1>
        <p className="text-muted-foreground">มอบหมายนักศึกษาในความดูแลให้อาจารย์ที่ปรึกษาและอาจารย์ปฏิบัติ</p>
      </div>

      {/* เลือกประเภทอาจารย์ + ตัวอาจารย์ */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label className="font-semibold">ประเภทอาจารย์</Label>
          <Select value={advisorType} onValueChange={setAdvisorType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label} (สูงสุด {t.limit} คน)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label className="font-semibold">รายชื่ออาจารย์</Label>
          <Popover open={teacherPickerOpen} onOpenChange={setTeacherPickerOpen} modal>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                <span className={selectedTeacherLabel ? '' : 'text-muted-foreground'}>
                  {selectedTeacherLabel || 'เลือกอาจารย์...'}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" collisionPadding={12}>
              <Command shouldFilter={false} loop>
                <CommandInput
                  placeholder="ค้นหาชื่อหรือรหัสอาจารย์..."
                  value={teacherSearch}
                  onValueChange={setTeacherSearch}
                />
                <CommandList className="h-[220px] max-h-[220px] overflow-y-auto overscroll-contain">
                  <CommandEmpty>ไม่พบอาจารย์ที่ตรงกับ "{teacherSearch}"</CommandEmpty>
                  <CommandGroup>
                    {filteredTeachers.map((t) => (
                      <CommandItem
                        key={t.id}
                        value={t.id}
                        onSelect={() => {
                          setSelectedTeacher(t.id);
                          setTeacherPickerOpen(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedTeacher === t.id ? 'opacity-100' : 'opacity-0'}`} />
                        <span className="flex-1">{t.name}</span>
                        <Badge variant={t.assigned_count >= limit ? 'destructive' : 'secondary'} className="ml-2">
                          {t.assigned_count}/{limit}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* รายชื่อนักศึกษา */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> รายชื่อนักศึกษาทั้งหมด
          </CardTitle>
          <CardDescription>
            {selectedTeacher
              ? `ติ๊กเลือกนักศึกษาที่จะให้อยู่ในความดูแลของ ${selectedTeacherLabel}`
              : 'เลือกอาจารย์ด้านบนก่อน จึงจะติ๊กเลือกนักศึกษาได้'}
          </CardDescription>

          <div className="flex flex-col gap-3 pt-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="ค้นหารายชื่อ นักศึกษาในระบบ..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="ชั้นปี" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกชั้นปี</SelectItem>
                {yearLevels.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    ชั้นปีที่ {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-[34rem] overflow-auto overscroll-contain rounded-lg border [&>div]:overflow-visible">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="w-[60px] text-center">เลือก</TableHead>
                    <TableHead className="w-[140px] whitespace-nowrap">รหัส นศ.</TableHead>
                    <TableHead>ชื่อ นศ.</TableHead>
                    <TableHead className="w-[100px] text-center">เพศ</TableHead>
                    <TableHead className="w-[100px] text-center whitespace-nowrap">ชั้นปี</TableHead>
                    <TableHead className="whitespace-nowrap">อยู่ในความดูแลของ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        ไม่พบนักศึกษาตามเงื่อนไขที่ค้นหา
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((s) => {
                      const isChecked = checked.includes(s.id);
                      const otherTeacher =
                        s.assigned_faculty_id && s.assigned_faculty_id !== selectedTeacher
                          ? s.assigned_faculty_name
                          : null;
                      return (
                        <TableRow key={s.id} className={isChecked ? 'bg-primary/5' : undefined}>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isChecked}
                              disabled={!selectedTeacher}
                              onCheckedChange={(v) => toggleStudent(s.id, v === true)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm whitespace-nowrap">{s.student_code}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell className="text-center">{s.gender || '-'}</TableCell>
                          <TableCell className="text-center">{s.year_level ?? '-'}</TableCell>
                          <TableCell className="text-sm">
                            {s.assigned_faculty_name ? (
                              <Badge variant={otherTeacher ? 'outline' : 'secondary'} className="font-normal">
                                {s.assigned_faculty_name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">ยังไม่มี</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <UserCheck className="inline h-4 w-4 mr-1 text-primary" />
              เลือกแล้ว{' '}
              <span className={checked.length > limit ? 'text-destructive font-bold' : 'font-bold'}>
                {checked.length}
              </span>{' '}
              / {limit} คน
              {checked.length >= limit && <span className="text-muted-foreground"> (เต็มโควตาแล้ว)</span>}
            </p>
            <Button onClick={handleSave} disabled={!selectedTeacher || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              บันทึกการมอบหมาย
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
