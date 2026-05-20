import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, MoreVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateProjectDialog from "@/components/ui/CreateProjectDialog";
import EditProjectDialog from "@/components/ui/EditProjectDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = "http://localhost/path-to-your-api/project_api.php"; 

const ProjectsPage = () => {
  // 1. ใส่ Mockup Data เป็นค่าเริ่มต้น
const [projects, setProjects] = useState<any[]>([
    {
      id: 1,
      name: "ระบบติดตามและแจ้งเตือนสัญญาณชีพผู้ป่วย",
      nameEn: "Patient Vitals Monitoring System",
      description: "พัฒนาระบบเชื่อมต่ออุปกรณ์วัดสัญญาณชีพเข้ากับหน้าจอ Central Monitor ที่เคาน์เตอร์พยาบาลแบบเรียลไทม์",
      type: "เทคโนโลยีการแพทย์",
      status: "กำลังดำเนินการ",
      progress: 60,
      deadline: "2026-08-30",
      budget: "450000",
    },
    {
      id: 2,
      name: "แอปพลิเคชันดูแลผู้ป่วยติดเตียงที่บ้าน",
      nameEn: "Home Care Nursing Application",
      description: "ระบบสำหรับพยาบาลวิชาชีพเพื่อบันทึกข้อมูลการเยี่ยมบ้าน วิดีโอคอลติดตามอาการ และให้คำปรึกษาญาติผู้ป่วย",
      type: "บริการสุขภาพชุมชน",
      status: "เริ่มโครงการ",
      progress: 15,
      deadline: "2026-12-15",
      budget: "200000",
    },
    {
      id: 3,
      name: "ระบบตรวจสอบและป้องกันความคลาดเคลื่อนทางยา",
      nameEn: "Medication Administration Checking System",
      description: "ระบบสแกนบาร์โค้ดยาและสายรัดข้อมือผู้ป่วยก่อนบริหารยา เพื่อลดอุบัติการณ์ Medication Error",
      type: "พัฒนาคุณภาพบริการ",
      status: "เสร็จสิ้น",
      progress: 100,
      deadline: "2026-02-28",
      budget: "350000",
    },
    {
      id: 4,
      name: "ระบบจัดตารางเวรพยาบาลอัจฉริยะ",
      nameEn: "Smart Nurse Scheduling System",
      description: "โปรแกรมจัดตารางขึ้นเวรอัตโนมัติตามอัตรากำลังของแต่ละแผนก และคำนวณชั่วโมงพักผ่อนที่เหมาะสม",
      type: "บริหารจัดการภายใน",
      status: "กำลังดำเนินการ",
      progress: 80,
      deadline: "2026-06-10",
      budget: "150000",
    },
    {
      id: 5,
      name: "แพลตฟอร์มประเมินสมรรถนะและเก็บหน่วยกิตพยาบาล",
      nameEn: "Nursing Competency & CNEU Platform",
      description: "ระบบจัดการการสอบทักษะทางการพยาบาลและเก็บสะสมคะแนนหน่วยกิตการศึกษาต่อเนื่อง (CNEU)",
      type: "การศึกษาและฝึกอบรม",
      status: "รอตรวจสอบ",
      progress: 90,
      deadline: "2026-05-20",
      budget: "180000",
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false); // เปลี่ยนเป็น false เพราะมีข้อมูลรออยู่แล้ว
  
  // States สำหรับจัดการ Dialog ต่างๆ
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null); 

  // [GET]
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (data.status === "success") {
        const mappedProjects = data.data.map((p: any) => ({
          id: p.project_id,
          name: p.project_name_th,
          nameEn: p.project_name_en, 
          description: p.description,
          type: "โครงการทั่วไป", 
          status: "กำลังดำเนินการ",
          progress: 50, 
          deadline: "-",
          budget: "0",
        }));
        setProjects(mappedProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    // ปิดการดึงข้อมูลจาก API ชั่วคราว หน้าเว็บจะได้โชว์ Mockup 5 อันนั้น
    // fetchProjects();
  }, []);

  // [POST] จำลองการสร้างโครงการใหม่
  const handleCreate = async (data: { name: string; categories: string[]; budget: number; deadline: string }) => {
    // อัปเดต State จำลองไปก่อน
    const newProject = {
      id: projects.length + 1,
      name: data.name,
      nameEn: "",
      description: `Budget: ${data.budget}, Deadline: ${data.deadline}`,
      type: "โครงการทั่วไป",
      status: "กำลังดำเนินการ",
      progress: 0,
      deadline: data.deadline,
      budget: data.budget.toString()
    };
    setProjects([...projects, newProject]);
    setCreateOpen(false); // ปิด Dialog (ถ้า Dialog ไม่ได้ปิดเอง)

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          project_name_th: data.name,
          project_name_en: "", 
          description: `Budget: ${data.budget}, Deadline: ${data.deadline}`, 
        }),
      });
      const result = await res.json();
      if (result.status === "success") fetchProjects();
      else alert("Error: " + result.message);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // [PUT] จำลองการอัปเดตโครงการ
  const handleUpdate = async (updateData: { project_id: number; project_name_th: string; project_name_en: string; description: string }) => {
    // อัปเดต State จำลองไปก่อน
    setProjects(projects.map(p => 
      p.id === updateData.project_id 
        ? { ...p, name: updateData.project_name_th, nameEn: updateData.project_name_en, description: updateData.description } 
        : p
    ));
    setEditOpen(false); // ปิด Dialog


    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      const result = await res.json();
      if (result.status === "success") {
        fetchProjects(); 
      } else {
        alert("ไม่สามารถแก้ไขได้: " + result.message);
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  // [DELETE] จำลองการลบโครงการ
  const handleDelete = async (id: number) => {
    if (!window.confirm("คุณต้องการลบโครงการนี้ใช่หรือไม่?")) return;
    
    // อัปเดต State จำลองไปก่อน
    setProjects(projects.filter(p => p.id !== id));

    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ project_id: id }),
      });
      const result = await res.json();
      if (result.status === "success") fetchProjects();
      else alert("ไม่สามารถลบได้: " + result.message);
    } catch (error) {
      console.error("Error deleting project:", error);
    }   
  };

  // เปิดหน้าต่างแก้ไข พร้อมส่งข้อมูลไปให้ Dialog
  const openEditDialog = (project: any) => {
    setSelectedProject(project);
    setEditOpen(true);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการโครงการ</h1>
          <p className="text-muted-foreground mt-1">สร้าง แก้ไข และติดตามความคืบหน้าโครงการ</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          สร้างโครงการใหม่
        </Button>

        {/* เรียกใช้ Dialog สร้าง */}
        <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
        
        {/* เรียกใช้ Dialog แก้ไข */}
        <EditProjectDialog open={editOpen} onOpenChange={setEditOpen} projectData={selectedProject} onUpdate={handleUpdate} />
      </div>

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
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">กำลังโหลดข้อมูล...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-card rounded-xl shadow-card p-5 hover:shadow-md transition-shadow border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-2">{project.name}</h3>
                  {project.description && (
                     <p className="text-sm text-muted-foreground truncate mt-1">{project.description}</p>
                  )}
                </div>
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
                    {/* ปุ่มแก้ไข เรียกฟังก์ชัน openEditDialog */}
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEditDialog(project)}>
                      <Edit className="h-4 w-4" /> แก้ไขโครงการ
                    </DropdownMenuItem>
                    {/* ปุ่มลบ */}
                    <DropdownMenuItem className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="h-4 w-4" /> ลบโครงการ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;