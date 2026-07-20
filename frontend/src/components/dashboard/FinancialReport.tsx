import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ProjectBudgetItem {
  name: string;
  budget: number;
}

interface FinancialStats {
  total_students?: number;
  total_faculty?: number;
  retention_rate?: number;
  total_budget?: number;
}

const formatTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

// กราฟงบประมาณโครงการ (ข้อมูลจริงจาก API: financial.projects)
export const FinancialReport = ({ projects = [] }: { projects?: ProjectBudgetItem[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>สรุปงบประมาณโครงการ</CardTitle>
      <CardDescription>โครงการที่ได้รับงบประมาณสูงสุด (Top 5)</CardDescription>
    </CardHeader>
    <CardContent className="h-[280px]">
      {projects.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          ยังไม่มีข้อมูลงบประมาณโครงการ
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={projects.map(p => ({ ...p, budget: Number(p.budget) }))} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={140} />
            <Tooltip formatter={(v: number) => formatTHB(v)} />
            <Bar dataKey="budget" name="งบประมาณ" fill="#22c55e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

// บทสรุปผู้บริหาร (สร้างจากตัวเลขจริงใน stats)
export const ExecutiveSummary = ({ stats }: { stats?: FinancialStats }) => (
  <Card className="bg-primary text-primary-foreground">
    <CardContent className="pt-6 space-y-2">
      <h3 className="font-bold text-lg">บทสรุปผู้บริหาร</h3>
      {stats ? (
        <ul className="text-sm opacity-90 space-y-1 list-disc pl-4">
          <li>นักศึกษากำลังศึกษา {stats.total_students?.toLocaleString()} คน (อัตราคงอยู่ {stats.retention_rate}%)</li>
          <li>อาจารย์ประจำ {stats.total_faculty?.toLocaleString()} คน</li>
          <li>งบประมาณโครงการรวม {formatTHB(stats.total_budget || 0)}</li>
        </ul>
      ) : (
        <p className="text-sm opacity-90">ภาพรวมการดำเนินงานของคณะพยาบาลศาสตร์</p>
      )}
    </CardContent>
  </Card>
);