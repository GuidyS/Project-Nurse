import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Download, BarChart3, Target } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

// Mock data
const ploData = [
  { name: 'PLO1', target: 80, achieved: 85, description: 'ความรู้ทางวิชาชีพ' },
  { name: 'PLO2', target: 75, achieved: 72, description: 'ทักษะการปฏิบัติ' },
  { name: 'PLO3', target: 80, achieved: 88, description: 'คุณธรรมจริยธรรม' },
  { name: 'PLO4', target: 70, achieved: 75, description: 'การสื่อสาร' },
  { name: 'PLO5', target: 75, achieved: 70, description: 'การใช้เทคโนโลยี' },
];

const yloData = [
  { name: 'YLO1', target: 75, achieved: 78, description: 'เข้าใจแนวคิดพื้นฐาน' },
  { name: 'YLO2', target: 80, achieved: 82, description: 'ประยุกต์ใช้ความรู้' },
  { name: 'YLO3', target: 70, achieved: 75, description: 'วิเคราะห์ปัญหา' },
  { name: 'YLO4', target: 75, achieved: 72, description: 'สังเคราะห์ข้อมูล' },
];

const radarData = ploData.map(p => ({
  subject: p.name,
  A: p.achieved,
  B: p.target,
  fullMark: 100,
}));

export default function PLOYLOReport() {
  const [selectedCourse, setSelectedCourse] = useState('NUR101');

  const handleExport = () => {
    console.log('Exporting report');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายงาน PLO/YLO</h1>
            <p className="text-muted-foreground">รายงานผลลัพธ์การเรียนรู้ของรายวิชาที่สอน</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            ส่งออกรายงาน
          </Button>
        </div>

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกรายวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="เลือกรายวิชา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NUR101">NUR101 - พื้นฐานการพยาบาล</SelectItem>
                <SelectItem value="NUR201">NUR201 - การพยาบาลผู้ใหญ่ 1</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ผลลัพธ์ PLO
              </CardTitle>
              <CardDescription>เปรียบเทียบเป้าหมายและผลลัพธ์จริง</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="ผลลัพธ์จริง" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  <Radar name="เป้าหมาย" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ผลลัพธ์ YLO
              </CardTitle>
              <CardDescription>ผลลัพธ์การเรียนรู้รายปี</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yloData}>
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

        {/* PLO Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              รายละเอียด PLO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ploData.map((plo) => (
                <div key={plo.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{plo.name}: {plo.description}</p>
                    <p className="text-sm text-muted-foreground">
                      เป้าหมาย: {plo.target}% | ผลลัพธ์: {plo.achieved}%
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${plo.achieved >= plo.target ? 'text-green-600' : 'text-destructive'}`}>
                    {plo.achieved >= plo.target ? '✓ บรรลุ' : '✗ ไม่บรรลุ'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
