import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RotateCcw, CalendarDays, Info } from "lucide-react";
import api from "@/lib/axios";

interface TermRange {
  term: number;
  start: string;
  end: string;
  label: string;
}

interface TermSettings {
  terms: TermRange[];
  boundary: { month: number; day: number };
  current_year: number;
  current_term: { semester: number | null; academic_year: number; label: string; today: string };
  defaults: TermRange[];
}

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const pad = (value: number) => String(value).padStart(2, "0");

const splitMonthDay = (value: string): { month: number; day: number } => {
  const m = /^(\d{2})-(\d{2})$/.exec(value || "");
  return m ? { month: Number(m[1]), day: Number(m[2]) } : { month: 1, day: 1 };
};

export const formatMonthDayTh = (value: string): string => {
  const { month, day } = splitMonthDay(value);
  return `${day} ${THAI_MONTHS[month - 1] ?? month}`;
};

/** ช่องเลือกวัน/เดือน (ไม่มีปี เพราะช่วงนี้ใช้ซ้ำทุกปีการศึกษา) */
function MonthDayPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const { month, day } = splitMonthDay(value);
  const maxDay = DAYS_IN_MONTH[month - 1] ?? 31;

  return (
    <div className="flex gap-2">
      <Select
        value={String(day)}
        disabled={disabled}
        onValueChange={(next) => onChange(`${pad(month)}-${pad(Number(next))}`)}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
            <SelectItem key={d} value={String(d)}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(month)}
        disabled={disabled}
        onValueChange={(next) => {
          const nextMonth = Number(next);
          const limit = DAYS_IN_MONTH[nextMonth - 1] ?? 31;
          onChange(`${pad(nextMonth)}-${pad(Math.min(day, limit))}`);
        }}
      >
        <SelectTrigger className="flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {THAI_MONTHS.map((name, index) => (
            <SelectItem key={name} value={String(index + 1)}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function TermSettingsDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TermSettings | null>(null);
  const [draft, setDraft] = useState<TermRange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/index.php?page=get-term-settings");
      if (res.data.status === "success") {
        setSettings(res.data.data);
        setDraft((res.data.data.terms || []).map((t: TermRange) => ({ ...t })));
      } else {
        toast({ title: "ข้อผิดพลาด", description: res.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error?.response?.data?.message || "โหลดช่วงวันที่ภาคเรียนไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const updateTerm = (term: number, field: "start" | "end", value: string) => {
    setDraft((prev) => prev.map((t) => (t.term === term ? { ...t, [field]: value } : t)));
  };

  const resetToDefaults = () => {
    if (!settings) return;
    setDraft(settings.defaults.map((t) => ({ ...t })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.post("/index.php?page=save-term-settings", {
        terms: draft.map((t) => ({ term: t.term, start: t.start, end: t.end })),
      });
      if (res.data.status === "success") {
        toast({ title: "บันทึกสำเร็จ", description: res.data.message });
        setSettings(res.data.data);
        setDraft((res.data.data.terms || []).map((t: TermRange) => ({ ...t })));
        onSaved?.();
        onOpenChange(false);
      } else {
        toast({ title: "บันทึกไม่สำเร็จ", description: res.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "บันทึกไม่สำเร็จ",
        description: error?.response?.data?.message || "บันทึกช่วงวันที่ภาคเรียนไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const term1 = draft.find((t) => t.term === 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-dialog-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" /> ตั้งค่าช่วงวันที่ภาคเรียน
          </DialogTitle>
          <DialogDescription>
            กำหนดว่าช่วงวันไหนเป็นภาคเรียนไหน ใช้ซ้ำทุกปีการศึกษา — ระบบใช้ค่านี้เลือกภาคเรียนให้อัตโนมัติในหน้าลงทะเบียนเรียน
          </DialogDescription>
        </DialogHeader>

        {isLoading || !settings ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-foreground">
                  <span className="font-semibold">วันเปิดภาคการศึกษาที่ 1 คือวันเริ่มปีการศึกษาของทั้งระบบ</span> —
                  เปลี่ยนค่านี้แล้วทุกหน้าที่อ้างปีการศึกษา (รายงาน, คลังเอกสาร มคอ., ภาระงาน, โครงการ, ส่งออกข้อมูล) จะขยับตามทันที
                </p>
                <p className="text-muted-foreground">
                  ปัจจุบัน: ปีการศึกษา {settings.current_year} เริ่มวันที่{" "}
                  {formatMonthDayTh(`${pad(settings.boundary.month)}-${pad(settings.boundary.day)}`)} ·{" "}
                  วันนี้อยู่ใน {settings.current_term.semester ? settings.current_term.label : "นอกช่วงภาคเรียน"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {draft.map((term) => (
                <div key={term.term} className="rounded-md border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{term.label}</span>
                    {term.term === 1 && (
                      <Badge variant="secondary" className="text-xs">วันเริ่มปีการศึกษา</Badge>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">วันเริ่ม</Label>
                      <MonthDayPicker
                        value={term.start}
                        disabled={isSaving}
                        onChange={(next) => updateTerm(term.term, "start", next)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">วันสิ้นสุด</Label>
                      <MonthDayPicker
                        value={term.end}
                        disabled={isSaving}
                        onChange={(next) => updateTerm(term.term, "end", next)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatMonthDayTh(term.start)} ถึง {formatMonthDayTh(term.end)}
                    {splitMonthDay(term.start).month > splitMonthDay(term.end).month && " (ข้ามปีปฏิทิน)"}
                  </p>
                </div>
              ))}
            </div>

            {term1 && (
              <p className="text-xs text-muted-foreground">
                ช่วงวันที่ต้องต่อเนื่องกันจนครบทั้งปี ห้ามเว้นช่องว่างหรือซ้อนทับกัน
                ระบบจะตรวจให้อีกครั้งก่อนบันทึก
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={resetToDefaults} disabled={isLoading || isSaving} className="gap-2">
            <RotateCcw className="h-4 w-4" /> ใช้ค่าเริ่มต้น
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              บันทึก
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
