import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

// เรียกใช้โมดูลอินสแตนซ์ Axios ที่กำหนดค่าพอร์ตกลางไว้แล้ว
import api from '@/lib/axios';
import { type ReportDetails } from '@/components/ui/ProjectReportDetailsDialog';
import { consumePendingProjectNavigation } from '@/lib/projectNavigation';

interface ProjectOption {
  id: number;
  project_id: string;
  name: string;
  project_type?: ProjectType;
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
  totalBudget: number | null;
}

export default function ProjectReports() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projectSearch, setProjectSearch] = useState('');
  const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectTypeFilter>('all');
  
  const [stats, setStats] = useState<ProjectStats>({ totalBudget: null });
  const [details, setDetails] = useState<ReportDetails | null>(null);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [periodStatus, setPeriodStatus] = useState('open');
  const [loading, setLoading] = useState(true);
  const activeFilterCount = Number(projectTypeFilter !== 'all');

  // ฟังก์ชันดึงข้อมูลรายงานจาก API (แก้ไขให้ใช้ Axios Instance)
  const fetchReportData = async (projectId = '') => {
    setLoading(true);
    setErrorMessage('');
    try {
      // เรียกข้อมูลผ่านหน้า index.php ของ Backend ตามรูปแบบ API ที่ใช้อยู่ทั่วไป
      const response = await api.get('/index.php', { params: { page: 'get-project-reports', ...(projectId ? { project_id: projectId } : {}) } });
      const res = response.data;
      
      if (res.status === 'success') {
        setProjects(res.data.projects);
        setSelectedProject(res.data.selectedProjectId ? res.data.selectedProjectId.toString() : '');
        setStats(res.data.stats);
        setDetails(res.data.details);
        setPeriodStatus(res.data.periodStatus);
      } else {
        console.error(res.message);
      }
    } catch (err: any) {
      setDetails(null); setStats({ totalBudget: null });
      setErrorMessage(err.response?.data?.message || "โหลดรายงานไม่สำเร็จ");
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
    handleProjectChange(project.project_id.toString());
  };

  const getProjectsByType = (filter: ProjectTypeFilter) => projects.filter((project) => {
    const normalizedType = normalizeProjectType(project.project_type);
    return filter === 'all' || normalizedType === filter;
  });

  const typeFilteredProjects = getProjectsByType(projectTypeFilter);

  const handleProjectTypeFilterChange = (value: string) => {
    const nextFilter = value as ProjectTypeFilter;
    const nextProjects = getProjectsByType(nextFilter);
    const currentProject = projects.find((project) => project.project_id.toString() === selectedProject);
    const currentMatchesFilter =
      !currentProject || nextFilter === 'all' || normalizeProjectType(currentProject.project_type) === nextFilter;

    setProjectTypeFilter(nextFilter);

    if (!currentMatchesFilter && nextProjects.length > 0) {
      handleProjectChange(nextProjects[0].project_id.toString());
    }
  };

  const projectSearchText = projectSearch.trim();
  const hasProjectSearchText = projectSearchText.length > 0;
  const searchedProjects = hasProjectSearchText
    ? typeFilteredProjects.filter((project) =>
        `${project.project_id} ${project.name}`.toLowerCase().includes(projectSearchText.toLowerCase())
      )
    : [];

  const selectedProjectName = projects.find(p => p.project_id.toString() === selectedProject)?.name || 'project-report';

  const formatCurrency = (num: number | null) => {
    if (num === null || num === undefined) return "ยังไม่ระบุ";
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
            <p className="app-page-description">รายงานงบรวมทั้งหมดของโครงการและกิจกรรมย่อย</p>
          </div>
        </div>

        {errorMessage && <p role="alert" className="text-destructive">{errorMessage}</p>}
        <p className="text-sm text-muted-foreground">{periodStatus === "closed" ? "ปิดรอบแล้ว · อ่านจากภาพรายงานที่บันทึกไว้" : "ยอดงบประมาณมาจากโครงการหลักเท่านั้น · รายการที่รอตรวจย้ายยังไม่รวมในรายงาน"}</p>
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
                      <SelectItem key={project.project_id} value={project.project_id.toString()}>
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
                            key={project.project_id}
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
        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งบรวมทั้งหมดของโครงการ</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{formatCurrency(stats.totalBudget)}</div>
            </CardContent>
          </Card>
        </div>

        {details && <Card><CardHeader><CardTitle>รายละเอียดโครงการและกิจกรรม</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm">รหัส {selectedProject} · ปี {details.academic_year} · {details.plan_name || 'ยังไม่ระบุแผนงาน'}</p><p className="text-sm">วัตถุประสงค์: {details.objective || 'ยังไม่ระบุ'} · KPI: {details.kpi || 'ยังไม่ระบุ'}</p><p className="rounded-md border p-3 text-sm">งบรวมทั้งหมด: <span className="font-semibold">฿{formatCurrency(details.total_budget == null ? null : Number(details.total_budget))}</span></p><div className="space-y-2"><h3 className="font-semibold">กิจกรรมย่อย</h3>{details.activities.length === 0 ? <p className="text-sm text-muted-foreground">ไม่มีกิจกรรมย่อย</p> : details.activities.map(activity => <div key={activity.id ?? activity.activity_name} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"><span>{activity.activity_name}</span><a href={activity.google_drive_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">เปิด Google Drive</a></div>)}</div><p className="text-xs text-muted-foreground">กิจกรรมย่อยไม่มีงบแยก</p></CardContent></Card>}
      </div>
    </>
  );
}
