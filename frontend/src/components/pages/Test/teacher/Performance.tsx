import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Search, Star, Plus, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

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
  if (score >= 4.5) return <Badge className="bg-green-500">ดีเยี่ยม</Badge>;
  if (score >= 4.0) return <Badge className="bg-blue-500">ดี</Badge>;
  if (score >= 3.0) return <Badge className="bg-yellow-500">พอใช้</Badge>;
  return <Badge variant="destructive">ต้องปรับปรุง</Badge>;
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
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ประเมิน Performance</h1>
            <p className="text-muted-foreground">บันทึกและประเมินผลการปฏิบัติงานของนักศึกษา</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                ประเมินใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>ประเมินผลการปฏิบัติงาน</DialogTitle>
                <DialogDescription>
                  บันทึกคะแนนประเมินนักศึกษา
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label>นักศึกษา</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกนักศึกษา" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPerformances.map((p) => (
                        <SelectItem key={p.studentId} value={p.studentId}>
                          {p.studentId} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>ทักษะปฏิบัติ</Label>
                      <span className="text-sm font-medium">{scores.skill[0]}/5</span>
                    </div>
                    <Slider
                      value={scores.skill}
                      onValueChange={(value) => setScores({ ...scores, skill: value })}
                      max={5}
                      min={1}
                      step={0.5}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>ทัศนคติ</Label>
                      <span className="text-sm font-medium">{scores.attitude[0]}/5</span>
                    </div>
                    <Slider
                      value={scores.attitude}
                      onValueChange={(value) => setScores({ ...scores, attitude: value })}
                      max={5}
                      min={1}
                      step={0.5}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>ความรู้</Label>
                      <span className="text-sm font-medium">{scores.knowledge[0]}/5</span>
                    </div>
                    <Slider
                      value={scores.knowledge}
                      onValueChange={(value) => setScores({ ...scores, knowledge: value })}
                      max={5}
                      min={1}
                      step={0.5}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>การสื่อสาร</Label>
                      <span className="text-sm font-medium">{scores.communication[0]}/5</span>
                    </div>
                    <Slider
                      value={scores.communication}
                      onValueChange={(value) => setScores({ ...scores, communication: value })}
                      max={5}
                      min={1}
                      step={0.5}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>ความคิดเห็นเพิ่มเติม</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="บันทึกความคิดเห็น..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave}>บันทึกประเมิน</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ค่าเฉลี่ยแต่ละด้าน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                ตัวอย่างการประเมินรายบุคคล
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar name="คะแนน" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>ผลการประเมินนักศึกษา</CardTitle>
            <CardDescription>สรุปผลการประเมินล่าสุด</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>ทักษะ</TableHead>
                  <TableHead>ทัศนคติ</TableHead>
                  <TableHead>ความรู้</TableHead>
                  <TableHead>สื่อสาร</TableHead>
                  <TableHead>รวม</TableHead>
                  <TableHead>ระดับ</TableHead>
                  <TableHead>ประเมินล่าสุด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerformances.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.studentId}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.skill.toFixed(1)}</TableCell>
                    <TableCell>{p.attitude.toFixed(1)}</TableCell>
                    <TableCell>{p.knowledge.toFixed(1)}</TableCell>
                    <TableCell>{p.communication.toFixed(1)}</TableCell>
                    <TableCell className="font-bold">{p.overall.toFixed(1)}</TableCell>
                    <TableCell>{getScoreBadge(p.overall)}</TableCell>
                    <TableCell>{p.lastEval}</TableCell>
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
