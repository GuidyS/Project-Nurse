import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, BarChart3, DollarSign, Filter } from 'lucide-react';
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
  project_type?: ProjectType;
}

type ProjectType = 'academic_service' | 'culture' | 'other';
type ProjectTypeFilter = ProjectType | 'all';

const projectTypeLabels: Record<ProjectType, string> = {
  academic_service: 'บริการวิชาการ',
  culture: 'ทำนุบำรุงศิลปวัฒนธรรม',
  other: 'อื่น ๆ / ยังไม่จำแนก',
};

const projectTypeFilterOptions: { value: ProjectTypeFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'academic_service', label: projectTypeLabels.academic_service },
  { value: 'culture', label: projectTypeLabels.culture },
  { value: 'other', label: projectTypeLabels.other },
];

const normalizeProjectType = (value?: ProjectType | null): ProjectType => value || 'other';

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
  const [projectSearch, setProjectSearch] = useState('');
  const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectTypeFilter>('all');
  
  const [stats, setStats] = useState<ProjectStats>({ totalBudget: 0, totalSpent: 0, remaining: 0, progress: 0 });
  const [budgetData, setBudgetData] = useState<BudgetRow[]>([]);
  const [progressData, setProgressData] = useState<ProgressRow[]>([]);
  
  const [loading, setLoading] = useState(true);
  const activeFilterCount = Number(projectTypeFilter !== 'all');

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

  const handleProjectSearchSelect = (project: ProjectOption) => {
    setProjectSearch(project.name);
    setIsProjectSearchOpen(false);
    handleProjectChange(project.id.toString());
  };

  const searchedProjects = projects.filter((project) => {
    const normalizedType = normalizeProjectType(project.project_type);
    const matchesType = projectTypeFilter === 'all' || normalizedType === projectTypeFilter;
    const search = projectSearch.trim().toLowerCase();
    const matchesSearch = !search || `${project.id} ${project.name}`.toLowerCase().includes(search);

    return matchesType && matchesSearch;
  });

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
      <div className="app-page">
        <div className="app-page-header">
          <div>
            <h1 className="app-page-title">รายงานสรุปโครงการ</h1>
            <p className="app-page-description">รายงานความคืบหน้าและงบประมาณสะสม</p>
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
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
              <div className="relative w-full lg:flex-1">
                <Input
                  value={projectSearch}
                  onChange={(event) => {
                    setProjectSearch(event.target.value);
                    setIsProjectSearchOpen(true);
                  }}
                  onFocus={() => setIsProjectSearchOpen(true)}
                  onBlur={() => setIsProjectSearchOpen(false)}
                  placeholder="ค้นหารายชื่อโครงการ..."
                  className="w-full"
                />
                {isProjectSearchOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                    {searchedProjects.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        ไม่พบโครงการที่ตรงกับคำค้นหา
                      </div>
                    ) : (
                      searchedProjects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          className="flex w-full flex-col rounded-sm px-3 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleProjectSearchSelect(project)}
                        >
                          <span className="font-medium">{project.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {projectTypeLabels[normalizeProjectType(project.project_type)]}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    กรอง
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-1 rounded-sm px-1.5 py-0 text-[11px]">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">ตัวกรองโครงการ</p>
                    <p className="text-xs text-muted-foreground">เลือกประเภทโครงการ</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-type-filter">ประเภทโครงการ</Label>
                    <Select value={projectTypeFilter} onValueChange={(value) => setProjectTypeFilter(value as ProjectTypeFilter)}>
                      <SelectTrigger id="project-type-filter">
                        <SelectValue placeholder="เลือกประเภทโครงการ" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypeFilterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={activeFilterCount === 0}
                    onClick={() => setProjectTypeFilter('all')}
                  >
                    ล้างตัวกรอง
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
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
