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

type RetentionData = {
  stats: {
    total_students: number;
    total_enrolled: number;
    retention_rate: number;
    graduation_rate: number;
    dropped: number;
    graduated: number;
  };
  academicYear: number;
  retention: { name: string; statusKey: string; value: number }[];
  retentionByYearLevel: {
    level: string;
    label: string;
    admissionYear: number;
    total: number;
    retained: number;
    rate: number;
  }[];
  recentDropouts: {
    studentId: string;
    name: string;
    year: string | number;
    statusKey: string;
    statusLabel: string;
    reason: string | null;
  }[];
};

/**
 * ล็อกสีตามสถานะ ไม่ใช่ตามลำดับในกราฟ
 * ถ้าใช้ลำดับ พอสถานะไหนหายไปสีจะร่นมาแทนที่กัน เช่น "พ้นสภาพ" กลายเป็นสีเขียว
 */
const STATUS_COLORS: Record<string, string> = {
  active: "#3b82f6",    // คงอยู่ — น้ำเงิน
  graduated: "#22c55e", // จบการศึกษา — เขียว
  onleave: "#f59e0b",   // พักการเรียน — เหลือง
  resigned: "#ef4444",  // ลาออก — แดง
  dropped: "#b91c1c",   // พ้นสภาพ — แดงเข้ม
  other: "#94a3b8",     // ค่าที่ไม่รู้จัก — เทา
};

const statusColor = (statusKey: string) => STATUS_COLORS[statusKey] ?? STATUS_COLORS.other;

export default function Retention() {
  const [data, setData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังโหลดข้อมูลอัตราคงอยู่...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">อัตราการคงอยู่ของนักศึกษา</h1>
          <p className="app-page-description">วิเคราะห์สัดส่วนนักศึกษาคงอยู่และสาเหตุการออกกลางคัน</p>
        </div>
        <ExportButton reportName="Retention-Report" />
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
          subtitle="กำลังศึกษา + สำเร็จการศึกษา"
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
          subtitle="พ้นสภาพ / ลาออก"
          icon={UserMinus}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนสถานะนักศึกษา</CardTitle>
            <CardDescription>จากข้อมูล student.status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data?.retention && data.retention.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.retention}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.retention.map((entry) => (
                        <Cell key={entry.statusKey} fill={statusColor(entry.statusKey)} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
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
            <CardTitle>
              อัตราการคงอยู่ของปีการศึกษา {data?.academicYear ?? "—"}
            </CardTitle>
            <CardDescription>
              เปรียบเทียบชั้นปีที่ 1-4 พร้อมรหัสรุ่น (ชั้นปีที่เกิน 4 ไม่นำมาแสดง)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data?.retentionByYearLevel && data.retentionByYearLevel.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.retentionByYearLevel}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => [`${v}%`, "อัตราคงอยู่"]} />
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
          <CardDescription>สถานะที่ไม่ใช่ "คงอยู่" หรือ "จบการศึกษา"</CardDescription>
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
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      {/* ใช้สีเดียวกับกราฟโดนัท จะได้อ่านคู่กันได้ */}
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: statusColor(student.statusKey),
                          color: statusColor(student.statusKey),
                        }}
                      >
                        {student.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.reason ?? "-"}
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
