import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Download, BarChart3, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

interface LOItem {
  name: string;
  description: string;
  target: number;
  achieved: number;
}

export default function ProgramReports() {
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
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดรายงานหลักสูตรได้', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleExport = () => {
    const rows: string[][] = [
      ['รายงาน PLO/YLO/CLO ของหลักสูตร'],
      ['ประเภท', 'รหัส', 'คำอธิบาย', 'เป้าหมาย(%)', 'ผลลัพธ์(%)'],
      ...ploData.map(p => ['PLO', p.name, p.description, String(p.target), String(p.achieved)]),
      ...yloData.map(y => ['YLO', y.name, y.description, String(y.target), String(y.achieved)]),
    ];
    const csv = '﻿' + rows.map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'program_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const radarData = ploData.map(p => ({ subject: p.name, A: p.achieved, fullMark: 100 }));

  return (
    <>
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

        {/* PLO Stat Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          {ploData.map((plo) => (
            <Card key={plo.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{plo.name}</CardTitle>
                <TrendingUp className={`h-4 w-4 ${plo.achieved >= plo.target ? 'text-green-500' : 'text-destructive'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plo.achieved}%</div>
                <p className="text-xs text-muted-foreground">เป้า {plo.target}%</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> ภาพรวมผลลัพธ์ PLO</CardTitle>
              <CardDescription>ผลลัพธ์การเรียนรู้ระดับหลักสูตร</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="ผลลัพธ์จริง" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> ผลลัพธ์ YLO รายชั้นปี</CardTitle>
              <CardDescription>เปรียบเทียบเป้าหมายกับผลลัพธ์จริง</CardDescription>
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

        {/* ตารางรายละเอียด */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดตัวชี้วัดทั้งหมด</CardTitle>
            <CardDescription>PLO และ YLO พร้อมสถานะการบรรลุเป้าหมาย</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>รหัส</TableHead>
                  <TableHead>คำอธิบาย</TableHead>
                  <TableHead className="text-center">เป้าหมาย</TableHead>
                  <TableHead className="text-center">ผลลัพธ์</TableHead>
                  <TableHead className="w-[180px]">ความคืบหน้า</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...ploData.map(p => ({ ...p, type: 'PLO' })), ...yloData.map(y => ({ ...y, type: 'YLO' }))].map((lo) => (
                  <TableRow key={lo.name}>
                    <TableCell><Badge variant="outline">{lo.type}</Badge></TableCell>
                    <TableCell className="font-medium">{lo.name}</TableCell>
                    <TableCell>{lo.description}</TableCell>
                    <TableCell className="text-center">{lo.target}%</TableCell>
                    <TableCell className="text-center font-semibold">{lo.achieved}%</TableCell>
                    <TableCell><Progress value={lo.achieved} /></TableCell>
                    <TableCell className="text-center">
                      {lo.achieved >= lo.target
                        ? <Badge className="bg-green-500">บรรลุ</Badge>
                        : <Badge variant="destructive">ไม่บรรลุ</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
