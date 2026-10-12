import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Award } from "lucide-react";
import api from "@/lib/axios";
import {
  CompetencyResultView,
  type FinalSummary,
  type PloGroup,
} from "@/components/shared/CompetencyResultView";

/**
 * ผลการประเมินสมรรถนะหลักของนักศึกษาที่ล็อกอินอยู่
 * ใช้ component แสดงผลตัวเดียวกับหน้าของอาจารย์ที่ปรึกษา เพื่อให้หน้าตาตรงกัน
 */
export default function StudentCompetencyView() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<PloGroup[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [yearLevel, setYearLevel] = useState<number | null>(null);
  const [academicYear, setAcademicYear] = useState<number | null>(null);
  const [curriculumYear, setCurriculumYear] = useState<number | null>(null);
  const [finalSummary, setFinalSummary] = useState<FinalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyCompetency = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/index.php?page=my-competency");
      if (res.data.status === "success" && res.data.data) {
        const payload = res.data.data;
        setGroups(payload.groups || []);
        setStudentName(payload.full_name || "");
        setStudentId(payload.student_id || "");
        setYearLevel(payload.year_level);
        setAcademicYear(payload.academic_year);
        setCurriculumYear(payload.framework?.curriculum_year || null);
        setFinalSummary(payload.final_summary || null);
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: res.data.message || "ไม่สามารถดึงข้อมูลได้",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error.response?.data?.message || "โหลดผลการประเมินไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMyCompetency();
  }, [fetchMyCompetency]);

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">
            ผลการประเมินสมรรถนะหลักของนักศึกษาชั้นปีที่ {yearLevel || "—"}{" "}
            {curriculumYear && `(หลักสูตรปรับปรุง ${curriculumYear})`}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          นักศึกษา: <span className="text-foreground font-medium">{studentName}</span>
          {studentId && ` (รหัส ${studentId})`}
          {academicYear && ` · ปีการศึกษา ${academicYear}`}
        </p>
      </div>

      <div className="bg-muted/40 p-3 rounded-md text-xs text-muted-foreground leading-relaxed border border-border/60">
        <span className="font-semibold text-foreground">คำชี้แจง: </span>
        ผล "บรรลุ / ไม่บรรลุ" คำนวณอัตโนมัติจากคะแนนที่อาจารย์ให้ไว้ในแต่ละรายวิชา โดยนำคะแนนของสมรรถนะข้อเดียวกันจากทุกวิชามารวมกัน
        แล้วเทียบกับคะแนนผ่านที่หลักสูตรกำหนดไว้
      </div>

      <CompetencyResultView
        groups={groups}
        yearLevel={yearLevel}
        finalSummary={finalSummary}
        isLoading={isLoading}
      />
    </div>
  );
}
