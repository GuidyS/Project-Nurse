import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Search, Star, Plus, BarChart3, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const getScoreBadge = (score: number) => {
  if (score >= 4.5) return <Badge className="bg-[#10b981] hover:bg-[#059669] text-white border-none rounded-full px-4">ดีเยี่ยม</Badge>;
  if (score >= 4.0) return <Badge className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-none rounded-full px-4">ดี</Badge>;
  if (score >= 3.0) return <Badge className="bg-[#94a3b8] hover:bg-[#64748b] text-white border-none rounded-full px-4">พอใช้</Badge>;
  return <Badge variant="destructive" className="rounded-full px-4">ต้องปรับปรุง</Badge>;
};

export default function Performance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [scores, setScores] = useState({
    skill: [4],
    attitude: [4],
    knowledge: [4],
    communication: [4],
    teamwork: [4],
    punctuality: [4],
  });
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  
  const [performances, setPerformances] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/components/Teacher/Performance/get_performance.php');
      if (response.data.status === 'success') {
        setPerformances(response.data.data.performances || []);
        setChartData(response.data.data.chartData || []);
        setRadarData(response.data.data.radarData || []);
        setStudentList(response.data.data.studentList || []);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPerformances = performances.filter(
    (p) => p.name.includes(searchTerm) || p.studentId.includes(searchTerm)
  );

  const handleSave = async () => {
    try {
      if (!selectedStudent) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกนักศึกษา', variant: 'destructive' });
        return;
      }
      const response = await api.post('/components/Teacher/Performance/save_performance.php', {
        selectedStudent,
        scores,
        comment
      });
      if (response.data.status === 'success') {
        toast({ title: 'สำเร็จ', description: 'บันทึกการประเมินเรียบร้อยแล้ว' });
        setIsDialogOpen(false);
        fetchData(); // reload data
        setSelectedStudent('');
        setScores({ skill: [4], attitude: [4], knowledge: [4], communication: [4], teamwork: [4], punctuality: [4] });
        setComment('');
      } else {
        toast({ title: 'ข้อผิดพลาด', description: response.data.message || 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error saving performance:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการเชื่อมต่อ', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#334155]">
            <TrendingUp className="h-6 w-6" />
            <h1 className="text-2xl font-bold">ประเมิน Performance</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-8">สรุปผลและบันทึกการประเมินนักศึกษา</p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-md px-6 shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                ประเมินใหม่
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>ประเมินผลการปฏิบัติงาน</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>นักศึกษา</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกนักศึกษา" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentList.map(s => (
                        <SelectItem key={s.student_id} value={String(s.student_id)}>{s.display_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>ทักษะปฏิบัติ (เต็ม 5)</Label>
                    <Input type="number" min="0" max="5" step="0.5" value={scores.skill[0]} onChange={(e) => setScores({...scores, skill: [parseFloat(e.target.value)]})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>ทัศนคติ (เต็ม 5)</Label>
                    <Input type="number" min="0" max="5" step="0.5" value={scores.attitude[0]} onChange={(e) => setScores({...scores, attitude: [parseFloat(e.target.value)]})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>ความรู้ (เต็ม 5)</Label>
                    <Input type="number" min="0" max="5" step="0.5" value={scores.knowledge[0]} onChange={(e) => setScores({...scores, knowledge: [parseFloat(e.target.value)]})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>การสื่อสาร (เต็ม 5)</Label>
                    <Input type="number" min="0" max="5" step="0.5" value={scores.communication[0]} onChange={(e) => setScores({...scores, communication: [parseFloat(e.target.value)]})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>ทำงานเป็นทีม (เต็ม 5)</Label>
                    <Input type="number" min="0" max="5" step="0.5" value={scores.teamwork[0]} onChange={(e) => setScores({...scores, teamwork: [parseFloat(e.target.value)]})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>ตรงต่อเวลา (เต็ม 5)</Label>
                    <Input type="number" min="0" max="5" step="0.5" value={scores.punctuality[0]} onChange={(e) => setScores({...scores, punctuality: [parseFloat(e.target.value)]})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>ความคิดเห็นเพิ่มเติม</Label>
                  <Textarea placeholder="ความคิดเห็นเพิ่มเติม..." value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave}>บันทึกประเมิน</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              ค่าเฉลี่ยแต่ละด้าน
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="avg" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={60} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                กำลังโหลดข้อมูล...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-gray-500" />
              ตัวอย่างการประเมินรายบุคคล
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            {radarData && radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar
                    name="คะแนน"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-xl font-bold">ผลการประเมินนักศึกษา</CardTitle>
            <CardDescription>สรุปผลการประเมินล่าสุด</CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#f8fafc] border-gray-200"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-100">
            <Table>
              <TableHeader className="bg-[#f8fafc]">
                <TableRow>
                  <TableHead className="w-[120px]">รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-center">ทักษะ</TableHead>
                  <TableHead className="text-center">ทัศนคติ</TableHead>
                  <TableHead className="text-center">ความรู้</TableHead>
                  <TableHead className="text-center">สื่อสาร</TableHead>
                  <TableHead className="text-center">ทำงานเป็นทีม</TableHead>
                  <TableHead className="text-center">ตรงต่อเวลา</TableHead>
                  <TableHead className="text-center font-bold text-black">รวม</TableHead>
                  <TableHead className="text-center">ระดับ</TableHead>
                  <TableHead className="text-right">ประเมินล่าสุด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerformances.length > 0 ? filteredPerformances.map((p) => (
                  <TableRow key={p.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-slate-600">{p.studentId}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-center">{Number(p.skill).toFixed(1)}</TableCell>
                    <TableCell className="text-center">{Number(p.attitude).toFixed(1)}</TableCell>
                    <TableCell className="text-center">{Number(p.knowledge).toFixed(1)}</TableCell>
                    <TableCell className="text-center">{Number(p.communication).toFixed(1)}</TableCell>
                    <TableCell className="text-center">{Number(p.teamwork).toFixed(1)}</TableCell>
                    <TableCell className="text-center">{Number(p.punctuality).toFixed(1)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-900">{Number(p.overall).toFixed(1)}</TableCell>
                    <TableCell className="text-center">{getScoreBadge(Number(p.overall))}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.lastEval}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground h-24">ไม่มีข้อมูล</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}