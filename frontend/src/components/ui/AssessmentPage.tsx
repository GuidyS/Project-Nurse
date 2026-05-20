import { useState } from "react";
import { Save, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface StudentInfo {
  studentId: string;
  name: string;
  workplace: string;
}

interface AssessmentPageProps {
  student?: StudentInfo | null;
  onBack?: () => void;
}

interface CLOAssessment {
  code: string;
  description: string;
  bloomLevel: string;
  weight: number;
  score: string;
  comment: string;
}

const scoreOptions = [
  { value: "5", label: "5 - ดีเยี่ยม" },
  { value: "4", label: "4 - ดี" },
  { value: "3", label: "3 - ปานกลาง" },
  { value: "2", label: "2 - ต้องปรับปรุง" },
  { value: "1", label: "1 - ไม่ผ่าน" },
];

const bloomColors: Record<string, string> = {
  "เข้าใจ": "bg-secondary text-secondary-foreground",
  "ประยุกต์ใช้": "bg-primary/10 text-primary",
  "วิเคราะห์": "bg-amber-100 text-amber-700",
  "ประเมินค่า": "bg-red-100 text-red-700",
  "สร้างสรรค์": "bg-green-100 text-green-700",
};

const initialCLOs: CLOAssessment[] = [
  { code: "CLO1", description: "อธิบายหลักการพื้นฐานของการพยาบาลได้", bloomLevel: "เข้าใจ", weight: 20, score: "", comment: "" },
  { code: "CLO2", description: "สาธิตทักษะการพยาบาลพื้นฐานได้อย่างถูกต้อง", bloomLevel: "ประยุกต์ใช้", weight: 30, score: "", comment: "" },
  { code: "CLO3", description: "วิเคราะห์สถานการณ์ปัญหาสุขภาพเบื้องต้นได้", bloomLevel: "วิเคราะห์", weight: 25, score: "", comment: "" },
  { code: "CLO4", description: "แสดงจริยธรรมในการปฏิบัติการพยาบาลได้", bloomLevel: "ประเมินค่า", weight: 25, score: "", comment: "" },
];

export default function AssessmentPage({ student, onBack }: AssessmentPageProps) {
  const assessStudent = student || null;
  const [clos, setClos] = useState<CLOAssessment[]>(initialCLOs);
  const [overallComment, setOverallComment] = useState("");

  const allScored = clos.every((c) => c.score !== "");
  const totalWeightedScore = allScored
    ? clos.reduce((sum, c) => sum + (parseInt(c.score) / 5) * c.weight, 0).toFixed(1)
    : null;

  const updateCLO = (index: number, field: keyof CLOAssessment, value: string) => {
    setClos((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const handleSubmit = () => {
    if (!allScored) {
      toast.error("กรุณาให้คะแนนทุก CLO ก่อนบันทึก");
      return;
    }
    toast.success(`บันทึกผลประเมินนักศึกษา ${assessStudent?.name} เรียบร้อย`);
    if (onBack) onBack();
  };

  return (
    <Dialog open={!!assessStudent} onOpenChange={(open) => { if (!open && onBack) onBack(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {assessStudent && (
          <>
            <DialogHeader>
              <DialogTitle>ประเมินผล CLO - {assessStudent.name}</DialogTitle>
              <p className="text-muted-foreground text-sm">รหัส {assessStudent.studentId} · {assessStudent.workplace}</p>
            </DialogHeader>

            {/* CLO Assessment cards */}
            <div className="space-y-4">
        {clos.map((clo, index) => (
          <div key={clo.code} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary text-lg">{clo.code}</span>
                <Badge variant="secondary" className={bloomColors[clo.bloomLevel] || ""}>
                  {clo.bloomLevel}
                </Badge>
                <span className="text-sm text-muted-foreground">น้ำหนัก {clo.weight}%</span>
              </div>
              {clo.score && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">ให้คะแนนแล้ว</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-4">{clo.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">คะแนน</label>
                <Select value={clo.score} onValueChange={(v) => updateCLO(index, "score", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกคะแนน" />
                  </SelectTrigger>
                  <SelectContent>
                    {scoreOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">ความคิดเห็น</label>
                <Textarea
                  placeholder="เพิ่มความคิดเห็น (ไม่บังคับ)..."
                  value={clo.comment}
                  onChange={(e) => updateCLO(index, "comment", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

            {/* Overall comment & summary */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">ความคิดเห็นโดยรวม</h3>
              <Textarea
                placeholder="เพิ่มความคิดเห็นโดยรวมเกี่ยวกับนักศึกษา..."
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                rows={3}
                className="mb-4"
              />
              {totalWeightedScore && (
                <div className="p-4 bg-primary/5 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">คะแนนรวมถ่วงน้ำหนัก</span>
                  <span className="text-2xl font-bold text-primary">{totalWeightedScore}%</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={onBack}>
                <X className="mr-2 h-4 w-4" />
                ยกเลิก
              </Button>
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" />
                บันทึกผลประเมิน
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}