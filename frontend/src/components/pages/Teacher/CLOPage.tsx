import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Link2, Save, BookOpen, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface Course {
  subject_id: number;
  subject_code: string;
  subject_name_th: string;
}

interface CLO {
  clo_id: number;
  description: string;
  ylo_id: string | null;
}

export default function CLOPage() {
  const { toast } = useToast();
  
  // States
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(""); // เก็บค่า subject_id
  const [clos, setClos] = useState<CLO[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  
  // Form State สำหรับสร้าง/แก้ไข
  const [formData, setFormData] = useState({
    description: "",
    ylo_id: "",
  });

  // 1. ดึงข้อมูลรายวิชาตอนเปิดหน้าเว็บ
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/index.php?page=get-subjects');
        if (res.data.status === 'success') {
          setCourses(res.data.data);
        }
      } catch (error) {
        toast({ title: "ข้อผิดพลาด", description: "ดึงข้อมูลรายวิชาไม่สำเร็จ", variant: "destructive" });
      }
    };
    fetchCourses();
  }, []);

  // 2. ดึง CLO เมื่อมีการเปลี่ยนวิชา
  useEffect(() => {
    if (!selectedCourse) return;
    
    const fetchCLOs = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/index.php?page=get-clos&subject_id=${selectedCourse}`);
        // API ส่งเป็น Array หรือ Object เช็คให้ดี (สมมติส่งเป็น array กลับมา)
        setClos(res.data || []); 
      } catch (error) {
        toast({ title: "ข้อผิดพลาด", description: "ดึงข้อมูล CLO ไม่สำเร็จ", variant: "destructive" });
        setClos([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCLOs();
  }, [selectedCourse]);

  // 3. ฟังก์ชันเพิ่ม / แก้ไข CLO
  const handleSave = async () => {
    if (!formData.description) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกคำอธิบาย CLO", variant: "destructive" });
      return;
    }

    try {
      if (isEditing) {
        // โหมดแก้ไข
        const res = await api.post('/index.php?page=update-clo', {
          clo_id: isEditing,
          description: formData.description,
          ylo_id: formData.ylo_id
        });
        if (res.data.status === 'success') {
          toast({ title: "สำเร็จ", description: "แก้ไข CLO เรียบร้อยแล้ว" });
          setClos(clos.map(c => c.clo_id === isEditing ? { ...c, description: formData.description, ylo_id: formData.ylo_id } : c));
        }
      } else {
        // โหมดเพิ่มใหม่
        const res = await api.post('/index.php?page=add-clo', {
          subject_id: parseInt(selectedCourse),
          description: formData.description,
          ylo_id: formData.ylo_id
        });
        if (res.data.status === 'success') {
          toast({ title: "สำเร็จ", description: "เพิ่ม CLO เรียบร้อยแล้ว" });
          // รีเฟรชดึงข้อมูลใหม่
          const refresh = await api.get(`/index.php?page=get-clos&subject_id=${selectedCourse}`);
          setClos(refresh.data || []);
        }
      }
      
      // เคลียร์ฟอร์ม
      setFormData({ description: "", ylo_id: "" });
      setIsEditing(null);
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
    }
  };

  // 4. ฟังก์ชันลบ CLO
  const handleDelete = async (clo_id: number) => {
    if (!confirm("คุณต้องการลบ CLO นี้ใช่หรือไม่?")) return;
    
    try {
      const res = await api.post('/index.php?page=delete-clo', { clo_id });
      if (res.data.status === 'success') {
        toast({ title: "สำเร็จ", description: "ลบข้อมูลเรียบร้อยแล้ว" });
        setClos(clos.filter(c => c.clo_id !== clo_id));
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถลบข้อมูลได้", variant: "destructive" });
    }
  };

  const handleEditClick = (clo: CLO) => {
    setIsEditing(clo.clo_id);
    setFormData({ description: clo.description, ylo_id: clo.ylo_id || "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">การจัดการ CLO รายวิชา</h1>
          <p className="text-muted-foreground">Course Learning Outcomes Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* คอลัมน์ซ้าย: ตัวเลือกวิชา */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> เลือกรายวิชา
            </h3>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- เลือกรหัสวิชา --" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem 
                    key={course.subject_id} 
                    value={`${course.subject_id}`} 
                  >
                    {course.subject_code} - {course.subject_name_th}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* คอลัมน์ขวา: พื้นที่จัดการ CLO */}
        <div className="md:col-span-3 space-y-4">
          {selectedCourse ? (
            <div className="bg-card rounded-xl shadow-card p-6 border-t-4 border-t-primary">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  รายการ CLO
                </h2>
              </div>

              {/* ฟอร์มเพิ่ม/แก้ไข */}
              <div className="bg-muted/30 p-4 rounded-lg mb-6 border border-border">
                <h4 className="text-sm font-semibold mb-3">{isEditing ? "แก้ไข CLO" : "เพิ่ม CLO ใหม่"}</h4>
                <div className="grid gap-3">
                  <Textarea 
                    placeholder="รายละเอียด CLO..." 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <Input 
                    placeholder="รหัส YLO ที่สอดคล้อง (เช่น YLO1)" 
                    value={formData.ylo_id}
                    onChange={(e) => setFormData({ ...formData, ylo_id: e.target.value })}
                  />
                  <div className="flex justify-end gap-2">
                    {isEditing && (
                      <Button variant="outline" onClick={() => { setIsEditing(null); setFormData({ description: "", ylo_id: "" }); }}>ยกเลิก</Button>
                    )}
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" /> บันทึก
                    </Button>
                  </div>
                </div>
              </div>

              {/* รายการ CLO ปัจจุบัน */}
              {isLoading ? (
                 <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : clos.length > 0 ? (
                <div className="space-y-3">
                  {clos.map((clo, index) => (
                    <div key={clo.clo_id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                              CLO {index + 1}
                            </Badge>
                            {clo.ylo_id && <Badge variant="secondary">{clo.ylo_id}</Badge>}
                          </div>
                          <p className="text-foreground text-sm">{clo.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(clo)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(clo.clo_id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">ยังไม่มีข้อมูล CLO สำหรับวิชานี้</p>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-card p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">เลือกรายวิชา</h3>
              <p className="text-sm text-muted-foreground">กรุณาเลือกรายวิชาด้านซ้ายมือเพื่อดูและแก้ไข CLO</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
