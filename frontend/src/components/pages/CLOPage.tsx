import { useState } from "react";
import { Plus, Edit, Trash2, Link2, Save, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const courses = [
  { id: 1, code: "CS101", name: "การเขียนโปรแกรมเบื้องต้น" },
  { id: 2, code: "CS201", name: "โครงสร้างข้อมูลและอัลกอริทึม" },
  { id: 3, code: "CS301", name: "ปัญญาประดิษฐ์" },
  { id: 4, code: "CS401", name: "Machine Learning" },
];

const cloData = [
  { id: 1, code: "CLO1", description: "สามารถเขียนโปรแกรมพื้นฐานได้", plo: "PLO1", ylo: "YLO1" },
  { id: 2, code: "CLO2", description: "เข้าใจหลักการออกแบบอัลกอริทึม", plo: "PLO2", ylo: "YLO2" },
  { id: 3, code: "CLO3", description: "สามารถแก้ปัญหาด้วยการเขียนโปรแกรม", plo: "PLO3", ylo: "YLO1" },
  { id: 4, code: "CLO4", description: "ทำงานร่วมกับผู้อื่นได้อย่างมีประสิทธิภาพ", plo: "PLO5", ylo: "YLO3" },
  { id: 5, code: "CLO5", description: "สื่อสารแนวคิดทางเทคนิคได้อย่างชัดเจน", plo: "PLO6", ylo: "YLO4" },
];

/**
 * CLOPage Component - หน้ากำหนด Course Learning Outcomes (CLO)
 * 
 * หน้าที่:
 * - เลือกรายวิชาเพื่อดูและแก้ไข CLO
 * - แสดงรายการ CLO ของรายวิชาที่เลือก
 * - รองรับการเพิ่ม แก้ไข และลบ CLO
 * 
 * State:
 * - selectedCourse: รหัสวิชาที่เลือก (string)
 * - clos: รายการ CLO ของรายวิชาที่เลือก
 */
const CLOPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [clos, setClos] = useState(cloData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">กำหนด CLO</h1>
          <p className="text-muted-foreground mt-1">กำหนดและแก้ไข Course Learning Outcomes</p>
        </div>
      </div>

      {/* Course Selector */}
      <div className="bg-card rounded-xl shadow-card p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">เลือกรายวิชา</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกรายวิชา..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.code}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่ม CLO
          </Button>
        </div>
      </div>

      {/* CLO List */}
      {selectedCourse ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              CLO ของรายวิชา {selectedCourse}
            </h2>
            <Button variant="outline" className="gap-2">
              <Link2 className="h-4 w-4" />
              ดู CLO Map
            </Button>
          </div>

          <div className="space-y-3">
            {clos.map((clo) => (
              <div key={clo.id} className="bg-card rounded-xl shadow-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold">
                        {clo.code}
                      </Badge>
                      <Badge variant="secondary">{clo.plo}</Badge>
                      <Badge variant="secondary">{clo.ylo}</Badge>
                    </div>
                    <p className="text-foreground">{clo.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline">ยกเลิก</Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              บันทึก
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-card p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">เลือกรายวิชา</h3>
          <p className="text-sm text-muted-foreground">กรุณาเลือกรายวิชาเพื่อดูและแก้ไข CLO</p>
        </div>
      )}
    </div>
  );
};

export default CLOPage;
