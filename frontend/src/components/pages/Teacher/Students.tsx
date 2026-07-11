import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Download, GraduationCap, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case 'critical': return <Badge variant="destructive">วิกฤต</Badge>;
    case 'warning': return <Badge className="bg-yellow-500">ต้องติดตาม</Badge>;
    default: return <Badge className="bg-green-500">ปกติ</Badge>;
  }
};

export default function Students() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/index.php?page=get-students-list');
        if (res.data.status === 'success') setStudents(res.data.data || []);
      } catch {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดรายชื่อนักศึกษาได้', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      (String(s.name ?? '').includes(searchTerm) || String(s.studentId ?? '').includes(searchTerm)) &&
      (yearFilter === 'all' || String(s.year) === yearFilter)
  );

  const handleExport = () => {
    const rows: string[][] = [
      ['รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ชั้นปี', 'GPA', 'สถานะ'],
      ...filteredStudents.map(s => [String(s.studentId), s.name, `ปี ${s.year}`, String(s.gpa), s.riskStatus === 'normal' ? 'ปกติ' : s.riskStatus === 'warning' ? 'ต้องติดตาม' : 'วิกฤต']),
    ];
    const csv = '﻿' + rows.map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'students.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const yearOptions = Array.from(new Set(students.map(s => String(s.year)))).sort();

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายชื่อนักศึกษา</h1>
            <p className="text-muted-foreground">นักศึกษาทั้งหมดในระบบ ({students.length} คน)</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            ส่งออกรายชื่อ
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{students.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะปกติ</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{students.filter(s => s.riskStatus === 'normal').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ต้องติดตาม/วิกฤต</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{students.filter(s => s.riskStatus !== 'normal').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>นักศึกษาทั้งหมด</CardTitle>
            <CardDescription>คลิก "ดูรายละเอียด" เพื่อดูข้อมูลรายบุคคล</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ชั้นปี" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกชั้นปี</SelectItem>
                  {yearOptions.map(y => <SelectItem key={y} value={y}>ปี {y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                ไม่พบนักศึกษาตามเงื่อนไขที่ค้นหา
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
                    <TableHead className="text-center">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((s) => (
                    <TableRow key={s.student_id}>
                      <TableCell className="font-medium font-mono">{s.studentId}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell className="text-center">ปี {s.year}</TableCell>
                      <TableCell className="text-center font-semibold">{Number(s.gpa).toFixed(2)}</TableCell>
                      <TableCell className="text-center">{getRiskBadge(s.riskStatus)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm"
                          onClick={() => { window.location.href = `/?page=students-info&sid=${s.student_id}`; }}>
                          ดูรายละเอียด
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
    </>
  );
}
