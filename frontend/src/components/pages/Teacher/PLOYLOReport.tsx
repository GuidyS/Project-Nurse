import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Download, BarChart3, Target, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import api from '@/lib/axios';
import { toast } from 'sonner';

type PloItem = {
  name: string;
  target: number;
  achieved: number;
  description: string;
};

export default function PLOYLOReport() {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [ploData, setPloData] = useState<PloItem[]>([]);
  const [yloData, setYloData] = useState<PloItem[]>([]);
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
          toast.error(res.data.message || 'ไม่สามารถโหลดรายงาน PLO/YLO ได้');
        }
      } catch {
        toast.error('ไม่สามารถเชื่อมต่อ API รายงาน PLO/YLO ได้');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const radarData = useMemo(
    () => ploData.map(p => ({ subject: p.name, A: p.achieved, B: p.target, fullMark: 100 })),
    [ploData]
  );

  const handleExport = () => {
    toast.info('กำลังเตรียมส่งออกรายงาน PLO/YLO...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังโหลดรายงาน PLO/YLO...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายงาน PLO/YLO</h1>
          <p className="text-muted-foreground">รายงานผลลัพธ์การเรียนรู้จากฐานข้อมูล</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          ส่งออกรายงาน
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>เลือกรายวิชา</CardTitle>
          <CardDescription>ตัวกรองรายวิชาจะเชื่อมใน Phase ถัดไป — ปัจจุบันแสดงข้อมูลทั้งหลักสูตร</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="เลือกรายวิชา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกรายวิชา / ทั้งหลักสูตร</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

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
            {ploData.length > 0 ? (
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
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">ไม่มีข้อมูล PLO</p>
            )}
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
            {yloData.length > 0 ? (
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
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">ไม่มีข้อมูล YLO</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            รายละเอียด PLO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ploData.length === 0 ? (
              <p className="text-sm text-muted-foreground">ไม่มีข้อมูล PLO ในระบบ</p>
            ) : (
              ploData.map((plo) => (
                <div key={plo.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{plo.name}: {plo.description}</p>
                    <p className="text-sm text-muted-foreground">
                      เป้าหมาย: {plo.target}% | ผลลัพธ์: {plo.achieved}%
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 text-base font-semibold ${plo.achieved >= plo.target ? 'text-green-600' : 'text-destructive'}`}>
                    {plo.achieved >= plo.target ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span>บรรลุ</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 shrink-0" />
                        <span>ไม่บรรลุ</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
