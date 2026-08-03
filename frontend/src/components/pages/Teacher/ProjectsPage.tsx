import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, MoreVertical, Upload, Link2, FileText, Trash2, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

// โครงสร้างข้อมูลที่ตรงกับฐานข้อมูลจริง
interface Project {
  project_id: number;
  project_name_th: string;
  project_name_en: string;
  description: string;
}

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
    project_id: "",
    project_name_th: "",
    project_name_en: "",
    description: "",
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
    setFormData({ project_id: "", project_name_th: "", project_name_en: "", description: "" });
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
        description: formData.description
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
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          กรอง
        </Button>
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
                    <Badge variant="secondary" className="text-xs">กำลังดำเนินการ</Badge>
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

              {/* Progress & Info (Mock data visual fallbacks for now) */}
              <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                  {project.description || "ไม่มีคำอธิบายโครงการ"}
                </p>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">ความคืบหน้า (จำลอง)</span>
                    <span className="font-medium text-primary">0%</span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all w-0" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไขโครงการ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
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