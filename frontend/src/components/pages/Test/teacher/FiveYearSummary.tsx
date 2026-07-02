import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, TrendingDown, Minus, BarChart3, FileText } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

// Mock data for 5 years
const yearlyData = [
  { year: '2562', graduates: 245, employmentRate: 92, avgGPA: 3.15, plo1: 85, plo2: 78, plo3: 82, plo4: 88, plo5: 75 },
  { year: '2563', graduates: 258, employmentRate: 88, avgGPA: 3.22, plo1: 87, plo2: 80, plo3: 84, plo4: 86, plo5: 78 },
  { year: '2564', graduates: 262, employmentRate: 85, avgGPA: 3.18, plo1: 86, plo2: 82, plo3: 85, plo4: 87, plo5: 80 },
  { year: '2565', graduates: 270, employmentRate: 91, avgGPA: 3.25, plo1: 88, plo2: 84, plo3: 86, plo4: 89, plo5: 82 },
  { year: '2566', graduates: 275, employmentRate: 94, avgGPA: 3.28, plo1: 90, plo2: 85, plo3: 88, plo4: 91, plo5: 84 },
];

const courseData = [
  { code: 'NUR101', name: 'พื้นฐานการพยาบาล', y2562: 3.12, y2563: 3.18, y2564: 3.15, y2565: 3.22, y2566: 3.25, trend: 'up' },
  { code: 'NUR201', name: 'การพยาบาลผู้ใหญ่ 1', y2562: 3.05, y2563: 3.08, y2564: 3.10, y2565: 3.15, y2566: 3.18, trend: 'up' },
  { code: 'NUR202', name: 'การพยาบาลผู้ใหญ่ 2', y2562: 2.95, y2563: 2.98, y2564: 3.02, y2565: 3.05, y2566: 3.08, trend: 'up' },
  { code: 'NUR301', name: 'การพยาบาลเด็ก', y2562: 3.20, y2563: 3.18, y2564: 3.15, y2565: 3.22, y2566: 3.25, trend: 'stable' },
  { code: 'NUR302', name: 'การพยาบาลจิตเวช', y2562: 3.30, y2563: 3.28, y2564: 3.25, y2565: 3.22, y2566: 3.20, trend: 'down' },
  { code: 'NUR401', name: 'การบริหารการพยาบาล', y2562: 3.40, y2563: 3.42, y2564: 3.45, y2565: 3.48, y2566: 3.50, trend: 'up' },
];

const ploChartData = yearlyData.map(y => ({
  year: y.year,
  'PLO1: ความรู้': y.plo1,
  'PLO2: ทักษะ': y.plo2,
  'PLO3: จริยธรรม': y.plo3,
  'PLO4: สื่อสาร': y.plo4,
  'PLO5: เทคโนโลยี': y.plo5,
}));

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function FiveYearSummary() {
  const [selectedProgram, setSelectedProgram] = useState('all');

  const handleExport = (format: string) => {
    console.log('Exporting as:', format);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ผลสรุป 5 ปี</h1>
            <p className="text-muted-foreground">สรุปผลการดำเนินงานหลักสูตร 5 ปีย้อนหลัง</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกหลักสูตร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหลักสูตร</SelectItem>
                <SelectItem value="nursing">พยาบาลศาสตร์</SelectItem>
                <SelectItem value="public_health">สาธารณสุขศาสตร์</SelectItem>
              </SelectContent>
            </Select>
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

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">บัณฑิตรวม 5 ปี</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {yearlyData.reduce((acc, y) => acc + y.graduates, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราการมีงานทำเฉลี่ย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(yearlyData.reduce((acc, y) => acc + y.employmentRate, 0) / yearlyData.length).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">เฉลี่ย 5 ปี</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPA เฉลี่ย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(yearlyData.reduce((acc, y) => acc + y.avgGPA, 0) / yearlyData.length).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">เฉลี่ย 5 ปี</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แนวโน้ม PLO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <span className="text-2xl font-bold text-green-600">ดีขึ้น</span>
              </div>
              <p className="text-xs text-muted-foreground">ทุกด้านมีพัฒนาการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                จำนวนบัณฑิตและอัตราการมีงานทำ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="graduates" name="บัณฑิต (คน)" fill="hsl(var(--primary))" />
                  <Line yAxisId="right" type="monotone" dataKey="employmentRate" name="มีงานทำ (%)" stroke="#22c55e" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                แนวโน้มผลลัพธ์การเรียนรู้ (PLO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ploChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="PLO1: ความรู้" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="PLO2: ทักษะ" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="PLO3: จริยธรรม" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="PLO4: สื่อสาร" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="PLO5: เทคโนโลยี" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Course Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>สรุปผลรายวิชา 5 ปี</CardTitle>
            <CardDescription>เกรดเฉลี่ยรายวิชาย้อนหลัง 5 ปี</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสวิชา</TableHead>
                  <TableHead>ชื่อวิชา</TableHead>
                  <TableHead className="text-center">2562</TableHead>
                  <TableHead className="text-center">2563</TableHead>
                  <TableHead className="text-center">2564</TableHead>
                  <TableHead className="text-center">2565</TableHead>
                  <TableHead className="text-center">2566</TableHead>
                  <TableHead className="text-center">แนวโน้ม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseData.map((course) => (
                  <TableRow key={course.code}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell className="text-center">{course.y2562.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{course.y2563.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{course.y2564.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{course.y2565.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{course.y2566.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(course.trend)}
                        <Badge
                          variant={
                            course.trend === 'up'
                              ? 'default'
                              : course.trend === 'down'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {course.trend === 'up' ? 'ดีขึ้น' : course.trend === 'down' ? 'ลดลง' : 'คงที่'}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Yearly Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>ตารางสรุปรายปี</CardTitle>
            <CardDescription>ข้อมูลสรุปรายปีการศึกษา</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ปีการศึกษา</TableHead>
                  <TableHead className="text-center">บัณฑิต</TableHead>
                  <TableHead className="text-center">มีงานทำ (%)</TableHead>
                  <TableHead className="text-center">GPA เฉลี่ย</TableHead>
                  <TableHead className="text-center">PLO1</TableHead>
                  <TableHead className="text-center">PLO2</TableHead>
                  <TableHead className="text-center">PLO3</TableHead>
                  <TableHead className="text-center">PLO4</TableHead>
                  <TableHead className="text-center">PLO5</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyData.map((year) => (
                  <TableRow key={year.year}>
                    <TableCell className="font-medium">{year.year}</TableCell>
                    <TableCell className="text-center">{year.graduates}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={year.employmentRate >= 90 ? 'bg-green-500' : 'bg-yellow-500'}>
                        {year.employmentRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{year.avgGPA.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{year.plo1}%</TableCell>
                    <TableCell className="text-center">{year.plo2}%</TableCell>
                    <TableCell className="text-center">{year.plo3}%</TableCell>
                    <TableCell className="text-center">{year.plo4}%</TableCell>
                    <TableCell className="text-center">{year.plo5}%</TableCell>
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
