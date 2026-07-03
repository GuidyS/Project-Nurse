import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import ExportButton from "@/components/dashboard/ExportButton";
import { Users, GraduationCap, UserCheck, TrendingUp, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import api from "@/lib/axios";

type DeanStats = {
  total_students: number;
  total_enrolled: number;
  retention_rate: number;
  graduation_rate: number;
  total_faculty: number;
  total_budget: number;
  dropped: number;
  graduated: number;
};

type DeanData = {
  stats: DeanStats;
  retention: { name: string; value: number }[];
  financial: { projects: { name: string; budget: number }[] };
  grades: { grade: string; count: number }[];
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b"];

const formatBudget = (value: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);

export default function DeanDashboard() {
  const [data, setData] = useState<DeanData | null>(null);
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
        setError(err.response?.data?.message || "ไม่สามารถเชื่อมต่อ Dean Dashboard API ได้");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดคณบดี</h1>
          <p className="text-muted-foreground">ภาพรวม KPI และรายงานสำหรับผู้บริหาร</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>ปีการศึกษา 2568</span>
          </div>
          <ExportButton reportName="Dashboard-KPI-Report" />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="นักศึกษากำลังศึกษา"
          value={loading ? "..." : (stats?.total_students ?? 0).toLocaleString()}
          subtitle={`ทั้งหมดในระบบ ${stats?.total_enrolled ?? 0} คน`}
          icon={GraduationCap}
        />
        <StatCard
          title="อาจารย์ทั้งหมด"
          value={loading ? "..." : String(stats?.total_faculty ?? 0)}
          subtitle="จากตาราง faculty"
          icon={Users}
        />
        <StatCard
          title="อัตราคงอยู่"
          value={loading ? "..." : `${stats?.retention_rate ?? 0}%`}
          subtitle={`ออกกลางคัน ${stats?.dropped ?? 0} คน`}
          icon={UserCheck}
        />
        <StatCard
          title="อัตราจบการศึกษา"
          value={loading ? "..." : `${stats?.graduation_rate ?? 0}%`}
          subtitle={`สำเร็จการศึกษา ${stats?.graduated ?? 0} คน`}
          icon={TrendingUp}
        />
      </div>

      <Tabs defaultValue="kpi" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="retention">การคงอยู่</TabsTrigger>
          <TabsTrigger value="financial">รายงานการเงิน</TabsTrigger>
        </TabsList>

        <TabsContent value="kpi" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">สัดส่วนเกรด (assessments)</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                {data?.grades && data.grades.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.grades}>
                      <XAxis dataKey="grade" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="จำนวน" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-8 text-center">ไม่มีข้อมูลเกรด</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">งบประมาณโครงการรวม</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{loading ? "..." : formatBudget(stats?.total_budget ?? 0)}</p>
                <p className="text-sm text-muted-foreground mt-2">รวมจากตาราง project</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">สถานะนักศึกษา</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {data?.retention && data.retention.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.retention}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {data.retention.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground pt-8 text-center">ไม่มีข้อมูลการคงอยู่</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>โครงการตามงบประมาณ (Top 5)</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                {data?.financial?.projects && data.financial.projects.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.financial.projects}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip formatter={(v: number) => formatBudget(v)} />
                      <Bar dataKey="budget" name="งบประมาณ" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-8 text-center">ไม่มีข้อมูลโครงการ</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg">บทสรุปผู้บริหาร</h3>
                <p className="text-sm opacity-90 mt-2">
                  งบประมาณรวม {formatBudget(stats?.total_budget ?? 0)} อัตราคงอยู่ {stats?.retention_rate ?? 0}%
                  นักศึกษากำลังศึกษา {stats?.total_students ?? 0} คน
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
