import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CalendarClock, Loader2, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

export interface AcademicSettings {
  cutoff_month: number;
  cutoff_day: number;
  current_academic_year: number;
  next_promotion_date: string;
  purge_enabled: boolean;
  purge_years: number;
  purge_preview: {
    cutoff_entry_year: number;
    total: number;
    by_entry_year: Record<string, number>;
    sample: string[];
  };
  purge_last_run: { last_run_at: string; last_result: string } | null;
}

const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const formatCutoff = (month?: number, day?: number) =>
  month && day ? `${day} ${MONTHS[month - 1]}` : "";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (settings: AcademicSettings) => void;
  /** เรียกหลังลบข้อมูลนักศึกษา เพื่อให้หน้าหลักโหลดรายชื่อใหม่ */
  onPurged?: () => void;
}

export function AcademicSettingsDialog({ open, onOpenChange, onSaved, onPurged }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AcademicSettings | null>(null);
  const [month, setMonth] = useState(8);
  const [day, setDay] = useState(10);
  const [purgeEnabled, setPurgeEnabled] = useState(false);
  const [purgeYears, setPurgeYears] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [confirmPurgeOpen, setConfirmPurgeOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/index.php?page=get-academic-settings");
      const data: AcademicSettings = res.data?.data;
      setSettings(data);
      setMonth(data.cutoff_month);
      setDay(data.cutoff_day);
      setPurgeEnabled(Boolean(data.purge_enabled));
      setPurgeYears(data.purge_years);
    } catch (err: any) {
      toast({
        title: "โหลดการตั้งค่าไม่สำเร็จ",
        description: err?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.post("/index.php?page=save-academic-settings", {
        cutoff_month: month,
        cutoff_day: day,
        purge_enabled: purgeEnabled,
        purge_years: purgeYears,
      });
      toast({ title: "บันทึกการตั้งค่าแล้ว", description: res.data?.message });
      const updated = { ...(settings as AcademicSettings), ...res.data?.data, cutoff_month: month, cutoff_day: day, purge_enabled: purgeEnabled, purge_years: purgeYears };
      setSettings(updated);
      onSaved?.(updated);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "บันทึกไม่สำเร็จ",
        description: err?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      const res = await api.post("/index.php?page=run-student-purge", { confirm: "DELETE" });
      toast({ title: "ลบข้อมูลแล้ว", description: res.data?.message });
      setConfirmPurgeOpen(false);
      onPurged?.();
      load();
    } catch (err: any) {
      toast({
        title: "ลบข้อมูลไม่สำเร็จ",
        description: err?.response?.data?.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsPurging(false);
    }
  };

  const purgeTotal = settings?.purge_preview?.total ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> ตั้งค่าปีการศึกษา
            </DialogTitle>
            <DialogDescription>
              กำหนดวันที่ระบบเลื่อนชั้นปีของนักศึกษาโดยอัตโนมัติ และการล้างข้อมูลนักศึกษาที่เรียนครบกำหนดแล้ว
            </DialogDescription>
          </DialogHeader>

          {isLoading || !settings ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {/* วันเลื่อนชั้นปี */}
              <section className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">วันเลื่อนชั้นปีอัตโนมัติ</h3>
                  <Badge variant="secondary">ปีการศึกษาปัจจุบัน {settings.current_academic_year}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>เดือน</Label>
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((name, i) => (
                          <SelectItem key={name} value={String(i + 1)}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>วันที่</Label>
                    <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: DAYS_IN_MONTH[month - 1] }, (_, i) => i + 1).map((d) => (
                          <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  นักศึกษาทุกคนจะเลื่อนชั้นปีพร้อมกันทุกวันที่ {formatCutoff(month, day)} — ครั้งถัดไป{" "}
                  {new Date(settings.next_promotion_date).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </section>

              {/* ล้างข้อมูลนักศึกษา */}
              <section className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">ล้างข้อมูลนักศึกษาที่ครบกำหนด</h3>
                    <p className="text-sm text-muted-foreground">
                      ลบนักศึกษาที่เข้าศึกษามานานเกินจำนวนปีที่กำหนด ออกจากฐานข้อมูลโดยอัตโนมัติปีละครั้ง
                    </p>
                  </div>
                  <Switch checked={purgeEnabled} onCheckedChange={setPurgeEnabled} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>เก็บข้อมูลไว้ (ปี)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={purgeYears}
                      onChange={(e) => setPurgeYears(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>รายชื่อที่เข้าเกณฑ์ตอนนี้</Label>
                    <div className="flex h-10 items-center gap-2 rounded-md border bg-muted/30 px-3 text-sm">
                      <span className="font-medium">{purgeTotal} คน</span>
                      {purgeTotal > 0 && (
                        <span className="text-muted-foreground">
                          (เข้าศึกษาปี {settings.purge_preview.cutoff_entry_year} หรือก่อนหน้า)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    การลบนี้ย้อนกลับไม่ได้ ระบบจะสำรองข้อมูลที่ลบเป็นไฟล์ไว้ในเซิร์ฟเวอร์
                    (backend/src/uploads/student-purge-archive) และบันทึกลง Audit Log ทุกครั้ง
                  </span>
                </div>

                {settings.purge_last_run && (
                  <p className="text-xs text-muted-foreground">
                    ลบครั้งล่าสุด: {settings.purge_last_run.last_run_at}
                  </p>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={purgeTotal === 0}
                  onClick={() => setConfirmPurgeOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> ลบข้อมูลที่เข้าเกณฑ์ตอนนี้ ({purgeTotal} คน)
                </Button>
              </section>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึกการตั้งค่า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={confirmPurgeOpen}
        onOpenChange={setConfirmPurgeOpen}
        title="ยืนยันการลบข้อมูลนักศึกษา"
        description={`จะลบข้อมูลนักศึกษา ${purgeTotal} คน ที่เข้าศึกษาปี ${settings?.purge_preview?.cutoff_entry_year ?? ""} หรือก่อนหน้า พร้อมบัญชีผู้ใช้และข้อมูลที่เกี่ยวข้อง การลบนี้ย้อนกลับไม่ได้`}
        confirmLabel="ลบข้อมูล"
        variant="destructive"
        onConfirm={handlePurge}
        isLoading={isPurging}
      />
    </>
  );
}
