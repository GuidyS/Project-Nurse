import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Download, BarChart3, Target, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

interface LOItem {
  name: string;
  description: string;
  target: number;
  achieved: number;
}

export default function PLOYLOReport() {
  const { toast } = useToast();
  const [ploData, setPloData] = useState<LOItem[]>([]);
  const [yloData, setYloData] = useState<LOItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/index.php?page=get-plo-ylo-report');
        if (res.data.status === 'success') {
          setPloData(res.data.data.plos || []);
          setYloData(res.data.data.ylos || []);
        }
      } catch {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดรายงาน PLO/YLO ได้', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleExport = (format: string) => {
    if (format === 'pdf') { window.print(); return; }
    const rows: string[][] = [
      ['รายงานวิเคราะห์ PLO/YLO'],
      ['ประเภท', 'รหัส', 'คำอธิบาย', 'เป้าหมาย(%)', 'ผลลัพธ์จริง(%)', 'สถานะ'],
      ...ploData.map(p => ['PLO', p.name, p.description, String(p.target), String(p.achieved), p.achieved >= p.target ? 'บรรลุ' : 'ไม่บรรลุ']),
      ...yloData.map(y => ['YLO', y.name, y.description, String(y.target), String(y.achieved), y.achieved >= y.target ? 'บรรลุ' : 'ไม่บรรลุ']),
    ];
    const csv = '﻿' + rows.map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'plo_ylo_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const radarData = ploData.map(p => ({ subject: p.name, A: p.achieved, B: p.target, fullMark: 100 }));
  const achievedCount = [...ploData, ...yloData].filter(x => x.achieved >= x.target).length;
  const totalCount = ploData.length + yloData.length;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายงานวิเคราะห์ PLO/YLO</h1>
            <p className="text-muted-foreground">เปรียบเทียบเป้าหมายกับผลลัพธ์การเรียนรู้ของหลักสูตร</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        {/* สรุปภาพรวม */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">ตัวชี้วัดทั้งหมด</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalCount}</div><p className="text-xs text-muted-foreground">PLO {ploData.length} + YLO {yloData.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">บรรลุเป้าหมาย</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{achievedCount}</div><p className="text-xs text-muted-foreground">ตัวชี้วัด</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">ยังไม่บรรลุ</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{totalCount - achievedCount}</div><p className="text-xs text-muted-foreground">ตัวชี้วัด</p></CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> ผลลัพธ์ PLO</CardTitle>
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
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> ผลลัพธ์ YLO</CardTitle>
              <CardDescription>ผลลัพธ์การเรียนรู้รายชั้นปี</CardDescription>
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

        {/* PLO/YLO Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> รายละเอียดตัวชี้วัด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...ploData, ...yloData].map((lo) => (
                <div key={lo.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{lo.name}: {lo.description}</p>
                    <p className="text-sm text-muted-foreground">
                      เป้าหมาย: {lo.target}% | ผลลัพธ์: {lo.achieved}%
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-base font-semibold ${lo.achieved >= lo.target ? 'text-green-600' : 'text-destructive'}`}>
                    {lo.achieved >= lo.target ? (
                      <><CheckCircle2 className="h-5 w-5 shrink-0" /><span>บรรลุ</span></>
                    ) : (
                      <><XCircle className="h-5 w-5 shrink-0" /><span>ไม่บรรลุ</span></>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
