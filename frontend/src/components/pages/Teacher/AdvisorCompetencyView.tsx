import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Loader2, ChevronLeft, Users, Search, Save } from "lucide-react";
import api from "@/lib/axios";

interface StudentListItem {
  student_id: string;
  full_name: string;
  status: string;
}

interface CompetencyItemRow {
  id: number;
  plo_id: number | null;
  plo_code?: string;
  plo_name?: string;
  sequence_no: number;
  competency_name: string;
  is_scorable: number;
  score: number | null;
}

interface PloGroup {
  plo_id: number;
  plo_code: string;
  plo_name: string;
  items: CompetencyItemRow[];
}

export default function AdvisorCompetencyView() {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "detail">("list");
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [flatItems, setFlatItems] = useState<CompetencyItemRow[]>([]);
  const [yearLevel, setYearLevel] = useState<number | null>(null);
  const [curriculumYear, setCurriculumYear] = useState<number | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        `/index.php?page=student-competency&student_id=${encodeURIComponent(student.student_id)}`
      );
      if (res.data.status === "success") {
        const rawGroups: PloGroup[] = res.data.data.groups || [];
        
        // 🔄 ดึงรายการทั้งหมดออกมาแผ่เป็น Array เดียวพร้อมผูกข้อมูล PLO
        const items: CompetencyItemRow[] = rawGroups.flatMap((g) =>
          (g.items || []).map((it) => ({
            ...it,
            plo_id: g.plo_id === 0 ? null : g.plo_id,
            plo_code: g.plo_id === 0 ? "" : g.plo_code,
            plo_name: g.plo_id === 0 ? "" : g.plo_name,
          }))
        );

        // 🔢 จัดเรียงตาม sequence_no จาก 1, 2, 3... ทั่วทั้งฟอร์ม
        items.sort((a, b) => Number(a.sequence_no) - Number(b.sequence_no));

        setFlatItems(items);
        setYearLevel(res.data.data.year_level);
        setCurriculumYear(res.data.data.framework?.curriculum_year || 2567);
      } else {
        toast({ title: "ข้อผิดพลาด", description: res.data.message || "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" });
        setView("list");
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดรายการประเมินไม่สำเร็จ", variant: "destructive" });
      setView("list");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleScoreChange = (itemId: number, score: number) => {
    setFlatItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, score } : it))
    );
  };

  const handleBack = () => {
    setView("list");
    setSelectedStudent(null);
    setFlatItems([]);
  };

  const handleSave = async () => {
    if (!selectedStudent) return;

    const scores = flatItems
      .filter((it) => it.is_scorable && it.score)
      .map((it) => ({ competency_item_id: it.id, score: it.score }));

    if (scores.length === 0) {
      toast({ title: "ยังไม่ได้ให้คะแนน", description: "กรุณาเลือกคะแนนอย่างน้อย 1 รายการ", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post("/index.php?page=save-student-competency", {
        student_id: selectedStudent.student_id,
        scores,
      });
      if (res.data.status === "success") {
        toast({ title: "บันทึกสำเร็จ", description: `บันทึกผลการประเมิน ${res.data.saved_count} รายการ` });
      } else {
        toast({ title: "บันทึกไม่สำเร็จ", description: res.data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "บันทึกผลการประเมินไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsSaving(false);
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
            <h1 className="text-2xl font-bold text-foreground">ประเมินสมรรถนะหลักนักศึกษา</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">เลือกนักศึกษาในความดูแลเพื่อประเมินสมรรถนะหลักตามชั้นปี</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="ค้นหาชื่อหรือรหัสนักศึกษา" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoadingList ? (
              <div className="py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">ไม่พบนักศึกษา</TableCell></TableRow>
                  ) : (
                    filteredStudents.map((s) => (
                      <TableRow key={s.student_id}>
                        <TableCell className="font-medium">{s.student_id}</TableCell>
                        <TableCell>{s.full_name}</TableCell>
                        <TableCell><Badge variant="outline">{s.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleSelectStudent(s)}>ประเมิน</Button>
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
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                การประเมินสมรรถนะหลักของนักศึกษาชั้นปีที่ {yearLevel || "—"} {curriculumYear && `(หลักสูตรปรับปรุง ${curriculumYear})`}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              นักศึกษา: <span className="text-foreground font-medium">{selectedStudent?.full_name}</span> (รหัส {selectedStudent?.student_id})
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLoadingDetail} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          บันทึกผลการประเมิน
        </Button>
      </div>

      <div className="bg-muted/40 p-3 rounded-md text-xs text-muted-foreground leading-relaxed border border-border/60">
        <span className="font-semibold text-foreground">คำชี้แจง: </span>
        ใส่เครื่องหมายเลือกระดับคะแนนที่ตรงกับระดับความคิดเห็นของท่าน โดย 
        <span className="font-medium text-foreground"> 5 = เห็นด้วยมากที่สุด, 4 = เห็นด้วยมาก, 3 = เห็นด้วยปานกลาง, 2 = เห็นด้วยน้อย, 1 = เห็นด้วยน้อยที่สุด</span>
      </div>

      {isLoadingDetail ? (
        <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : flatItems.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">ยังไม่มีรายการประเมินสำหรับชั้นปีนี้</CardContent></Card>
      ) : (
        <Card className="shadow-sm overflow-hidden border border-border">
          <CardContent className="p-0">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/60 text-muted-foreground">
                  <th className="w-[60px] py-3 px-2 text-center font-bold border-r border-border text-foreground">ลำดับ</th>
                  <th className="py-3 px-4 text-left font-bold border-r border-border text-foreground">รายการประเมินสมรรถนะ</th>
                  <th className="w-[50px] py-3 px-1 text-center font-bold border-r border-border text-foreground">5</th>
                  <th className="w-[50px] py-3 px-1 text-center font-bold border-r border-border text-foreground">4</th>
                  <th className="w-[50px] py-3 px-1 text-center font-bold border-r border-border text-foreground">3</th>
                  <th className="w-[50px] py-3 px-1 text-center font-bold border-r border-border text-foreground">2</th>
                  <th className="w-[50px] py-3 px-1 text-center font-bold text-foreground">1</th>
                </tr>
              </thead>
              <tbody>
                {flatItems.map((item, index) => {
                  // ตรวจสอบว่าต้องแสดงหัวข้อ PLO ขั้นก่อนข้อนี้หรือไม่
                  const prevItem = flatItems[index - 1];
                  const showPloHeader = item.plo_id && item.plo_id !== prevItem?.plo_id;

                  return (
                    <React.Fragment key={item.id}>
                      {showPloHeader && (
                        <tr className="border-b bg-muted/30">
                          <td colSpan={7} className="py-2.5 px-4 font-semibold text-sm text-foreground bg-accent/20 border-b border-border">
                            {item.plo_code} {item.plo_name}
                          </td>
                        </tr>
                      )}

                      <tr className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-2 text-center text-muted-foreground font-medium border-r border-border align-middle">
                          {item.sequence_no}.
                        </td>
                        <td className="py-3 px-4 text-foreground border-r border-border align-middle leading-relaxed">
                          <span className={!item.is_scorable ? "text-muted-foreground italic" : ""}>
                            {item.competency_name}
                          </span>
                        </td>

                        {!item.is_scorable ? (
                          <td colSpan={5} className="bg-muted/60 text-center py-3 text-xs text-muted-foreground font-medium select-none">
                            ไม่ต้องประเมินเพราะไม่กำหนดตัวชี้วัด
                          </td>
                        ) : (
                          <td colSpan={5} className="p-0">
                            <RadioGroup
                              value={item.score ? String(item.score) : undefined}
                              onValueChange={(v) => handleScoreChange(item.id, Number(v))}
                              className="grid grid-cols-5 h-full w-full"
                            >
                              {[5, 4, 3, 2, 1].map((val) => (
                                <label
                                  key={val}
                                  htmlFor={`item-${item.id}-${val}`}
                                  className="flex items-center justify-center h-12 cursor-pointer border-r last:border-r-0 border-border hover:bg-primary/5 transition-colors"
                                >
                                  <RadioGroupItem value={String(val)} id={`item-${item.id}-${val}`} />
                                </label>
                              ))}
                            </RadioGroup>
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}