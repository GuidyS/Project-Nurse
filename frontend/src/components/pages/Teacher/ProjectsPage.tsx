import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, Edit, MoreVertical, Upload, Link2, FileText, Trash2, Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDropInput } from "@/components/ui/FileDropInput";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { navigateToProject } from "@/lib/projectNavigation";
import { PROJECT_ATTACHMENT_MAX_BYTES, uploadProjectAttachment } from "@/lib/projectAttachmentUpload";

// โครงสร้างข้อมูลที่ตรงกับฐานข้อมูลจริง
interface Project {
  project_id: number;
  project_name_th: string;
  project_name_en: string;
  description: string;
  strategy?: string | null;
  academic_year?: number | null;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  members?: number;
  budget?: number;
  spent?: number;
  progress?: number;
  responsible_name?: string | null;
  documents?: ProjectDocument[];
  member_details?: ProjectMember[];
  member_names?: string[];
}

interface ProjectMember {
  id: number;
  name: string;
  type: string;
  role: string;
}

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

interface FacultyOption {
  faculty_id: number;
  name: string;
  email?: string | null;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.message || fallback;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const getFileUrl = (filePath: string) => `${API_BASE_URL}/${filePath.replace(/^\/+/, "")}`;

const formatFileSize = (size: number | null) => {
  if (!size) return "";
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const getDocumentDisplayName = (document: ProjectDocument) => document.file_name || document.name;

const getProjectStatusBadge = (status?: string | null) => {
  switch ((status || "active").toLowerCase()) {
    case "pending":
    case "รอดำเนินการ":
      return { label: "รอดำเนินการ", className: "bg-yellow-500 hover:bg-yellow-500" };
    case "completed":
    case "เสร็จสิ้น":
      return { label: "เสร็จสิ้น", className: "bg-green-500 hover:bg-green-500" };
    case "cancelled":
    case "ยกเลิก":
      return { label: "ยกเลิก", className: "bg-red-500 hover:bg-red-500" };
    case "active":
    case "กำลังดำเนินการ":
    default:
      return { label: "กำลังดำเนินการ", className: "bg-blue-500 hover:bg-blue-500" };
  }
};

const ProjectStatusBadge = ({ status }: { status?: string | null }) => {
  const badge = getProjectStatusBadge(status);

  return <Badge className={`text-xs text-white ${badge.className}`}>{badge.label}</Badge>;
};

type ProjectStatus = 'pending' | 'active' | 'completed' | 'cancelled';

const PROJECT_STRATEGY_EMPTY_VALUE = "__none__";

const STRATEGY_OPTIONS = [
  "ยุทธศาสตร์ที่ 1: Future Research & Innovation",
  "ยุทธศาสตร์ที่ 2: Future Education",
  "ยุทธศาสตร์ที่ 3: Future Lecturer/Researcher",
  "ยุทธศาสตร์ที่ 4: Future System for Management",
];

interface ProjectFormData {
  project_id: string;
  project_name_th: string;
  project_name_en: string;
  description: string;
  strategy: string;
  academic_year: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  budget_allocated: string;
  budget_spent: string;
  progress_percent: string;
}

const createInitialForm = (): ProjectFormData => ({
  project_id: "",
  project_name_th: "",
  project_name_en: "",
  description: "",
  strategy: "",
  academic_year: "",
  status: "active",
  start_date: "",
  end_date: "",
  budget_allocated: "",
  budget_spent: "",
  progress_percent: "",
});

const ProjectsPage = () => {
  const { toast } = useToast();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const isAdmin = Number(storedUser.role_id) === 1;
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // States สำหรับจัดการ Modal เพิ่มและแก้ไข
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(() => createInitialForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<number[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const navigateToProjectPage = (page: "project-docs" | "project-links" | "project-reports", projectId: number) => {
    const action = page === "project-docs" ? "create-doc" : page === "project-links" ? "links" : "reports";
    navigateToProject(page, projectId, action);
  };

  const handleOpenViewModal = (project: Project) => {
    setViewProject(project);
    setIsViewOpen(true);
  };

  const renderUploadedFiles = (documents: ProjectDocument[]) => {
    if (documents.length === 0) {
      return <p className="text-sm text-muted-foreground">ยังไม่มีไฟล์แนบ</p>;
    }

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {documents.map((document) => {
          const displayName = getDocumentDisplayName(document);
          const fileMeta = [displayName, document.date, formatFileSize(document.file_size)].filter(Boolean).join(" - ");

          return (
            <button
              key={document.id}
              type="button"
              className="flex min-h-[118px] flex-col items-center justify-start gap-2 rounded-md border bg-background p-3 text-center transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!document.file_path}
              title={fileMeta}
              onClick={() => document.file_path && window.open(getFileUrl(document.file_path), "_blank")}
            >
              <FileText className="h-12 w-12 text-primary" />
              <span className="line-clamp-2 max-w-full break-words text-xs text-muted-foreground">
                {displayName}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderProjectMembers = (members: ProjectMember[]) => {
    if (members.length === 0) {
      return <p className="text-sm text-muted-foreground">ยังไม่มีรายชื่อสมาชิก</p>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <Badge
            key={`${member.type}-${member.id}`}
            variant="outline"
            className="max-w-full gap-1 rounded-md px-2 py-1 text-xs"
            title={`${member.name} - ${member.role}`}
          >
            <Users className="h-3 w-3 shrink-0" />
            <span className="max-w-[220px] truncate">{member.name}</span>
            <span className="text-muted-foreground">({member.role})</span>
          </Badge>
        ))}
      </div>
    );
  };

  // 1. ฟังก์ชันดึงข้อมูลโครงการทั้งหมด (Read)
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/index.php?page=get-project", {
        params: { search: searchQuery },
      });
      if (res.data.status === "success") {
        setProjects(res.data.data || []);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลโครงการได้", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, toast]);

  // ดึงข้อมูลเมื่อโหลดหน้าเว็บ หรือเมื่อมีการค้นหา
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 500); // หน่วงเวลา 0.5 วิ เพื่อไม่ให้ยิง API ถี่เกินไปตอนพิมพ์ค้นหา
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProjects]);

  useEffect(() => {
    const fetchFacultyOptions = async () => {
      try {
        const response = await api.get("/index.php?page=get-my-project-faculty-options");
        if (response.data.status === "success") {
          setFacultyOptions(response.data.data || []);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error: unknown) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: getApiErrorMessage(error, "ไม่สามารถดึงรายชื่ออาจารย์ได้"),
          variant: "destructive",
        });
      }
    };

    if (isAdmin) {
      fetchFacultyOptions();
    }
  }, [isAdmin, toast]);

  // 2. เปิดฟอร์มสร้างโครงการใหม่
  const handleOpenCreateModal = () => {
    setEditMode(false);
    setFormData(createInitialForm());
    setSelectedFile(null);
    setSelectedFacultyIds([]);
    setMemberSearch("");
    setIsModalOpen(true);
  };

  // 3. เปิดฟอร์มแก้ไขโครงการ
  const handleOpenEditModal = (project: Project) => {
    setEditMode(true);
    setFormData({
      project_id: project.project_id.toString(),
      project_name_th: project.project_name_th,
      project_name_en: project.project_name_en || "",
      description: project.description || "",
      strategy: project.strategy || "",
      academic_year: project.academic_year != null ? String(project.academic_year) : "",
      status: (project.status as ProjectStatus) || "active",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      budget_allocated: project.budget != null ? String(project.budget) : "",
      budget_spent: project.spent != null ? String(project.spent) : "",
      progress_percent: project.progress != null ? String(project.progress) : "",
    });
    setSelectedFacultyIds(
      (project.member_details || [])
        .filter((member) => member.type === "faculty" && member.role === "ผู้ร่วมโครงการ")
        .map((member) => Number(member.id))
        .filter((id) => Number.isFinite(id) && id > 0)
    );
    setMemberSearch("");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const updateFormData = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFacultyMember = (facultyId: number) => {
    setSelectedFacultyIds((prev) =>
      prev.includes(facultyId)
        ? prev.filter((id) => id !== facultyId)
        : [...prev, facultyId]
    );
  };

  const validateProjectForm = () => {
    if (!formData.project_name_th.trim()) {
      return "กรุณากรอกชื่อโครงการ (ภาษาไทย)";
    }

    const academicYear = formData.academic_year === "" ? null : Number(formData.academic_year);
    const budgetAllocated = formData.budget_allocated === "" ? null : Number(formData.budget_allocated);
    const budgetSpent = formData.budget_spent === "" ? null : Number(formData.budget_spent);
    const progressPercent = formData.progress_percent === "" ? null : Number(formData.progress_percent);

    if (academicYear !== null && (!Number.isFinite(academicYear) || academicYear <= 0)) {
      return "ปีการศึกษาต้องเป็นตัวเลขมากกว่า 0";
    }

    if (budgetAllocated !== null && (!Number.isFinite(budgetAllocated) || budgetAllocated < 0)) {
      return "งบประมาณที่ได้รับต้องไม่ติดลบ";
    }

    if (budgetSpent !== null && (!Number.isFinite(budgetSpent) || budgetSpent < 0)) {
      return "งบที่ใช้จริงต้องไม่ติดลบ";
    }

    if (progressPercent !== null && (!Number.isFinite(progressPercent) || progressPercent < 0 || progressPercent > 100)) {
      return "ความคืบหน้าต้องอยู่ระหว่าง 0 ถึง 100";
    }

    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      return "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น";
    }

    if (selectedFile && selectedFile.size > PROJECT_ATTACHMENT_MAX_BYTES) {
      return "ไฟล์แนบต้องมีขนาดไม่เกิน 10 MB";
    }

    return null;
  };

  // 4. บันทึกข้อมูล (Create & Update)
  const handleSaveProject = async () => {
    const validationError = validateProjectForm();
    if (validationError) {
      toast({ title: "แจ้งเตือน", description: validationError, variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint = editMode ? "/index.php?page=update-project" : "/index.php?page=add-project";
      const basePayload = {
        project_name_th: formData.project_name_th.trim(),
        project_name_en: formData.project_name_en.trim(),
        description: formData.description.trim(),
        strategy: formData.strategy || null,
        academic_year: formData.academic_year === "" ? null : Number(formData.academic_year),
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        member_faculty_ids: selectedFacultyIds,
        budget_allocated: formData.budget_allocated === "" ? null : Number(formData.budget_allocated),
        budget_spent: formData.budget_spent === "" ? null : Number(formData.budget_spent),
        progress_percent: formData.progress_percent === "" ? null : Number(formData.progress_percent),
      };
      const payload = editMode
        ? {
            project_id: formData.project_id,
            ...basePayload,
          }
        : basePayload;

      const res = await api.post(endpoint, payload);

      if (res.data.status === "success") {
        let toastTitle = "สำเร็จ";
        let toastDescription = res.data.message;

        if (selectedFile) {
          try {
            await uploadProjectAttachment({
              api,
              projectId: editMode ? formData.project_id : res.data.project_id,
              projectName: basePayload.project_name_th,
              file: selectedFile,
            });
            toastDescription = `${toastDescription}\nอัปโหลดไฟล์แนบสำเร็จ`;
          } catch (uploadError: unknown) {
            toastTitle = "บันทึกโครงการสำเร็จ แต่ไฟล์แนบอัปโหลดไม่ได้";
            toastDescription = getApiErrorMessage(uploadError, "ไม่สามารถอัปโหลดไฟล์แนบได้");
          }
        }

        toast({ title: toastTitle, description: toastDescription });
        setIsModalOpen(false);
        setFormData(createInitialForm());
        setSelectedFile(null);
        setSelectedFacultyIds([]);
        setMemberSearch("");
        fetchProjects();
      }
    } catch (error: unknown) {
      toast({ title: "ข้อผิดพลาด", description: getApiErrorMessage(error, "ไม่สามารถบันทึกข้อมูลได้"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. ลบโครงการ (Delete)
  const openDeleteConfirm = (id: number) => {
    setPendingDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteProject = async () => {
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
    } catch (error: unknown) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถลบโครงการได้ อาจมีการใช้งานอยู่", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const normalizedMemberSearch = memberSearch.trim().toLowerCase();
  const filteredFacultyOptions = facultyOptions.filter((faculty) => {
    const haystack = `${faculty.name} ${faculty.faculty_id} ${faculty.email || ""}`.toLowerCase();
    return normalizedMemberSearch === "" || haystack.includes(normalizedMemberSearch);
  });
  const selectedFacultyOptions = selectedFacultyIds
    .map((facultyId) => facultyOptions.find((faculty) => faculty.faculty_id === facultyId))
    .filter((faculty): faculty is FacultyOption => Boolean(faculty));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground   leading-snug">จัดการโครงการ</h1>
          <p className="text-muted-foreground mt-1">สร้าง แก้ไข และติดตามความคืบหน้าโครงการภาควิชา</p>
        </div>
        {isAdmin ? (
          <Button className="gap-2" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4" />
            สร้างโครงการใหม่
          </Button>
        ) : (
          <Badge variant="outline" className="self-start sm:self-auto">Read only</Badge>
        )}
      </div>

      {/* Search & Filter */}
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
      </div>

      {/* Project Cards */}
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
          {projects.map((project) => (
            <div key={project.project_id} className="bg-card rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-primary/5">โครงการคณะ</Badge>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2">{project.project_name_th}</h3>
                  {project.project_name_en && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{project.project_name_en}</p>
                  )}
                  {project.strategy && (
                    <p className="text-xs text-primary mt-1 truncate">{project.strategy}</p>
                  )}
                </div>
                
                {/* 3-Dots Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2 focus:bg-muted focus:text-foreground" onClick={() => handleOpenViewModal(project)}>
                      <Eye className="h-4 w-4 text-blue-500" /> ดูรายละเอียด
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem className="gap-2 focus:bg-muted focus:text-foreground" onClick={() => handleOpenEditModal(project)}>
                          <Edit className="h-4 w-4 text-orange-500" /> แก้ไขโครงการ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 focus:bg-muted focus:text-foreground"
                          onClick={() => navigateToProjectPage("project-docs", project.project_id)}
                        >
                          <Upload className="h-4 w-4 text-green-500" /> อัปโหลดเอกสาร
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 focus:bg-muted focus:text-foreground"
                          onClick={() => navigateToProjectPage("project-links", project.project_id)}
                        >
                          <Link2 className="h-4 w-4 text-purple-500" /> เชื่อมโยงระดับ LO
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600 focus:bg-red-500" onClick={() => openDeleteConfirm(project.project_id)}>
                          <Trash2 className="h-4 w-4" /> ลบโครงการ
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Progress & Info */}
              <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                  {project.description || "ไม่มีคำอธิบายโครงการ"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>สมาชิก {Number(project.members || 0).toLocaleString()} คน</span>
                  <span>งบประมาณ ฿{Number(project.budget || 0).toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> รายชื่อสมาชิก
                  </p>
                  {renderProjectMembers(project.member_details || [])}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">ความคืบหน้า</span>
                    <span className="font-medium text-primary">{Math.round(Number(project.progress || 0))}%</span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, Number(project.progress || 0)))}%` }}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigateToProjectPage("project-reports", project.project_id)}
                >
                  <FileText className="h-4 w-4" /> ดูรายงานโครงการ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไขโครงการ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="app-dialog-2xl">
          <DialogHeader>
            <DialogTitle>{editMode ? "แก้ไขข้อมูลโครงการ" : "สร้างโครงการใหม่"}</DialogTitle>
            <DialogDescription>
              กรอกรายละเอียดข้อมูลของโครงการเพื่อบันทึกลงในฐานข้อมูลคณะพยาบาลศาสตร์
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>ชื่อโครงการ (ภาษาไทย) <span className="text-red-500">*</span></Label>
              <Input
                value={formData.project_name_th}
                onChange={(e) => updateFormData("project_name_th", e.target.value)}
                placeholder="เช่น โครงการพัฒนาศักยภาพนักศึกษา..."
              />
            </div>
            <div className="grid gap-2">
              <Label>ชื่อโครงการ (ภาษาอังกฤษ)</Label>
              <Input
                value={formData.project_name_en}
                onChange={(e) => updateFormData("project_name_en", e.target.value)}
                placeholder="เช่น Student Development Project..."
              />
            </div>
            <div className="grid gap-2">
              <Label>รายละเอียดโครงการ</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="อธิบายวัตถุประสงค์ หรือเป้าหมายของโครงการโดยสังเขป..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>ยุทธศาสตร์</Label>
              <Select
                value={formData.strategy || PROJECT_STRATEGY_EMPTY_VALUE}
                onValueChange={(value) =>
                  updateFormData("strategy", value === PROJECT_STRATEGY_EMPTY_VALUE ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกยุทธศาสตร์" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PROJECT_STRATEGY_EMPTY_VALUE}>ไม่ระบุ</SelectItem>
                  {STRATEGY_OPTIONS.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>ปีการศึกษา</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.academic_year}
                  onChange={(e) => updateFormData("academic_year", e.target.value)}
                  placeholder="2569"
                />
              </div>
              <div className="grid gap-2">
                <Label>สถานะ</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData("status", value as ProjectStatus)}>
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
                <Badge variant="outline">เลือกแล้ว {selectedFacultyIds.length} คน</Badge>
              </div>
              <Input
                id="project-member-search"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
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
                            รหัสอาจารย์ {faculty.faculty_id}{faculty.email ? ` - ${faculty.email}` : ""}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                สมาชิกที่เลือกจะถูกบันทึกเป็นผู้ร่วมโครงการ
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>วันที่เริ่มต้น</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData("start_date", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>วันที่สิ้นสุด</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateFormData("end_date", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>งบประมาณที่ได้รับ</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget_allocated}
                    onChange={(e) => updateFormData("budget_allocated", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>งบที่ใช้จริง</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget_spent}
                    onChange={(e) => updateFormData("budget_spent", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>ความคืบหน้า (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.progress_percent}
                    onChange={(e) => updateFormData("progress_percent", e.target.value)}
                    placeholder="0"
                  />
                </div>
            </div>

            <FileDropInput
              id="project-page-attachment"
              file={selectedFile}
              onFileChange={setSelectedFile}
              disabled={isSubmitting}
            />
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

      {/* Dialog ดูรายละเอียดโครงการ */}
      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) setViewProject(null);
        }}
      >
        <DialogContent className="app-dialog-xl">
          <DialogHeader>
            <DialogTitle>รายละเอียดโครงการ</DialogTitle>
            <DialogDescription>ข้อมูลโครงการที่บันทึกในระบบ</DialogDescription>
          </DialogHeader>
          {viewProject && (
            <div className="space-y-4 py-2 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">ชื่อโครงการ (ภาษาไทย)</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">{viewProject.project_name_th}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">ชื่อโครงการ (ภาษาอังกฤษ)</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">
                  {viewProject.project_name_en || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">ยุทธศาสตร์</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">
                  {viewProject.strategy || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">คำอธิบาย</p>
                <p className="font-medium text-foreground whitespace-pre-wrap rounded-lg border bg-muted/30 p-3">
                  {viewProject.description || "ไม่มีคำอธิบายโครงการ"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">รายชื่อสมาชิกในโครงการ</p>
                {renderProjectMembers(viewProject.member_details || [])}
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">ไฟล์ที่ถูกอัปโหลด</p>
                {renderUploadedFiles(viewProject.documents || [])}
              </div>
            </div>
          )}
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
