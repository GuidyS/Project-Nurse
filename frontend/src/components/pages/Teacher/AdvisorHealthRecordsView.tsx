import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Activity, Loader2, ChevronLeft, Users, Search } from "lucide-react";
import api from "@/lib/axios";

interface StudentListItem {
  student_id: string;
  full_name: string;
  status: string;
}

interface HealthRecordItem {
  year_level: number;
  academic_year: string;
  height: string;
  weight: string;
  bmi: string;
  overall_status: "healthy" | "has_health_issue";
  health_issue_detail: string;
}

export default function AdvisorHealthRecordsView() {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "detail">("list");
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [records, setRecords] = useState<HealthRecordItem[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchStudentList = async () => {
    try {
      setIsLoadingList(true);
      const res = await api.get("/index.php?page=advisor-student-list");
      if (res.data.status === "success") {
        setStudents(res.data.data);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดรายชื่อนักศึกษาไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchStudentList();
  }, []);

  const handleSelectStudent = async (student: StudentListItem) => {
    setSelectedStudent(student);
    setView("detail");
    setIsLoadingDetail(true);
    try {
      const res = await api.get(
        `/index.php?page=view-student-health-records&student_id=${encodeURIComponent(student.student_id)}`
      );
      if (res.data.status === "success") {
        setRecords(res.data.data || []);
      } else {
        toast({ title: "ข้อผิดพลาด", description: res.data.message, variant: "destructive" });
        setView("list");
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดข้อมูลภาวะสุขภาพไม่สำเร็จ", variant: "destructive" });
      setView("list");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const filteredStudents = students.filter(
    (s) => s.full_name.includes(search) || s.student_id.includes(search)
  );

  if (view === "list") {
    return (
      <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">ภาวะสุขภาพนักศึกษาในความดูแล</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">ตรวจสอบภาวะสุขภาพ ส่วนสูง น้ำหนัก และ BMI (ดูอย่างเดียว)</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อหรือรหัสนักศึกษา"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoadingList ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">รหัสนักศึกษา</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead className="w-32">สถานะ</TableHead>
                    <TableHead className="w-32 text-right">ดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        ไม่พบข้อมูลนักศึกษา
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((s) => (
                      <TableRow key={s.student_id}>
                        <TableCell className="font-medium">{s.student_id}</TableCell>
                        <TableCell>{s.full_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleSelectStudent(s)}>
                            ดูข้อมูล
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setView("list")} className="shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">2. ภาวะสุขภาพ</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ข้อมูลของ {selectedStudent?.full_name} (รหัสนักศึกษา: {selectedStudent?.student_id}) — <b>โหมดดูอย่างเดียว</b>
          </p>
        </div>
      </div>

      {isLoadingDetail ? (
        <div className="py-24 flex justify-center items-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          กำลังโหลดข้อมูล...
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            นักศึกษาคนนี้ยังไม่มีการบันทึกข้อมูลภาวะสุขภาพ
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.year_level} className="shadow-sm bg-muted/5">
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-bold text-base text-foreground">
                    {record.year_level}. ชั้นปีที่ {record.year_level}
                  </span>
                  <span className="text-muted-foreground">ปีการศึกษา:</span>
                  <span className="font-medium text-foreground">{record.academic_year || "—"}</span>

                  <span className="text-muted-foreground ml-3">ส่วนสูง:</span>
                  <span className="font-medium text-foreground">{record.height ? `${record.height} ซม.` : "—"}</span>

                  <span className="text-muted-foreground ml-3">น้ำหนัก:</span>
                  <span className="font-medium text-foreground">{record.weight ? `${record.weight} กก.` : "—"}</span>

                  <span className="text-muted-foreground ml-3">BMI:</span>
                  <Badge variant="secondary" className="font-bold text-sm">
                    {record.bmi || "—"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-sm">
                  <span className="text-muted-foreground">ภาวะสุขภาพโดยรวม:</span>
                  {record.overall_status === "healthy" ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">
                      แข็งแรงดี
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="destructive">มีปัญหาสุขภาพ</Badge>
                      <span className="text-xs text-foreground font-medium">
                        ({record.health_issue_detail || "ไม่ได้ระบุรายละเอียด"})
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}