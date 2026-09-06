import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Loader2, CheckCircle2, CircleDashed, AlertCircle } from "lucide-react";
import api from "@/lib/axios";

interface CompetencyItemRow {
  id: number;
  plo_id: number;
  plo_code: string;
  plo_name: string;
  sequence_no: number;
  competency_name: string;
  is_scorable: number;
  score: number | null;
  assessed_at?: string;
}

export default function StudentCompetencyView() {
  const { toast } = useToast();
  const [items, setItems] = useState<CompetencyItemRow[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [yearLevel, setYearLevel] = useState<number | null>(null);
  const [academicYear, setAcademicYear] = useState<number | null>(null);
  const [curriculumYear, setCurriculumYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyCompetency = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/index.php?page=my-competency");
      if (res.data.status === "success" && res.data.data) {
        const rawItems: CompetencyItemRow[] = res.data.data.items || [];
        setItems(rawItems);
        setStudentName(res.data.data.full_name || "");
        setStudentId(res.data.data.student_id || "");
        setYearLevel(res.data.data.year_level);
        setAcademicYear(res.data.data.academic_year);
        setCurriculumYear(res.data.data.framework?.curriculum_year || null);
      } else {
        toast({ 
          title: "ข้อผิดพลาด", 
          description: res.data.message || "ไม่สามารถดึงข้อมูลได้", 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "ข้อผิดพลาด", 
        description: error.response?.data?.message || "โหลดผลการประเมินไม่สำเร็จ", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCompetency();
  }, []);

  const totalScorable = items.filter((it) => Boolean(it.is_scorable)).length;
  const totalAssessed = items.filter((it) => Boolean(it.is_scorable) && it.score !== null).length;
  const isFullyAssessed = totalScorable > 0 && totalAssessed === totalScorable;

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              ผลการประเมินสมรรถนะหลักของนักศึกษาชั้นปีที่ {yearLevel || "—"} {curriculumYear && `(หลักสูตรปรับปรุง ${curriculumYear})`}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            นักศึกษา: <span className="text-foreground font-medium">{studentName}</span> (รหัส {studentId}) {academicYear && `• ปีการศึกษา ${academicYear}`}
          </p>
        </div>

        {/* Badge สถานะ */}
        <div>
          {isFullyAssessed ? (
            <Badge className="bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 py-1.5 px-3">
              <CheckCircle2 className="h-4 w-4" /> ได้รับการประเมินครบถ้วน
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <CircleDashed className="h-4 w-4 text-muted-foreground" /> ประเมินแล้ว {totalAssessed}/{totalScorable} รายการ
            </Badge>
          )}
        </div>
      </div>

      {/* คำชี้แจงเกณฑ์คะแนน */}
      <div className="bg-muted/40 p-3.5 rounded-md text-xs text-muted-foreground leading-relaxed border border-border/60">
        <span className="font-semibold text-foreground">คำชี้แจง: </span>
        ระดับผลการประเมินจากอาจารย์ที่ปรึกษา โดย 
        <span className="font-medium text-foreground"> 5 = เห็นด้วยมากที่สุด, 4 = เห็นด้วยมาก, 3 = เห็นด้วยปานกลาง, 2 = เห็นด้วยน้อย, 1 = เห็นด้วยน้อยที่สุด</span>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
            <p>ยังไม่มีรายการประเมินสมรรถนะสำหรับชั้นปีที่ {yearLevel || ""}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm overflow-hidden border border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/60 text-muted-foreground">
                    <th className="w-[70px] py-3.5 px-2 text-center font-bold border-r border-border text-foreground">ลำดับ</th>
                    <th className="py-3.5 px-4 text-left font-bold border-r border-border text-foreground">รายการประเมินสมรรถนะ</th>
                    <th className="w-[55px] py-3.5 px-1 text-center font-bold border-r border-border text-foreground">5</th>
                    <th className="w-[55px] py-3.5 px-1 text-center font-bold border-r border-border text-foreground">4</th>
                    <th className="w-[55px] py-3.5 px-1 text-center font-bold border-r border-border text-foreground">3</th>
                    <th className="w-[55px] py-3.5 px-1 text-center font-bold border-r border-border text-foreground">2</th>
                    <th className="w-[55px] py-3.5 px-1 text-center font-bold text-foreground">1</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const prevItem = items[index - 1];
                    const showPloHeader = index === 0 || item.plo_id !== prevItem?.plo_id;

                    return (
                      <React.Fragment key={item.id}>
                        {/* แถบหัวข้อ PLO */}
                        {showPloHeader && (
                          <tr className="border-b bg-muted/30">
                            <td colSpan={7} className="py-2.5 px-4 font-semibold text-sm text-foreground bg-primary/10 border-b border-border">
                              <span className="text-primary mr-1.5">{item.plo_code}</span> {item.plo_name}
                            </td>
                          </tr>
                        )}

                        {/* แถวข้อประเมิน */}
                        <tr className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                          <td className="py-3 px-2 text-center text-muted-foreground font-semibold border-r border-border align-middle">
                            {item.sequence_no}.
                          </td>
                          <td className="py-3 px-4 text-foreground border-r border-border align-middle leading-relaxed">
                            <span className={!item.is_scorable ? "text-muted-foreground italic" : ""}>
                              {item.competency_name}
                            </span>
                          </td>

                          {!item.is_scorable ? (
                            <td colSpan={5} className="bg-muted/40 text-center py-3 text-xs text-muted-foreground font-medium select-none">
                              ไม่ต้องประเมินเพราะไม่กำหนดตัวชี้วัด
                            </td>
                          ) : (
                            [5, 4, 3, 2, 1].map((val) => {
                              const isSelected = item.score === val;
                              return (
                                <td
                                  key={val}
                                  className="w-[55px] p-0 text-center align-middle border-r last:border-r-0 border-border"
                                >
                                  <div className="flex items-center justify-center h-12">
                                    <div
                                      className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                                        isSelected
                                          ? "border-primary bg-primary text-primary-foreground shadow-sm scale-110"
                                          : "border-muted-foreground/30 bg-transparent"
                                      }`}
                                    >
                                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                                    </div>
                                  </div>
                                </td>
                              );
                            })
                          )}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}