import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, ChevronLeft } from "lucide-react";
import api from "@/lib/axios";
import type { AdvisorDetailPanelProps } from "./advisorStudent";
import {
  CompetencyResultView,
  type FinalSummary,
  type PloGroup,
} from "@/components/shared/CompetencyResultView";

// แผง "ประเมิน" สมรรถนะหลักของนักศึกษา 1 คน (คำนวณอัตโนมัติจากคะแนนรายวิชา)
export default function AdvisorCompetencyDetail({ student, onBack }: AdvisorDetailPanelProps) {
  const { toast } = useToast();
  const [groups, setGroups] = useState<PloGroup[]>([]);
  const [yearLevel, setYearLevel] = useState<number | null>(null);
  const [curriculumYear, setCurriculumYear] = useState<number | null>(null);
  const [finalSummary, setFinalSummary] = useState<FinalSummary | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);

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
          setGroups(res.data.data.groups || []);
          setYearLevel(res.data.data.year_level);
          setCurriculumYear(res.data.data.framework?.curriculum_year || null);
          setFinalSummary(res.data.data.final_summary || null);
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

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
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

      <div className="bg-muted/40 p-3 rounded-md text-xs text-muted-foreground leading-relaxed border border-border/60">
        <span className="font-semibold text-foreground">คำชี้แจง: </span>
        ผล "บรรลุ / ไม่บรรลุ" คำนวณอัตโนมัติจากคะแนนที่อาจารย์ให้ไว้ในแต่ละรายวิชา โดยนำคะแนนของสมรรถนะข้อเดียวกันจากทุกวิชามารวมกัน
        แล้วเทียบกับคะแนนผ่านที่กำหนดไว้ที่หน้า "จัดการ CLO รายวิชา" — หน้านี้จึงเป็นโหมดดูอย่างเดียว
      </div>

      <CompetencyResultView
        groups={groups}
        yearLevel={yearLevel}
        finalSummary={finalSummary}
        isLoading={isLoadingDetail}
      />
    </div>
  );
}
