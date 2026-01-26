import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, MoreVertical, Upload, Link2, FileText, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// 1. Interface สำหรับข้อมูลโครงการ
interface Project {
  id: number;
  name: string;
  type: string;
  status: string;
  progress: number;
  deadline: string;
  budget: string | number;
  faculty_name: string;
  academic_year: number; // เพิ่มฟิลด์ปีการศึกษา
}

// 2. Interface สำหรับข้อมูลในฟอร์ม (สร้าง/แก้ไข)
interface ProjectFormData {
  project_name: string;
  academic_year: number | "";
  budget: number | "";
  faculty_id: number | "";
}

const ProjectsPage = () => {
  // --- States ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // States สำหรับจัดการ Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // State สำหรับฟอร์ม
  const initialFormState: ProjectFormData = { project_name: "", academic_year: new Date().getFullYear() + 543, budget: "", faculty_id: "" };
  const [formData, setFormData] = useState<ProjectFormData>(initialFormState);

  // --- 1. Fetch ข้อมูล ---
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/projects/get_projects.php");
      const result = await response.json();
      if (result.status === "success") {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- 2. ฟังก์ชัน เพิ่มโครงการ ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/projects/add_project.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("สร้างโครงการสำเร็จ!");
        setIsCreateOpen(false); // ปิด Modal
        setFormData(initialFormState); // ล้างฟอร์ม
        fetchProjects(); // โหลดข้อมูลใหม่
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // --- 3. ฟังก์ชัน เปิดฟอร์มแก้ไข ---
  const openEditModal = (project: Project) => {
    setCurrentProject(project);
    // ดึงค่าเดิมมาใส่ในฟอร์ม
    setFormData({
      project_name: project.name,
      academic_year: project.academic_year,
      budget: typeof project.budget === 'string' ? parseFloat(project.budget.replace(/,/g, '')) : project.budget,
      faculty_id: "", // TODO: หากมี ID อาจารย์ให้ใส่ตรงนี้
    });
    setIsEditOpen(true);
  };

  // --- 4. ฟังก์ชัน บันทึกการแก้ไข ---
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    try {
      const response = await fetch("http://localhost:8080/api/projects/update_project.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, project_id: currentProject.id }),
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("อัปเดตโครงการสำเร็จ!");
        setIsEditOpen(false);
        fetchProjects();
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  // --- 5. ฟังก์ชัน ลบโครงการ ---
  const handleDelete = async (projectId: number) => {
    if (window.confirm("คุณต้องการลบโครงการนี้ใช่หรือไม่? ข้อมูลจะถูกลบถาวร")) {
      try {
        const response = await fetch("http://localhost:8080/api/projects/delete_project.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: projectId }),
        });
        const result = await response.json();
        if (result.status === "success") {
          alert("ลบโครงการสำเร็จ");
          fetchProjects();
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "เสร็จสิ้น": return <Badge className="bg-green-100 text-green-800">เสร็จสิ้น</Badge>;
      case "กำลังดำเนินการ": return <Badge className="bg-blue-100 text-blue-800">กำลังดำเนินการ</Badge>;
      case "รอเริ่ม": return <Badge className="bg-yellow-100 text-yellow-800">รอเริ่ม</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 30) return "bg-yellow-500";
    return "bg-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการโครงการ</h1>
          <p className="text-muted-foreground mt-1">สร้าง แก้ไข และติดตามความคืบหน้าโครงการ</p>
        </div>

        {/* --- Dialog สำหรับสร้างโครงการใหม่ --- */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              สร้างโครงการใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>สร้างโครงการใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ชื่อโครงการ <span className="text-red-500">*</span></Label>
                <Input 
                  required 
                  value={formData.project_name} 
                  onChange={(e) => setFormData({...formData, project_name: e.target.value})} 
                  placeholder="เช่น โครงการวิจัยสุขภาวะชุมชน" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ปีการศึกษา (พ.ศ.) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.academic_year} 
                    onChange={(e) => setFormData({...formData, academic_year: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>งบประมาณ (บาท)</Label>
                  <Input 
                    type="number" 
                    value={formData.budget} 
                    onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})} 
                    placeholder="50000" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>รหัสอาจารย์ผู้รับผิดชอบ (Faculty ID)</Label>
                <Input 
                  type="number" 
                  value={formData.faculty_id} 
                  onChange={(e) => setFormData({...formData, faculty_id: Number(e.target.value)})} 
                  placeholder="ใส่ ID อาจารย์" 
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>ยกเลิก</Button>
                <Button type="submit">บันทึกข้อมูล</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- Dialog สำหรับแก้ไขโครงการ --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>แก้ไขโครงการ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อโครงการ <span className="text-red-500">*</span></Label>
              <Input 
                required 
                value={formData.project_name} 
                onChange={(e) => setFormData({...formData, project_name: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ปีการศึกษา (พ.ศ.) <span className="text-red-500">*</span></Label>
                <Input 
                  type="number" 
                  required 
                  value={formData.academic_year} 
                  onChange={(e) => setFormData({...formData, academic_year: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label>งบประมาณ (บาท)</Label>
                <Input 
                  type="number" 
                  value={formData.budget} 
                  onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})} 
                  disabled // ล็อกไว้ก่อนถ้าไม่ต้องการให้แก้ค่าเงินในหน้านี้
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
              <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาโครงการ..."
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        /* Project Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-card rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{project.type}</Badge>
                    {getStatusBadge(project.status)}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    ผู้รับผิดชอบ: {project.faculty_name}
                  </p>
                </div>
                
                {/* Action Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Eye className="h-4 w-4" /> ดูรายละเอียด
                    </DropdownMenuItem>
                    {/* ปุ่มแก้ไข - เรียกใช้ฟังก์ชันเปิด Modal */}
                    <DropdownMenuItem className="gap-2" onClick={() => openEditModal(project)}>
                      <Edit className="h-4 w-4" /> แก้ไขโครงการ
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Upload className="h-4 w-4" /> อัปโหลดเอกสาร
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Link2 className="h-4 w-4" /> เชื่อมโยง PLO/YLO
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="gap-2 text-red-600 focus:text-red-600"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" /> ลบโครงการ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">ความคืบหน้า</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ปีงบประมาณ: {project.academic_year || "-"}</span>
                  <span className="font-medium text-primary">งบประมาณ: ฿{project.budget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;