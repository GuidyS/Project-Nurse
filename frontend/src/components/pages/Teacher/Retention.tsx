import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ExportButton from "@/components/dashboard/ExportButton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, Users, UserMinus, GraduationCap, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

type RetentionData = {
  academic_year?: number;
  stats: {
    total_students: number;
    total_enrolled: number;
    retention_rate: number;
    graduation_rate: number;
    dropped: number;
    graduated: number;
  };
  retention: { name: string; value: number }[];
  retentionByYearLevel: {
    level: string;
    year: number;
    cohortYear?: number;
    cohortCode?: string;
    cohortLabel?: string;
    total: number;
    retained: number;
    rate: number;
  }[];
  recentDropouts: {
    studentId: string;
    name: string;
    year: string | number;
    status: string;
    rawStatus?: string;
    reason: string;
    dropout_date?: string | null;
  }[];
};

// สีประจำสถานะแบบ Fixed ไม่ให้เลื่อนตาม index
const STATUS_COLORS: Record<string, string> = {
  "กำลังศึกษา": "#3b82f6",     // น้ำเงิน
  "คงอยู่": "#3b82f6",
  "สำเร็จการศึกษา": "#22c55e",  // เขียว
  "จบการศึกษา": "#22c55e",
  "พ้นสภาพ": "#ef4444",        // แดง (Fixed)
  "พ้นสภาพ/ลาออก": "#ef4444",  // แดง (Fixed)
  "ลาออก": "#dc2626",          // แดงเข้ม (Fixed)
  "พักการเรียน": "#f59e0b",     // เหลืองอำพัน
};

function getStatusColor(name: string): string {
  if (STATUS_COLORS[name]) return STATUS_COLORS[name];
  if (name.includes("พ้นสภาพ") || name.includes("ลาออก")) return "#ef4444";
  if (name.includes("สำเร็จ") || name.includes("จบ")) return "#22c55e";
  if (name.includes("ศึกษา") || name.includes("คงอยู่")) return "#3b82f6";
  if (name.includes("พัก")) return "#f59e0b";
  return "#8b5cf6";
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status.includes("พ้นสภาพ") || status === "ลาออก") {
    return "destructive";
  }
  if (status === "พักการเรียน") {
    return "secondary";
  }
  return "outline";
}

interface PositionedSliceLabel {
  index: number;
  name: string;
  value: number;
  percent: number;
  color: string;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  lx: number;
  ly: number;
  textX: number;
  textY: number;
  textAnchor: "start" | "end";
}

function calculateDonutLabels(
  slices: { name: string; value: number }[],
  cx: number,
  cy: number,
  outerRadius: number
): Map<number, PositionedSliceLabel> {
  const result = new Map<number, PositionedSliceLabel>();
  if (!slices || slices.length === 0) return result;

  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let currentAngle = 0;

  const rawSlices = slices.map((s, idx) => {
    const sweep = (s.value / total) * 360;
    const midAngle = currentAngle + sweep / 2;
    currentAngle += sweep;

    const rad = -midAngle * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rStart = outerRadius + 4;
    const rElbow = outerRadius + 22;

    return {
      index: idx,
      name: s.name,
      value: s.value,
      percent: s.value / total,
      color: getStatusColor(s.name),
      cos,
      sin,
      sx: cx + rStart * cos,
      sy: cy + rStart * sin,
      initialY: cy + rElbow * sin,
      isRight: cos >= 0,
    };
  });

  const MIN_Y_GAP = 30;

  const adjustSide = (items: typeof rawSlices) => {
    if (items.length === 0) return;
    if (items.length === 1) {
      const it = items[0];
      const isRight = it.isRight;
      const ex = isRight ? cx + outerRadius + 22 : cx - (outerRadius + 22);
      const lx = isRight ? ex + 14 : ex - 14;
      result.set(it.index, {
        index: it.index,
        name: it.name,
        value: it.value,
        percent: it.percent,
        color: it.color,
        sx: it.sx,
        sy: it.sy,
        ex,
        ey: it.initialY,
        lx,
        ly: it.initialY,
        textX: isRight ? lx + 6 : lx - 6,
        textY: it.initialY,
        textAnchor: isRight ? "start" : "end",
      });
      return;
    }

    // เรียงจากบนลงล่างตาม initialY
    const sorted = [...items].sort((a, b) => a.initialY - b.initialY);
    const n = sorted.length;
    const ys = sorted.map((s) => s.initialY);

    // Forward pass ป้องกันไม่ให้ทับกัน (ห่างอย่างน้อย MIN_Y_GAP)
    for (let i = 1; i < n; i++) {
      if (ys[i] - ys[i - 1] < MIN_Y_GAP) {
        ys[i] = ys[i - 1] + MIN_Y_GAP;
      }
    }

    // จัดกลุ่มให้อยู่กึ่งกลางรอบค่าเฉลี่ยเดิม
    const initialMean = sorted.reduce((sum, s) => sum + s.initialY, 0) / n;
    const currentMean = ys.reduce((sum, y) => sum + y, 0) / n;
    const shift = initialMean - currentMean;
    for (let i = 0; i < n; i++) {
      ys[i] += shift;
    }

    // Backward pass ตรวจสอบระยะห่างอีกครั้ง
    for (let i = n - 2; i >= 0; i--) {
      if (ys[i + 1] - ys[i] < MIN_Y_GAP) {
        ys[i] = ys[i + 1] - MIN_Y_GAP;
      }
    }

    sorted.forEach((it, i) => {
      const isRight = it.isRight;
      const ey = ys[i];
      const ex = isRight ? cx + outerRadius + 22 : cx - (outerRadius + 22);
      const lx = isRight ? ex + 14 : ex - 14;
      result.set(it.index, {
        index: it.index,
        name: it.name,
        value: it.value,
        percent: it.percent,
        color: it.color,
        sx: it.sx,
        sy: it.sy,
        ex,
        ey,
        lx,
        ly: ey,
        textX: isRight ? lx + 6 : lx - 6,
        textY: ey,
        textAnchor: isRight ? "start" : "end",
      });
    });
  };

  adjustSide(rawSlices.filter((s) => s.isRight));
  adjustSide(rawSlices.filter((s) => !s.isRight));

  return result;
}

export default function Retention() {
  const [data, setData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/index.php?page=get-retention");
        if (res.data.status === "success") {
          setData(res.data.data);
        } else {
          setError(res.data.message || "ไม่สามารถโหลดข้อมูลได้");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "ไม่สามารถเชื่อมต่อ API ได้");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats;
  const retainedStudents = (stats?.total_students ?? 0) + (stats?.graduated ?? 0);
  const academicYear = data?.academic_year || 2569;
  const year1CohortCode = String(academicYear).slice(-2);

  // กรองเฉพาะชั้นปีที่ 1 - 4 ตามลำดับ (เกิน ปี4 ไม่ต้องดึงมา)
  const barChartData = (data?.retentionByYearLevel || [])
    .filter((item) => item.year >= 1 && item.year <= 4)
    .sort((a, b) => a.year - b.year);

  const handleExportExcel = () => {
    if (!data) {
      toast({
        title: "ไม่มีข้อมูลสำหรับส่งออก",
        variant: "destructive",
      });
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      // แผ่นที่ 1: สรุปภาพรวมและสัดส่วน
      const summaryRows = [
        ["รายงานอัตราการคงอยู่ของนักศึกษา คณะพยาบาลศาสตร์"],
        [`ประจำปีการศึกษา: ${academicYear}`],
        [`วันที่ส่งออกข้อมูล: ${new Date().toLocaleDateString("th-TH")}`],
        [],
        ["1. ตัวชี้วัดภาพรวม"],
        ["ตัวชี้วัด", "จำนวน/ค่า", "หน่วย/คำอธิบาย"],
        ["นักศึกษาทั้งหมด", stats?.total_enrolled ?? 0, "คน"],
        ["นักศึกษาคงอยู่", retainedStudents, "คน (กำลังศึกษา + สำเร็จการศึกษา)"],
        ["อัตราการคงอยู่รวม", `${stats?.retention_rate ?? 0}%`, "เป้าหมาย 95%"],
        ["ออกกลางคัน", stats?.dropped ?? 0, "คน (พ้นสภาพ / ลาออก / พักการเรียน)"],
        [],
        ["2. สัดส่วนสถานะนักศึกษา"],
        ["สถานะ", "จำนวน (คน)", "คิดเป็นร้อยละ (%)"],
        ...(data.retention || []).map((r) => [
          r.name,
          r.value,
          stats?.total_enrolled ? `${((r.value / stats.total_enrolled) * 100).toFixed(1)}%` : "0%",
        ]),
        [],
        [`3. อัตราคงอยู่ตามชั้นปี (ปีการศึกษา ${academicYear})`],
        ["ชั้นปี", "รหัสรุ่นนักศึกษา", "นักศึกษาทั้งหมด (คน)", "คงอยู่ (คน)", "อัตราคงอยู่ (%)"],
        ...barChartData.map((y) => [
          y.level,
          y.cohortLabel || `รหัส ${String(academicYear - y.year + 1).slice(-2)}`,
          y.total,
          y.retained,
          `${y.rate}%`,
        ]),
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "ภาพรวมอัตราคงอยู่");

      // แผ่นที่ 2: รายชื่อนักศึกษาออกกลางคัน
      const dropoutHeaders = ["ลำดับ", "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ชั้นปี", "สถานะ", "สาเหตุ", "วันที่บันทึก"];
      const dropoutRows = (data.recentDropouts || []).map((s, idx) => [
        idx + 1,
        s.studentId,
        s.name,
        typeof s.year === "number" ? `ปี ${s.year}` : s.year,
        s.status,
        s.reason || "-",
        s.dropout_date || "-",
      ]);
      const wsDropouts = XLSX.utils.aoa_to_sheet([
        [`รายชื่อนักศึกษาออกกลางคันล่าสุด (ปีการศึกษา ${academicYear})`],
        [],
        dropoutHeaders,
        ...dropoutRows,
      ]);
      XLSX.utils.book_append_sheet(wb, wsDropouts, "นักศึกษาออกกลางคัน");

      // บันทึกไฟล์
      XLSX.writeFile(wb, `รายงานอัตราการคงอยู่ของนักศึกษา_ปีการศึกษา_${academicYear}.xlsx`);

      toast({
        title: "ส่งออกข้อมูลสำเร็จ",
        description: `ดาวน์โหลดไฟล์รายงานประจำปีการศึกษา ${academicYear} เรียบร้อยแล้ว`,
      });
    } catch (err: any) {
      console.error("Export error:", err);
      toast({
        title: "เกิดข้อผิดพลาดในการส่งออกข้อมูล",
        description: err.message || "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังโหลดข้อมูลอัตราคงอยู่...
      </div>
    );
  }

  const renderCollisionFreeLabel = (props: any) => {
    const { cx, cy, outerRadius, index } = props;
    if (!data?.retention || data.retention.length === 0) return null;

    const labelsMap = calculateDonutLabels(data.retention, cx, cy, outerRadius || 80);
    const item = labelsMap.get(index);
    if (!item) return null;

    const pct = (item.percent * 100).toFixed(1);

    return (
      <g key={`leader-label-${index}`} className="transition-all duration-200">
        {/* จุดเริ่มต้นบนขอบชิ้นเค้ก */}
        <circle cx={item.sx} cy={item.sy} r={2.5} fill={item.color} />
        {/* เส้นชี้หักมุม (Leader line) */}
        <path
          d={`M ${item.sx} ${item.sy} L ${item.ex} ${item.ey} L ${item.lx} ${item.ly}`}
          stroke={item.color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.85}
        />
        {/* ข้อความอธิบายสถานะ สัดส่วน และจำนวนคน */}
        <text
          x={item.textX}
          y={item.textY}
          textAnchor={item.textAnchor}
          dominantBaseline="central"
          className="text-xs select-none"
        >
          <tspan fontWeight="700" fill={item.color}>
            {item.name}
          </tspan>
          <tspan dx={5} fill="hsl(var(--foreground))" fontWeight="500">
            {pct}%
          </tspan>
          <tspan dx={4} fill="hsl(var(--muted-foreground))" fontSize="11">
            ({item.value} คน)
          </tspan>
        </text>
      </g>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">อัตราการคงอยู่ของนักศึกษา</h1>
          <p className="app-page-description">วิเคราะห์สัดส่วนนักศึกษาคงอยู่และสาเหตุการออกกลางคัน</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton reportName="Retention-Report" onExport={handleExportExcel} />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="นักศึกษาทั้งหมด"
          value={(stats?.total_enrolled ?? 0).toLocaleString()}
          subtitle="ทุกสถานะในระบบ"
          icon={Users}
        />
        <StatCard
          title="นักศึกษาคงอยู่"
          value={retainedStudents.toLocaleString()}
          subtitle="คงอยู่ + สำเร็จการศึกษา"
          icon={GraduationCap}
        />
        <StatCard
          title="อัตราคงอยู่รวม"
          value={`${stats?.retention_rate ?? 0}%`}
          subtitle="เป้าหมาย: 95%"
          icon={TrendingUp}
        />
        <StatCard
          title="ออกกลางคัน"
          value={String(stats?.dropped ?? 0)}
          subtitle="พ้นสภาพ / ลาออก / พักการเรียน"
          icon={UserMinus}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนสถานะนักศึกษา</CardTitle>
            <CardDescription>จากข้อมูล student.status พร้อมเส้นชี้จำแนกแต่ละสถานะ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[340px]">
              {data?.retention && data.retention.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.retention}
                      cx="50%"
                      cy="46%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={renderCollisionFreeLabel}
                      labelLine={false}
                    >
                      {data.retention.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={getStatusColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number, name: string) => [
                        `${val.toLocaleString()} คน (${stats?.total_enrolled ? ((val / stats.total_enrolled) * 100).toFixed(1) : 0}%)`,
                        name,
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      content={({ payload }) => (
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-xs">
                          {payload?.map((entry: any, index: number) => {
                            const item = data?.retention?.find((r) => r.name === entry.value);
                            const count = item?.value ?? 0;
                            const total = stats?.total_enrolled || 1;
                            const pct = ((count / total) * 100).toFixed(1);
                            return (
                              <div key={`legend-${index}`} className="flex items-center gap-1.5 font-medium">
                                <span
                                  className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-foreground">{entry.value}:</span>
                                <span className="text-muted-foreground">{count.toLocaleString()} คน ({pct}%)</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center pt-16">ไม่มีข้อมูล</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>อัตราการคงอยู่ของปีการศึกษา {academicYear}</CardTitle>
            <CardDescription>
              เปรียบเทียบชั้นปีที่ 1 - 4 (ปี 1: นศ. รหัส {year1CohortCode})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[340px]">
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="level" tick={{ fontSize: 13 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(v: number, _name: string, entry: any) => {
                        const payload = entry?.payload;
                        const cohortText = payload?.cohortLabel ? ` (${payload.cohortLabel})` : "";
                        const details = payload ? ` [คงอยู่ ${payload.retained}/${payload.total} คน]` : "";
                        return [`${v}%${details}`, `อัตราคงอยู่${cohortText}`];
                      }}
                    />
                    <Bar dataKey="rate" name="อัตราคงอยู่ (%)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center pt-16">ไม่มีข้อมูลชั้นปี</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>นักศึกษาออกกลางคันล่าสุด</CardTitle>
          <CardDescription>สถานะที่ไม่ใช่กำลังศึกษาหรือสำเร็จการศึกษา (สอดคล้องกับข้อมูลในจัดการผู้ใช้)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสนักศึกษา</TableHead>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>ชั้นปี</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>สาเหตุ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.recentDropouts && data.recentDropouts.length > 0 ? (
                data.recentDropouts.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{typeof student.year === "number" ? `ปี ${student.year}` : student.year}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(student.status)} className="font-normal">
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.reason}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    ไม่มีข้อมูลนักศึกษาที่ออกกลางคัน
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
