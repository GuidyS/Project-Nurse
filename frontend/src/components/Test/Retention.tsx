import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, TrendingDown, Users, UserMinus, GraduationCap, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

// Mock data for retention
const yearlyRetentionData = [
  { year: "2564", enrolled: 320, retained: 305, dropped: 15, rate: 95.3 },
  { year: "2565", enrolled: 335, retained: 318, dropped: 17, rate: 94.9 },
  { year: "2566", enrolled: 350, retained: 330, dropped: 20, rate: 94.3 },
  { year: "2567", enrolled: 365, retained: 348, dropped: 17, rate: 95.3 },
  { year: "2568", enrolled: 380, retained: 365, dropped: 15, rate: 96.1 },
];

const retentionByYearLevel = [
  { level: "ชั้นปีที่ 1", total: 380, retained: 365, rate: 96.1 },
  { level: "ชั้นปีที่ 2", total: 350, retained: 335, rate: 95.7 },
  { level: "ชั้นปีที่ 3", total: 320, retained: 302, rate: 94.4 },
  { level: "ชั้นปีที่ 4", total: 290, retained: 278, rate: 95.9 },
];

const exitReasonsData = [
  { name: "ผลการเรียนไม่ผ่านเกณฑ์", value: 35, color: "hsl(0, 84%, 60%)" },
  { name: "ปัญหาทางการเงิน", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "ย้ายสถาบัน", value: 18, color: "hsl(217, 91%, 50%)" },
  { name: "ปัญหาสุขภาพ", value: 12, color: "hsl(142, 71%, 45%)" },
  { name: "เหตุผลส่วนตัว", value: 7, color: "hsl(280, 60%, 50%)" },
  { name: "อื่นๆ", value: 3, color: "hsl(215, 16%, 47%)" },
];

const monthlyTrendData = [
  { month: "ม.ค.", retained: 98.2, target: 95 },
  { month: "ก.พ.", retained: 97.8, target: 95 },
  { month: "มี.ค.", retained: 96.5, target: 95 },
  { month: "เม.ย.", retained: 96.8, target: 95 },
  { month: "พ.ค.", retained: 95.9, target: 95 },
  { month: "มิ.ย.", retained: 96.1, target: 95 },
];

const recentDropouts = [
  { id: 1, studentId: "64010001", name: "สมชาย ใจดี", faculty: "วิศวกรรมศาสตร์", year: 2, reason: "ปัญหาทางการเงิน", date: "2569-01-15" },
  { id: 2, studentId: "64010045", name: "สมหญิง รักเรียน", faculty: "วิทยาศาสตร์", year: 1, reason: "ย้ายสถาบัน", date: "2569-01-10" },
  { id: 3, studentId: "63010089", name: "วิชัย เก่งมาก", faculty: "บริหารธุรกิจ", year: 3, reason: "ผลการเรียนไม่ผ่านเกณฑ์", date: "2569-01-08" },
  { id: 4, studentId: "65010023", name: "มานี มีสุข", faculty: "ศิลปศาสตร์", year: 1, reason: "เหตุผลส่วนตัว", date: "2569-01-05" },
  { id: 5, studentId: "62010156", name: "ประยุทธ์ ขยันเรียน", faculty: "วิศวกรรมศาสตร์", year: 4, reason: "ปัญหาสุขภาพ", date: "2569-01-02" },
];

export default function Retention() {
  const totalStudents = 1340;
  const retainedStudents = 1280;
  const overallRate = ((retainedStudents / totalStudents) * 100).toFixed(1);

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
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

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="นักศึกษาทั้งหมด"
            value={totalStudents.toLocaleString()}
            subtitle="ทุกชั้นปีรวมกัน"
            icon={Users}
          />
          <StatCard
            title="นักศึกษาคงอยู่"
            value={retainedStudents.toLocaleString()}
            subtitle="ยังคงศึกษาอยู่ในระบบ"
            icon={GraduationCap}
            trend={{ value: 2.3, isPositive: true }}
          />
          <StatCard
            title="อัตราคงอยู่รวม"
            value={`${overallRate}%`}
            subtitle="เป้าหมาย: 95%"
            icon={TrendingUp}
            trend={{ value: 1.1, isPositive: true }}
          />
          <StatCard
            title="ออกกลางคันปีนี้"
            value="60"
            subtitle="ลดลงจากปีก่อน 12 คน"
            icon={UserMinus}
            trend={{ value: 16.7, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Retention Trend by Year */}
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มอัตราคงอยู่รายปี</CardTitle>
              <CardDescription>เปรียบเทียบอัตราการคงอยู่ย้อนหลัง 5 ปี</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyRetentionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis className="text-xs" domain={[90, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'อัตราคงอยู่']}
                    />
                    <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="อัตราคงอยู่" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Exit Reasons Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>สาเหตุการออกกลางคัน</CardTitle>
              <CardDescription>สัดส่วนสาเหตุที่นักศึกษาออกจากระบบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={exitReasonsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {exitReasonsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'สัดส่วน']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend & By Year Level */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มรายเดือน</CardTitle>
              <CardDescription>อัตราคงอยู่เทียบกับเป้าหมาย 95%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" domain={[90, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="retained" stroke="hsl(var(--primary))" strokeWidth={2} name="อัตราจริง" dot={{ fill: 'hsl(var(--primary))' }} />
                    <Line type="monotone" dataKey="target" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" name="เป้าหมาย" />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Retention by Year Level */}
          <Card>
            <CardHeader>
              <CardTitle>อัตราคงอยู่ตามชั้นปี</CardTitle>
              <CardDescription>เปรียบเทียบระหว่างชั้นปี</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionByYearLevel.map((item) => (
                  <div key={item.level} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.level}</span>
                      <span className="text-muted-foreground">
                        {item.retained}/{item.total} ({item.rate}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Dropouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>นักศึกษาออกกลางคันล่าสุด</CardTitle>
            <CardDescription>รายชื่อนักศึกษาที่ออกจากระบบในเดือนนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>คณะ</TableHead>
                  <TableHead>ชั้นปี</TableHead>
                  <TableHead>สาเหตุ</TableHead>
                  <TableHead>วันที่ออก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDropouts.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.faculty}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.reason}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
