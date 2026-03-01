import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, BarChart3, PieChart } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

// Mock data
const gradeDistribution = [
  { grade: 'A', count: 12, color: '#22c55e' },
  { grade: 'B+', count: 8, color: '#84cc16' },
  { grade: 'B', count: 10, color: '#eab308' },
  { grade: 'C+', count: 7, color: '#f97316' },
  { grade: 'C', count: 5, color: '#ef4444' },
  { grade: 'D+', count: 2, color: '#dc2626' },
  { grade: 'D', count: 1, color: '#b91c1c' },
  { grade: 'F', count: 0, color: '#7f1d1d' },
];

const cloAchievement = [
  { name: 'CLO1', achieved: 85, target: 80 },
  { name: 'CLO2', achieved: 78, target: 80 },
  { name: 'CLO3', achieved: 92, target: 80 },
  { name: 'CLO4', achieved: 75, target: 80 },
];

export default function CourseReports() {
  const [selectedCourse, setSelectedCourse] = useState('NUR101');

  const handleExport = (format: string) => {
    console.log('Exporting as:', format);
  };

  const totalStudents = gradeDistribution.reduce((acc, g) => acc + g.count, 0);
  const passRate = Math.round(((gradeDistribution.filter(g => !['F'].includes(g.grade)).reduce((acc, g) => acc + g.count, 0)) / totalStudents) * 100);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายงานรายวิชา</h1>
            <p className="text-muted-foreground">สรุปผลการเรียนและ CLO</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Course Selection */}
        <Card>
          <CardContent className="pt-6">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="เลือกรายวิชา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NUR101">NUR101 - พื้นฐานการพยาบาล</SelectItem>
                <SelectItem value="NUR201">NUR201 - การพยาบาลผู้ใหญ่ 1</SelectItem>
                <SelectItem value="NUR301">NUR301 - การพยาบาลเด็ก</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักศึกษาทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราผ่าน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{passRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เกรดเฉลี่ย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.25</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CLO บรรลุ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3/4</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                การกระจายเกรด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={gradeDistribution.filter(g => g.count > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="grade"
                    label={({ grade, count }) => `${grade}: ${count}`}
                  >
                    {gradeDistribution.filter(g => g.count > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ผลลัพธ์ CLO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cloAchievement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="achieved" name="ผลลัพธ์จริง" fill="hsl(var(--primary))" />
                  <Bar dataKey="target" name="เป้าหมาย" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
