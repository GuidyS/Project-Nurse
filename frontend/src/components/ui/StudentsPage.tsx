import { useState } from 'react';
import { User, MapPin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface StudentInfo {
  id: string;
  name: string;
  practicePlace: string;
  status: string;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  phone: string;
  email: string;
  advisor: string;
  startDate: string;
  endDate: string;
}

interface CLOAssessment {
  code: string;
  description: string;
  bloomLevel: string;
  score: number;
  maxScore: number;
}

interface ActivityLog {
  date: string;
  type: string;
  activity: string;
}

const statusColors: Record<string, string> = {
  'ผ่าน': 'bg-green-100 text-green-700',
  'ไม่ผ่าน': 'bg-red-100 text-red-700',
  'กำลังดำเนิน': 'bg-blue-100 text-blue-700',
};

const bloomColors: Record<string, string> = {
  'เข้าใจ': 'bg-secondary text-secondary-foreground',
  'ประยุกต์ใช้': 'bg-primary/10 text-primary',
  'วิเคราะห์': 'bg-amber-100 text-amber-700',
  'ประเมินค่า': 'bg-red-100 text-red-700',
  'สร้างสรรค์': 'bg-green-100 text-green-700',
};

const activityColors: Record<string, string> = {
  'รายงาน': 'bg-blue-100 text-blue-700',
  'ประเมิน': 'bg-green-100 text-green-700',
  'อัปโหลด': 'bg-purple-100 text-purple-700',
  'ตรวจสอบ': 'bg-yellow-100 text-yellow-700',
};

interface StudentsPageProps {
  student?: StudentInfo | null;
  onBack?: () => void;
}

export default function StudentsPage({ student: detailStudent = null, onBack }: StudentsPageProps) {
  const [, setDetailStudent] = useState<StudentInfo | null>(detailStudent || null);

  if (!detailStudent) return null;

  const mockCLOAssessments: CLOAssessment[] = [
    { code: 'CLO1', description: 'อธิบายหลักการพื้นฐานของการพยาบาล', bloomLevel: 'เข้าใจ', score: 4, maxScore: 5 },
    { code: 'CLO2', description: 'ปฏิบัติทักษะพยาบาล', bloomLevel: 'ประยุกต์ใช้', score: 3, maxScore: 5 },
    { code: 'CLO3', description: 'วิเคราะห์สถานการณ์', bloomLevel: 'วิเคราะห์', score: 4, maxScore: 5 },
    { code: 'CLO4', description: 'แสดงจริยธรรม', bloomLevel: 'ประเมินค่า', score: 5, maxScore: 5 },
  ];

  const mockActivityLog: ActivityLog[] = [
    { date: '28 กพ. 2567', type: 'ประเมิน', activity: 'ประเมิน CLO ครั้งที่ 1' },
    { date: '25 กพ. 2567', type: 'อัปโหลด', activity: 'อัปโหลดหลักฐาน' },
    { date: '20 กพ. 2567', type: 'รายงาน', activity: 'ส่งรายงานประจำเดือน' },
  ];

  const cloAssessments = mockCLOAssessments;
  const cloAvg = Math.round(
    (cloAssessments.reduce((sum, c) => sum + (c.score / c.maxScore) * 100, 0) / cloAssessments.length) || 0
  );
  const activityLog = mockActivityLog;

  const handleOpen = (open: boolean) => {
    if (!open && onBack) onBack();
  };

  return (
    <Dialog open={!!detailStudent} onOpenChange={handleOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        {detailStudent && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {detailStudent.name}
                <Badge variant="secondary" className={statusColors[detailStudent.status]}>
                  {detailStudent.status}
                </Badge>
              </DialogTitle>
              <p className="text-muted-foreground text-sm">
                รหัส {detailStudent.id} · {detailStudent.practicePlace}
              </p>
            </DialogHeader>

        {/* Stats Summary Area */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <div className="text-center bg-muted rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground">ความพึงพอใจ</p>
            <p className="text-xl font-bold text-foreground">{detailStudent.progress}%</p>
          </div>
          <div className="text-center bg-muted rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground">จำนวนวัน</p>
            <p className="text-xl font-bold text-foreground">
              {detailStudent.tasksCompleted}/{detailStudent.totalTasks}
            </p>
          </div>
          <div className="text-center bg-muted rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground">CLO เสร็จ</p>
            <p className="text-xl font-bold text-foreground">{cloAvg}%</p>
          </div>
          <div className="text-center bg-muted rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground">CLO ทั้งหมด</p>
            <p className="text-xl font-bold text-foreground">{cloAssessments.length}</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-4 space-y-4">
          <TabsList>
            <TabsTrigger value="overview">ข้อมูลทั่วไป</TabsTrigger>
            <TabsTrigger value="clo">ผลประเมิน CLO</TabsTrigger>
            <TabsTrigger value="activity">ประวัติกิจกรรม</TabsTrigger>
          </TabsList>

          {/* ข้อมูลทั่วไป */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" /> ข้อมูลนักศึกษา
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ชื่อ-นามสกุล</span>
                    <span className="text-foreground font-medium">{detailStudent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">รหัส</span>
                    <span className="text-foreground font-medium">{detailStudent.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">โทรศัพท์</span>
                    <span className="text-foreground font-medium">{detailStudent.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">อีเมล</span>
                    <span className="text-foreground font-medium">{detailStudent.email}</span>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" /> ข้อมูลสถานที่ปฏิบัติ
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">สถานที่ฝึก</span>
                    <span className="text-foreground font-medium">{detailStudent.practicePlace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">อาจารย์นิเทศ</span>
                    <span className="text-foreground font-medium">{detailStudent.advisor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">วันเริ่มเก็บ</span>
                    <span className="text-foreground font-medium">{detailStudent.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">วันสิ้นสุด</span>
                    <span className="text-foreground font-medium">{detailStudent.endDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ผลประเมิน CLO */}
          <TabsContent value="clo" className="space-y-3">
            {cloAssessments.map((clo) => (
              <div key={clo.code} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{clo.code}</span>
                    <Badge variant="secondary" className={bloomColors[clo.bloomLevel] || ""}>
                      {clo.bloomLevel}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {clo.score}/{clo.maxScore}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{clo.description}</p>
                <div className="flex items-center gap-3">
                  <Progress value={(clo.score / clo.maxScore) * 100} className="h-2 flex-1" />
                  <span className="text-sm font-semibold text-foreground">
                    {Math.round((clo.score / clo.maxScore) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ประวัติกิจกรรม */}
          <TabsContent value="activity">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" /> ประวัติกิจกรรม
              </h3>
              <div className="space-y-2">
                {activityLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="text-xs text-muted-foreground min-w-[5rem] pt-0.5">{log.date}</div>
                    <Badge variant="secondary" className={`${activityColors[log.type] || ""} text-xs`}>
                      {log.type}
                    </Badge>
                    <p className="text-sm text-foreground">{log.activity}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }