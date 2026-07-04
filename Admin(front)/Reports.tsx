import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Calendar, Users, GraduationCap, TrendingUp, DollarSign, BookOpen, Clock, PieChart } from "lucide-react";
import api from "@/lib/axios";

interface ApiTemplateResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  lastGenerated?: string;
}

interface ReportTemplate extends ApiTemplateResponse {
  icon: React.ComponentType<{ className?: string }>;
}

const categories = ["ทั้งหมด", "KPI", "การเงิน/งบประมาณ", "โครงการ/ยุทธศาสตร์", "การศึกษา"];
const academicYears = ["2568", "2567", "2566", "2565"];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, GraduationCap, TrendingUp, DollarSign, BookOpen, FileText, PieChart
};

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [academicYear, setAcademicYear] = useState("2568");
  const [dynamicTemplates, setDynamicTemplates] = useState<ReportTemplate[]>([]);
  const [stats, setStats] = useState({ total: 0, downloaded: 0, pending: 0, errors: 0 });
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const response = await api.get("/components/Admin/admin_reports.php?action=get_templates");
      if (response.data.status === "success") {
        const mappedTemplates = response.data.data.templates.map((tpl: ApiTemplateResponse) => ({
          ...tpl,
          icon: iconMap[tpl.iconName] || FileText
        }));
        setDynamicTemplates(mappedTemplates);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
      toast({ title: "โหลดข้อมูลล้มเหลว", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredReports = dynamicTemplates.filter(
    (report) => selectedCategory === "ทั้งหมด" || report.category === selectedCategory
  );

  const handleGenerateReport = async (report: ReportTemplate) => {
    toast({ title: "กำลังสร้างรายงาน", description: `ระบบกำลังดึงข้อมูล ${report.name} (ปี ${academicYear})...` });

    try {
      const isFileDownload = report.name.includes('ยุทธศาสตร์') || report.name.includes('ภาพรวมผลการเรียน');

      const response = await api.post("/components/Admin/admin_reports.php?action=generate", {
        reportName: report.name,
        academicYear: academicYear
      }, {
        responseType: isFileDownload ? 'blob' : 'json' 
      });

      if (isFileDownload) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Report_${academicYear}_${report.name}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast({ title: "สร้างรายงานสำเร็จ", description: `ดาวน์โหลด ${report.name} เรียบร้อยแล้ว` });
      } else {
        toast({ title: "แจ้งเตือน", description: response.data.message || "ประมวลผลสำเร็จ" });
      }

      fetchTemplates(); 
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถสร้างรายงานได้", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">รายงานผู้บริหาร</h1>
          <p className="text-muted-foreground">สร้างและดาวน์โหลดรายงานสรุปแผนและสถิติต่างๆ</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className="w-32"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (<SelectItem key={year} value={year}>ปี {year}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category)}>
            {category}
          </Button>
        ))}
      </div>

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
                    <CardTitle className="text-base leading-tight">{report.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">{report.category}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>{report.description}</CardDescription>
              {report.lastGenerated && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> อัปเดตล่าสุด: {report.lastGenerated}
                </div>
              )}
              <Button size="sm" className="w-full gap-2" onClick={() => handleGenerateReport(report)}>
                <Download className="h-4 w-4" /> สกัดข้อมูลเป็นไฟล์ Excel
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">สถิติภาพรวมจากฐานข้อมูล</CardTitle>
          <CardDescription>ข้อมูลอัปเดตแบบ Real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">โครงการทั้งหมด</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-3xl font-bold text-success">{stats.downloaded}</p>
              <p className="text-sm text-muted-foreground">งบประมาณรวม (บาท)</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-3xl font-bold text-warning">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">รอดำเนินการ</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-3xl font-bold text-destructive">{stats.errors}</p>
              <p className="text-sm text-muted-foreground">ข้อผิดพลาด</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}