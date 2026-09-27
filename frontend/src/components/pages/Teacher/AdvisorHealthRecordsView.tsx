import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Activity, Loader2, ChevronLeft, Search, Users } from "lucide-react";
import api from "@/lib/axios";
import type { AdvisorDetailPanelProps, StudentListItem } from "./advisorStudent";
import AdvisorVaccinationDetail from "./AdvisorVaccinationDetail";
import AdvisorCompetencyDetail from "./AdvisorCompetencyDetail";

// หน้ารวม: ข้อมูลวัคซีน / ข้อมูลสุขภาพ / ประเมิน อยู่ในหน้าเดียวกัน
// เลือกนักศึกษาจากตารางแล้วกดปุ่มตามคอลัมน์ที่ต้องการดู
type PanelKind = "vaccination" | "health" | "competency";

interface HealthRecordItem {
  year_level: number;
  academic_year: string;
  height: string;
  weight: string;
  bmi: string;
  overall_status: "healthy" | "has_health_issue";
  health_issue_detail: string;
}

// แผง "ข้อมูลสุขภาพ" ของนักศึกษา 1 คน (โหมดดูอย่างเดียว)
function AdvisorHealthDetail({ student, onBack }: AdvisorDetailPanelProps) {
  const { toast } = useToast();
  const [records, setRecords] = useState<HealthRecordItem[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const res = await api.get(
          `/index.php?page=view-student-health-records&student_id=${encodeURIComponent(String(student.student_id))}`
        );
        if (cancelled) return;

        if (res.data.status === "success") {
          setRecords(res.data.data || []);
        } else {
          toast({ title: "ข้อผิดพลาด", description: res.data.message, variant: "destructive" });
          onBack();
        }
      } catch (error) {
        if (cancelled) return;
        toast({ title: "ข้อผิดพลาด", description: "โหลดข้อมูลภาวะสุขภาพไม่สำเร็จ", variant: "destructive" });
        onBack();
      } finally {
        if (!cancelled) setIsLoadingDetail(false);
      }
    };

    fetchDetail();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.student_id]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="app-page-title">2. ภาวะสุขภาพ</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ข้อมูลของ {student.full_name} (รหัสนักศึกษา: {student.student_id}) — <b>โหมดดูอย่างเดียว</b>
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
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
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

export default function AdvisorHealthRecordsView() {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [panel, setPanel] = useState<PanelKind | null>(null);

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

  const handleOpenPanel = (student: StudentListItem, kind: PanelKind) => {
    setSelectedStudent(student);
    setPanel(kind);
  };

  const handleBack = () => {
    setPanel(null);
    setSelectedStudent(null);
  };

  // API อาจส่ง student_id มาเป็นตัวเลข และ full_name อาจเป็น null
  // จึงแปลงเป็นข้อความก่อนเสมอ ไม่งั้น .includes() จะพังทั้งหน้าเวลาพิมพ์ค้นหา
  const keyword = search.trim().toLowerCase();
  const filteredStudents = students.filter((s) => {
    if (!keyword) return true;
    const name = String(s.full_name ?? "").toLowerCase();
    const id = String(s.student_id ?? "").toLowerCase();
    return name.includes(keyword) || id.includes(keyword);
  });

  if (panel && selectedStudent) {
    if (panel === "vaccination") {
      return <AdvisorVaccinationDetail student={selectedStudent} onBack={handleBack} />;
    }
    if (panel === "competency") {
      return <AdvisorCompetencyDetail student={selectedStudent} onBack={handleBack} />;
    }
    return <AdvisorHealthDetail student={selectedStudent} onBack={handleBack} />;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">นักศึกษาในความดูแล</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          ข้อมูลวัคซีน ภาวะสุขภาพ และการประเมินสมรรถนะหลักของนักศึกษา
        </p>
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
                  <TableHead className="w-28">คำนำหน้า</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead className="w-32 text-center whitespace-nowrap">ข้อมูลวัคซีน</TableHead>
                  <TableHead className="w-32 text-center whitespace-nowrap">ข้อมูลสุขภาพ</TableHead>
                  <TableHead className="w-32 text-center whitespace-nowrap">ประเมิน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูลนักศึกษา
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => (
                    <TableRow key={s.student_id}>
                      <TableCell className="font-medium whitespace-nowrap">{s.student_id}</TableCell>
                      <TableCell className="whitespace-nowrap">{s.title || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{s.full_name}</TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" onClick={() => handleOpenPanel(s, "vaccination")}>
                          ดูข้อมูล
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" onClick={() => handleOpenPanel(s, "health")}>
                          ดูข้อมูล
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" onClick={() => handleOpenPanel(s, "competency")}>
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
