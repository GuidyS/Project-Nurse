import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, MoreVertical, Upload, Link2, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

// โครงสร้างข้อมูลที่ตรงกับฐานข้อมูลจริง
interface Project {
  project_id: number;
  project_name_th: string;
  project_name_en: string;
  description: string;
  academic_year?: number | null;
  status?: "pending" | "active" | "completed" | "cancelled";
  start_date?: string | null;
  end_date?: string | null;
  project_budget_years_id?: number | null;
  fiscal_year?: number | null;
  budget_allocated?: string | number | null;
  budget_spent?: string | number | null;
  budget_note?: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "รออนุมัติ",
  active: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  cancelled: "ไม่อนุมัติ/ยกเลิก",
};

const statusClassNames: Record<string, string> = {
  pending: "border-yellow-500/60 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  active: "border-green-500/60 bg-green-500/10 text-green-700 dark:text-green-300",
  completed: "border-blue-500/60 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  cancelled: "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300",
};

const initialFormData = {
  project_id: "",
  project_budget_years_id: "",
  project_name_th: "",
  project_name_en: "",
  description: "",
  academic_year: "",
  start_date: "",
  end_date: "",
  status: "pending",
  budget_allocated: "",
  budget_spent: "",
  budget_source: "",
  budget_note: "",
};

const formatCurrency = (value?: string | number | null) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const parseBudgetNote = (raw?: string | null) => {
  const note = raw || "";
  const [sourcePart, ...rest] = note.split(" | ");
  if (sourcePart.startsWith("แหล่งงบ: ")) {
    return {
      source: sourcePart.replace("แหล่งงบ: ", ""),
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

  // States สำหรับจัดการ Modal เพิ่มและแก้ไข
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...initialFormData,
  });

  const navigateToProjectPage = (page: "project-docs" | "project-links", projectId: number) => {
    sessionStorage.setItem("pendingProjectId", String(projectId));
    window.dispatchEvent(new CustomEvent("app:navigate", { detail: { page } }));
  };

  const handleOpenViewModal = (project: Project) => {
    setViewProject(project);
    setIsViewOpen(true);
  };

  // 1. ฟังก์ชันดึงข้อมูลโครงการทั้งหมด (Read)
  const fetchProjects = async () => {
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
  };

  // ดึงข้อมูลเมื่อโหลดหน้าเว็บ หรือเมื่อมีการค้นหา
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 500); // หน่วงเวลา 0.5 วิ เพื่อไม่ให้ยิง API ถี่เกินไปตอนพิมพ์ค้นหา
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 2. เปิดฟอร์มสร้างโครงการใหม่
  const handleOpenCreateModal = () => {
    setEditMode(false);
    setFormData({ ...initialFormData });
    setIsModalOpen(true);
  };

  // 3. เปิดฟอร์มแก้ไขโครงการ
  const handleOpenEditModal = (project: Project) => {
    const budget = parseBudgetNote(project.budget_note);
    setEditMode(true);
    setFormData({
      project_id: project.project_id.toString(),
      project_budget_years_id: project.project_budget_years_id?.toString() || "",
      project_name_th: project.project_name_th,
      project_name_en: project.project_name_en || "",
      description: project.description || "",
      academic_year: project.academic_year?.toString() || project.fiscal_year?.toString() || "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      status: project.status || "pending",
      budget_allocated: project.budget_allocated?.toString() || "",
      budget_spent: project.budget_spent?.toString() || "",
      budget_source: budget.source,
      budget_note: budget.note,
    });
    setIsModalOpen(true);
  };

  // 4. บันทึกข้อมูล (Create & Update)
  const handleSaveProject = async () => {
    if (!formData.project_name_th.trim()) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกชื่อโครงการ (ภาษาไทย)", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint = editMode ? "/index.php?page=update-project" : "/index.php?page=add-project";
      const payload = editMode ? formData : {
        project_name_th: formData.project_name_th,
        project_name_en: formData.project_name_en,
        description: formData.description,
        academic_year: formData.academic_year || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget_allocated: formData.budget_allocated || 0,
        budget_spent: formData.budget_spent || 0,
        budget_source: formData.budget_source,
        budget_note: formData.budget_note,
      };

      const res = await api.post(endpoint, payload);
      
      if (res.data.status === "success") {
        toast({ title: "สำเร็จ", description: res.data.message });
        setIsModalOpen(false);
        fetchProjects(); // รีโหลดข้อมูลใหม่
      }
    } catch (error: any) {
      toast({ title: "ข้อผิดพลาด", description: error.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
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
    } catch (error: any) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถลบโครงการได้ อาจมีการใช้งานอยู่", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">จัดการโครงการ</h1>
          <p className="text-muted-foreground mt-1">สร้าง แก้ไข และติดตามความคืบหน้าโครงการภาควิชา</p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4" />
          สร้างโครงการใหม่
        </Button>
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
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-primary/5">โครงการคณะ</Badge>
                    <Badge variant="outline" className={`text-xs ${statusClassNames[project.status || "active"] || ""}`}>
                      {statusLabels[project.status || "active"] || project.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2">{project.project_name_th}</h3>
                  {project.project_name_en && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{project.project_name_en}</p>
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
                    <DropdownMenuItem className="gap-2" onClick={() => handleOpenViewModal(project)}>
                      <Eye className="h-4 w-4 text-blue-500" /> ดูรายละเอียด
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => handleOpenEditModal(project)}>
                      <Edit className="h-4 w-4 text-orange-500" /> แก้ไขโครงการ
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => navigateToProjectPage("project-docs", project.project_id)}
                    >
                      <Upload className="h-4 w-4 text-green-500" /> อัปโหลดเอกสาร
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => navigateToProjectPage("project-links", project.project_id)}
                    >
                      <Link2 className="h-4 w-4 text-purple-500" /> เชื่อมโยงระดับ LO
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-red-600 focus:bg-red-50" onClick={() => openDeleteConfirm(project.project_id)}>
                      <Trash2 className="h-4 w-4" /> ลบโครงการ
                    </DropdownMenuItem>
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
                    <p className="mt-1 font-medium text-foreground">{project.academic_year || project.fiscal_year || "—"}</p>
                  </div>
                  <div>
                    <p>งบเสนอ</p>
                    <p className="mt-1 font-medium text-foreground">{formatCurrency(project.budget_allocated)} บาท</p>
                  </div>
                  <div>
                    <p>งบใช้จริง</p>
                    <p className="mt-1 font-medium text-foreground">{formatCurrency(project.budget_spent)} บาท</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไขโครงการ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>ปีการศึกษา</Label>
                <Input
                  type="number"
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
            {editMode && (
              <div className="grid gap-2">
                <Label>สถานะโครงการ</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">รออนุมัติ</SelectItem>
                    <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                    <SelectItem value="cancelled">ไม่อนุมัติ/ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Dialog ดูรายละเอียดโครงการ */}
      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) setViewProject(null);
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดโครงการ</DialogTitle>
            <DialogDescription>ข้อมูลโครงการที่บันทึกในระบบ</DialogDescription>
          </DialogHeader>
          {viewProject && (
            <div className="space-y-4 py-2 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">รหัสโครงการ</p>
                <p className="font-medium text-foreground">{viewProject.project_id}</p>
              </div>
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
                <p className="text-muted-foreground">คำอธิบาย</p>
                <p className="font-medium text-foreground whitespace-pre-wrap rounded-lg border bg-muted/30 p-3">
                  {viewProject.description || "ไม่มีคำอธิบายโครงการ"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">ปีการศึกษา</p>
                  <p className="font-medium text-foreground">{viewProject.academic_year || viewProject.fiscal_year || "—"}</p>
                </div>
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">สถานะ</p>
                  <p className="font-medium text-foreground">{statusLabels[viewProject.status || "active"] || viewProject.status}</p>
                </div>
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">งบเสนอ</p>
                  <p className="font-medium text-foreground">{formatCurrency(viewProject.budget_allocated)} บาท</p>
                </div>
                <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                  <p className="text-muted-foreground">งบใช้จริง</p>
                  <p className="font-medium text-foreground">{formatCurrency(viewProject.budget_spent)} บาท</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">แหล่งงบ/หมายเหตุ</p>
                <p className="font-medium text-foreground whitespace-pre-wrap rounded-lg border bg-muted/30 p-3">
                  {viewProject.budget_note || "—"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>ปิด</Button>
            {viewProject && (
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
