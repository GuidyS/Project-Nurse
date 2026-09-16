import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, BarChart3, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// เรียกใช้โมดูลอินสแตนซ์ Axios ที่กำหนดค่าพอร์ตกลางไว้แล้ว
import api from '@/lib/axios';
import { consumePendingProjectNavigation } from '@/lib/projectNavigation';

interface ProjectOption {
  id: number;
  name: string;
}

interface ProjectStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  progress: number;
}

interface BudgetRow {
  month: string;
  budget: number;
  spent: number;
}

interface ProgressRow {
  week: string;
  planned: number;
  actual: number;
}

export default function ProjectReports() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const [stats, setStats] = useState<ProjectStats>({ totalBudget: 0, totalSpent: 0, remaining: 0, progress: 0 });
  const [budgetData, setBudgetData] = useState<BudgetRow[]>([]);
  const [progressData, setProgressData] = useState<ProgressRow[]>([]);
  
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลรายงานจาก API (แก้ไขให้ใช้ Axios Instance)
  const fetchReportData = async (projectId = '') => {
    setLoading(true);
    try {
      // เรียกข้อมูลผ่านหน้า index.php ของ Backend ตามรูปแบบ API ที่ใช้อยู่ทั่วไป
      const response = await api.get(`/index.php?page=get-project-reports${projectId ? `&project_id=${projectId}` : ''}`);
      const res = response.data;
      
      if (res.status === 'success') {
        setProjects(res.data.projects);
        setSelectedProject(res.data.selectedProjectId ? res.data.selectedProjectId.toString() : '');
        setStats(res.data.stats);
        setBudgetData(res.data.budgetData);
        setProgressData(res.data.progressData);
      } else {
        console.error(res.message);
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการโหลดรายงาน:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pending = consumePendingProjectNavigation();
    fetchReportData(pending?.projectId || '');
  }, []);

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    fetchReportData(val);
  };

  const selectedProjectName = projects.find(p => p.id.toString() === selectedProject)?.name || 'project-report';

  const handleExport = (format: 'excel' | 'pdf') => {
    if (!selectedProject) return;

    if (format === 'excel') {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
        { metric: 'totalBudget', value: stats.totalBudget },
        { metric: 'totalSpent', value: stats.totalSpent },
        { metric: 'remaining', value: stats.remaining },
        { metric: 'progress', value: stats.progress },
      ]), 'Summary');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(budgetData), 'Budget');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(progressData), 'Progress');
      XLSX.writeFile(workbook, `project-report-${selectedProject}.xlsx`);
      return;
    }

    const doc = new jsPDF();
    doc.text(`Project Report: ${selectedProjectName}`, 14, 16);
    autoTable(doc, {
      startY: 24,
      head: [['Metric', 'Value']],
      body: [
        ['Budget', formatCurrency(stats.totalBudget)],
        ['Spent', formatCurrency(stats.totalSpent)],
        ['Remaining', formatCurrency(stats.remaining)],
        ['Progress', `${stats.progress}%`],
      ],
    });
    autoTable(doc, {
      head: [['Period', 'Budget', 'Spent']],
      body: budgetData.map(row => [row.month, formatCurrency(row.budget), formatCurrency(row.spent)]),
    });
    autoTable(doc, {
      head: [['Period', 'Planned', 'Actual']],
      body: progressData.map(row => [row.week, `${row.planned}%`, `${row.actual}%`]),
    });
    doc.save(`project-report-${selectedProject}.pdf`);
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
            <h1 className="text-3xl font-bold tracking-tight leading-snug">รายงานสรุปโครงการ</h1>
            <p className="text-muted-foreground">รายงานความคืบหน้าและงบประมาณสะสม</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')} disabled={!selectedProject}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} disabled={!selectedProject}>
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
