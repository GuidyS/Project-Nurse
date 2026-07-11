import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Phone, Mail, MapPin, HeartPulse, GraduationCap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export default function StudentsInfo() {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // โหลดรายชื่อสำหรับ dropdown + อ่าน ?sid= จาก URL (มาจากหน้า "รายชื่อนักศึกษา")
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/index.php?page=get-students-list');
        if (res.data.status === 'success') {
          const list = res.data.data || [];
          setStudents(list);
          const sid = new URLSearchParams(window.location.search).get('sid');
          if (sid) setSelectedId(sid);
          else if (list.length > 0) setSelectedId(String(list[0].student_id));
        }
      } catch {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดรายชื่อนักศึกษาได้', variant: 'destructive' });
      }
    };
    init();
  }, []);

  // โหลดรายละเอียดเมื่อเปลี่ยนคน
  useEffect(() => {
    if (!selectedId) return;
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/index.php?page=get-student-detail&student_id=${selectedId}`);
        if (res.data.status === 'success') setDetail(res.data.data);
        else toast({ title: 'ข้อผิดพลาด', description: res.data.message, variant: 'destructive' });
      } catch {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลนักศึกษาได้', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [selectedId]);

  const infoRow = (icon: React.ReactNode, label: string, value: any) => (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ข้อมูลนักศึกษารายบุคคล</h1>
          <p className="text-muted-foreground">รายละเอียดข้อมูลส่วนตัวและผลการเรียนของนักศึกษา</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { window.location.href = '/?page=students'; }}>
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้ารายชื่อ
          </Button>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="เลือกนักศึกษา" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.student_id} value={String(s.student_id)}>
                  {s.studentId} - {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading || !detail ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* โปรไฟล์ */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {String(detail.name || '?').replace(/^(นางสาว|นาย|นาง)/, '').trim().charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{detail.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {detail.studentId} · ชั้นปีที่ {detail.yearLevel} · ปีที่เข้าศึกษา {detail.admissionYear}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">GPA</p>
                  <p className="text-2xl font-bold">{Number(detail.gpa).toFixed(2)}</p>
                  <Badge className="bg-green-500 mt-1">{detail.status || 'กำลังศึกษา'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {/* ข้อมูลส่วนตัว */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> ข้อมูลส่วนตัว</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {infoRow(<User className="h-4 w-4" />, 'ชื่อ (อังกฤษ)', detail.nameEn)}
                {infoRow(<User className="h-4 w-4" />, 'ชื่อเล่น', detail.nickname)}
                {infoRow(<User className="h-4 w-4" />, 'เพศ', detail.gender)}
                {infoRow(<User className="h-4 w-4" />, 'วันเกิด', detail.birthDate)}
                {infoRow(<GraduationCap className="h-4 w-4" />, 'อาจารย์ที่ปรึกษา', detail.advisor)}
              </CardContent>
            </Card>

            {/* ติดต่อ */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4" /> การติดต่อ</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {infoRow(<Mail className="h-4 w-4" />, 'อีเมล', detail.email)}
                {infoRow(<Phone className="h-4 w-4" />, 'โทรศัพท์', detail.phone)}
                {infoRow(<MapPin className="h-4 w-4" />, 'ภูมิลำเนา', detail.hometown)}
                {infoRow(<MapPin className="h-4 w-4" />, 'ที่อยู่', detail.homeAddress)}
              </CardContent>
            </Card>

            {/* สุขภาพ + สมรรถนะ */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><HeartPulse className="h-4 w-4" /> สุขภาพและสมรรถนะ</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {infoRow(<HeartPulse className="h-4 w-4" />, 'ส่วนสูง / น้ำหนัก / BMI',
                  detail.height ? `${detail.height} ซม. / ${detail.weight ?? '-'} กก. / ${detail.bmi ?? '-'}` : '-')}
                {infoRow(<GraduationCap className="h-4 w-4" />, 'คะแนนทักษะ', detail.scores?.skill)}
                {infoRow(<GraduationCap className="h-4 w-4" />, 'คะแนนความรู้', detail.scores?.knowledge)}
                {infoRow(<GraduationCap className="h-4 w-4" />, 'คะแนนรวม', detail.scores?.overall)}
              </CardContent>
            </Card>
          </div>

          {/* ประวัติการลงทะเบียน */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ประวัติการลงทะเบียนเรียน</CardTitle>
              <CardDescription>วิชาที่ลงทะเบียนพร้อมผลเกรด</CardDescription>
            </CardHeader>
            <CardContent>
              {(!detail.enrollments || detail.enrollments.length === 0) ? (
                <div className="text-center py-6 text-muted-foreground">ยังไม่มีประวัติการลงทะเบียน</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสวิชา</TableHead>
                      <TableHead>ชื่อวิชา</TableHead>
                      <TableHead className="text-center">ปีการศึกษา</TableHead>
                      <TableHead className="text-center">ภาคเรียน</TableHead>
                      <TableHead className="text-center">เกรด</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.enrollments.map((e: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{e.subject_code}</TableCell>
                        <TableCell>{e.subject_name_th}</TableCell>
                        <TableCell className="text-center">{e.academic_year}</TableCell>
                        <TableCell className="text-center">{e.semester}</TableCell>
                        <TableCell className="text-center">
                          {e.grade ? <Badge variant="outline">{e.grade}</Badge> : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
