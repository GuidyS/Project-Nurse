import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";


export default function DialogCourse({ onAddCourse }: { onAddCourse?: (course: any) => void }) {
  const [open, setOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    credits: "",
    semester: "",
    description: "",
  });

  const handleAddCourse = () => {
    if (!newCourse.code || !newCourse.name || !newCourse.credits || !newCourse.semester) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (onAddCourse) {
      onAddCourse({
        code: newCourse.code,
        name: newCourse.name,
        credits: Number(newCourse.credits),
        semester: newCourse.semester,
        description: newCourse.description,
      });
    }
    toast.success(`เพิ่มรายวิชา ${newCourse.code} - ${newCourse.name} สำเร็จ`);
    setNewCourse({ code: "", name: "", credits: "", semester: "", description: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          เพิ่มรายวิชา
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>เพิ่มรายวิชาใหม่</DialogTitle>
          <DialogDescription>กรอกข้อมูลรายวิชาที่ต้องการเพิ่มเข้าสู่ระบบ</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-code">รหัสวิชา</Label>
              <Input
                id="course-code"
                placeholder="เช่น NUR101"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-credits">หน่วยกิต</Label>
              <Select
                value={newCourse.credits}
                onValueChange={(val) => setNewCourse({ ...newCourse, credits: val })}
              >
                <SelectTrigger id="course-credits">
                  <SelectValue placeholder="เลือก" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((c) => (
                    <SelectItem key={c} value={String(c)}>{c} หน่วยกิต</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-name">ชื่อรายวิชา</Label>
            <Input
              id="course-name"
              placeholder="เช่น พื้นฐานการพยาบาล"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-semester">ภาคการศึกษา</Label>
            <Select
              value={newCourse.semester}
              onValueChange={(val) => setNewCourse({ ...newCourse, semester: val })}
            >
              <SelectTrigger id="course-semester">
                <SelectValue placeholder="เลือกภาคการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1/2566">1/2566</SelectItem>
                <SelectItem value="2/2566">2/2566</SelectItem>
                <SelectItem value="1/2567">1/2567</SelectItem>
                <SelectItem value="2/2567">2/2567</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-desc">รายละเอียดเพิ่มเติม (ไม่บังคับ)</Label>
            <Textarea
              id="course-desc"
              placeholder="คำอธิบายรายวิชา..."
              rows={3}
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
          <Button onClick={handleAddCourse}>เพิ่มรายวิชา</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}