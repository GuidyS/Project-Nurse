import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Filter, Eye, Edit, MoreVertical, Upload, Link2, ClipboardCheck, Trash2, Loader2, UserCheck, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

type ProjectType = "academic_service" | "culture" | "other";
type ProjectStatus = "pending" | "active" | "completed" | "cancelled";

interface ProjectMember {
  id: number;
  name: string;
  type: "faculty" | "student" | string;
  role?: string;
}

interface Project {
  project_id: number;
  project_name_th: string;
  project_name_en: string;
  description: string;
  project_type?: ProjectType | null;
  responsible_faculty_id?: number | string | null;
  responsible_name?: string | null;
  academic_year?: number | null;
  status?: ProjectStatus | null;
  start_date?: string | null;
  end_date?: string | null;
  project_budget_years_id?: number | null;
  fiscal_year?: number | null;
  budget?: string | number | null;
  spent?: string | number | null;
  budget_allocated?: string | number | null;
  budget_spent?: string | number | null;
  budget_note?: string | null;
  result?: string | null;
  progress?: string | number | null;
  members?: string | number | null;
  member_details?: ProjectMember[];
  member_names?: string[];
  member_faculty_ids?: number[];
}

interface CurrentUser {
  role_id?: number | string;
}

interface FacultyOption {
  faculty_id: number;
  name: string;
  email?: string | null;
}

interface ProjectFormData {
  project_id: string;
  project_name_th: string;
  project_name_en: string;
  description: string;
  project_type: ProjectType;
  responsible_faculty_id: string;
  member_faculty_ids: number[];
  academic_year: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  budget_allocated: string;
  budget_spent: string;
  budget_source: string;
  budget_note: string;
}

const projectTypeLabels: Record<ProjectType, string> = {
  academic_service: "บริการวิชาการ",
  culture: "ทำนุบำรุงศิลปวัฒนธรรม",
  other: "อื่น ๆ / ยังไม่จำแนก",
};

const statusLabels: Record<ProjectStatus, string> = {
  pending: "รออนุมัติ",
  active: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ไม่อนุมัติ/ยกเลิก",
};

const statusClassNames: Record<ProjectStatus, string> = {
  pending: "border-yellow-500/60 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  active: "border-green-500/60 bg-green-500/10 text-green-700 dark:text-green-300",
  completed: "border-blue-500/60 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  cancelled: "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300",
};

const BUDGET_SOURCE_PREFIX = "แหล่งงบ: ";

const createInitialFormData = (): ProjectFormData => ({
  project_id: "",
  project_name_th: "",
  project_name_en: "",
  description: "",
  project_type: "other",
  responsible_faculty_id: "",
  member_faculty_ids: [],
  academic_year: String(new Date().getFullYear() + 543),
  start_date: "",
  end_date: "",
  status: "pending",
  budget_allocated: "",
  budget_spent: "",
  budget_source: "",
  budget_note: "",
});

const getCurrentUser = (): CurrentUser | null => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? (JSON.parse(rawUser) as CurrentUser) : null;
  } catch {
    return null;
  }
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

const formatCurrency = (value?: string | number | null) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeProjectType = (value?: ProjectType | null): ProjectType => value || "other";
const normalizeStatus = (value?: ProjectStatus | null): ProjectStatus => value || "active";

const projectBudgetAllocated = (project: Project) => project.budget_allocated ?? project.budget ?? 0;
const projectBudgetSpent = (project: Project) => project.budget_spent ?? project.spent ?? 0;
const projectBudgetNote = (project: Project) => project.budget_note ?? project.result ?? "";

const projectProgress = (project: Project) => {
  const progress = Number(project.progress ?? 0);
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(100, Math.round(progress)));
};

const projectResponsibleName = (project: Project) => {
  const responsibleName = (project.responsible_name || "").trim();
  if (responsibleName) return responsibleName;

  const responsibleId = Number(project.responsible_faculty_id || 0);
  const responsibleMember = project.member_details?.find((member) => {
    const memberId = Number(member.id || 0);
    const role = member.role || "";
    return member.type === "faculty" && ((responsibleId > 0 && memberId === responsibleId) || role.includes("รับผิดชอบ") || role.includes("ดำเนิน"));
  });

  return responsibleMember?.name || "-";
};

const projectFacultyMembers = (project: Project) => {
  const responsibleId = Number(project.responsible_faculty_id || 0);
  return (project.member_details || []).filter((member) => {
    const memberId = Number(member.id || 0);
    const role = member.role || "";
    return member.type === "faculty" && (responsibleId <= 0 || memberId !== responsibleId) && !role.includes("รับผิดชอบ") && !role.includes("ดำเนิน");
  });
};

const projectMemberFacultyIds = (project: Project) => {
  if (Array.isArray(project.member_faculty_ids)) {
    return project.member_faculty_ids.map(Number).filter((id) => Number.isFinite(id) && id > 0);
  }

  return projectFacultyMembers(project)
    .map((member) => Number(member.id || 0))
    .filter((id) => Number.isFinite(id) && id > 0);
};

const parseBudgetNote = (raw?: string | null) => {
  const note = raw || "";
  const [sourcePart, ...rest] = note.split(" | ");
  if (sourcePart.startsWith(BUDGET_SOURCE_PREFIX)) {
    return {
      source: sourcePart.replace(BUDGET_SOURCE_PREFIX, ""),
      note: rest.join(" | "),
    };
  }

  return { source: "", note };
};

const ProjectsPage = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(() => createInitialFormData());
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const currentUser = getCurrentUser();
  const canManageProjects = Number(currentUser?.role_id || 0) === 1;

  const navigateToProjectPage = (page: "project-docs" | "project-links" | "project-assessments", projectId: number) => {
    if (!canManageProjects) return;
    sessionStorage.setItem("pendingProjectId", String(projectId));
    window.dispatchEvent(new CustomEvent("app:navigate", { detail: { page } }));
  };

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/index.php?page=get-project", {
        params: { search: searchQuery },
      });
      if (res.data.status === "success") {
        setProjects(res.data.data || []);
      }
    } catch {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลโครงการได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, toast]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProjects]);

  useEffect(() => {
    if (!canManageProjects) return;

    const fetchFacultyOptions = async () => {
      try {
        const res = await api.get("/index.php?page=get-my-project-faculty-options");
        if (res.data.status === "success") {
          setFacultyOptions(res.data.data || []);
        }
      } catch (error: unknown) {
        toast({
          title: "ข้อผิดพลาด",
          description: getApiErrorMessage(error, "ไม่สามารถดึงรายชื่ออาจารย์ได้"),
          variant: "destructive",
        });
      }
    };

    fetchFacultyOptions();
  }, [canManageProjects, toast]);

  const handleOpenViewModal = (project: Project) => {
    setViewProject(project);
    setIsViewOpen(true);
  };

  const handleOpenCreateModal = () => {
    if (!canManageProjects) return;
    setEditMode(false);
    setFormData(createInitialFormData());
    setMemberSearch("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    if (!canManageProjects) return;
    const budget = parseBudgetNote(projectBudgetNote(project));
    setEditMode(true);
    setFormData({
      project_id: project.project_id.toString(),
      project_name_th: project.project_name_th,
      project_name_en: project.project_name_en || "",
      description: project.description || "",
      project_type: normalizeProjectType(project.project_type),
      responsible_faculty_id: project.responsible_faculty_id ? String(project.responsible_faculty_id) : "",
      member_faculty_ids: projectMemberFacultyIds(project),
      academic_year: project.academic_year?.toString() || project.fiscal_year?.toString() || String(new Date().getFullYear() + 543),
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      status: normalizeStatus(project.status),
      budget_allocated: projectBudgetAllocated(project)?.toString() || "",
      budget_spent: projectBudgetSpent(project)?.toString() || "",
      budget_source: budget.source,
      budget_note: budget.note,
    });
    setMemberSearch("");
    setIsModalOpen(true);
  };

  const handleResponsibleFacultyChange = (value: string) => {
    const responsibleFacultyId = Number(value);
    setFormData((prev) => ({
      ...prev,
      responsible_faculty_id: value,
      member_faculty_ids: prev.member_faculty_ids.filter((facultyId) => facultyId !== responsibleFacultyId),
    }));
  };

  const toggleFacultyMember = (facultyId: number) => {
    setFormData((prev) => ({
      ...prev,
      member_faculty_ids: prev.member_faculty_ids.includes(facultyId)
        ? prev.member_faculty_ids.filter((id) => id !== facultyId)
        : [...prev.member_faculty_ids, facultyId],
    }));
  };

  const validateProjectForm = () => {
    if (!formData.project_name_th.trim()) return "กรุณากรอกชื่อโครงการ (ภาษาไทย)";

    const responsibleFacultyId = Number(formData.responsible_faculty_id);
    if (!Number.isInteger(responsibleFacultyId) || responsibleFacultyId <= 0) {
      return "กรุณาเลือกผู้ดำเนินโครงการ";
    }

    const academicYear = Number(formData.academic_year);
    if (!Number.isInteger(academicYear) || academicYear < 2500 || academicYear > 2700) {
      return "กรุณาระบุปีการศึกษา พ.ศ. 2500-2700";
    }

    const budgetAllocated = formData.budget_allocated === "" ? null : Number(formData.budget_allocated);
    const budgetSpent = formData.budget_spent === "" ? null : Number(formData.budget_spent);
    if (budgetAllocated !== null && (!Number.isFinite(budgetAllocated) || budgetAllocated < 0)) {
      return "งบเสนอต้องเป็นตัวเลขไม่ติดลบ";
    }
    if (budgetSpent !== null && (!Number.isFinite(budgetSpent) || budgetSpent < 0)) {
      return "งบใช้จริงต้องเป็นตัวเลขไม่ติดลบ";
    }

    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      return "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น";
    }

    const currentProject = projects.find((project) => project.project_id.toString() === formData.project_id);
    const currentProgress = Number(currentProject?.progress || 0);
    if (editMode && formData.status === "completed" && currentProgress < 100) {
      return `ความคืบหน้าปัจจุบัน ${currentProgress}% ต้องครบ 100% ก่อนเปลี่ยนเป็นเสร็จสิ้น`;
    }

    return null;
  };

  const handleSaveProject = async () => {
    if (!canManageProjects) return;

    const validationError = validateProjectForm();
    if (validationError) {
      toast({ title: "แจ้งเตือน", description: validationError, variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const academicYear = Number(formData.academic_year);
      const endpoint = editMode ? "/index.php?page=update-project" : "/index.php?page=add-project";
      const payload = {
        ...(editMode ? { project_id: formData.project_id } : {}),
        project_name_th: formData.project_name_th.trim(),
        project_name_en: formData.project_name_en.trim(),
        description: formData.description.trim(),
        project_type: formData.project_type,
        responsible_faculty_id: Number(formData.responsible_faculty_id),
        member_faculty_ids: formData.member_faculty_ids,
        academic_year: academicYear,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: formData.status,
        budget_allocated: formData.budget_allocated === "" ? null : Number(formData.budget_allocated),
        budget_spent: formData.budget_spent === "" ? null : Number(formData.budget_spent),
        budget_source: formData.budget_source.trim(),
        budget_note: formData.budget_note.trim(),
      };

      const res = await api.post(endpoint, payload);
      if (res.data.status === "success") {
        toast({ title: "สำเร็จ", description: res.data.message });
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (error: unknown) {
      toast({
        title: "ข้อผิดพลาด",
        description: getApiErrorMessage(error, "ไม่สามารถบันทึกข้อมูลได้"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (id: number) => {
    if (!canManageProjects) return;
    setPendingDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!canManageProjects) return;
    if (pendingDeleteId == null) return;

    setIsDeleting(true);
    try {
      const res = await api.post("/index.php?page=delete-project", { project_id: pendingDeleteId });
      if (res.data.status === "success") {
        toast({ title: "ลบสำเร็จ", description: "ลบโครงการออกจากระบบแล้ว" });
        setIsConfirmOpen(false);
        setPendingDeleteId(null);
        fetchProjects();
      }
    } catch {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถลบโครงการได้ อาจมีการใช้งานอยู่",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const normalizedMemberSearch = memberSearch.trim().toLowerCase();
  const responsibleFacultyId = Number(formData.responsible_faculty_id || 0);
  const filteredFacultyOptions = facultyOptions.filter((faculty) => {
    const haystack = `${faculty.name} ${faculty.faculty_id} ${faculty.email || ""}`.toLowerCase();
    return faculty.faculty_id !== responsibleFacultyId && (normalizedMemberSearch === "" || haystack.includes(normalizedMemberSearch));
  });
  const selectedFacultyOptions = formData.member_faculty_ids
    .map((facultyId) => facultyOptions.find((faculty) => faculty.faculty_id === facultyId))
    .filter((faculty): faculty is FacultyOption => Boolean(faculty));
  const editingProject = editMode
    ? projects.find((project) => project.project_id.toString() === formData.project_id) || null
    : null;
  const editingProgress = editingProject ? projectProgress(editingProject) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการโครงการ</h1>
          <p className="text-muted-foreground mt-1">สร้าง แก้ไข และติดตามความคืบหน้าโครงการภาควิชา</p>
        </div>
        {canManageProjects && (
          <Button className="gap-2" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4" />
            สร้างโครงการใหม่
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาโครงการด้วยชื่อภาษาไทย หรือ ภาษาอังกฤษ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          กรอง
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
          ไม่พบข้อมูลโครงการในระบบ
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const projectType = normalizeProjectType(project.project_type);
            const status = normalizeStatus(project.status);
            const progress = projectProgress(project);
            const responsibleName = projectResponsibleName(project);
            const facultyMembers = projectFacultyMembers(project);
            const visibleFacultyMembers = facultyMembers.slice(0, 3);
            const hiddenFacultyCount = Math.max(0, facultyMembers.length - visibleFacultyMembers.length);

            return (
              <div key={project.project_id} className="bg-card rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs bg-primary/5">{projectTypeLabels[projectType]}</Badge>
                      <Badge variant="outline" className={`text-xs ${statusClassNames[status]}`}>
                        {statusLabels[status]}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2">{project.project_name_th}</h3>
                    {project.project_name_en && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{project.project_name_en}</p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2" onClick={() => handleOpenViewModal(project)}>
                        <Eye className="h-4 w-4 text-blue-500" /> ดูรายละเอียด
                      </DropdownMenuItem>
                      {canManageProjects && (
                        <>
                          <DropdownMenuItem className="gap-2" onClick={() => handleOpenEditModal(project)}>
                            <Edit className="h-4 w-4 text-orange-500" /> แก้ไขโครงการ
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => navigateToProjectPage("project-docs", project.project_id)}
                          >
                            <Upload className="h-4 w-4 text-green-500" /> อัปโหลดเอกสาร
                          </DropdownMenuItem>
                          {projectType === "academic_service" && (
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => navigateToProjectPage("project-links", project.project_id)}
                            >
                              <Link2 className="h-4 w-4 text-purple-500" /> เชื่อมโยงระดับ LO
                            </DropdownMenuItem>
                          )}
                          {projectType !== "other" && (
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => navigateToProjectPage("project-assessments", project.project_id)}
                            >
                              <ClipboardCheck className="h-4 w-4 text-cyan-600" /> ประเมินผู้เข้าร่วม
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600 focus:bg-red-50" onClick={() => openDeleteConfirm(project.project_id)}>
                            <Trash2 className="h-4 w-4" /> ลบโครงการ
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                    {project.description || "ไม่มีคำอธิบายโครงการ"}
                  </p>
                  <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                    <div>
                      <p>ปีการศึกษา</p>
                      <p className="mt-1 font-medium text-foreground">{project.academic_year || project.fiscal_year || "-"}</p>
                    </div>
                    <div>
                      <p>งบเสนอ</p>
                      <p className="mt-1 font-medium text-foreground">{formatCurrency(projectBudgetAllocated(project))} บาท</p>
                    </div>
                    <div>
                      <p>งบใช้จริง</p>
                      <p className="mt-1 font-medium text-foreground">{formatCurrency(projectBudgetSpent(project))} บาท</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ช่วงเวลา</span>
                    <span className="font-medium text-foreground">{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ความคืบหน้า</span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <UserCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground leading-relaxed">ผู้ดำเนินโครงการ</p>
                        <Badge>
                          <p className="truncate font-medium text-foreground">{responsibleName}</p>
                        </Badge>
                        
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground leading-relaxed">ผู้ร่วมโครงการ</p>
                        {facultyMembers.length === 0 ? (
                          <p className="font-medium text-foreground">-</p>
                        ) : (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {visibleFacultyMembers.map((member) => (
                              <Badge key={`${project.project_id}-${member.id}`} variant="secondary" className="max-w-full truncate text-[11px]">
                                {member.name}
                              </Badge>
                            ))}
                            {hiddenFacultyCount > 0 && (
                              <Badge variant="outline" className="text-[11px]">+{hiddenFacultyCount}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="app-dialog-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "แก้ไขข้อมูลโครงการ" : "สร้างโครงการใหม่"}</DialogTitle>
            <DialogDescription>
              กรอกรายละเอียดข้อมูลของโครงการเพื่อบันทึกลงในฐานข้อมูลคณะพยาบาลศาสตร์
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>ประเภทโครงการ <span className="text-red-500">*</span></Label>
              <Select
                value={formData.project_type}
                onValueChange={(value: ProjectType) => setFormData({ ...formData, project_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทโครงการ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic_service">บริการวิชาการ</SelectItem>
                  <SelectItem value="culture">ทำนุบำรุงศิลปวัฒนธรรม</SelectItem>
                  <SelectItem value="other">อื่น ๆ / ยังไม่จำแนก</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>ชื่อโครงการ (ภาษาไทย) <span className="text-red-500">*</span></Label>
              <Input
                value={formData.project_name_th}
                onChange={(e) => setFormData({ ...formData, project_name_th: e.target.value })}
                placeholder="เช่น โครงการพัฒนาศักยภาพนักศึกษา..."
              />
            </div>
            <div className="grid gap-2">
              <Label>ชื่อโครงการ (ภาษาอังกฤษ)</Label>
              <Input
                value={formData.project_name_en}
                onChange={(e) => setFormData({ ...formData, project_name_en: e.target.value })}
                placeholder="เช่น Student Development Project..."
              />
            </div>
            <div className="grid gap-2">
              <Label>รายละเอียดโครงการ</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายวัตถุประสงค์ หรือเป้าหมายของโครงการโดยสังเขป..."
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label>ผู้ดำเนินโครงการ <span className="text-red-500">*</span></Label>
              <Select value={formData.responsible_faculty_id} onValueChange={handleResponsibleFacultyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกผู้ดำเนินโครงการ" />
                </SelectTrigger>
                <SelectContent className="overflow-y-auto [&_[data-radix-select-viewport]]:!h-auto [&_[data-radix-select-viewport]]:max-h-72 [&_[data-radix-select-viewport]]:overflow-y-auto">
                  {facultyOptions.map((faculty) => (
                    <SelectItem key={faculty.faculty_id} value={String(faculty.faculty_id)}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label>ผู้ร่วมโครงการ</Label>
                <Badge variant="outline">{formData.member_faculty_ids.length} คน</Badge>
              </div>
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="ค้นหาชื่อ รหัสอาจารย์ หรืออีเมล"
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
                    const checked = formData.member_faculty_ids.includes(faculty.faculty_id);

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
                            รหัสอาจารย์ {faculty.faculty_id}{faculty.email ? ` - ${faculty.email}` : ""}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                ผู้ดำเนินโครงการจะไม่ถูกบันทึกซ้ำในผู้ร่วมโครงการ
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>ปีการศึกษา <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="2500"
                  max="2700"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="เช่น 2569"
                />
              </div>
              <div className="grid gap-2">
                <Label>วันที่เริ่มต้น</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>วันที่สิ้นสุด</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>สถานะโครงการ</Label>
              <Select value={formData.status} onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">รออนุมัติ</SelectItem>
                  <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                  <SelectItem
                    value="completed"
                    disabled={!editMode || Number(projects.find((project) => project.project_id.toString() === formData.project_id)?.progress || 0) < 100}
                  >
                    เสร็จสิ้น
                  </SelectItem>
                  <SelectItem value="cancelled">ไม่อนุมัติ/ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
              {editMode && Number(projects.find((project) => project.project_id.toString() === formData.project_id)?.progress || 0) < 100 && (
                <p className="text-xs text-muted-foreground">
                  สถานะเสร็จสิ้นจะเลือกได้เมื่อความคืบหน้าโครงการครบ 100%
                </p>
              )}
            </div>
            {editMode && (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ความคืบหน้าปัจจุบัน</span>
                  <span className="font-medium text-foreground">{editingProgress}%</span>
                </div>
                <Progress value={editingProgress} className="h-2" />
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>งบเสนอ (บาท)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.budget_allocated}
                  onChange={(e) => setFormData({ ...formData, budget_allocated: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>งบใช้จริง (บาท)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.budget_spent}
                  onChange={(e) => setFormData({ ...formData, budget_spent: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>แหล่งงบประมาณ</Label>
                <Input
                  value={formData.budget_source}
                  onChange={(e) => setFormData({ ...formData, budget_source: e.target.value })}
                  placeholder="เช่น คณะ, มหาวิทยาลัย"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>หมายเหตุงบประมาณ</Label>
              <Textarea
                value={formData.budget_note}
                onChange={(e) => setFormData({ ...formData, budget_note: e.target.value })}
                placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ไม่ใช้งบ, รออนุมัติ, งบจากภายนอก"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveProject} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editMode ? "บันทึกการแก้ไข" : "สร้างโครงการ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                const progress = projectProgress(viewProject);
                const facultyMembers = projectFacultyMembers(viewProject);

                return (
                  <>
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">ความคืบหน้า</p>
                        <p className="font-medium text-foreground">{progress}%</p>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
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
                              <Badge key={`${viewProject.project_id}-${member.id}`} variant="secondary">
                                {member.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
              <div className="space-y-1">
                <p className="text-muted-foreground">รหัสโครงการ</p>
                <p className="font-medium text-foreground">{viewProject.project_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">ประเภทโครงการ</p>
                <Badge variant="outline">{projectTypeLabels[normalizeProjectType(viewProject.project_type)]}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">ชื่อโครงการ (ภาษาไทย)</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">{viewProject.project_name_th}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">ชื่อโครงการ (ภาษาอังกฤษ)</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">
                  {viewProject.project_name_en || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">คำอธิบาย</p>
                <p className="font-medium text-foreground whitespace-pre-wrap rounded-lg border bg-muted/30 p-3">
                  {viewProject.description || "ไม่มีคำอธิบายโครงการ"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">ปีการศึกษา</p>
                  <p className="font-medium text-foreground">{viewProject.academic_year || viewProject.fiscal_year || "-"}</p>
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
                  {projectBudgetNote(viewProject) || "-"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>ปิด</Button>
            {viewProject && canManageProjects && (
              <>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    setIsViewOpen(false);
                    navigateToProjectPage("project-docs", viewProject.project_id);
                  }}
                >
                  <Upload className="h-4 w-4" /> เอกสาร
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setIsViewOpen(false);
                    handleOpenEditModal(viewProject);
                  }}
                >
                  <Edit className="h-4 w-4" /> แก้ไข
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) setPendingDeleteId(null);
        }}
        title="ยืนยันการลบ"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้? ข้อมูลที่เกี่ยวข้องอาจถูกลบไปด้วย"
        onConfirm={handleDeleteProject}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectsPage;
