import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, BarChart3, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function ProjectReports() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const [stats, setStats] = useState({ totalBudget: 0, totalSpent: 0, remaining: 0, progress: 0 });
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลรายงานจาก API
  const fetchReportData = (projectId = '') => {
    setLoading(true);
    fetch(`/api/get_project_reports.php${projectId ? `?project_id=${projectId}` : ''}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setProjects(res.data.projects);
          if (!selectedProject && res.data.selectedProjectId) {
            setSelectedProject(res.data.selectedProjectId.toString());
          }
          setStats(res.data.stats);
          setBudgetData(res.data.budgetData);
          setProgressData(res.data.progressData);
        } else {
          console.error(res.message);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("เกิดข้อผิดพลาดในการโหลดรายงาน:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    fetchReportData(val);
  };

  const handleExport = (format: string) => {
    alert(`กำลังเตรียมดาวน์โหลดไฟล์ ${format.toUpperCase()}...`);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  if (loading && projects.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">กำลังโหลดข้อมูลรายงาน...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">รายงานสรุปโครงการ</h1>
            <p className="text-muted-foreground">รายงานความคืบหน้าและงบประมาณสะสม</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* ส่วนเลือกโครงการ */}
        <Card>
          <CardContent className="pt-6">
            <Select value={selectedProject} onValueChange={handleProjectChange}>
              <SelectTrigger className="w-[400px]">
                <SelectValue placeholder="เลือกโครงการเพื่อดูรายงาน" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* การ์ดแสดงตัวเลขสถิติสรุป */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งบประมาณโครงการ</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{formatCurrency(stats.totalBudget)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ใช้จ่ายไปแล้ว</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">฿{formatCurrency(stats.totalSpent)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งบประมาณคงเหลือ</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">฿{formatCurrency(stats.remaining)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ความคืบหน้าภาพรวม</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.progress}%</div>
            </CardContent>
          </Card>
        </div>

        {/* ส่วนแสดงผลกราฟสองฝั่ง */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                งบประมาณรายเดือน
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budgetData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `฿${formatCurrency(Number(value))}`} />
                    <Legend />
                    <Bar dataKey="budget" name="งบประมาณ" fill="hsl(var(--primary))" />
                    <Bar dataKey="spent" name="ใช้จริง" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">ไม่มีข้อมูลแผนงบประมาณสำหรับโครงการนี้</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ความคืบหน้าโครงการประจำสัปดาห์
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="planned" name="แผนการปฏิบัติ" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="actual" name="ผลงานจริง" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">ไม่มีข้อมูลความคืบหน้าสำหรับโครงการนี้</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}