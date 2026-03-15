import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Search, Star, Plus, BarChart3, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Mock data
const mockPerformances = [
  { id: '1', studentId: '64010001', name: 'สมชาย ใจดี', skill: 4.5, attitude: 4.8, knowledge: 4.2, communication: 4.0, overall: 4.4, lastEval: '2024-01-10' },
  { id: '2', studentId: '64010002', name: 'สมหญิง รักเรียน', skill: 3.8, attitude: 4.2, knowledge: 3.5, communication: 4.5, overall: 4.0, lastEval: '2024-01-08' },
  { id: '3', studentId: '64010003', name: 'มานะ ตั้งใจ', skill: 4.8, attitude: 5.0, knowledge: 4.5, communication: 4.2, overall: 4.6, lastEval: '2024-01-12' },
  { id: '4', studentId: '64010004', name: 'มานี ขยัน', skill: 3.0, attitude: 3.5, knowledge: 2.8, communication: 3.2, overall: 3.1, lastEval: '2024-01-05' },
  { id: '5', studentId: '64010005', name: 'ปิติ สุขใจ', skill: 4.0, attitude: 4.5, knowledge: 3.8, communication: 4.0, overall: 4.1, lastEval: '2024-01-11' },
];

const chartData = [
  { name: 'ทักษะปฏิบัติ', avg: 4.0 },
  { name: 'ทัศนคติ', avg: 4.4 },
  { name: 'ความรู้', avg: 3.8 },
  { name: 'สื่อสาร', avg: 4.0 },
];

const radarData = [
  { subject: 'ทักษะปฏิบัติ', A: 4.5, fullMark: 5 },
  { subject: 'ทัศนคติ', A: 4.8, fullMark: 5 },
  { subject: 'ความรู้', A: 4.2, fullMark: 5 },
  { subject: 'การสื่อสาร', A: 4.0, fullMark: 5 },
  { subject: 'ทำงานเป็นทีม', A: 4.3, fullMark: 5 },
  { subject: 'ตรงต่อเวลา', A: 4.7, fullMark: 5 },
];

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
  });
  const [comment, setComment] = useState('');

  const filteredPerformances = mockPerformances.filter(
    (p) => p.name.includes(searchTerm) || p.studentId.includes(searchTerm)
  );

  const handleSave = () => {
    console.log('Saving evaluation:', { selectedStudent, scores, comment });
    setIsDialogOpen(false);
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
                <p className="text-sm text-gray-500 italic">ฟอร์มกรอกคะแนนประเมิน...</p>
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
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="avg" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={60} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-gray-500" />
              ตัวอย่างการประเมินรายบุคคล
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
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
                  <TableHead className="text-center font-bold text-black">รวม</TableHead>
                  <TableHead className="text-center">ระดับ</TableHead>
                  <TableHead className="text-right">ประเมินล่าสุด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerformances.map((p) => (
                  <TableRow key={p.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-slate-600">{p.studentId}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-center">{p.skill.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{p.attitude.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{p.knowledge.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{p.communication.toFixed(1)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-900">{p.overall.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{getScoreBadge(p.overall)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.lastEval}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}