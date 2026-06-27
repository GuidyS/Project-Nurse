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
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import api from '@/lib/axios';

// กำหนด TypeScript Interface สำหรับรองรับข้อมูลจาก Database
interface PerformanceData {
  id: string;
  studentId: string;
  name: string;
  skill: number;
  attitude: number;
  knowledge: number;
  communication: number;
  overall: number;
  lastEval: string;
}

interface StudentDropdownItem {
  student_id: string;
  display_name: string;
}

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

  // === [ ส่วนที่เพิ่มเข้ามาใหม่: States สำหรับเก็บข้อมูลจาก Database API ] ===
  const [performances, setPerformances] = useState<PerformanceData[]>([]);
  const [chartData, setChartData] = useState<{ name: string; avg: number }[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<StudentDropdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  // URL ของ API Backend (ปรับเปลี่ยนพอร์ตหรือพาร์ทได้ตามจริงครับ)
  const API_BASE_URL = 'http://localhost/api'; 

  // ก. ฟังก์ชันดึงข้อมูลทั้งหมดจากฐานข้อมูลมาแสดงผล
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      // แนบ credentials: true ไปด้วยเสมอกรณีเผื่อใช้ session ร่วมกับ auth_middleware.php ของบอส
      const response = await fetch(`${API_BASE_URL}/get_performance_data.php`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setPerformances(result.data.performances);
        setChartData(result.data.chartData);
        setRadarData(result.data.radarData);
        setStudentList(result.data.studentList);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // เรียกใช้ดึงข้อมูลทันทีเมื่อเปิดหน้านี้ขึ้นมา
  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // ข. ค้นหาข้อมูลนักศึกษาจาก State ที่ได้มาจากตารางจริง
  const filteredPerformances = performances.filter(
    (p) => p.name.includes(searchTerm) || p.studentId.toString().includes(searchTerm)
  );

  // ค. ฟังก์ชันส่งข้อมูลประเมินตัวจริงกลับไปบันทึกลงฐานข้อมูล
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/save_performance_eval.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedStudent,
          scores,
          comment
        }),
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setIsDialogOpen(false);
        // เคลียร์ค่าในฟอร์มให้กลับเป็นเริ่มต้น
        setSelectedStudent('');
        setScores({ skill: [4], attitude: [4], knowledge: [4], communication: [4] });
        setComment('');
        // ดึงข้อมูลใหม่จากฐานข้อมูลเพื่ออัปเดตกราฟและตารางหน้าจอแบบเรียลไทม์
        fetchPerformanceData();
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้');
    }
  };

  return (
    <>
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
                      {/* ดึงข้อมูลจากรายชื่อนักศึกษาจริงในระบบ แทนของ Mock เดิม */}
                      {studentList.map((student) => (
                        <SelectItem key={student.student_id} value={student.student_id.toString()}>
                          {student.display_name}
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
                <Button onClick={handleSave} disabled={!selectedStudent}>บันทึกประเมิน</Button>
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
              {loading ? (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">กำลังโหลดข้อมูลกราฟ...</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
              {loading ? (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">กำลังโหลดข้อมูลกราฟ...</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar name="คะแนน" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">กำลังโหลดข้อมูลนักศึกษา...</TableCell>
                  </TableRow>
                ) : filteredPerformances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">ไม่พบข้อมูลผลการประเมิน</TableCell>
                  </TableRow>
                ) : (
                  filteredPerformances.map((p) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}