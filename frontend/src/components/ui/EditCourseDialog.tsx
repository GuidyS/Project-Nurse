import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { useEffect } from "react";

const EditCourseDialog = ({ course, open, onOpenChange, onSave, onDelete }: {
  course: any,
  open: boolean,
  onOpenChange: (open: boolean) => void,
  onSave: (updated: any) => void,
  onDelete?: (id: string) => void,
}) => {
  const [form, setForm] = useState({
    code: "",
    name: "",
    credits: "",
    semester: "",
  });

  useEffect(() => {
    if (course) {
      setForm({
        code: course.code || "",
        name: course.name || "",
        credits: course.credits?.toString() || "",
        semester: course.semester || "",
      });
    }
  }, [course]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({ ...course, ...form, credits: Number(form.credits) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขรายวิชา</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">รหัสวิชา</Label>
            <Input
              id="code"
              placeholder="เช่น NUR101"
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">ชื่อรายวิชา</Label>
            <Input
              id="name"
              placeholder="เช่น พื้นฐานการพยาบาล"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="credits">หน่วยกิต</Label>
              <Input
                id="credits"
                type="number"
                placeholder="3"
                value={form.credits}
                onChange={(e) => handleChange("credits", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="semester">ภาคการศึกษา</Label>
              <Input
                id="semester"
                placeholder="เช่น 2/2566"
                value={form.semester}
                onChange={(e) => handleChange("semester", e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ยกเลิก</Button>
          </DialogClose>
          {onDelete && course?.id && (
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => onDelete(course.id)}>
                ลบรายวิชา
              </Button>
            </DialogClose>
          )}
          <DialogClose asChild>
            <Button onClick={handleSave}>บันทึก</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;