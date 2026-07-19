import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

// สีมาตรฐานของกราฟชุดแดชบอร์ด
const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6", "#f97316"];

const EmptyChart = ({ message }: { message: string }) => (
  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{message}</div>
);

// กราฟจำนวนนักศึกษาแยกชั้นปี (ข้อมูลจริงจาก API: students_by_year)
export const StudentKPIChart = ({ data = [] }: { data?: { name: string; total: number }[] }) => (
  <Card className="h-[320px]">
    <CardHeader><CardTitle className="text-sm">สถิตินักศึกษาแยกตามชั้นปี</CardTitle></CardHeader>
    <CardContent className="h-[240px]">
      {data.length === 0 ? (
        <EmptyChart message="ยังไม่มีข้อมูลนักศึกษา" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" name="จำนวน (คน)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

// กราฟอาจารย์แยกตามตำแหน่งวิชาการ (ข้อมูลจริงจาก API: faculty_by_position)
export const TeacherKPIChart = ({ data = [] }: { data?: { name: string; total: number }[] }) => (
  <Card className="h-[320px]">
    <CardHeader><CardTitle className="text-sm">อาจารย์แยกตามตำแหน่งวิชาการ</CardTitle></CardHeader>
    <CardContent className="h-[240px]">
      {data.length === 0 ? (
        <EmptyChart message="ยังไม่มีข้อมูลอาจารย์" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80}
              label={({ name, total }) => `${name}: ${total}`}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

// กราฟการคงอยู่ของนักศึกษา (ข้อมูลจริงจาก API: retention)
export const RetentionChart = ({ data = [] }: { data?: { name: string; value: number }[] }) => (
  <Card className="h-[320px]">
    <CardHeader><CardTitle className="text-sm">สถานะการคงอยู่ของนักศึกษา</CardTitle></CardHeader>
    <CardContent className="h-[240px]">
      {data.length === 0 ? (
        <EmptyChart message="ยังไม่มีข้อมูลการคงอยู่" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
              label={({ name, value }) => `${name}: ${value} คน`}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.name === "กำลังศึกษา" ? "#22c55e" : entry.name === "สำเร็จการศึกษา" ? "#3b82f6" : "#ef4444"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

// กราฟการกระจายเกรดรวมทั้งคณะ (ข้อมูลจริงจาก API: grades)
export const ExitReasonsChart = ({ grades = [] }: { grades?: { grade: string; count: number }[] }) => (
  <Card className="h-[320px]">
    <CardHeader><CardTitle className="text-sm">การกระจายเกรดรวม</CardTitle></CardHeader>
    <CardContent className="h-[240px]">
      {grades.length === 0 ? (
        <EmptyChart message="ยังไม่มีข้อมูลเกรด" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={grades}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="จำนวน (คน)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);