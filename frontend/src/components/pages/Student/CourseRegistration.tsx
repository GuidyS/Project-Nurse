import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, Search, Check, Plus, AlertCircle, Library, CalendarDays } from "lucide-react";
import api from "@/lib/axios";

interface RegistrationSubject {
  subject_code: string;
  subject_name: string;
  credit: number;
  credit_desc: string | null;
  semester: number | null;
  academic_year: number | null;
  term_label: string;
  ylo: number | null;
  instructor_id: string | null;
  instructor_name: string | null;
  is_enrolled: boolean;
  enrolled_semester: number | null;
  enrolled_year: number | null;
  enrollment_status: string | null;
  /** มีคะแนนที่อาจารย์บันทึกไว้แล้ว — ถอนเองไม่ได้ */
  has_scores: boolean;
}

interface ActiveCurriculum {
  id: number;
  start_year: number;
  end_year: number;
  is_explicit: boolean;
  label: string;
}

interface CurrentTerm {
  semester: number | null;
  academic_year: number;
  label: string;
  today: string;
}

export default function CourseRegistration() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<RegistrationSubject[]>([]);
  const [curriculum, setCurriculum] = useState<ActiveCurriculum | null>(null);
  const [currentTerm, setCurrentTerm] = useState<CurrentTerm | null>(null);
  const [enrolledCredits, setEnrolledCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [pendingWithdraw, setPendingWithdraw] = useState<RegistrationSubject | null>(null);

  // หน้าต่างเลือกวิชาที่จะลงทะเบียน (แสดงรายวิชาทั้งหมดของหลักสูตร)
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/index.php?page=student-registration");
      if (res.data.status === "success") {
        const payload = res.data.data;
        setSubjects(payload.subjects || []);
        setCurriculum(payload.curriculum ?? null);
        setCurrentTerm(payload.current_term ?? null);
        setEnrolledCredits(Number(payload.enrolled_credits || 0));
      } else {
        toast({ title: "ข้อผิดพลาด", description: res.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error?.response?.data?.message || "โหลดรายวิชาที่ลงทะเบียนไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submit = async (subject: RegistrationSubject, action: "enroll" | "withdraw") => {
    setBusyCode(subject.subject_code);
    try {
      const res = await api.post("/index.php?page=save-student-registration", {
        action,
        subject_code: subject.subject_code,
      });
      if (res.data.status === "success") {
        toast({ title: "สำเร็จ", description: res.data.message });
        setPendingWithdraw(null);
        await fetchData();
      } else {
        toast({ title: "ไม่สำเร็จ", description: res.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error?.response?.data?.message || "บันทึกการลงทะเบียนไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setBusyCode(null);
    }
  };

  const enrolled = useMemo(() => subjects.filter((s) => s.is_enrolled), [subjects]);

  const pickerSubjects = useMemo(() => {
    const keyword = pickerSearch.trim().toLowerCase();
    if (!keyword) return subjects;
    return subjects.filter(
      (s) =>
        s.subject_code.toLowerCase().includes(keyword) ||
        String(s.subject_name ?? "").toLowerCase().includes(keyword)
    );
  }, [subjects, pickerSearch]);

  return (
    <div className="app-page animate-fade-in">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">วิชาที่ลงทะเบียน</h1>
          <p className="app-page-description">
            ลงทะเบียนเรียนรายวิชาของหลักสูตร — เมื่อลงทะเบียนแล้ว อาจารย์ผู้รับผิดชอบรายวิชาจะเห็นชื่อคุณในหน้า "วิชาที่รับผิดชอบ" ทันที
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setPickerSearch(""); setPickerOpen(true); }}>
          <Plus className="h-4 w-4" /> ลงทะเบียนวิชา
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" /> รายวิชาที่ลงทะเบียน
            </CardTitle>
            <CardDescription>
              {enrolled.length > 0
                ? `ลงทะเบียนแล้ว ${enrolled.length} วิชา รวม ${enrolledCredits} หน่วยกิต`
                : "ยังไม่ได้ลงทะเบียนรายวิชาใด"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : enrolled.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">ยังไม่ได้ลงทะเบียนรายวิชาใด</p>
              <Button variant="outline" className="gap-2" onClick={() => { setPickerSearch(""); setPickerOpen(true); }}>
                <Plus className="h-4 w-4" /> ลงทะเบียนวิชา
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28 whitespace-nowrap">รหัสวิชา</TableHead>
                    <TableHead className="min-w-[220px]">ชื่อวิชา</TableHead>
                    <TableHead className="w-24 text-center whitespace-nowrap">หน่วยกิต</TableHead>
                    <TableHead className="w-24 text-center whitespace-nowrap">YLO</TableHead>
                    <TableHead className="w-28 text-center whitespace-nowrap">ภาคเรียน</TableHead>
                    <TableHead className="min-w-[180px]">อาจารย์ผู้รับผิดชอบ</TableHead>
                    <TableHead className="w-28 text-right whitespace-nowrap">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolled.map((subject) => (
                    <TableRow key={subject.subject_code}>
                      <TableCell className="font-medium whitespace-nowrap">{subject.subject_code}</TableCell>
                      <TableCell>{subject.subject_name}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {subject.credit_desc ?? subject.credit}
                      </TableCell>
                      <TableCell className="text-center">
                        {subject.ylo ? (
                          <Badge variant="secondary" className="font-medium">YLO{subject.ylo}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap text-muted-foreground">
                        {subject.term_label || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subject.instructor_name || (
                          <span className="text-amber-600 dark:text-amber-400 text-xs">ยังไม่มอบหมายอาจารย์</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={busyCode === subject.subject_code || subject.has_scores}
                          title={subject.has_scores ? "มีคะแนนที่อาจารย์บันทึกไว้แล้ว จึงถอนเองไม่ได้" : "ถอนรายวิชา"}
                          onClick={() => setPendingWithdraw(subject)}
                        >
                          ถอน
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* หน้าต่างเลือกวิชา — แสดงรายวิชาทั้งหมดตามหน้า "จัดการหลักสูตร" */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="app-dialog-2xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> ลงทะเบียนวิชา
            </DialogTitle>
            <DialogDescription className="space-y-1">
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <Library className="h-4 w-4 text-primary" />
                  {curriculum ? `หลักสูตร ${curriculum.label}` : "ยังไม่มีหลักสูตรในระบบ"}
                </span>
                {currentTerm && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {currentTerm.semester ? currentTerm.label : `นอกช่วงภาคเรียน — ${currentTerm.label}`}
                  </span>
                )}
              </span>
              <span className="block">รายวิชามาจากหน้า "จัดการหลักสูตร" ของผู้ดูแลระบบ ลงทะเบียนได้เฉพาะรายวิชาในหลักสูตรนี้</span>
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="ค้นหารหัส / ชื่อวิชา..."
              className="pl-9"
            />
          </div>

          <div className="max-h-[22rem] overflow-auto overscroll-contain rounded-md border [&>div]:overflow-visible">
            {subjects.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
                <p>ยังไม่มีรายวิชาในหลักสูตรที่ใช้งานในระบบ</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-28 whitespace-nowrap">รหัสวิชา</TableHead>
                    <TableHead className="min-w-[200px]">ชื่อวิชา</TableHead>
                    <TableHead className="w-20 text-center whitespace-nowrap">หน่วยกิต</TableHead>
                    <TableHead className="w-20 text-center whitespace-nowrap">YLO</TableHead>
                    <TableHead className="w-24 text-center whitespace-nowrap">ภาคเรียน</TableHead>
                    <TableHead className="w-36 text-right whitespace-nowrap">ลงทะเบียน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickerSubjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        ไม่พบรายวิชาที่ตรงกับคำค้นหา
                      </TableCell>
                    </TableRow>
                  ) : (
                    pickerSubjects.map((subject) => (
                      <TableRow key={subject.subject_code} data-state={subject.is_enrolled ? "selected" : undefined}>
                        <TableCell className="font-medium whitespace-nowrap">{subject.subject_code}</TableCell>
                        <TableCell>{subject.subject_name}</TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {subject.credit_desc ?? subject.credit}
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.ylo ? (
                            <Badge variant="secondary" className="font-medium">YLO{subject.ylo}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap text-muted-foreground">
                          {subject.term_label || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {subject.is_enrolled ? (
                            <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Check className="h-3.5 w-3.5" /> ลงแล้ว
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="gap-1"
                              disabled={busyCode === subject.subject_code}
                              onClick={() => submit(subject, "enroll")}
                            >
                              {busyCode === subject.subject_code ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              ลงทะเบียน
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={pendingWithdraw !== null}
        onOpenChange={(next) => { if (!next) setPendingWithdraw(null); }}
        title="ยืนยันการถอนรายวิชา"
        description={
          pendingWithdraw
            ? `ต้องการถอนรายวิชา ${pendingWithdraw.subject_code} ${pendingWithdraw.subject_name} ใช่หรือไม่? ชื่อของคุณจะหายจากรายชื่อของอาจารย์ผู้รับผิดชอบรายวิชานี้`
            : ""
        }
        confirmLabel="ถอนรายวิชา"
        isLoading={busyCode !== null}
        onConfirm={() => { if (pendingWithdraw) submit(pendingWithdraw, "withdraw"); }}
      />
    </div>
  );
}
