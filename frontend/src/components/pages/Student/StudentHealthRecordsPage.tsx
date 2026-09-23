import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Activity, Save, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/axios";

interface HealthRecordItem {
  year_level: number;
  academic_year: string;
  height: string;
  weight: string;
  bmi: string;
  overall_status: "healthy" | "has_health_issue";
  health_issue_detail: string;
}

const DEFAULT_RECORDS: HealthRecordItem[] = [
  { year_level: 1, academic_year: "2567", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "" },
  { year_level: 2, academic_year: "2568", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "" },
  { year_level: 3, academic_year: "2569", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "" },
  { year_level: 4, academic_year: "2570", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "" },
];

export default function StudentHealthRecordsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<HealthRecordItem[]>(DEFAULT_RECORDS);

  const calculateBMI = useCallback((heightStr: string, weightStr: string): string => {
    const trimmedH = heightStr.trim();
    const trimmedW = weightStr.trim();

    if (!trimmedH || !trimmedW) return "";

    const h = parseFloat(trimmedH);
    const w = parseFloat(trimmedW);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0 || h > 300 || w > 500) {
      return "";
    }

    const hMeter = h / 100;
    const computedBMI = w / (hMeter * hMeter);

    if (isNaN(computedBMI) || !isFinite(computedBMI)) {
      return "";
    }

    return computedBMI.toFixed(2);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/index.php?page=student-health-records");

      if (res.data?.status === "success") {
        const savedData: any[] = Array.isArray(res.data.data) ? res.data.data : [];
        
        const merged: HealthRecordItem[] = DEFAULT_RECORDS.map((def) => {
          const match = savedData.find((s) => Number(s.year_level) === def.year_level);
          if (match) {
            const h = match.height !== null && match.height !== undefined ? String(match.height) : "";
            const w = match.weight !== null && match.weight !== undefined ? String(match.weight) : "";
            const status: "healthy" | "has_health_issue" = match.overall_status === "has_health_issue" ? "has_health_issue" : "healthy";

            return {
              year_level: Number(match.year_level),
              academic_year: String(match.academic_year || def.academic_year),
              height: h,
              weight: w,
              bmi: match.bmi ? String(match.bmi) : calculateBMI(h, w),
              overall_status: status,
              health_issue_detail: status === "has_health_issue" ? String(match.health_issue_detail || "") : "",
            };
          }
          return def;
        });

        setRecords(merged);
      }
    } catch (error) {
      toast({ 
        title: "ข้อผิดพลาด", 
        description: "โหลดข้อมูลภาวะสุขภาพไม่สำเร็จ", 
        variant: "destructive" 
      });
      setRecords(DEFAULT_RECORDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (yearLevel: number, field: keyof HealthRecordItem, value: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.year_level !== yearLevel) return r;

        const updated: HealthRecordItem = { ...r, [field]: value };

        if (field === "height" || field === "weight") {
          const h = field === "height" ? value : r.height;
          const w = field === "weight" ? value : r.weight;
          updated.bmi = calculateBMI(h, w);
        }

        if (field === "overall_status") {
          if (value === "healthy") {
            updated.health_issue_detail = "";
          }
        }

        return updated;
      })
    );
  };

  const validateBeforeSave = (): boolean => {
    for (const r of records) {
      if (r.overall_status === "has_health_issue" && !r.health_issue_detail.trim()) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: `กรุณาระบุรายละเอียดปัญหาสุขภาพของ ชั้นปีที่ ${r.year_level}`,
          variant: "destructive",
        });
        return false;
      }

      if (r.height && (parseFloat(r.height) <= 0 || parseFloat(r.height) > 250)) {
        toast({
          title: "ข้อมูลไม่ถูกต้อง",
          description: `ส่วนสูงของ ชั้นปีที่ ${r.year_level} ไม่สมเหตุสมผล`,
          variant: "destructive",
        });
        return false;
      }

      if (r.weight && (parseFloat(r.weight) <= 0 || parseFloat(r.weight) > 300)) {
        toast({
          title: "ข้อมูลไม่ถูกต้อง",
          description: `น้ำหนักของ ชั้นปีที่ ${r.year_level} ไม่สมเหตุสมผล`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateBeforeSave()) return;

    try {
      setSaving(true);
      
      const payload = records.map((r) => ({
        year_level: r.year_level,
        academic_year: r.academic_year.trim(),
        height: r.height.trim() ? parseFloat(r.height) : null,
        weight: r.weight.trim() ? parseFloat(r.weight) : null,
        bmi: r.bmi.trim() ? parseFloat(r.bmi) : null,
        overall_status: r.overall_status,
        health_issue_detail: r.overall_status === "has_health_issue" ? r.health_issue_detail.trim() : null,
      }));

      const res = await api.post("/index.php?page=student-health-records", { records: payload });

      if (res.data?.status === "success") {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูลภาวะสุขภาพเรียบร้อยแล้ว" });
        await fetchData();
      } else {
        throw new Error(res.data?.message || "บันทึกล้มเหลว");
      }
    } catch (error: any) {
      toast({
        title: "บันทึกล้มเหลว",
        description: error.response?.data?.message || error.message || "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">กำลังโหลดข้อมูลภาวะสุขภาพ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">2. ภาวะสุขภาพ</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ข้อมูลภาวะสุขภาพโดยรวม ส่วนสูง น้ำหนัก และดัชนีมวลกาย (BMI) ของนักศึกษาในแต่ละชั้นปี
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          บันทึกข้อมูล
        </Button>
      </div>

      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.year_level} className="shadow-sm border-border/60">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-bold text-base text-foreground min-w-[90px]">
                  {record.year_level}. ชั้นปีที่ {record.year_level}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">ปีการศึกษา</span>
                  <Input
                    type="text"
                    maxLength={4}
                    className="w-20 h-8 text-center"
                    value={record.academic_year}
                    onChange={(e) => handleChange(record.year_level, "academic_year", e.target.value.replace(/\D/g, ""))}
                    placeholder="25xx"
                  />
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">ส่วนสูง</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="250"
                    className="w-24 h-8 text-center"
                    value={record.height}
                    onChange={(e) => handleChange(record.year_level, "height", e.target.value)}
                    placeholder="0.0"
                  />
                  <span className="text-muted-foreground text-xs">ซม.</span>
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">น้ำหนัก</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    className="w-24 h-8 text-center"
                    value={record.weight}
                    onChange={(e) => handleChange(record.year_level, "weight", e.target.value)}
                    placeholder="0.0"
                  />
                  <span className="text-muted-foreground text-xs">กก.</span>
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">BMI =</span>
                  <Input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className="w-20 h-8 text-center font-bold bg-muted cursor-default select-none"
                    value={record.bmi || "—"}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3 border-t border-border/50">
                <span className="text-sm font-medium text-foreground shrink-0">ภาวะสุขภาพโดยรวม:</span>
                
                <RadioGroup
                  value={record.overall_status}
                  onValueChange={(val: "healthy" | "has_health_issue") => handleChange(record.year_level, "overall_status", val)}
                  className="flex flex-wrap items-center gap-6 text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="healthy" id={`healthy-${record.year_level}`} />
                    <Label htmlFor={`healthy-${record.year_level}`} className="cursor-pointer font-medium">
                      แข็งแรงดี
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="has_health_issue" id={`issue-${record.year_level}`} />
                    <Label htmlFor={`issue-${record.year_level}`} className="cursor-pointer font-medium">
                      มีปัญหาสุขภาพ..ระบุ
                    </Label>
                  </div>
                </RadioGroup>

                {record.overall_status === "has_health_issue" && (
                  <div className="flex-1 min-w-[240px] flex items-center gap-1.5 animate-in fade-in duration-200">
                    <Input
                      type="text"
                      className="h-8 text-xs flex-1 border-destructive/50 focus-visible:ring-destructive/30"
                      placeholder="ระบุรายละเอียดปัญหาสุขภาพ *"
                      value={record.health_issue_detail}
                      onChange={(e) => handleChange(record.year_level, "health_issue_detail", e.target.value)}
                    />
                    {!record.health_issue_detail.trim() && (
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}