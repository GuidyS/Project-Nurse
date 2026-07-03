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
import { TrendingUp, Users, UserMinus, GraduationCap, Calendar, Loader2 } from "lucide-react";
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
  retention: { name: string; value: number }[];
  retentionByYearLevel: { level: string; total: number; retained: number; rate: number }[];
  recentDropouts: { studentId: string; name: string; year: string | number; reason: string }[];
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6"];

export default function Retention() {
  const [data, setData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/index.php?page=get-dean-dashboard");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">อัตราการคงอยู่ของนักศึกษา</h1>
          <p className="text-muted-foreground">วิเคราะห์สัดส่วนนักศึกษาคงอยู่และสาเหตุการออกกลางคัน</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>ปีการศึกษา 2568</span>
          </div>
          <ExportButton reportName="Retention-Report" />
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
                      {data.retention.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
            <CardTitle>อัตราคงอยู่ตามชั้นปี</CardTitle>
            <CardDescription>เปรียบเทียบระหว่างชั้นปี</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data?.retentionByYearLevel && data.retentionByYearLevel.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.retentionByYearLevel}>
                    <XAxis dataKey="level" tick={{ fontSize: 11 }} />
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
          <CardDescription>สถานะที่ไม่ใช่กำลังศึกษาหรือสำเร็จการศึกษา</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสนักศึกษา</TableHead>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>ชั้นปี</TableHead>
                <TableHead>สถานะ/สาเหตุ</TableHead>
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
                      <Badge variant="secondary">{student.reason}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
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
