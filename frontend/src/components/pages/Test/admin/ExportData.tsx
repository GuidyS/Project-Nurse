import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, FileText, Users, BookOpen, FolderKanban, GraduationCap, Calendar } from "lucide-react";

const exportCategories = [
  { 
    value: "students", 
    label: "ข้อมูลนักศึกษา", 
    icon: Users,
    fields: ["รหัสนักศึกษา", "ชื่อ-นามสกุล", "คณะ", "สาขา", "ชั้นปี", "GPA", "สถานะ", "อาจารย์ที่ปรึกษา"]
  },
  { 
    value: "teachers", 
    label: "ข้อมูลอาจารย์", 
    icon: GraduationCap,
    fields: ["รหัสอาจารย์", "ชื่อ-นามสกุล", "ตำแหน่งวิชาการ", "สาขา", "อีเมล", "เบอร์โทร", "ตำแหน่งบริหาร"]
  },
  { 
    value: "courses", 
    label: "ข้อมูลรายวิชา", 
    icon: BookOpen,
    fields: ["รหัสวิชา", "ชื่อวิชา", "หน่วยกิต", "ผู้สอน", "หลักสูตร", "จำนวนนักศึกษา", "CLO"]
  },
  { 
    value: "projects", 
    label: "ข้อมูลโครงการ", 
    icon: FolderKanban,
    fields: ["รหัสโครงการ", "ชื่อโครงการ", "ผู้รับผิดชอบ", "งบประมาณ", "สถานะ", "PLO/YLO"]
  },
];

const academicYears = ["2568", "2567", "2566", "2565", "2564"];
const semesters = ["ทั้งหมด", "ภาคเรียนที่ 1", "ภาคเรียนที่ 2", "ภาคฤดูร้อน"];

export default function ExportData() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [format, setFormat] = useState("xlsx");
  const [academicYear, setAcademicYear] = useState("2568");
  const [semester, setSemester] = useState("ทั้งหมด");
  const { toast } = useToast();

  const currentCategory = exportCategories.find((c) => c.value === selectedCategory);

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    if (currentCategory) {
      if (selectedFields.length === currentCategory.fields.length) {
        setSelectedFields([]);
      } else {
        setSelectedFields([...currentCategory.fields]);
      }
    }
  };

  const handleExport = () => {
    if (!selectedCategory) {
      toast({ title: "กรุณาเลือกประเภทข้อมูล", variant: "destructive" });
      return;
    }
    if (selectedFields.length === 0) {
      toast({ title: "กรุณาเลือกฟิลด์ที่ต้องการส่งออก", variant: "destructive" });
      return;
    }

    toast({
      title: "กำลังส่งออกข้อมูล",
      description: `กำลังสร้างไฟล์ ${currentCategory?.label}.${format}...`,
    });

    setTimeout(() => {
      toast({
        title: "ส่งออกสำเร็จ",
        description: `ดาวน์โหลด ${currentCategory?.label}.${format} เรียบร้อยแล้ว`,
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ส่งออกข้อมูล</h1>
          <p className="text-muted-foreground">เลือกข้อมูลที่ต้องการส่งออกเป็นไฟล์ Excel หรือ CSV</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Category Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">เลือกประเภทข้อมูล</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {exportCategories.map((category) => (
                  <div
                    key={category.value}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCategory === category.value
                        ? "bg-primary/10 border border-primary"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setSelectedFields([]);
                    }}
                  >
                    <category.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{category.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ตัวกรอง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> ปีการศึกษา
                  </Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ภาคเรียน</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Field Selection & Format */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">เลือกฟิลด์ที่ต้องการส่งออก</CardTitle>
                    <CardDescription>
                      {currentCategory ? `${selectedFields.length}/${currentCategory.fields.length} ฟิลด์` : "เลือกประเภทข้อมูลก่อน"}
                    </CardDescription>
                  </div>
                  {currentCategory && (
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedFields.length === currentCategory.fields.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {currentCategory ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {currentCategory.fields.map((field) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Checkbox
                          id={field}
                          checked={selectedFields.includes(field)}
                          onCheckedChange={() => handleFieldToggle(field)}
                        />
                        <Label htmlFor={field} className="cursor-pointer">{field}</Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">เลือกประเภทข้อมูลจากด้านซ้าย</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">รูปแบบไฟล์</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="xlsx" id="xlsx" />
                    <Label htmlFor="xlsx" className="flex items-center gap-2 cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" /> CSV (.csv)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Button onClick={handleExport} className="w-full gap-2" size="lg">
              <Download className="h-4 w-4" />
              ส่งออกข้อมูล
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
