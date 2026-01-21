import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, MoreVertical, Upload, Link2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const projects = [
  {
    id: 1,
    name: "โครงการวิจัย Machine Learning เพื่อการพยากรณ์",
    type: "วิจัย",
    status: "กำลังดำเนินการ",
    progress: 75,
    deadline: "30 ม.ค. 2569",
    budget: "500,000",
  },
  {
    id: 2,
    name: "พัฒนาหลักสูตร Data Science สำหรับผู้เริ่มต้น",
    type: "หลักสูตร",
    status: "กำลังดำเนินการ",
    progress: 45,
    deadline: "15 ก.พ. 2569",
    budget: "200,000",
  },
  {
    id: 3,
    name: "โครงการบริการวิชาการชุมชน",
    type: "บริการวิชาการ",
    status: "รอเริ่ม",
    progress: 10,
    deadline: "1 มี.ค. 2569",
    budget: "150,000",
  },
  {
    id: 4,
    name: "การประชุมวิชาการนานาชาติ ICAI 2026",
    type: "ประชุมวิชาการ",
    status: "เสร็จสิ้น",
    progress: 100,
    deadline: "10 ม.ค. 2569",
    budget: "300,000",
  },
];

/**
 * ProjectsPage Component - หน้าจัดการโครงการ
 * 
 * หน้าที่:
 * - แสดงรายการโครงการทั้งหมด
 * - ค้นหาและกรองโครงการ
 * - แสดงความคืบหน้าและสถานะของโครงการ
 * - จัดการโครงการ (ดู, แก้ไข, อัปโหลดเอกสาร, เชื่อมโยง PLO/YLO/CLO)
 * 
 * Features:
 * - Project cards แสดงข้อมูลโครงการ
 * - Progress bar แสดงความคืบหน้า
 * - Status badges แสดงสถานะ
 * - Search และ filter
 */
const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * filteredProjects - กรองโครงการตาม searchQuery
   * 
   * ค้นหาจากชื่อโครงการ (case-insensitive)
   */
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * getStatusBadge - สร้าง Badge component สำหรับแสดงสถานะโครงการ
   * 
   * ใช้สีที่แตกต่างกันตามสถานะ:
   * - เสร็จสิ้น: สีเขียว (success)
   * - กำลังดำเนินการ: สีหลัก (primary)
   * - รอเริ่ม: สีรอง (secondary)
   * - อื่นๆ: outline
   * 
   * @param {string} status - สถานะโครงการ
   * @returns {JSX.Element} - Badge component
   */
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

  /**
   * getProgressColor - กำหนดสีของ progress bar ตามเปอร์เซ็นต์ความคืบหน้า
   * 
   * เกณฑ์:
   * - >= 80%: สีเขียว (success)
   * - >= 50%: สีหลัก (primary)
   * - >= 30%: สีเหลือง (warning)
   * - < 30%: สี accent
   * 
   * @param {number} progress - เปอร์เซ็นต์ความคืบหน้า (0-100)
   * @returns {string} - CSS class สำหรับสี
   */
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
          <p className="text-muted-foreground mt-1">สร้าง แก้ไข และติดตามความคืบหน้าโครงการ</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          สร้างโครงการใหม่
        </Button>
      </div>

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

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-card rounded-xl shadow-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{project.type}</Badge>
                  {getStatusBadge(project.status)}
                </div>
                <h3 className="font-semibold text-foreground line-clamp-2">{project.name}</h3>
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
                  <DropdownMenuItem className="gap-2">
                    <Edit className="h-4 w-4" /> แก้ไขโครงการ
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Upload className="h-4 w-4" /> อัปโหลดเอกสาร
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Link2 className="h-4 w-4" /> เชื่อมโยง PLO/YLO/CLO
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <FileText className="h-4 w-4" /> สร้างรายงาน
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
                <span className="text-muted-foreground">กำหนดส่ง: {project.deadline}</span>
                <span className="text-muted-foreground">งบประมาณ: ฿{project.budget}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
