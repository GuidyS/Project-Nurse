import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Edit, Eye, FileText, FolderKanban, Users, User, Calendar, Loader2, Plus, Globe2, Image } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDropInput } from '@/components/shared/FileDropInput';
import { PageHeader } from '@/components/shared/PageHeader';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  id?: number;
  name: string;
  type?: string;
  role: string;
}

type ProjectType = 'academic_service' | 'culture' | 'other' | 'teaching' | 'research' | 'quality_assurance';
type ProjectTypeFilter = 'all' | ProjectType;
type ProjectAttachmentType = 'google_drive' | 'website_url' | 'file';

interface Project {
  id: string;
  project_id?: number;
  name: string;
  project_name_th?: string;
  project_name_en?: string;
  description?: string;
  project_type?: ProjectType | null;
  responsible_faculty_id?: number | string | null;
  responsible_name?: string | null;
  type: string;
  status: string;
  budget: number | null;
  spent: number | null;
  budget_allocated?: number | string | null;
  budget_spent?: number | string | null;
  project_budget_years_id?: number | null;
  fiscal_year?: number | null;
  budget_note?: string | null;
  members: number;
  deadline: string;
  academic_year?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  documents?: ProjectDocument[];
  plos?: string[];
  member_faculty_ids?: number[];
  member_faculties?: ProjectFacultyMember[];
  member_details?: ProjectFacultyMember[];
  can_edit?: boolean;
}

interface FacultyOption {
  faculty_id: number;
  name: string;
  email?: string | null;
}

type ProjectStatus = 'pending' | 'active' | 'completed' | 'cancelled';

const GoogleDriveIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="#0F9D58" d="M8.3 3h7.4l7.4 12.8h-7.4L8.3 3Z" />
    <path fill="#F4B400" d="M.9 15.8 8.3 3l3.7 6.4-3.7 6.4H.9Z" />
    <path fill="#4285F4" d="M8.3 15.8h14.8L19.4 22H4.6l3.7-6.2Z" />
  </svg>
);

const projectTypeLabels: Record<ProjectType, string> = {
  academic_service: 'บริการวิชาการ',
  culture: 'ทำนุบำรุงศิลปวัฒนธรรม',
  teaching: 'การเรียนการสอน',
  research: 'วิจัย',
  quality_assurance: 'การประกันคุณภาพ',
  other: 'อื่น ๆ / ยังไม่จำแนก',
};

const projectTypeTabs: { value: ProjectTypeFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'academic_service', label: projectTypeLabels.academic_service },
  { value: 'culture', label: projectTypeLabels.culture },
  { value: 'teaching', label: projectTypeLabels.teaching },
  { value: 'research', label: projectTypeLabels.research },
  { value: 'quality_assurance', label: projectTypeLabels.quality_assurance },
  { value: 'other', label: projectTypeLabels.other },
];

const normalizeProjectType = (value?: ProjectType | null): ProjectType => value || 'other';

const formatProjectBudget = (amount: number | null) =>
  amount == null ? 'ยังไม่ระบุ' : `${amount.toLocaleString('th-TH', { maximumFractionDigits: 2 })} บาท`;

const formatCurrency = (value?: string | number | null) => {
  const amount = Number(value || 0);
  return amount.toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusLabels: Record<ProjectStatus, string> = {
  pending: 'รออนุมัติ',
  active: 'กำลังดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ไม่อนุมัติ/ยกเลิก',
};

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
const isExternalDocumentUrl = (document: ProjectDocument) => /^https?:\/\//i.test(document.file_path || '');
const getFileUrl = (filePath: string) =>
  /^https?:\/\//i.test(filePath) ? filePath : `${API_BASE_URL}/${filePath.replace(/^\/+/, '')}`;

const getAttachmentUrlType = (value: string): Exclude<ProjectAttachmentType, 'file'> => {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    return host === 'drive.google.com' || host === 'docs.google.com' ? 'google_drive' : 'website_url';
  } catch {
    return 'website_url';
  }
};

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

const getDocumentAttachmentType = (document: ProjectDocument): ProjectAttachmentType => {
  if (!isExternalDocumentUrl(document)) return 'file';
  const label = (document.file_name || '').toLowerCase();
  if (label.includes('website')) return 'website_url';
  return getAttachmentUrlType(document.file_path || '');
};

const getDocumentDisplayName = (document: ProjectDocument) => {
  const attachmentType = getDocumentAttachmentType(document);
  if (attachmentType === 'google_drive') return 'Google Drive';
  if (attachmentType === 'website_url') return 'Website URL';
  return document.file_name || document.name;
};

const getDocumentOpenLabel = (document: ProjectDocument) => {
  const attachmentType = getDocumentAttachmentType(document);
  if (attachmentType === 'google_drive') return 'Google Drive';
  if (attachmentType === 'website_url') return 'เว็บไซต์';
  return 'ไฟล์';
};

const DocumentAttachmentIcon = ({ document, className = 'h-4 w-4' }: { document: ProjectDocument; className?: string }) => {
  const attachmentType = getDocumentAttachmentType(document);
  if (attachmentType === 'google_drive') return <GoogleDriveIcon className={className} />;
  if (attachmentType === 'website_url') return <Globe2 className={className} />;
  return <Image className={className} />;
};

const projectDocuments = (project?: Project | null) => (Array.isArray(project?.documents) ? project.documents : []);
const projectPlos = (project?: Project | null) => (Array.isArray(project?.plos) ? project.plos : []);

const normalizeStatus = (value?: string | null): ProjectStatus => {
  if (value === 'pending' || value === 'active' || value === 'completed' || value === 'cancelled') return value;
  return 'active';
};

const projectBudgetAllocated = (project: Project) => project.budget_allocated ?? project.budget ?? 0;
const projectBudgetSpent = (project: Project) => project.budget_spent ?? project.spent ?? 0;
const projectBudgetNote = (project: Project) => project.budget_note || '';

const getProjectKey = (project: Project) => project.project_id ?? Number(project.id || 0);

const projectResponsibleName = (project: Project) => {
  const responsibleName = (project.responsible_name || '').trim();
  if (responsibleName) return responsibleName;

  const responsibleId = Number(project.responsible_faculty_id || 0);
  const responsibleMember = (project.member_details || project.member_faculties || []).find((member) => {
    const memberId = Number(member.id || member.faculty_id || 0);
    return responsibleId > 0 && memberId === responsibleId;
  });

  return responsibleMember?.name || '-';
};

const projectFacultyMembers = (project: Project) => {
  const responsibleId = Number(project.responsible_faculty_id || 0);
  return (project.member_details || project.member_faculties || []).filter((member) => {
    const memberId = Number(member.id || member.faculty_id || 0);
    return responsibleId <= 0 || memberId !== responsibleId;
  });
};

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectTypeFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProjectForm>(() => createInitialForm());
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<number[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
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
    });
    setEditingProjectId(project.id);
    setSelectedFacultyIds(project.member_faculty_ids || []);
    setMemberSearch('');
    setSelectedFiles([]);
    setIsCreateOpen(true);
  };

  const openViewDialog = (project: Project) => {
    setViewProject(project);
    setIsViewOpen(true);
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

  const renderDetailDocumentList = (documents: ProjectDocument[]) => {
    if (documents.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
          ยังไม่มีเอกสารแนบสำหรับโครงการนี้
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-5">
        {documents.map((documentItem) => (
          <button
            key={documentItem.id}
            type="button"
            className="flex flex-col items-center gap-2 rounded-md bg-background px-2 py-3 text-center transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!documentItem.file_path}
            onClick={() => openDocument(documentItem)}
            title={getDocumentOpenLabel(documentItem)}
            aria-label={`เปิดเอกสาร ${documentItem.name || getDocumentDisplayName(documentItem)}`}
          >
            <DocumentAttachmentIcon document={documentItem} className="h-14 w-14 shrink-0" />
            <div className="min-w-0 w-full">
              <p className="max-w-[7rem] truncate text-center text-[13px] font-semibold text-foreground">{documentItem.name}</p>
              <p className="truncate text-xs text-muted-foreground">{formatDate(documentItem.date)}</p>
              <p className="truncate text-xs text-muted-foreground">{getDocumentDisplayName(documentItem)}</p>
            </div>
          </button>
        ))}
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

    if (academicYear !== null && (!Number.isFinite(academicYear) || academicYear <= 0)) {
      return 'ปีการศึกษาต้องเป็นตัวเลขมากกว่า 0';
    }

    if (budgetAllocated !== null && (!Number.isFinite(budgetAllocated) || budgetAllocated < 0)) {
      return 'งบประมาณที่ได้รับต้องไม่ติดลบ';
    }

    if (budgetSpent !== null && (!Number.isFinite(budgetSpent) || budgetSpent < 0)) {
      return 'งบที่ใช้จริงต้องไม่ติดลบ';
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

  const filteredProjects = useMemo(() => {
    return projects.filter(
      (project) => projectTypeFilter === 'all' || normalizeProjectType(project.project_type) === projectTypeFilter
    );
  }, [projectTypeFilter, projects]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeProjectsCount = filteredProjects.filter(
    p => p.status === 'active' || p.status === 'กำลังดำเนินการ'
  ).length;

  const pendingProjectsCount = filteredProjects.filter(
    p => p.status === 'pending' || p.status === 'รอดำเนินการ'
  ).length;
  const completedProjectsCount = filteredProjects.filter(
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
      <div className="app-page">
        <PageHeader
          title="โครงการของฉัน"
          description="โครงการที่คุณเป็นผู้รับผิดชอบหรือเป็นสมาชิก"
          actions={<Badge variant="outline">อ่านอย่างเดียว</Badge>}
        />

        <Tabs value={projectTypeFilter} onValueChange={(value) => setProjectTypeFilter(value as ProjectTypeFilter)}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {projectTypeTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">โครงการทั้งหมด</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredProjects.length}</div>
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
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">ไม่พบโครงการที่เกี่ยวข้องกับคุณในขณะนี้</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="flex gap-3">{project.name}
                        {getStatusBadge(project.status)}
                      </CardTitle>
                      <CardDescription className="mt-1">ประเภท: {project.type}</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-2"
                      onClick={() => openViewDialog(project)}
                    >
                      <Eye className="h-4 w-4" />
                      ดูรายละเอียด
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{project.members} คน</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">กำหนดส่ง: {project.deadline}</span>
                    </div>
                  </div>
                  <dl className="grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
                    <div className="min-w-0 space-y-1">
                      <dt className="text-sm text-muted-foreground">งบเสนอ</dt>
                      <dd className="break-words text-base font-semibold tabular-nums">{formatProjectBudget(project.budget)}</dd>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <dt className="text-sm text-muted-foreground">ใช้จริง</dt>
                      <dd className="break-words text-base font-semibold tabular-nums">{formatProjectBudget(project.spent)}</dd>
                    </div>
                  </dl>
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
                            <User aria-hidden="true" className="h-3 w-3 shrink-0" />
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
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) setViewProject(null);
        }}
      >
        <DialogContent className="app-dialog-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดโครงการ</DialogTitle>
            <DialogDescription>ข้อมูลโครงการที่บันทึกในระบบ</DialogDescription>
          </DialogHeader>
          {viewProject && (
            <div className="space-y-4 py-2 text-sm">
              {(() => {
                const facultyMembers = projectFacultyMembers(viewProject);

                return (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                      <p className="text-muted-foreground">ผู้ดำเนินโครงการ</p>
                      <p className="font-medium text-foreground">{projectResponsibleName(viewProject)}</p>
                    </div>
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                      <p className="text-muted-foreground">ผู้ร่วมโครงการ</p>
                      {facultyMembers.length === 0 ? (
                        <p className="font-medium text-foreground">-</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {facultyMembers.map((member) => (
                            <Badge key={`${getProjectKey(viewProject)}-${member.id || member.faculty_id}`} variant="secondary">
                              {member.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="space-y-1">
                <p className="text-muted-foreground">ประเภทโครงการ</p>
                <Badge variant="outline">{projectTypeLabels[normalizeProjectType(viewProject.project_type)]}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">PLO ที่เชื่อมกับโครงการ</p>
                {projectPlos(viewProject).length === 0 ? (
                  <p className="font-medium text-foreground">-</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {projectPlos(viewProject).map((plo) => (
                      <Badge key={`${getProjectKey(viewProject)}-detail-${plo}`} variant="secondary">
                        {plo}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">ชื่อโครงการ (ภาษาไทย)</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">{viewProject.project_name_th || viewProject.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">ชื่อโครงการ (ภาษาอังกฤษ)</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">
                  {viewProject.project_name_en || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">คำอธิบาย</p>
                <p className="font-medium text-foreground whitespace-pre-wrap rounded-lg border bg-muted/30 p-3">
                  {viewProject.description || 'ไม่มีคำอธิบายโครงการ'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">ปีการศึกษา</p>
                  <p className="font-medium text-foreground">{viewProject.academic_year || viewProject.fiscal_year || '-'}</p>
                </div>
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">สถานะ</p>
                  <p className="font-medium text-foreground">{statusLabels[normalizeStatus(viewProject.status)]}</p>
                </div>
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">วันที่เริ่มต้น</p>
                  <p className="font-medium text-foreground">{formatDate(viewProject.start_date)}</p>
                </div>
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">วันที่สิ้นสุด</p>
                  <p className="font-medium text-foreground">{formatDate(viewProject.end_date)}</p>
                </div>
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">งบเสนอ</p>
                  <p className="font-medium text-foreground">{formatCurrency(projectBudgetAllocated(viewProject))} บาท</p>
                </div>
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">งบใช้จริง</p>
                  <p className="font-medium text-foreground">{formatCurrency(projectBudgetSpent(viewProject))} บาท</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">แหล่งงบ/หมายเหตุ</p>
                <p className="font-medium text-foreground whitespace-pre-wrap rounded-lg border bg-muted/30 p-3">
                  {projectBudgetNote(viewProject) || '-'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground text-base font-bold">เอกสารที่อัปโหลด</p>
                  <Badge variant="outline">{projectDocuments(viewProject).length} รายการ</Badge>
                </div>
                {renderDetailDocumentList(projectDocuments(viewProject))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
