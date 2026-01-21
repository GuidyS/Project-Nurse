import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ-สกุล"),
  position: z.string().min(1, "กรุณากรอกตำแหน่ง"),
  department: z.string().min(1, "กรุณากรอกภาควิชา"),
  faculty: z.string().min(1, "กรุณากรอกคณะ"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  office: z.string().min(1, "กรุณากรอกห้องทำงาน"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Education {
  degree: string;
  field: string;
  university: string;
  year: string;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    name: string;
    position: string;
    department: string;
    faculty: string;
    email: string;
    phone: string;
    office: string;
    education: Education[];
    expertise: string[];
  };
  onSave: (data: ProfileFormData & { education: Education[]; expertise: string[] }) => void;
}

/**
 * EditProfileDialog Component - Dialog สำหรับแก้ไขข้อมูลส่วนตัว
 * 
 * หน้าที่:
 * - แสดง form สำหรับแก้ไขข้อมูลส่วนตัว
 * - จัดการประวัติการศึกษา (เพิ่ม, แก้ไข, ลบ)
 * - จัดการความเชี่ยวชาญ (เพิ่ม, ลบ)
 * - Validate ข้อมูลด้วย Zod schema
 * 
 * Props:
 * - open: สถานะการเปิด/ปิด dialog
 * - onOpenChange: Callback เมื่อสถานะ dialog เปลี่ยน
 * - profile: ข้อมูลโปรไฟล์ปัจจุบัน
 * - onSave: Callback เมื่อบันทึกข้อมูล
 */

const EditProfileDialog = ({ open, onOpenChange, profile, onSave }: EditProfileDialogProps) => {
  const [education, setEducation] = useState<Education[]>(profile.education);
  const [expertise, setExpertise] = useState<string[]>(profile.expertise);
  const [newExpertise, setNewExpertise] = useState("");

  /**
   * form - React Hook Form instance
   * 
   * ใช้ zodResolver สำหรับ validation
   * defaultValues จาก profile prop
   */

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      position: profile.position,
      department: profile.department,
      faculty: profile.faculty,
      email: profile.email,
      phone: profile.phone,
      office: profile.office,
    },
  });

  /**
   * handleAddEducation - เพิ่มรายการประวัติการศึกษาว่างใหม่
   * 
   * หน้าที่:
   * - เพิ่ม education object ใหม่ที่มีค่าว่างทั้งหมด
   */

  const handleAddEducation = () => {
    setEducation([...education, { degree: "", field: "", university: "", year: "" }]);
  };

  /**
   * handleRemoveEducation - ลบรายการประวัติการศึกษา
   * 
   * @param {number} index - Index ของรายการที่ต้องการลบ
   */

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  /**
   * handleEducationChange - อัพเดทข้อมูลประวัติการศึกษา
   * 
   * @param {number} index - Index ของรายการที่ต้องการแก้ไข
   * @param {keyof Education} field - Field ที่ต้องการแก้ไข
   * @param {string} value - ค่าใหม่
   */

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  /**
   * handleAddExpertise - เพิ่มความเชี่ยวชาญใหม่
   * 
   * หน้าที่:
   * - ตรวจสอบว่าไม่ว่างและยังไม่มีในรายการ
   * - เพิ่มเข้า expertise array
   * - ล้าง input field
   */

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()]);
      setNewExpertise("");
    }
  };

  /**
   * handleRemoveExpertise - ลบความเชี่ยวชาญ
   * 
   * @param {string} skill - ความเชี่ยวชาญที่ต้องการลบ
   */

  const handleRemoveExpertise = (skill: string) => {
    setExpertise(expertise.filter((e) => e !== skill));
  };

  /**
   * onSubmit - จัดการเมื่อ submit form
   * 
   * หน้าที่:
   * - เรียก onSave callback พร้อมข้อมูลที่แก้ไข
   * - แสดง toast notification
   * - ปิด dialog
   * 
   * @param {ProfileFormData} data - ข้อมูลจาก form (ผ่าน validation แล้ว)
   */
  
  const onSubmit = (data: ProfileFormData) => {
    onSave({ ...data, education, expertise });
    toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">แก้ไขข้อมูลส่วนตัว</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground border-b pb-2">ข้อมูลพื้นฐาน</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อ-สกุล</FormLabel>
                      <FormControl>
                        <Input placeholder="ชื่่อ-สกุล" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ตำแหน่ง</FormLabel>
                      <FormControl>
                        <Input placeholder="ตำแหน่ง" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ภาควิชา</FormLabel>
                      <FormControl>
                        <Input placeholder="ภาควิชา" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faculty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>คณะ</FormLabel>
                      <FormControl>
                        <Input placeholder="คณะ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@university.ac.th" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เบอร์โทรศัพท์</FormLabel>
                      <FormControl>
                        <Input placeholder="02-123-4567 ต่อ 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />       
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold text-foreground">ประวัติการศึกษา</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddEducation}>
                  <Plus className="h-4 w-4 mr-1" />
                  เพิ่ม
                </Button>
              </div>

              {education.map((edu, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-10">
                    <div>
                      <Label className="text-sm">ระดับการศึกษา</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                        placeholder="ปริญญาเอก"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">สาขาวิชา</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => handleEducationChange(index, "field", e.target.value)}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">สถาบัน</Label>
                      <Input
                        value={edu.university}
                        onChange={(e) => handleEducationChange(index, "university", e.target.value)}
                        placeholder="MIT, USA"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">ปี พ.ศ.</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                        placeholder="2558"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expertise */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground border-b pb-2">ความเชี่ยวชาญ</h3>
              
              <div className="flex gap-2">
                <Input
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="เพิ่มความเชี่ยวชาญ..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddExpertise}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {expertise.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">
                บันทึกข้อมูล
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
