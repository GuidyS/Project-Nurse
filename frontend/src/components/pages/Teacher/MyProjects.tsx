import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Edit, Eye, FileText, FolderKanban, Users, Calendar, DollarSign, Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileDropInput } from '@/components/ui/FileDropInput';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface ProjectDocument {
  id: number;
  name: string;
  type: string;
  date: string;
  file_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
}

interface ProjectFacultyMember {
  faculty_id: number;
  name: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  project_name_th?: string;
  project_name_en?: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  members: number;
  deadline: string;
  academic_year?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  documents?: ProjectDocument[];
  member_faculty_ids?: number[];
  member_faculties?: ProjectFacultyMember[];
  can_edit?: boolean;
}

interface FacultyOption {
  faculty_id: number;
  name: string;
  email?: string | null;
}

type ProjectStatus = 'pending' | 'active' | 'completed' | 'cancelled';

interface CreateProjectForm {
  project_name_th: string;
  project_name_en: string;
  description: string;
  academic_year: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  budget_allocated: string;
  budget_spent: string;
  progress_percent: string;
}

const createInitialForm = (): CreateProjectForm => ({
  project_name_th: '',
  project_name_en: '',
  description: '',
  academic_year: '',
  status: 'active',
  start_date: '',
  end_date: '',
  budget_allocated: '',
  budget_spent: '',
  progress_percent: '',
});

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
    case 'กำลังดำเนินการ':
      return <Badge className="bg-blue-500">กำลังดำเนินการ</Badge>;
    case 'completed':
    case 'เสร็จสิ้น':
      return <Badge className="bg-green-500">เสร็จสิ้น</Badge>;
    case 'pending':
    case 'รอดำเนินการ':
      return <Badge className="bg-yellow-500">รอดำเนินการ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const PROJECT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
const getFileUrl = (filePath: string) => `${API_BASE_URL}/${filePath.replace(/^\/+/, '')}`;

const uploadMyProjectAttachment = async (projectId: number | string, file: File) => {
  const uploadData = new FormData();
  uploadData.append('project_id', String(projectId));
  uploadData.append('file', file);

  const response = await api.post('/index.php?page=upload-my-project-file', uploadData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (response.data.status !== 'success') {
    throw new Error(response.data.message || 'ไม่สามารถอัปโหลดไฟล์แนบโครงการได้');
  }

  return response.data;
};

const formatFileSize = (size: number | null) => {
  if (!size) return '';
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const getDocumentDisplayName = (document: ProjectDocument) => document.file_name || document.name;

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProjectForm>(() => createInitialForm());
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<number[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const { toast } = useToast();

  const fetchMyProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-my-projects');
      if (response.data.status === 'success') {
        setProjects(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: unknown) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: getApiErrorMessage(error, "ไม่สามารถดึงข้อมูลโครงการได้"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  useEffect(() => {
    const fetchFacultyOptions = async () => {
      try {
        const response = await api.get('/index.php?page=get-my-project-faculty-options');
        if (response.data.status === 'success') {
          const currentFacultyId = Number(response.data.current_faculty_id || 0);
          const options = (response.data.data || []).filter(
            (faculty: FacultyOption) => faculty.faculty_id !== currentFacultyId
          );
          setFacultyOptions(options);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error: unknown) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: getApiErrorMessage(error, 'ไม่สามารถดึงรายชื่ออาจารย์ได้'),
          variant: 'destructive',
        });
      }
    };

    fetchFacultyOptions();
  }, [toast]);

  const updateCreateForm = (field: keyof CreateProjectForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetCreateDialog = () => {
    setCreateForm(createInitialForm());
    setEditingProjectId(null);
    setSelectedFiles([]);
    setSelectedFacultyIds([]);
    setMemberSearch('');
  };

  const openEditDialog = (project: Project) => {
    setCreateForm({
      project_name_th: project.project_name_th || project.name || '',
      project_name_en: project.project_name_en || '',
      description: project.description || '',
      academic_year: project.academic_year != null ? String(project.academic_year) : '',
      status: (project.status as ProjectStatus) || 'active',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget_allocated: project.budget != null ? String(project.budget) : '',
      budget_spent: project.spent != null ? String(project.spent) : '',
      progress_percent: project.progress != null ? String(project.progress) : '',
    });
    setEditingProjectId(project.id);
    setSelectedFacultyIds(project.member_faculty_ids || []);
    setMemberSearch('');
    setSelectedFiles([]);
    setIsCreateOpen(true);
  };

  const toggleFacultyMember = (facultyId: number) => {
    setSelectedFacultyIds((prev) =>
      prev.includes(facultyId)
        ? prev.filter((id) => id !== facultyId)
        : [...prev, facultyId]
    );
  };

  const openDocument = (document: ProjectDocument) => {
    if (!document.file_path) return;
    window.open(getFileUrl(document.file_path), '_blank');
  };

  const downloadDocument = (document: ProjectDocument) => {
    if (!document.file_path) return;

    const link = window.document.createElement('a');
    link.href = getFileUrl(document.file_path);
    link.download = document.file_name || document.name;
    link.click();
  };

  const renderDocumentList = (documents: ProjectDocument[], emptyText?: string) => {
    if (documents.length === 0) {
      return emptyText ? <p className="text-sm text-muted-foreground">{emptyText}</p> : null;
    }

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {documents.map((document) => {
          const displayName = getDocumentDisplayName(document);
          const fileMeta = [displayName, document.date, formatFileSize(document.file_size)].filter(Boolean).join(' - ');

          return (
            <div
              key={document.id}
              className="group relative flex min-h-[118px] flex-col items-center justify-start gap-2 rounded-md p-3 text-center transition-colors hover:bg-muted/50"
            >
              <button
                type="button"
                className="flex w-full flex-col items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!document.file_path}
                title={fileMeta}
                onClick={() => openDocument(document)}
              >
                <FileText className="h-12 w-12 text-muted-foreground" />
                <span className="line-clamp-2 max-w-full break-words text-xs text-muted-foreground">
                  {displayName}
                </span>
              </button>
              <div className="absolute right-1 top-1 flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-background/80"
                  disabled={!document.file_path}
                  onClick={() => openDocument(document)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-background/80"
                  disabled={!document.file_path}
                  onClick={() => downloadDocument(document)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const validateCreateForm = () => {
    if (!createForm.project_name_th.trim()) {
      return 'กรุณากรอกชื่อโครงการภาษาไทย';
    }

    const academicYear = createForm.academic_year === '' ? null : Number(createForm.academic_year);
    const budgetAllocated = createForm.budget_allocated === '' ? null : Number(createForm.budget_allocated);
    const budgetSpent = createForm.budget_spent === '' ? null : Number(createForm.budget_spent);
    const progressPercent = createForm.progress_percent === '' ? null : Number(createForm.progress_percent);

    if (academicYear !== null && (!Number.isFinite(academicYear) || academicYear <= 0)) {
      return 'ปีการศึกษาต้องเป็นตัวเลขมากกว่า 0';
    }

    if (budgetAllocated !== null && (!Number.isFinite(budgetAllocated) || budgetAllocated < 0)) {
      return 'งบประมาณที่ได้รับต้องไม่ติดลบ';
    }

    if (budgetSpent !== null && (!Number.isFinite(budgetSpent) || budgetSpent < 0)) {
      return 'งบที่ใช้จริงต้องไม่ติดลบ';
    }

    if (progressPercent !== null && (!Number.isFinite(progressPercent) || progressPercent < 0 || progressPercent > 100)) {
      return 'ความคืบหน้าต้องอยู่ระหว่าง 0 ถึง 100';
    }

    if (createForm.start_date && createForm.end_date && createForm.end_date < createForm.start_date) {
      return 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น';
    }

    if (selectedFiles.some((file) => file.size > PROJECT_ATTACHMENT_MAX_BYTES)) {
      return 'ไฟล์แนบต้องมีขนาดไม่เกิน 10 MB';
    }

    return null;
  };

  const handleCreateProject = async () => {
    const validationError = validateCreateForm();
    if (validationError) {
      toast({
        title: 'ข้อมูลไม่ครบถ้วน',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      project_name_th: createForm.project_name_th.trim(),
      project_name_en: createForm.project_name_en.trim(),
      description: createForm.description.trim(),
      academic_year: createForm.academic_year ? Number(createForm.academic_year) : null,
      status: createForm.status,
      start_date: createForm.start_date || null,
      end_date: createForm.end_date || null,
      budget_allocated: createForm.budget_allocated ? Number(createForm.budget_allocated) : null,
      budget_spent: createForm.budget_spent ? Number(createForm.budget_spent) : null,
      progress_percent: createForm.progress_percent ? Number(createForm.progress_percent) : null,
      member_faculty_ids: selectedFacultyIds,
    };

    try {
      setIsSubmitting(true);
      const endpoint = editingProjectId ? '/index.php?page=update-my-project' : '/index.php?page=create-my-project';
      const response = await api.post(endpoint, editingProjectId
        ? { project_id: editingProjectId, ...payload }
        : payload);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'ไม่สามารถบันทึกโครงการได้');
      }

      let toastTitle = editingProjectId ? 'บันทึกการแก้ไขสำเร็จ' : 'สร้างโครงการสำเร็จ';
      let toastDescription = response.data.message || (editingProjectId ? 'อัปเดตโครงการแล้ว' : 'เพิ่มโครงการใหม่แล้ว');

      if (selectedFiles.length > 0) {
        const uploadResults = await Promise.allSettled(
          selectedFiles.map((file) =>
            uploadMyProjectAttachment(editingProjectId || response.data.project_id, file)
          )
        );
        const successCount = uploadResults.filter((result) => result.status === 'fulfilled').length;
        const failedCount = uploadResults.length - successCount;

        if (failedCount > 0) {
          toastTitle = editingProjectId
            ? 'บันทึกโครงการสำเร็จ แต่ไฟล์แนบบางไฟล์อัปโหลดไม่ได้'
            : 'สร้างโครงการสำเร็จ แต่ไฟล์แนบบางไฟล์อัปโหลดไม่ได้';
          const firstError = uploadResults.find((result) => result.status === 'rejected');
          const errorText =
            firstError?.status === 'rejected'
              ? getApiErrorMessage(firstError.reason, 'ไม่สามารถอัปโหลดไฟล์แนบได้')
              : 'ไม่สามารถอัปโหลดไฟล์แนบได้';
          toastDescription = `${toastDescription}\nอัปโหลดสำเร็จ ${successCount} ไฟล์, ไม่สำเร็จ ${failedCount} ไฟล์\n${errorText}`;
        } else {
          toastDescription = `${toastDescription}\nอัปโหลดไฟล์แนบสำเร็จ ${successCount} ไฟล์`;
        }
      }

      toast({
        title: toastTitle,
        description: toastDescription,
      });
      setIsCreateOpen(false);
      resetCreateDialog();
      fetchMyProjects();
    } catch (error: unknown) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: getApiErrorMessage(error, 'ไม่สามารถบันทึกโครงการได้'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeProjectsCount = projects.filter(
    p => p.status === 'active' || p.status === 'กำลังดำเนินการ'
  ).length;

  const pendingProjectsCount = projects.filter(
    p => p.status === 'pending' || p.status === 'รอดำเนินการ'
  ).length;
  const completedProjectsCount = projects.filter(
    p => p.status === 'completed' || p.status === 'เสร็จสิ้น'
  ).length;
  const editingProject = editingProjectId
    ? projects.find((project) => project.id === editingProjectId) || null
    : null;
  const normalizedMemberSearch = memberSearch.trim().toLowerCase();
  const filteredFacultyOptions = facultyOptions.filter((faculty) => {
    const haystack = `${faculty.name} ${faculty.faculty_id} ${faculty.email || ''}`.toLowerCase();
    return normalizedMemberSearch === '' || haystack.includes(normalizedMemberSearch);
  });
  const selectedFacultyOptions = selectedFacultyIds
    .map((facultyId) => facultyOptions.find((faculty) => faculty.faculty_id === facultyId))
    .filter((faculty): faculty is FacultyOption => Boolean(faculty));

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight leading-snug">โครงการของฉัน</h1>
            <p className="text-muted-foreground">โครงการที่คุณเป็นผู้รับผิดชอบหรือเป็นสมาชิก</p>
          </div>
          <Badge variant="outline">อ่านอย่างเดียว</Badge>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">โครงการทั้งหมด</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
              <FolderKanban className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {activeProjectsCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingProjectsCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เสร็จสิ้น</CardTitle>
              <FolderKanban className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedProjectsCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Cards */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">ไม่พบโครงการที่เกี่ยวข้องกับคุณในขณะนี้</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex gap-3">{project.name}
                        {getStatusBadge(project.status)}
                      </CardTitle>
                      <CardDescription className="mt-1">ประเภท: {project.type}</CardDescription>
                    </div>

                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{project.members} คน</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">กำหนดส่ง: {project.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">ใช้จ่าย: ฿{project.spent.toLocaleString()} / ฿{project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">ความคืบหน้า: {project.progress}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>ความคืบหน้า</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                  {project.member_faculties && project.member_faculties.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">รายชื่อสมาชิก</p>
                      <div className="flex flex-wrap gap-2">
                        {project.member_faculties.map((member) => (
                          <Badge
                            key={`${project.id}-${member.faculty_id}-${member.role}`}
                            variant="outline"
                            className="max-w-full gap-1 rounded-md px-2 py-1"
                            title={`${member.name} - ${member.role}`}
                          >
                            <Users className="h-3 w-3 shrink-0" />
                            <span className="max-w-[220px] truncate">{member.name}</span>
                            <span className="text-muted-foreground">({member.role})</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetCreateDialog();
        }}
      >
        <DialogContent className="app-dialog-2xl">
          <DialogHeader>
            <DialogTitle>{editingProjectId ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่'}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลโครงการตามคอลัมน์ที่ระบบรองรับ
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="project-name-th">ชื่อโครงการภาษาไทย <span className="text-destructive">*</span></Label>
              <Input
                id="project-name-th"
                value={createForm.project_name_th}
                onChange={(event) => updateCreateForm('project_name_th', event.target.value)}
                placeholder="กรอกชื่อโครงการภาษาไทย"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-name-en">ชื่อโครงการภาษาอังกฤษ</Label>
              <Input
                id="project-name-en"
                value={createForm.project_name_en}
                onChange={(event) => updateCreateForm('project_name_en', event.target.value)}
                placeholder="Project name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-description">รายละเอียด</Label>
              <Textarea
                id="project-description"
                value={createForm.description}
                onChange={(event) => updateCreateForm('description', event.target.value)}
                placeholder="อธิบายรายละเอียดโครงการ"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="project-academic-year">ปีการศึกษา</Label>
                <Input
                  id="project-academic-year"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={createForm.academic_year}
                  onChange={(event) => updateCreateForm('academic_year', event.target.value)}
                  placeholder="2569"
                />
              </div>

              <div className="grid gap-2">
                <Label>สถานะ</Label>
                <Select value={createForm.status} onValueChange={(value) => updateCreateForm('status', value as ProjectStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                    <SelectItem value="pending">รอดำเนินการ</SelectItem>
                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="project-member-search">สมาชิกผู้ร่วมโครงการ</Label>
                <Badge variant="outline">รวม {selectedFacultyIds.length + 1} คน</Badge>
              </div>
              <Input
                id="project-member-search"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="ค้นหาชื่อหรือรหัสอาจารย์"
              />
              {selectedFacultyOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFacultyOptions.map((faculty) => (
                    <Badge
                      key={faculty.faculty_id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleFacultyMember(faculty.faculty_id)}
                    >
                      {faculty.name}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="max-h-52 overflow-y-auto rounded-md border">
                {filteredFacultyOptions.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">ไม่พบรายชื่ออาจารย์</p>
                ) : (
                  filteredFacultyOptions.map((faculty) => {
                    const checked = selectedFacultyIds.includes(faculty.faculty_id);

                    return (
                      <label
                        key={faculty.faculty_id}
                        className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleFacultyMember(faculty.faculty_id)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{faculty.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            รหัสอาจารย์ {faculty.faculty_id}{faculty.email ? ` • ${faculty.email}` : ''}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                ผู้สร้างโครงการถูกนับเป็นสมาชิกอัตโนมัติ
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="project-start-date">วันที่เริ่มต้น</Label>
                <Input
                  id="project-start-date"
                  type="date"
                  value={createForm.start_date}
                  onChange={(event) => updateCreateForm('start_date', event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project-end-date">วันที่สิ้นสุด</Label>
                <Input
                  id="project-end-date"
                  type="date"
                  value={createForm.end_date}
                  onChange={(event) => updateCreateForm('end_date', event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="project-budget-allocated">งบประมาณที่ได้รับ</Label>
                  <Input
                    id="project-budget-allocated"
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.budget_allocated}
                    onChange={(event) => updateCreateForm('budget_allocated', event.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="project-budget-spent">งบที่ใช้จริง</Label>
                  <Input
                    id="project-budget-spent"
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.budget_spent}
                    onChange={(event) => updateCreateForm('budget_spent', event.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="project-progress">ความคืบหน้า (%)</Label>
                  <Input
                    id="project-progress"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={createForm.progress_percent}
                    onChange={(event) => updateCreateForm('progress_percent', event.target.value)}
                    placeholder="0"
                  />
                </div>
            </div>

            {editingProjectId && (
              <div className="space-y-2">
                <Label>ไฟล์แนบเดิมของฉัน</Label>
                {renderDocumentList(editingProject?.documents || [], 'ยังไม่มีไฟล์แนบ')}
              </div>
            )}

            <FileDropInput
              id="my-project-attachment"
              file={null}
              onFileChange={() => undefined}
              files={selectedFiles}
              onFilesChange={setSelectedFiles}
              multiple
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateProject} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : editingProjectId ? (
                <Edit className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {editingProjectId ? 'บันทึกการแก้ไข' : 'สร้างโครงการ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
