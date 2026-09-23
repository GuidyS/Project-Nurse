import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Download, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface YearlyReportRow {
  year: string;
  yearLevel?: number | string;
  plo1?: number;
  plo2?: number;
  plo3?: number;
  plo4?: number;
  plo5?: number;
}

interface RadarReportRow {
  subject: string;
  description?: string;
  A: number;
  fullMark: number;
}

const ploLabels = [
  'PLO1: ความรู้',
  'PLO2: ทักษะ',
  'PLO3: จริยธรรม',
  'PLO4: สื่อสาร',
  'PLO5: เทคโนโลยี',
];

const getYearLevel = (row: YearlyReportRow): string => {
  if (row.yearLevel !== undefined && row.yearLevel !== null && row.yearLevel !== '') {
    return String(row.yearLevel);
  }

  const match = String(row.year ?? '').match(/\d+/);
  return match?.[0] ?? '';
};

const normalizeYearlyRow = (row: YearlyReportRow): YearlyReportRow => {
  const yearLevel = getYearLevel(row);

  return {
    ...row,
    yearLevel: yearLevel || row.yearLevel,
    year: yearLevel ? `ปี ${yearLevel}` : row.year,
  };
};

export default function ProgramReports() {
  const [selectedYear, setSelectedYear] = useState('all');
  const [yearlyData, setYearlyData] = useState<YearlyReportRow[]>([]);
  const [radarData, setRadarData] = useState<RadarReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/components/Teacher/ProgramReports/get_program_reports.php');
      if (response.data.status === 'success') {
        const yData = response.data.data.yearlyData;
        const rData = response.data.data.radarData;

        if (yData && yData.length > 0) {
          setYearlyData(yData.map(normalizeYearlyRow));
        }

        if (rData && rData.length > 0) {
          setRadarData(rData);
        }
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredYearlyData = selectedYear === 'all'
    ? yearlyData
    : yearlyData.filter((d) => getYearLevel(d) === selectedYear);

  const filteredRadarData = selectedYear === 'all'
    ? radarData
    : ploLabels.map((subject, index) => ({
        subject,
        A: (filteredYearlyData[0]?.[`plo${index + 1}` as keyof YearlyReportRow] as number) || 0,
        fullMark: 100,
      }));

  const handleExport = () => {
    try {
      const headers = ['ชั้นปี', 'PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5'];
      const csvRows = [headers.join(',')];

      filteredYearlyData.forEach((row) => {
        csvRows.push([
          row.year,
          row.plo1 || 0,
          row.plo2 || 0,
          row.plo3 || 0,
          row.plo4 || 0,
          row.plo5 || 0,
        ].join(','));
      });

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);

      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `รายงาน_PLO_${selectedYear === 'all' ? 'รวม' : 'ปี_' + selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        กำลังโหลดรายงาน...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight leading-snug">รายงาน PLO/YLO/CLO</h1>
          <p className="text-muted-foreground">รายงานผลลัพธ์การเรียนรู้ของหลักสูตรทุกชั้นปี</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          ส่งออกรายงาน
        </Button>
      </div>

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

      <div className="grid gap-4 md:grid-cols-5">
        {['PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5'].map((plo, index) => (
          <Card key={plo}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{plo}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredRadarData[index]?.A || 0}%</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              PLO รายชั้นปี
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredYearlyData && filteredYearlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredYearlyData}>
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
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                ไม่มีข้อมูลสำหรับแสดงกราฟ
              </div>
            )}
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
            {filteredRadarData && filteredRadarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={filteredRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="ผลลัพธ์" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                ไม่มีข้อมูลสำหรับแสดงกราฟ
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
