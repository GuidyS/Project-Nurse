import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, MoreVertical, FileText, Loader2, Calendar, DollarSign, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface ProjectItem {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  deadline: string;
  budget: string;
  academic_year: number;
  responsible_faculty_id: string;
  responsible_faculty_name: string;
}

interface FacultyItem {
  id: string;
  name: string;
}

const progressOptions = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const ProjectsPage = () => {
  const { toast } = useToast();
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [facultiesList, setFacultiesList] = useState<FacultyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals Open State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form States
  const [newProject, setNewProject] = useState({
    projectName: "",
    type: "หลักสูตร",
    status: "กำลังดำเนินการ",
    progress: 0,
    deadline: "",
    budget: "",
    academicYear: new Date().getFullYear() + 543,
    responsibleFacultyId: ""
  });
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/index.php?page=get-projects&search=${encodeURIComponent(searchQuery)}`);
      if (response.data.status === "success") {
        setProjectsList(response.data.data.projects || []);
        setFacultiesList(response.data.data.faculties || []);
      } else {
        toast({ title: "ข้อผิดพลาด", description: response.data.message || "ไม่สามารถดึงข้อมูลได้", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery]);

  const handleCreate = async () => {
    if (!newProject.projectName || !newProject.academicYear || !newProject.responsibleFacultyId) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกข้อมูลโครงการให้ครบถ้วน", variant: "destructive" });
      return;
    }

    try {
      const response = await api.post("/index.php?page=add-project", {
        name: newProject.projectName,
        type: newProject.type,
        status: newProject.status,
        progress: newProject.progress,
        deadline: newProject.deadline,
        budget: newProject.budget,
        academic_year: newProject.academicYear,
        responsible_faculty_id: newProject.responsibleFacultyId
      });

      if (response.data.status === "success") {
        toast({ title: "สำเร็จ", description: "สร้างโครงการใหม่เรียบร้อยแล้ว" });
        setIsCreateOpen(false);
        setNewProject({
          projectName: "",
          type: "หลักสูตร",
          status: "กำลังดำเนินการ",
          progress: 0,
          deadline: "",
          budget: "",
          academicYear: new Date().getFullYear() + 543,
          responsibleFacultyId: ""
        });
        fetchProjects();
      } else {
        toast({ title: "ข้อผิดพลาด", description: response.data.message || "ไม่สามารถสร้างโครงการได้", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "เกิดข้อผิดพลาดในการบันทึกโครงการ", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!selectedProject || !selectedProject.name || !selectedProject.academic_year || !selectedProject.responsible_faculty_id) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกข้อมูลโครงการให้ครบถ้วน", variant: "destructive" });
      return;
    }

    try {
      const response = await api.post("/index.php?page=update-project", {
        project_id: selectedProject.id,
        name: selectedProject.name,
        type: selectedProject.type,
        status: selectedProject.status,
        progress: selectedProject.progress,
        deadline: selectedProject.deadline,
        budget: selectedProject.budget,
        academic_year: selectedProject.academic_year,
        responsible_faculty_id: selectedProject.responsible_faculty_id
      });

      if (response.data.status === "success") {
        toast({ title: "สำเร็จ", description: "แก้ไขข้อมูลโครงการเรียบร้อยแล้ว" });
        setIsEditOpen(false);
        setSelectedProject(null);
        fetchProjects();
      } else {
        toast({ title: "ข้อผิดพลาด", description: response.data.message || "ไม่สามารถแก้ไขข้อมูลได้", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "เกิดข้อผิดพลาดในการบันทึกการแก้ไข", variant: "destructive" });
    }
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ "${projectName}"?`)) {
      return;
    }

    try {
      const response = await api.post("/index.php?page=delete-project", {
        project_id: projectId
      });

      if (response.data.status === "success") {
        toast({ title: "สำเร็จ", description: "ลบโครงการเรียบร้อยแล้ว" });
        fetchProjects();
      } else {
        toast({ title: "ข้อผิดพลาด", description: response.data.message || "ไม่สามารถลบโครงการได้", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "เกิดข้อผิดพลาดในการลบโครงการ", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "เสร็จสิ้น":
        return <Badge className="bg-success text-success-foreground">เสร็จสิ้น</Badge>;
      case "กำลังดำเนินการ":
        return <Badge className="bg-primary text-primary-foreground">กำลังดำเนินการ</Badge>;
      case "รอเริ่ม":
        return <Badge variant="secondary">รอเริ่ม</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-success";
    if (progress >= 50) return "bg-primary";
    if (progress >= 30) return "bg-warning";
    return "bg-accent";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการโครงการ</h1>
          <p className="text-muted-foreground mt-1">สร้าง แก้ไข และติดตามโครงการการจัดการการเรียนรู้</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          สร้างโครงการใหม่
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาโครงการตามชื่อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projectsList.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
          <p className="text-muted-foreground">ไม่พบโครงการในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectsList.map((project) => (
            <div key={project.id} className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">ปี พ.ศ. {project.academic_year}</Badge>
                    <Badge variant="secondary" className="text-xs">{project.type}</Badge>
                    {getStatusBadge(project.status)}
                  </div>
                  <h3 className="font-semibold text-foreground text-base line-clamp-2 leading-snug">{project.name}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2" onClick={() => {
                      setSelectedProject(project);
                      setIsEditOpen(true);
                    }}>
                      <Edit className="h-4 w-4" /> แก้ไขโครงการ
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleDelete(project.id, project.name)}>
                      <Trash2 className="h-4 w-4" /> ลบโครงการ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Progress Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>ความคืบหน้า</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Deadline & Budget Info */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">ส่ง: {project.deadline || "-"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">งบ: ฿{project.budget || "0"}</span>
                </div>
              </div>

              <div className="border-t pt-2.5 flex items-center gap-1.5 text-xs">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">ผู้รับผิดชอบ:</span>
                <span className="font-medium text-foreground truncate flex-1">{project.responsible_faculty_name || "ไม่ระบุอาจารย์"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Modal: Create Project */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>สร้างโครงการใหม่</DialogTitle>
            <DialogDescription>
              สร้างโครงการใหม่เข้าสู่ระบบฐานข้อมูล
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="grid gap-1">
              <Label htmlFor="create-name" className="text-sm">ชื่อโครงการ</Label>
              <Input
                id="create-name"
                placeholder="ระบุชื่อโครงการ เช่น พัฒนาหลักสูตร Data Science"
                value={newProject.projectName}
                onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="create-type" className="text-sm">ประเภท</Label>
                <Select
                  value={newProject.type}
                  onValueChange={(value) => setNewProject({ ...newProject, type: value })}
                >
                  <SelectTrigger id="create-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="หลักสูตร">หลักสูตร</SelectItem>
                    <SelectItem value="วิจัย">วิจัย</SelectItem>
                    <SelectItem value="บริการวิชาการ">บริการวิชาการ</SelectItem>
                    <SelectItem value="ประชุมวิชาการ">ประชุมวิชาการ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="create-status" className="text-sm">สถานะ</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                >
                  <SelectTrigger id="create-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="รอเริ่ม">รอเริ่ม</SelectItem>
                    <SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
                    <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="create-progress" className="text-sm">ความคืบหน้า (%)</Label>
                <Select
                  value={newProject.progress.toString()}
                  onValueChange={(value) => setNewProject({ ...newProject, progress: parseInt(value) })}
                >
                  <SelectTrigger id="create-progress">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {progressOptions.map((val) => (
                      <SelectItem key={val} value={val.toString()}>
                        {val}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="create-year" className="text-sm">ปีการศึกษา (พ.ศ.)</Label>
                <Input
                  id="create-year"
                  type="number"
                  placeholder="เช่น 2569"
                  value={newProject.academicYear}
                  onChange={(e) => setNewProject({ ...newProject, academicYear: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="create-deadline" className="text-sm">กำหนดส่ง</Label>
                <Input
                  id="create-deadline"
                  placeholder="เช่น 15/2/2569"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="create-budget" className="text-sm">งบประมาณ</Label>
                <Input
                  id="create-budget"
                  placeholder="เช่น 200,000"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="create-faculty" className="text-sm">อาจารย์ผู้รับผิดชอบ</Label>
              <Select
                value={newProject.responsibleFacultyId}
                onValueChange={(value) => setNewProject({ ...newProject, responsibleFacultyId: value })}
              >
                <SelectTrigger id="create-faculty">
                  <SelectValue placeholder="เลือกอาจารย์ผู้รับผิดชอบ" />
                </SelectTrigger>
                <SelectContent>
                  {facultiesList.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreate}>สร้างโครงการ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modal: Edit Project */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลโครงการ</DialogTitle>
            <DialogDescription>
              แก้ไขชื่อโครงการ ปีการศึกษา หรือผู้รับผิดชอบโครงการ
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="grid gap-4 py-3">
              <div className="grid gap-1">
                <Label htmlFor="edit-name" className="text-sm">ชื่อโครงการ</Label>
                <Input
                  id="edit-name"
                  placeholder="ระบุชื่อโครงการ"
                  value={selectedProject.name}
                  onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="edit-type" className="text-sm">ประเภท</Label>
                  <Select
                    value={selectedProject.type}
                    onValueChange={(value) => setSelectedProject({ ...selectedProject, type: value })}
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="หลักสูตร">หลักสูตร</SelectItem>
                      <SelectItem value="วิจัย">วิจัย</SelectItem>
                      <SelectItem value="บริการวิชาการ">บริการวิชาการ</SelectItem>
                      <SelectItem value="ประชุมวิชาการ">ประชุมวิชาการ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="edit-status" className="text-sm">สถานะ</Label>
                  <Select
                    value={selectedProject.status}
                    onValueChange={(value) => setSelectedProject({ ...selectedProject, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="รอเริ่ม">รอเริ่ม</SelectItem>
                      <SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="edit-progress" className="text-sm">ความคืบหน้า (%)</Label>
                  <Select
                    value={selectedProject.progress.toString()}
                    onValueChange={(value) => setSelectedProject({ ...selectedProject, progress: parseInt(value) })}
                  >
                    <SelectTrigger id="edit-progress">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {progressOptions.map((val) => (
                        <SelectItem key={val} value={val.toString()}>
                          {val}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="edit-year" className="text-sm">ปีการศึกษา (พ.ศ.)</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    placeholder="เช่น 2569"
                    value={selectedProject.academic_year}
                    onChange={(e) => setSelectedProject({ ...selectedProject, academic_year: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="edit-deadline" className="text-sm">กำหนดส่ง</Label>
                  <Input
                    id="edit-deadline"
                    placeholder="เช่น 15/2/2569"
                    value={selectedProject.deadline}
                    onChange={(e) => setSelectedProject({ ...selectedProject, deadline: e.target.value })}
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="edit-budget" className="text-sm">งบประมาณ</Label>
                  <Input
                    id="edit-budget"
                    placeholder="เช่น 200,000"
                    value={selectedProject.budget}
                    onChange={(e) => setSelectedProject({ ...selectedProject, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="edit-faculty" className="text-sm">อาจารย์ผู้รับผิดชอบ</Label>
                <Select
                  value={selectedProject.responsible_faculty_id}
                  onValueChange={(value) => setSelectedProject({ ...selectedProject, responsible_faculty_id: value })}
                >
                  <SelectTrigger id="edit-faculty">
                    <SelectValue placeholder="เลือกอาจารย์ผู้รับผิดชอบ" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultiesList.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditOpen(false);
              setSelectedProject(null);
            }}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdate}>บันทึกการแก้ไข</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
