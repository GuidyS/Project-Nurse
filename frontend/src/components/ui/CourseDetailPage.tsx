import { BookOpen, Users, Layers, Clock, Target, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CourseDetailPageProps {
  courseCode?: string;
  onBack?: () => void;
  onManageCLO?: (courseCode: string) => void;
}

interface CourseInfo {
  code: string;
  name: string;
  semester: string;
  credits: number;
  students: number;
  cloProgress: number;
  description: string;
  instructor: string;
  schedule: string;
  type: string;
}

const courseData: Record<string, CourseInfo> = {
  NUR101: {
    code: "NUR101",
    name: "พื้นฐานการพยาบาล",
    semester: "2/2566",
    credits: 3,
    students: 45,
    cloProgress: 75,
    description: "ศึกษาหลักการพื้นฐานของวิชาชีพการพยาบาล บทบาทหน้าที่ จริยธรรม กฎหมายที่เกี่ยวข้อง และทักษะการพยาบาลพื้นฐาน",
    instructor: "ผศ.ดร.สมศรี พยาบาลดี",
    schedule: "จันทร์ 09:00-12:00, พุธ 13:00-16:00",
    type: "วิชาบังคับ",
  },
  NUR201: {
    code: "NUR201",
    name: "การพยาบาลผู้ใหญ่ 1",
    semester: "2/2566",
    credits: 4,
    students: 42,
    cloProgress: 60,
    description: "ศึกษาแนวคิดและหลักการพยาบาลผู้ใหญ่ที่มีปัญหาสุขภาพ การประเมินภาวะสุขภาพ การวางแผนการพยาบาล",
    instructor: "รศ.ดร.วิภา สุขใจ",
    schedule: "อังคาร 09:00-12:00, พฤหัสบดี 09:00-12:00",
    type: "วิชาบังคับ",
  },
  NUR301: {
    code: "NUR301",
    name: "การพยาบาลเด็ก",
    semester: "2/2566",
    credits: 3,
    students: 38,
    cloProgress: 85,
    description: "ศึกษาการพยาบาลเด็กตั้งแต่แรกเกิดจนถึงวัยรุ่น ครอบคลุมพัฒนาการ การประเมินสุขภาพ และการดูแลเด็กป่วย",
    instructor: "ผศ.ดร.นิตยา รักเด็ก",
    schedule: "จันทร์ 13:00-16:00, ศุกร์ 09:00-12:00",
    type: "วิชาบังคับ",
  },
};

const cloData: Record<string, { code: string; description: string; bloomLevel: string; weight: number; progress: number }[]> = {
  NUR101: [
    { code: "CLO1", description: "อธิบายหลักการพื้นฐานของการพยาบาลได้", bloomLevel: "เข้าใจ", weight: 20, progress: 80 },
    { code: "CLO2", description: "สาธิตทักษะการพยาบาลพื้นฐานได้อย่างถูกต้อง", bloomLevel: "ประยุกต์ใช้", weight: 30, progress: 70 },
    { code: "CLO3", description: "วิเคราะห์สถานการณ์ปัญหาสุขภาพเบื้องต้นได้", bloomLevel: "วิเคราะห์", weight: 25, progress: 75 },
    { code: "CLO4", description: "แสดงจริยธรรมในการปฏิบัติการพยาบาลได้", bloomLevel: "ประเมินค่า", weight: 25, progress: 78 },
  ],
  NUR201: [
    { code: "CLO1", description: "ประเมินภาวะสุขภาพของผู้ใหญ่ได้", bloomLevel: "วิเคราะห์", weight: 30, progress: 55 },
    { code: "CLO2", description: "วางแผนการพยาบาลผู้ใหญ่ที่มีปัญหาสุขภาพได้", bloomLevel: "สร้างสรรค์", weight: 35, progress: 58 },
    { code: "CLO3", description: "ปฏิบัติการพยาบาลผู้ใหญ่ได้อย่างปลอดภัย", bloomLevel: "ประยุกต์ใช้", weight: 35, progress: 65 },
  ],
  NUR301: [
    { code: "CLO1", description: "อธิบายพัฒนาการเด็กแต่ละวัยได้", bloomLevel: "เข้าใจ", weight: 25, progress: 90 },
    { code: "CLO2", description: "ประเมินภาวะสุขภาพเด็กตามวัยได้", bloomLevel: "วิเคราะห์", weight: 35, progress: 82 },
    { code: "CLO3", description: "ปฏิบัติการพยาบาลเด็กป่วยได้อย่างเหมาะสม", bloomLevel: "ประยุกต์ใช้", weight: 40, progress: 84 },
  ],
};

const bloomColors: Record<string, string> = {
  "จำ": "bg-muted text-muted-foreground",
  "เข้าใจ": "bg-secondary text-secondary-foreground",
  "ประยุกต์ใช้": "bg-primary/10 text-primary",
  "วิเคราะห์": "bg-warning/10 text-warning",
  "ประเมินค่า": "bg-destructive/10 text-destructive",
  "สร้างสรรค์": "bg-success/10 text-success",
};

export default function CourseDetailPage({ courseCode, onBack, onManageCLO }: CourseDetailPageProps) {
  const code = courseCode || "NUR101";
  const course = courseData[code];
  const clos = cloData[code] || [];

  const handleBack = () => {
    if (onBack) onBack();
  };

  const handleManageCLO = () => {
    if (onManageCLO) onManageCLO(code);
  };

  if (!course) {
    return (
      <Dialog open={!!courseCode} onOpenChange={(open) => !open && handleBack()}>
        <DialogContent className="max-w-xl">
          <div className="text-center py-10">
            <p className="text-muted-foreground">ไม่พบข้อมูลรายวิชา</p>
            <Button variant="outline" className="mt-4" onClick={handleBack}>ปิด</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={!!courseCode} onOpenChange={(open) => !open && handleBack()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{course.name}</span>
            <Badge className="bg-primary text-primary-foreground">{course.code}</Badge>
          </DialogTitle>
          <p className="text-muted-foreground text-sm">{course.type} · ภาคเรียน {course.semester}</p>
        </DialogHeader>

        <div>
          {/* Header action */}
          <div className="flex justify-end mb-4">
            <Button onClick={handleManageCLO}>จัดการ CLO</Button>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2.5"><Layers className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">หน่วยกิต</p>
                <p className="text-xl font-bold text-foreground">{course.credits}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2.5"><Users className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">นักศึกษา</p>
                <p className="text-xl font-bold text-foreground">{course.students} คน</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2.5"><Target className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">จำนวน CLO</p>
                <p className="text-xl font-bold text-foreground">{clos.length}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2.5"><FileText className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">ความคืบหน้า CLO</p>
                <p className="text-xl font-bold text-foreground">{course.cloProgress}%</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="clo">ผลลัพธ์การเรียนรู้</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> คำอธิบายรายวิชา
            </h2>
            <p className="text-muted-foreground leading-relaxed">{course.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> อาจารย์ผู้สอน
              </h2>
              <p className="text-muted-foreground">{course.instructor}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> ตารางเรียน
              </h2>
              <p className="text-muted-foreground">{course.schedule}</p>
            </div>
          </div>

          {/* Overall CLO progress */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> ความคืบหน้า CLO โดยรวม
            </h2>
            <div className="flex items-center gap-4">
              <Progress value={course.cloProgress} className="h-3 flex-1" />
              <span className="text-lg font-bold text-foreground min-w-[3rem] text-right">{course.cloProgress}%</span>
            </div>
          </div>
        </TabsContent>

        {/* CLO Tab */}
        <TabsContent value="clo" className="space-y-3">
          {clos.map((clo) => (
            <div key={clo.code} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">{clo.code}</span>
                  <Badge variant="secondary" className={bloomColors[clo.bloomLevel] || ""}>
                    {clo.bloomLevel}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">น้ำหนัก {clo.weight}%</span>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{clo.description}</p>
              <div className="flex items-center gap-3">
                <Progress value={clo.progress} className="h-2 flex-1" />
                <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">{clo.progress}%</span>
              </div>
            </div>
          ))}
        </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
