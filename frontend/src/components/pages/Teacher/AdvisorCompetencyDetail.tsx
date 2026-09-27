import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Loader2, ChevronLeft, Save } from "lucide-react";
import api from "@/lib/axios";
import type { AdvisorDetailPanelProps } from "./advisorStudent";

interface CompetencyItemRow {
  id: number;
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

// แผง "ประเมิน" สมรรถนะหลักของนักศึกษา 1 คน
export default function AdvisorCompetencyDetail({ student, onBack }: AdvisorDetailPanelProps) {
  const { toast } = useToast();
  // ✅ FIX: เก็บเป็น groups ตามที่ backend จัดมา ไม่ flatten เป็น array เดียว
  // เดิม flatten แล้ว sort ด้วย sequence_no ทั้งฟอร์ม ทำให้ถ้ามีเลขซ้ำข้าม PLO
  // (เช่นตอนที่ Admin เพิ่มรายการแล้วเลขชนกัน) การจัดกลุ่มพังทันที
  // ยึดตามโครงสร้าง groups ตรงๆ ปลอดภัยกว่า เพราะ backend แยกด้วย plo_id อยู่แล้ว ไม่ใช่ sort เลข
  const [groups, setGroups] = useState<PloGroup[]>([]);
  const [yearLevel, setYearLevel] = useState<number | null>(null);
  const [curriculumYear, setCurriculumYear] = useState<number | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const res = await api.get(
          `/index.php?page=student-competency&student_id=${encodeURIComponent(String(student.student_id))}`
        );
        if (cancelled) return;

        if (res.data.status === "success") {
          // ใช้ groups ตรงๆ ตามที่ backend ส่งมา (เรียง PLO ตาม sort_order, เรียง item ในแต่ละ PLO ตาม sequence_no อยู่แล้ว)
          setGroups(res.data.data.groups || []);
          setYearLevel(res.data.data.year_level);
          setCurriculumYear(res.data.data.framework?.curriculum_year || null);
        } else {
          toast({ title: "ข้อผิดพลาด", description: res.data.message || "โหลดข้อมูลไม่สำเร็จ", variant: "destructive" });
          onBack();
        }
      } catch (error) {
        if (cancelled) return;
        toast({ title: "ข้อผิดพลาด", description: "โหลดรายการประเมินไม่สำเร็จ", variant: "destructive" });
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

  const handleScoreChange = (itemId: number, score: number) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((it) => (it.id === itemId ? { ...it, score } : it)),
      }))
    );
  };

  const handleSave = async () => {
    const scores = groups
      .flatMap((g) => g.items)
      .filter((it) => it.is_scorable && it.score)
      .map((it) => ({ competency_item_id: it.id, score: it.score }));

    if (scores.length === 0) {
      toast({ title: "ยังไม่ได้ให้คะแนน", description: "กรุณาเลือกคะแนนอย่างน้อย 1 รายการ", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post("/index.php?page=save-student-competency", {
        student_id: student.student_id,
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

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
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
              นักศึกษา: <span className="text-foreground font-medium">{student.full_name}</span> (รหัส {student.student_id})
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
      ) : groups.length === 0 || groups.every((g) => g.items.length === 0) ? (
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
                {/* ✅ วนตาม groups ตรงๆ: PLO header ขึ้น 1 ครั้งต่อกลุ่มเสมอ ไม่ขึ้นอยู่กับว่า sequence_no เรียงถูกหรือไม่ */}
                {groups.map((g) =>
                  g.items.length === 0 ? null : (
                    <React.Fragment key={g.plo_id}>
                      <tr className="border-b bg-muted/30">
                        <td colSpan={7} className="py-2.5 px-4 font-semibold text-sm text-foreground bg-accent/20 border-b border-border">
                          {g.plo_code} {g.plo_name}
                        </td>
                      </tr>

                      {g.items.map((item) => (
                        <tr key={item.id} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
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
                      ))}
                    </React.Fragment>
                  )
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
