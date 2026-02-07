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

// 1. เพิ่ม Interface เพื่อบอก TypeScript ว่าคอมโพเนนต์นี้รับ currentUser
interface TeacherPageProps {
  currentUser?: any; // ใส่ ? ไว้เผื่อกรณีที่ยังไม่มีข้อมูล user
}

// 2. ปรับฟังก์ชันให้รับ Props (จากเดิมอาจจะเป็น const ProjectsPage = () => { ... })
const ProjectsPage = ({ currentUser }: TeacherPageProps) => { 
  
  // ตอนนี้คุณสามารถใช้ currentUser.name เพื่อโชว์ชื่ออาจารย์ในหน้านี้ได้แล้ว
  console.log("Current User in Teacher Page:", currentUser);

  return (
    <div className="p-6">
      {/* ตัวอย่างการนำไปใช้: แสดงชื่ออาจารย์ผู้ล็อกอิน */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ยินดีต้อนรับ อาจารย์ {currentUser?.name || "ผู้ใช้งาน"}</h1>
        <p className="text-muted-foreground">จัดการโครงการวิจัยและวิชาการของคุณ</p>
      </div>

      {/* ... ส่วนของตาราง/การ์ดโครงการเดิมของคุณ ... */}
    </div>
  );
};

export default ProjectsPage;