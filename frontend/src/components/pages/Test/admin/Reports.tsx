import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Calendar, Users, GraduationCap, TrendingUp, DollarSign, BookOpen, Eye, Clock } from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  lastGenerated?: string;
}

const reportTemplates: ReportTemplate[] = [
  { id: "1", name: "รายงาน KPI นักศึกษา", description: "สรุปผลตัวชี้วัดนักศึกษาประจำปี", category: "KPI", icon: Users, lastGenerated: "2569-02-01" },
  { id: "2", name: "รายงาน KPI อาจารย์", description: "สรุปผลตัวชี้วัดอาจารย์ประจำปี", category: "KPI", icon: GraduationCap, lastGenerated: "2569-02-01" },
  { id: "3", name: "รายงานอัตราคงอยู่", description: "วิเคราะห์อัตราการคงอยู่และสาเหตุการออก", category: "วิเคราะห์", icon: TrendingUp, lastGenerated: "2569-01-28" },
  { id: "4", name: "รายงานการเงินประจำปี", description: "สรุปรายรับ-รายจ่ายและงบประมาณ", category: "การเงิน", icon: DollarSign, lastGenerated: "2569-01-15" },
  { id: "5", name: "รายงานผลการเรียน", description: "สรุปผลการเรียนรายวิชาทุกหลักสูตร", category: "การศึกษา", icon: BookOpen },
  { id: "6", name: "รายงาน PLO/YLO", description: "สรุปผลลัพธ์การเรียนรู้ระดับหลักสูตร", category: "การศึกษา", icon: FileText },
  { id: "7", name: "รายงานสรุปโครงการ", description: "สรุปผลการดำเนินโครงการทั้งหมด", category: "โครงการ", icon: FileText, lastGenerated: "2569-01-20" },
  { id: "8", name: "รายงานผู้ใช้งานระบบ", description: "สรุปสถิติการใช้งานระบบ", category: "ระบบ", icon: Users, lastGenerated: "2569-02-03" },
];

const categories = ["ทั้งหมด", "KPI", "การเงิน", "การศึกษา", "โครงการ", "วิเคราะห์", "ระบบ"];
const academicYears = ["2568", "2567", "2566", "2565"];

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [academicYear, setAcademicYear] = useState("2568");
  const { toast } = useToast();

  const filteredReports = reportTemplates.filter(
    (report) => selectedCategory === "ทั้งหมด" || report.category === selectedCategory
  );

  const handleGenerateReport = (report: ReportTemplate) => {
    toast({
      title: "กำลังสร้างรายงาน",
      description: `กำลังสร้าง ${report.name}...`,
    });

    setTimeout(() => {
      toast({
        title: "สร้างรายงานสำเร็จ",
        description: `${report.name} พร้อมดาวน์โหลดแล้ว`,
      });
    }, 2000);
  };

  const handlePreviewReport = (report: ReportTemplate) => {
    toast({
      title: "กำลังเปิดตัวอย่าง",
      description: `กำลังโหลด ${report.name}...`,
    });
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">รายงาน</h1>
            <p className="text-muted-foreground">สร้างและดาวน์โหลดรายงานสำหรับผู้บริหาร</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>ปี {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Report Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <report.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">{report.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{report.description}</CardDescription>
                
                {report.lastGenerated && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    สร้างล่าสุด: {report.lastGenerated}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handlePreviewReport(report)}
                  >
                    <Eye className="h-4 w-4" />
                    ดูตัวอย่าง
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleGenerateReport(report)}
                  >
                    <Download className="h-4 w-4" />
                    สร้างรายงาน
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">สถิติการสร้างรายงาน</CardTitle>
            <CardDescription>รายงานที่สร้างในเดือนนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-3xl font-bold text-primary">24</p>
                <p className="text-sm text-muted-foreground">รายงานทั้งหมด</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-3xl font-bold text-success">18</p>
                <p className="text-sm text-muted-foreground">ดาวน์โหลดแล้ว</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-3xl font-bold text-warning">4</p>
                <p className="text-sm text-muted-foreground">รอดำเนินการ</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-3xl font-bold text-destructive">2</p>
                <p className="text-sm text-muted-foreground">มีข้อผิดพลาด</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
