import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Link2, Save, BookOpen, Target, Loader2, X } from "lucide-react";
import api from "@/lib/axios"; // 👈 นำเข้า Axios
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// กำหนด Path ไปหาโฟลเดอร์ Backend ของหน้า CLO
const API_BASE = "/components/CLOPage";

// กำหนดโครงสร้างข้อมูล (Type)
interface Course {
  id: number;
  code: string;
  name: string;
}

interface CLO {
  id: number;
  code: string;
  description: string;
  plo: string;
  ylo: string;
  ylo_id?: number; 
}

const CLOPage = () => {
  // 1. States สำหรับเก็บข้อมูลจากฐานข้อมูล
  const [courses, setCourses] = useState<Course[]>([]);
  const [clos, setClos] = useState<CLO[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  
  // 2. States สำหรับหน้าต่างป๊อปอัพ (Dialogs)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // 3. States สำหรับเก็บข้อมูลในฟอร์ม
  const [currentCLO, setCurrentCLO] = useState<Partial<CLO>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();


  // ฟังก์ชัน API: ดึงรายชื่อวิชา (ทำครั้งเดียวตอนเปิดหน้าเว็บ)
 
  useEffect(() => {
    api.get(`${API_BASE}/get_subjects.php`)
      .then((res) => {
        if (res.data.status === "success") setCourses(res.data.data);
      })
      .catch((err) => console.error("Error fetching courses", err));
  }, []);


  // ฟังก์ชัน API: ดึง CLO เมื่อผู้ใช้ "เลือกวิชา"

  const fetchCLOs = (subjectId: string) => {
    setIsLoading(true);
    api.get(`${API_BASE}/get_clos.php?subject_id=${subjectId}`)
      .then((res) => {
        if (res.data.status === "success") setClos(res.data.data);
      })
      .catch((err) => toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูล CLO ได้", variant: "destructive" }))
      .finally(() => setIsLoading(false));
  };

  const handleCourseChange = (courseCode: string) => {
    setSelectedCourse(courseCode);
    const course = courses.find(c => c.code === courseCode);
    if (course) fetchCLOs(course.id.toString());
  };


  // ฟังก์ชัน API: เพิ่ม CLO ใหม่

  const handleAddCLO = () => {
    const course = courses.find(c => c.code === selectedCourse);
    if (!course || !currentCLO.description) return;

    api.post(`${API_BASE}/add_clo.php`, { 
      subject_id: course.id, 
      description: currentCLO.description 
    })
      .then((res) => {
        if (res.data.status === "success") {
          toast({ title: "สำเร็จ", description: "เพิ่ม CLO เรียบร้อยแล้ว" });
          setIsAddOpen(false);
          setCurrentCLO({});
          fetchCLOs(course.id.toString()); // โหลดข้อมูลใหม่
        }
      });
  };


  // ฟังก์ชัน API: บันทึกการแก้ไข CLO

  const handleUpdateCLO = () => {
    api.post(`${API_BASE}/update_clo.php`, { 
      id: currentCLO.id, 
      description: currentCLO.description 
    })
      .then((res) => {
        if (res.data.status === "success") {
          toast({ title: "สำเร็จ", description: "แก้ไข CLO เรียบร้อยแล้ว" });
          setIsEditOpen(false);
          const course = courses.find(c => c.code === selectedCourse);
          if (course) fetchCLOs(course.id.toString());
        }
      });
  };


  // ฟังก์ชัน API: ลบ CLO
  const handleDeleteCLO = () => {
    api.post(`${API_BASE}/delete_clo.php`, { id: currentCLO.id })
      .then((res) => {
        if (res.data.status === "success") {
          toast({ title: "สำเร็จ", description: "ลบ CLO เรียบร้อยแล้ว" });
          setIsDeleteOpen(false);
          const course = courses.find(c => c.code === selectedCourse);
          if (course) fetchCLOs(course.id.toString());
        }
      });
  };

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
      <div className="bg-card rounded-xl shadow-card p-5 border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">เลือกรายวิชา</label>
            <Select value={selectedCourse} onValueChange={handleCourseChange}>
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
          <Button 
            className="gap-2" 
            disabled={!selectedCourse} 
            onClick={() => { setCurrentCLO({}); setIsAddOpen(true); }}
          >
            <Plus className="h-4 w-4" /> เพิ่ม CLO
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
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {clos.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
                  ยังไม่มีข้อมูล CLO สำหรับวิชานี้
                </div>
              ) : (
                clos.map((clo) => (
                  <div key={clo.id} className="bg-card rounded-xl shadow-sm border p-5">
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
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={() => { setCurrentCLO(clo); setIsEditOpen(true); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                          onClick={() => { setCurrentCLO(clo); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">เลือกรายวิชา</h3>
          <p className="text-sm text-muted-foreground">กรุณาเลือกรายวิชาเพื่อดูและแก้ไข CLO</p>
        </div>
      )}

     
      {/* ส่วนประกอบของ DIALOGS (หน้าต่างป๊อปอัพ เพิ่ม/แก้ไข/ลบ) */}
      {/* 1. Dialog: เพิ่ม CLO */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>เพิ่ม CLO ใหม่</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">รายละเอียด CLO (Description)</label>
              <Input 
                placeholder="เช่น สามารถเขียนโปรแกรมพื้นฐานได้..." 
                value={currentCLO.description || ""}
                onChange={(e) => setCurrentCLO({ ...currentCLO, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleAddCLO} disabled={!currentCLO.description}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Dialog: แก้ไข CLO */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>แก้ไข {currentCLO.code}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">รายละเอียด CLO</label>
              <Input 
                value={currentCLO.description || ""}
                onChange={(e) => setCurrentCLO({ ...currentCLO, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleUpdateCLO}>บันทึกการแก้ไข</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Dialog: ยืนยันการลบ */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive">ยืนยันการลบข้อมูล</DialogTitle></DialogHeader>
          <div className="py-4">
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{currentCLO.code}</strong> ?</p>
            <p className="text-sm text-muted-foreground mt-2">"{currentCLO.description}"</p>
            <p className="text-sm text-destructive mt-4">*การกระทำนี้ไม่สามารถกู้คืนได้</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={handleDeleteCLO}>ลบข้อมูล</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CLOPage;