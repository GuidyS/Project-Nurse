import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, CircleDashed, Award } from "lucide-react";

/**
 * ผลการประเมินสมรรถนะหลักของนักศึกษา 1 คน
 *
 * ใช้ร่วมกันทั้งหน้าของอาจารย์ที่ปรึกษาและหน้าของนักศึกษา
 * เพื่อให้ทั้งสองหน้าหน้าตาเหมือนกันเสมอ
 */

/** สถานะการบรรลุที่ backend คำนวณมาจากคะแนนรายวิชา */
export type OutcomeStatus = "achieved" | "not_achieved" | "pending" | "none";

export interface CompetencyItemRow {
  id: number;
  plo_id: number;
  sequence_no: number;
  sub_plo_code: string;
  competency_name: string;
  is_scorable: number;
  status: OutcomeStatus;
  earned: number;
  required: number;
  possible: number;
  sources: number;
}

export interface PloSummary {
  status: OutcomeStatus;
  total: number;
  achieved: number;
  pending: number;
}

export interface PloGroup {
  plo_id: number;
  plo_code: string;
  plo_name: string;
  items: CompetencyItemRow[];
  summary?: PloSummary;
}

export interface FinalPloRow {
  plo_id: number;
  plo_code: string;
  plo_name: string;
  status: OutcomeStatus;
  total: number;
  achieved: number;
  pending: number;
  earned: number;
  required: number;
}

export interface FinalSummary {
  overall_status: OutcomeStatus;
  plo_total: number;
  plo_achieved: number;
  plo_pending: number;
  plos: FinalPloRow[];
}

export const formatScore = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? "—"
    : Number.isInteger(value) ? String(value) : String(Number(Number(value).toFixed(2)));

/** ป้ายสถานะ บรรลุ / ไม่บรรลุ / ยังไม่ประเมิน */
export function StatusBadge({ status, size = "default" }: { status: OutcomeStatus; size?: "default" | "lg" }) {
  const cls = size === "lg" ? "text-sm px-3 py-1" : "text-xs";

  if (status === "achieved") {
    return (
      <Badge className={`gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ${cls}`}>
        <CheckCircle2 className="h-3.5 w-3.5" /> บรรลุ
      </Badge>
    );
  }
  if (status === "not_achieved") {
    return (
      <Badge variant="destructive" className={`gap-1 ${cls}`}>
        <XCircle className="h-3.5 w-3.5" /> ไม่บรรลุ
      </Badge>
    );
  }
  if (status === "none") {
    return <Badge variant="secondary" className={cls}>ไม่กำหนดตัวชี้วัด</Badge>;
  }
  return (
    <Badge variant="outline" className={`gap-1 text-muted-foreground ${cls}`}>
      <CircleDashed className="h-3.5 w-3.5" /> ยังไม่ประเมิน
    </Badge>
  );
}

export function CompetencyResultView({
  groups,
  yearLevel,
  finalSummary,
  isLoading,
}: {
  groups: PloGroup[];
  yearLevel: number | null;
  finalSummary: FinalSummary | null;
  isLoading: boolean;
}) {
  const hasItems = groups.some((g) => g.items.length > 0);

  if (isLoading) {
    return <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!hasItems) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          ยังไม่มีรายการประเมินสำหรับชั้นปีนี้
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* ตารางรายข้อของชั้นปีปัจจุบัน */}
      <Card className="shadow-sm overflow-hidden border border-border">
        <CardContent className="p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground">
                <th className="w-[150px] py-3 px-2 text-center font-bold border-r border-border text-foreground">
                  สมรรถนะชั้นปีที่ {yearLevel || "—"}
                </th>
                <th className="py-3 px-4 text-left font-bold border-r border-border text-foreground">รายการประเมินสมรรถนะ</th>
                <th className="w-[150px] py-3 px-2 text-center font-bold border-r border-border text-foreground">คะแนนรวม / เกณฑ์</th>
                <th className="w-[150px] py-3 px-2 text-center font-bold text-foreground">ผลการประเมิน</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) =>
                g.items.length === 0 ? null : (
                  <React.Fragment key={g.plo_id}>
                    <tr className="border-b bg-muted/30">
                      <td colSpan={3} className="py-2.5 px-4 font-semibold text-sm text-foreground bg-accent/20 border-b border-border">
                        {g.plo_code} {g.plo_name}
                      </td>
                      <td className="py-2.5 px-2 text-center bg-accent/20 border-b border-border">
                        {g.summary && <StatusBadge status={g.summary.status} />}
                      </td>
                    </tr>

                    {g.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-2 text-center text-muted-foreground font-medium border-r border-border align-middle">
                          {item.sub_plo_code}
                        </td>
                        <td className="py-3 px-4 text-foreground border-r border-border align-middle leading-relaxed">
                          <span className={!item.is_scorable ? "text-muted-foreground italic" : ""}>
                            {item.competency_name}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-muted-foreground border-r border-border align-middle">
                          {!item.is_scorable || item.sources === 0
                            ? "—"
                            : `${formatScore(item.earned)} / ${formatScore(item.required)}`}
                        </td>
                        <td className="py-3 px-2 text-center align-middle">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* สรุปรวมตอนจบชั้นปีที่ 4 — ชั้นปีอื่นไม่มีส่วนนี้ */}
      {finalSummary && (
        <Card className="border-primary/40 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60 bg-primary/5">
            <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base">
              <span className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                สรุปผลเมื่อจบชั้นปีที่ 4 — ครบตามหลักสูตรหรือไม่
              </span>
              <StatusBadge status={finalSummary.overall_status} size="lg" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              บรรลุแล้ว <span className="font-semibold text-foreground">{finalSummary.plo_achieved}</span> จาก{" "}
              <span className="font-semibold text-foreground">{finalSummary.plo_total}</span> PLO
              {finalSummary.plo_pending > 0 && ` (ยังไม่ประเมิน ${finalSummary.plo_pending} PLO)`}
              {" "}— รวมผลการเรียนทั้ง 4 ชั้นปี
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th className="w-[90px] py-2.5 px-3 text-left font-bold text-foreground">PLO</th>
                    <th className="py-2.5 px-3 text-left font-bold text-foreground">ผลลัพธ์การเรียนรู้</th>
                    <th className="w-[120px] py-2.5 px-3 text-center font-bold text-foreground">สมรรถนะที่ผ่าน</th>
                    <th className="w-[140px] py-2.5 px-3 text-center font-bold text-foreground">คะแนนรวม / เกณฑ์</th>
                    <th className="w-[130px] py-2.5 px-3 text-center font-bold text-foreground">ผล</th>
                  </tr>
                </thead>
                <tbody>
                  {finalSummary.plos.map((row) => (
                    <tr key={row.plo_id} className="border-b border-border/60">
                      <td className="py-2.5 px-3 font-semibold text-primary align-top">{row.plo_code}</td>
                      <td className="py-2.5 px-3 text-foreground leading-relaxed">{row.plo_name}</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {row.achieved} / {row.total}
                      </td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">
                        {formatScore(row.earned)} / {formatScore(row.required)}
                      </td>
                      <td className="py-2.5 px-3 text-center"><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
