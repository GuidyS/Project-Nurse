import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Download, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Mock data
const yearlyData = [
  { year: 'ปี 1', plo1: 75, plo2: 70, plo3: 80, plo4: 72, plo5: 68 },
  { year: 'ปี 2', plo1: 80, plo2: 75, plo3: 82, plo4: 78, plo5: 72 },
  { year: 'ปี 3', plo1: 85, plo2: 82, plo3: 88, plo4: 85, plo5: 78 },
  { year: 'ปี 4', plo1: 90, plo2: 88, plo3: 92, plo4: 90, plo5: 85 },
];

const radarData = [
  { subject: 'PLO1: ความรู้', A: 88, fullMark: 100 },
  { subject: 'PLO2: ทักษะ', A: 82, fullMark: 100 },
  { subject: 'PLO3: จริยธรรม', A: 90, fullMark: 100 },
  { subject: 'PLO4: สื่อสาร', A: 85, fullMark: 100 },
  { subject: 'PLO5: เทคโนโลยี', A: 78, fullMark: 100 },
];

export default function ProgramReports() {
  const [selectedYear, setSelectedYear] = useState('all');

  const handleExport = () => {
    console.log('Exporting report');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายงาน PLO/YLO/CLO</h1>
            <p className="text-muted-foreground">รายงานผลลัพธ์การเรียนรู้ของหลักสูตรทุกชั้นปี</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            ส่งออกรายงาน
          </Button>
        </div>

        {/* Year Selection */}
        <Card>
          <CardContent className="pt-6">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกชั้นปี" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกชั้นปี</SelectItem>
                <SelectItem value="1">ปี 1</SelectItem>
                <SelectItem value="2">ปี 2</SelectItem>
                <SelectItem value="3">ปี 3</SelectItem>
                <SelectItem value="4">ปี 4</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          {['PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5'].map((plo, index) => (
            <Card key={plo}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{plo}</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{radarData[index].A}%</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                PLO รายชั้นปี
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="plo1" name="PLO1" fill="#3b82f6" />
                  <Bar dataKey="plo2" name="PLO2" fill="#22c55e" />
                  <Bar dataKey="plo3" name="PLO3" fill="#f59e0b" />
                  <Bar dataKey="plo4" name="PLO4" fill="#8b5cf6" />
                  <Bar dataKey="plo5" name="PLO5" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ภาพรวม PLO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="ผลลัพธ์" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
