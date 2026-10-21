import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, DollarSign, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
  description?: string;
  responsible_faculty_id?: string;
  academic_year?: string | number;
  start_date?: string;
  end_date?: string;
  status?: string;
}

type ProjectType = 'academic_service' | 'culture' | 'other' | 'teaching' | 'research' | 'quality_assurance';;
type ProjectTypeFilter = ProjectType | 'all';

const projectTypeLabels: Record<ProjectType, string> = {
  academic_service: 'บริการวิชาการ',
  culture: 'ทำนุบำรุงศิลปวัฒนธรรม',
  teaching: 'การเรียนการสอน',
  research: 'วิจัย',
  quality_assurance: 'การประกันคุณภาพ',
  other: 'อื่น ๆ / ยังไม่จำแนก',
};

const projectTypeFilterOptions: { value: ProjectTypeFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'academic_service', label: projectTypeLabels.academic_service },
  { value: 'culture', label: projectTypeLabels.culture },
  { value: 'teaching', label: projectTypeLabels.teaching },
  { value: 'research', label: projectTypeLabels.research },
  { value: 'quality_assurance', label: projectTypeLabels.quality_assurance },
  { value: 'other', label: projectTypeLabels.other },
];

const normalizeProjectType = (value?: ProjectType | null): ProjectType => value || 'other';

interface ProjectStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
}

interface BudgetRow {
  month: string;
  budget: number;
  spent: number;
}

export default function ProjectReports() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projectSearch, setProjectSearch] = useState('');
  const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectTypeFilter>('all');
  
  const [stats, setStats] = useState<ProjectStats>({ totalBudget: 0, totalSpent: 0, remaining: 0 });
  const [budgetData, setBudgetData] = useState<BudgetRow[]>([]);
  
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

  const getProjectsByType = (filter: ProjectTypeFilter) => projects.filter((project) => {
    const normalizedType = normalizeProjectType(project.project_type);
    return filter === 'all' || normalizedType === filter;
  });

  const typeFilteredProjects = getProjectsByType(projectTypeFilter);

  const handleProjectTypeFilterChange = (value: string) => {
    const nextFilter = value as ProjectTypeFilter;
    const nextProjects = getProjectsByType(nextFilter);
    const currentProject = projects.find((project) => project.id.toString() === selectedProject);
    const currentMatchesFilter =
      !currentProject || nextFilter === 'all' || normalizeProjectType(currentProject.project_type) === nextFilter;

    setProjectTypeFilter(nextFilter);

    if (!currentMatchesFilter && nextProjects.length > 0) {
      handleProjectChange(nextProjects[0].id.toString());
    }
  };

  const projectSearchText = projectSearch.trim();
  const hasProjectSearchText = projectSearchText.length > 0;
  const searchedProjects = hasProjectSearchText
    ? typeFilteredProjects.filter((project) =>
        `${project.id} ${project.name}`.toLowerCase().includes(projectSearchText.toLowerCase())
      )
    : [];

  const selectedProjectName = projects.find(p => p.id.toString() === selectedProject)?.name || 'project-report';
  const selectedProjectDetails = projects.find(p => p.id.toString() === selectedProject);
  const safeProjectName = selectedProjectName.replace(/[\\/:*?"<>|]/g, '_');

  const handleExport = (format: 'excel' | 'pdf') => {
    if (!selectedProject) return;

    if (format === 'excel') {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
        { รายการ: 'ชื่อโครงการ', ข้อมูล: selectedProjectName },
        { รายการ: 'รหัสโครงการ', ข้อมูล: selectedProject },
        { รายการ: 'ประเภทโครงการ', ข้อมูล: projectTypeLabels[normalizeProjectType(selectedProjectDetails?.project_type)] },
        { รายการ: 'รายละเอียด', ข้อมูล: selectedProjectDetails?.description || '' },
        { รายการ: 'อาจารย์ผู้รับผิดชอบ', ข้อมูล: selectedProjectDetails?.responsible_faculty_id || '' },
        { รายการ: 'ปีการศึกษา', ข้อมูล: selectedProjectDetails?.academic_year || '' },
        { รายการ: 'วันที่เริ่ม', ข้อมูล: selectedProjectDetails?.start_date || '' },
        { รายการ: 'วันที่สิ้นสุด', ข้อมูล: selectedProjectDetails?.end_date || '' },
        { รายการ: 'สถานะ', ข้อมูล: selectedProjectDetails?.status || '' },
        { รายการ: 'งบประมาณทั้งหมด', ข้อมูล: stats.totalBudget },
        { รายการ: 'ใช้จ่ายจริง', ข้อมูล: stats.totalSpent },
        { รายการ: 'งบประมาณคงเหลือ', ข้อมูล: stats.remaining },
      ]), 'Summary');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(budgetData.map((row) => ({ ปีงบประมาณ: row.month, งบประมาณ: row.budget, ใช้จริง: row.spent }))), 'Budget');
      XLSX.writeFile(workbook, `${safeProjectName}.xlsx`);
      return;
    }

    const doc = new jsPDF();
    const titleCanvas = document.createElement('canvas');
    const context = titleCanvas.getContext('2d');
    if (context) {
      const title = `รายงานโครงการ: ${selectedProjectName}`;
      context.font = 'bold 24px Tahoma, sans-serif';
      titleCanvas.width = Math.max(900, Math.ceil(context.measureText(title).width) + 24);
      titleCanvas.height = 48;
      context.font = 'bold 24px Tahoma, sans-serif';
      context.fillStyle = '#111827';
      context.fillText(title, 8, 32);
      const titleWidth = Math.min(180, titleCanvas.width / 5);
      doc.addImage(titleCanvas.toDataURL('image/png'), 'PNG', 14, 9, titleWidth, titleWidth * titleCanvas.height / titleCanvas.width);
    } else {
      doc.text(`Project Report: ${selectedProject}`, 14, 16);
    }
    autoTable(doc, {
      startY: 24,
      head: [['Metric', 'Value']],
      body: [
        ['Budget', formatCurrency(stats.totalBudget)],
        ['Spent', formatCurrency(stats.totalSpent)],
        ['Remaining', formatCurrency(stats.remaining)],
      ],
    });
    autoTable(doc, {
      head: [['Period', 'Budget', 'Spent']],
      body: budgetData.map(row => [row.month, formatCurrency(row.budget), formatCurrency(row.spent)]),
    });
    doc.save(`${safeProjectName}.pdf`);
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
            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

              {/* Select Project */}
              <div className="w-full lg:w-80">
                <Select value={selectedProject} onValueChange={handleProjectChange} disabled={typeFilteredProjects.length === 0 || loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกโครงการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeFilteredProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        <span className="font-bold text-slate-900">{project.name}</span>
                        <span className="mx-1 text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {projectTypeLabels[normalizeProjectType(project.project_type)]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:justify-end">
                <div className="relative w-full sm:w-[400px]">
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
                  {isProjectSearchOpen && hasProjectSearchText && (
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
                            <span className="inline-flex min-w-0 items-center whitespace-nowrap">
                              <span className="truncate font-bold text-slate-900">{project.name}</span>
                              <span className="mx-1 shrink-0 text-muted-foreground">•</span>
                              <span className="shrink-0 text-muted-foreground">
                                {projectTypeLabels[normalizeProjectType(project.project_type)]}
                              </span>
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
                  <div className="space-y-2">
                    <Label htmlFor="project-type-filter">ประเภทโครงการ</Label>
                    <Select value={projectTypeFilter} onValueChange={handleProjectTypeFilterChange}>
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
                    onClick={() => handleProjectTypeFilterChange('all')}
                  >
                    ล้างตัวกรอง
                  </Button>
                </PopoverContent>
              </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* การ์ดแสดงตัวเลขสถิติสรุป */}
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>

        <div className="grid gap-4">
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

        </div>
      </div>
    </>
  );
}
