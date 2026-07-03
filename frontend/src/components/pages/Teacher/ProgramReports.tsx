import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Download, BarChart3, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '@/lib/axios';
import { toast } from 'sonner';

type OutcomeItem = {
  name: string;
  target: number;
  achieved: number;
  description: string;
};

export default function ProgramReports() {
  const [selectedYear, setSelectedYear] = useState('all');
  const [ploData, setPloData] = useState<OutcomeItem[]>([]);
  const [yloData, setYloData] = useState<OutcomeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/index.php?page=get-plo-ylo-report');
        if (res.data.status === 'success') {
          setPloData(res.data.data.ploData || []);
          setYloData(res.data.data.yloData || []);
        } else {
          toast.error(res.data.message || 'ไม่สามารถโหลดรายงานหลักสูตรได้');
        }
      } catch {
        toast.error('ไม่สามารถเชื่อมต่อ API รายงานหลักสูตรได้');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const radarData = useMemo(
    () => ploData.map((item) => ({
      subject: item.name,
      achieved: item.achieved,
      target: item.target,
      fullMark: 100,
    })),
    [ploData]
  );

  const handleExport = () => {
    const payload = {
      report: 'PLO/YLO/CLO Program Report',
      selectedYear,
      generatedAt: new Date().toISOString(),
      ploData,
      yloData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `program-report-${selectedYear}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('ส่งออกรายงานหลักสูตรแล้ว');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังโหลดรายงานหลักสูตร...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายงาน PLO/YLO/CLO</h1>
            <p className="text-muted-foreground">รายงานผลลัพธ์การเรียนรู้ของหลักสูตรทุกชั้นปี (FR033)</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            ส่งออกรายงาน
          </Button>
        </div>

        {/* Year Selection */}
        <Card>
          <CardHeader>
            <CardDescription>
              ตัวกรองชั้นปีจะเชื่อมกับข้อมูลรายชั้นปีใน Phase ถัดไป ปัจจุบันแสดงข้อมูลหลักสูตรรวมจาก API
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          {ploData.slice(0, 5).map((plo) => (
            <Card key={plo.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{plo.name}</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plo.achieved}%</div>
                <p className="text-xs text-muted-foreground">เป้าหมาย {plo.target}%</p>
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
                PLO เป้าหมายเทียบผลลัพธ์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ploData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="achieved" name="ผลลัพธ์จริง" fill="#3b82f6" />
                  <Bar dataKey="target" name="เป้าหมาย" fill="#22c55e" />
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
                  <Radar name="ผลลัพธ์จริง" dataKey="achieved" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  <Radar name="เป้าหมาย" dataKey="target" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูล YLO</CardTitle>
            <CardDescription>ผลลัพธ์การเรียนรู้ระดับปีจาก API เดียวกับรายงาน PLO/YLO</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {yloData.length === 0 ? (
                <p className="text-sm text-muted-foreground">ไม่มีข้อมูล YLO</p>
              ) : (
                yloData.map((ylo) => (
                  <div key={ylo.name} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{ylo.name}</p>
                      <span className="text-sm text-muted-foreground">{ylo.achieved}% / {ylo.target}%</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{ylo.description}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
