import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Loader2, ChevronLeft, ExternalLink } from "lucide-react";
import api from "@/lib/axios";
import type { AdvisorDetailPanelProps } from "./advisorStudent";

interface DoseItem {
  id: string;
  dose_no: number;
  label_type: "dose" | "year";
  received_date: string;
}

interface VaccineGroup {
  id: string;
  sequence_no: number;
  vaccine_name: string;
  immunity_status: "none_uninfected" | "none_infected" | "has_immunity" | "";
  evidence_attached: boolean;
  evidence_file_path?: string;
  advisor_name: string;
  remark: string;
  doses: DoseItem[];
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

// แผง "ข้อมูลวัคซีน" ของนักศึกษา 1 คน (โหมดดูอย่างเดียว)
export default function AdvisorVaccinationDetail({ student, onBack }: AdvisorDetailPanelProps) {
  const { toast } = useToast();
  const [groups, setGroups] = useState<VaccineGroup[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const res = await api.get(
          `/index.php?page=view-student-vaccinations&student_id=${encodeURIComponent(String(student.student_id))}`
        );
        if (cancelled) return;

        if (res.data.status === "success") {
          const rawRows: any[] = res.data.data;
          const groupMap = new Map<string, VaccineGroup>();

          rawRows.forEach((row) => {
            const key = `seq_${row.sequence_no}_${row.vaccine_name}`;
            if (!groupMap.has(key)) {
              groupMap.set(key, {
                id: `group-${row.sequence_no}-${Date.now()}`,
                sequence_no: Number(row.sequence_no),
                vaccine_name: row.vaccine_name,
                immunity_status: (row.immunity_status as any) || "",
                evidence_attached: Boolean(Number(row.evidence_attached)),
                evidence_file_path: row.evidence_file_path || "",
                advisor_name: row.advisor_name || "",
                remark: row.remark || "",
                doses: []
              });
            }

            const isYear = row.vaccine_name.includes("ไข้หวัดใหญ่");
            groupMap.get(key)!.doses.push({
              id: `dose-${row.sequence_no}-${row.dose_no}-${Math.random()}`,
              dose_no: Number(row.dose_no) || 1,
              label_type: isYear ? "year" : "dose",
              received_date: row.received_date || ""
            });
          });

          const loaded = Array.from(groupMap.values());
          loaded.forEach((g) => g.doses.sort((a, b) => a.dose_no - b.dose_no));
          setGroups(loaded);
        } else {
          toast({ title: "ข้อผิดพลาด", description: res.data.message || "ไม่สามารถดูข้อมูลนักศึกษาคนนี้ได้", variant: "destructive" });
          onBack();
        }
      } catch (error) {
        if (cancelled) return;
        toast({ title: "ข้อผิดพลาด", description: "โหลดข้อมูลวัคซีนไม่สำเร็จ", variant: "destructive" });
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

  // คำนวณ Label แยกตามประเภท (เข็ม หรือ ปี)
  const getDoseLabel = (doses: DoseItem[], currentIndex: number) => {
    const currentItem = doses[currentIndex];
    const subList = doses.slice(0, currentIndex + 1);

    if (currentItem.label_type === "year") {
      const yearCount = subList.filter(d => d.label_type === "year").length;
      return `ปี ${yearCount}`;
    } else {
      const doseCount = subList.filter(d => d.label_type === "dose").length;
      return `เข็มที่ ${doseCount}`;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              <h1 className="app-page-title">
                ส่วนที่ 3 ข้อมูลภาวะสุขภาพและการได้รับวัคซีนป้องกันโรค
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ข้อมูลของ {student.full_name} (รหัสนักศึกษา: {student.student_id}) — <b>โหมดดูอย่างเดียว</b>
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoadingDetail ? (
            <div className="py-24 flex justify-center items-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              กำลังโหลดข้อมูลประวัติการได้รับภูมิคุ้มกัน...
            </div>
          ) : groups.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              นักศึกษาคนนี้ยังไม่มีการบันทึกข้อมูลวัคซีนในระบบ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border-collapse border border-border w-full text-sm">
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-b border-border divide-x divide-border text-center font-semibold">
                    <TableHead className="w-16 text-center text-foreground">ลำดับ</TableHead>
                    <TableHead className="w-80 text-foreground">วัคซีนคุ้มกันโรค</TableHead>
                    <TableHead className="w-80 text-center text-foreground">วัน/เดือน/ปี ที่ได้รับวัคซีน (กรณีไม่มีภูมิ)</TableHead>
                    <TableHead className="w-56 text-center text-foreground">ลงชื่ออาจารย์ที่ปรึกษา</TableHead>
                    <TableHead className="text-foreground">หมายเหตุ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {groups.map((group) => (
                    <TableRow key={group.id} className="divide-x divide-border align-top bg-muted/5">
                      {/* ลำดับ (Read-Only) */}
                      <TableCell className="p-3 text-center">
                        <Input
                          type="number"
                          disabled
                          className="w-12 text-center mx-auto h-8 px-1 font-bold bg-background text-foreground disabled:opacity-100"
                          value={group.sequence_no}
                        />
                      </TableCell>

                      {/* วัคซีนคุ้มกันโรค (Read-Only) */}
                      <TableCell className="p-3 space-y-3">
                        <Textarea
                          rows={2}
                          disabled
                          className="font-bold text-foreground text-xs resize-none bg-background disabled:opacity-100"
                          value={group.vaccine_name}
                        />

                        <div className="space-y-2 pl-1 text-xs pointer-events-none">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`uninf-${group.id}`}
                              checked={group.immunity_status === "none_uninfected"}
                              disabled
                            />
                            <Label htmlFor={`uninf-${group.id}`} className="text-muted-foreground">ไม่มีภูมิ ไม่เคยติดเชื้อ</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`inf-${group.id}`}
                              checked={group.immunity_status === "none_infected"}
                              disabled
                            />
                            <Label htmlFor={`inf-${group.id}`} className="text-muted-foreground">ไม่มีภูมิ แต่เคยติดเชื้อ</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`has-${group.id}`}
                              checked={group.immunity_status === "has_immunity"}
                              disabled
                            />
                            <Label htmlFor={`has-${group.id}`} className="text-muted-foreground">มีภูมิคุ้มกันโรค</Label>
                          </div>

                          <div className="space-y-2 pl-6 pt-1 border-t border-border/40">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`doc-${group.id}`}
                                checked={group.evidence_attached}
                                disabled
                              />
                              <Label htmlFor={`doc-${group.id}`} className="text-xs text-muted-foreground font-medium">
                                (แนบหลักฐาน)
                              </Label>
                            </div>

                            {/* ลิงก์เปิดดูหลักฐานแนบ (คลิกได้ปกติ) */}
                            {group.evidence_file_path && (
                              <div className="pt-1 pointer-events-auto">
                                <a
                                  href={`${apiBaseUrl}/${group.evidence_file_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> เปิดดูหลักฐานแนบ
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* วัน/เดือน/ปี ที่ได้รับวัคซีน (Read-Only) */}
                      <TableCell className="p-3 space-y-2">
                        {group.doses.map((dose, idx) => (
                          <div key={dose.id} className="flex items-center gap-2">
                            <span className="w-16 text-xs text-muted-foreground shrink-0 font-medium">
                              {getDoseLabel(group.doses, idx)}
                            </span>
                            <Input
                              type="date"
                              disabled
                              className="h-8 text-xs flex-1 bg-background text-foreground disabled:opacity-100"
                              value={dose.received_date}
                            />
                          </div>
                        ))}
                      </TableCell>

                      {/* ลงชื่ออาจารย์ที่ปรึกษา (Read-Only) */}
                      <TableCell className="p-3">
                        <Input
                          disabled
                          placeholder="—"
                          className="text-xs h-8 text-center bg-background text-foreground disabled:opacity-100 font-medium"
                          value={group.advisor_name || "—"}
                        />
                      </TableCell>

                      {/* หมายเหตุ (Read-Only) */}
                      <TableCell className="p-3">
                        <Textarea
                          rows={3}
                          disabled
                          className="text-xs resize-none bg-background text-foreground disabled:opacity-100"
                          value={group.remark || "—"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
