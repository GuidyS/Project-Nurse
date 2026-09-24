import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, FileText, Users, BookOpen, FolderKanban, GraduationCap, Calendar, Library } from "lucide-react";
import api from "@/lib/axios";

type ExportField = { key: string; label: string };

const exportCategories: {
  value: string;
  label: string;
  icon: typeof Users;
  fields: ExportField[];
}[] = [
  {
    value: "students",
    label: "ข้อมูลนักศึกษา",
    icon: Users,
    fields: [
      { key: "student_id", label: "รหัสนักศึกษา" },
      { key: "full_name_th", label: "ชื่อ-นามสกุล" },
      { key: "gender", label: "เพศ" },
      { key: "year_level", label: "ชั้นปี" },
      { key: "gpa", label: "GPA" },
      { key: "status", label: "สถานะ" },
      { key: "email", label: "อีเมล" },
      { key: "phone", label: "เบอร์โทร" },
      { key: "admission_year", label: "ปีที่เข้าศึกษา" },
    ],
  },
  {
    value: "teachers",
    label: "ข้อมูลอาจารย์",
    icon: GraduationCap,
    fields: [
      { key: "faculty_id", label: "รหัสอาจารย์" },
      { key: "full_name_th", label: "ชื่อ-นามสกุล" },
      { key: "gender", label: "เพศ" },
      { key: "email", label: "อีเมล" },
      { key: "phone", label: "เบอร์โทร" },
      { key: "current_address", label: "ที่อยู่ปัจจุบัน" },
      { key: "nursing_council_no", label: "เลขใบประกอบวิชาชีพ" },
      { key: "license_expiry", label: "วันหมดอายุใบอนุญาต" },
      { key: "status", label: "สถานะ" },
    ],
  },
  {
    value: "courses",
    label: "ข้อมูลรายวิชา",
    icon: BookOpen,
    // ฟิลด์ตรงกับหน้า "จัดการหลักสูตรรอบ 5 ปี" — ส่งออกรายวิชาของหลักสูตรที่ใช้งานในระบบ
    fields: [
      { key: "subject_code", label: "รหัสวิชา" },
      { key: "subject_name_th", label: "ชื่อวิชา (ไทย)" },
      { key: "subject_name_en", label: "ชื่อวิชา (อังกฤษ)" },
      { key: "credit", label: "หน่วยกิต" },
      { key: "subject_type", label: "ประเภทวิชา" },
    ],
  },
  {
    value: "projects",
    label: "ข้อมูลโครงการ",
    icon: FolderKanban,
    fields: [
      { key: "project_id", label: "รหัสโครงการ" },
      { key: "project_name_th", label: "ชื่อโครงการ (ไทย)" },
      { key: "project_name_en", label: "ชื่อโครงการ (อังกฤษ)" },
      { key: "description", label: "รายละเอียด" },
      { key: "responsible_faculty_id", label: "อาจารย์ผู้รับผิดชอบ" },
      { key: "academic_year", label: "ปีการศึกษา" },
    ],
  },
];

// ปีการศึกษาปัจจุบัน (พ.ศ.) — ปีการศึกษาเริ่มเดือนมิถุนายน ช่วง ม.ค.–พ.ค. ยังนับเป็นปีการศึกษาก่อนหน้า
const getCurrentAcademicYear = (now = new Date()) =>
  now.getFullYear() + 543 - (now.getMonth() < 5 ? 1 : 0);

// ปีการศึกษาปัจจุบันย้อนหลังรวม 5 ปี (เช่น 2569 → 2569–2565) เลื่อนตามปีจริงโดยไม่ต้องแก้โค้ด
const currentAcademicYear = getCurrentAcademicYear();
const academicYears = Array.from({ length: 5 }, (_, i) => String(currentAcademicYear - i));
const semesters = ["ทั้งหมด", "ภาคเรียนที่ 1", "ภาคเรียนที่ 2", "ภาคฤดูร้อน"];

// อาจารย์ / รายวิชา ส่งออกทั้งหมด ไม่มีตัวกรองปีการศึกษา/ภาคเรียน
const categoriesWithoutFilters = ["teachers", "courses"];

interface ActiveCurriculum {
  start_year: number;
  end_year: number;
  label: string;
}

export default function ExportData() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [format, setFormat] = useState("xlsx");
  const [academicYear, setAcademicYear] = useState(academicYears[0]);
  const [semester, setSemester] = useState("ทั้งหมด");
  // undefined = กำลังโหลด, null = ยังไม่มีหลักสูตรในระบบ
  const [activeCurriculum, setActiveCurriculum] = useState<ActiveCurriculum | null | undefined>(undefined);
  const { toast } = useToast();

  const currentCategory = exportCategories.find((c) => c.value === selectedCategory);
  const showFilters = !categoriesWithoutFilters.includes(selectedCategory);

  // รายวิชาส่งออกตามหลักสูตรที่ใช้งาน (ตั้งค่าที่หน้า "จัดการหลักสูตรรอบ 5 ปี")
  useEffect(() => {
    if (selectedCategory !== "courses") return;
    let cancelled = false;
    api.get("/index.php?page=get-curriculum-cycles")
      .then((res) => {
        if (!cancelled) setActiveCurriculum(res.data?.data?.active_cycle ?? null);
      })
      .catch(() => {
        if (!cancelled) setActiveCurriculum(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

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
        setSelectedFields(currentCategory.fields.map((f) => f.key));
      }
    }
  };

  const handleExport = async () => {
    if (!selectedCategory) {
      toast({ title: "กรุณาเลือกประเภทข้อมูล", variant: "destructive" });
      return;
    }
    if (selectedFields.length === 0) {
      toast({ title: "กรุณาเลือกฟิลด์ที่ต้องการส่งออก", variant: "destructive" });
      return;
    }

    toast({
      title: "กำลังเตรียมข้อมูล",
      description: "ระบบกำลังสร้างไฟล์ กรุณารอสักครู่...",
    });

    try {
      // ยิง API ไปสร้างไฟล์ (ส่งแบบ blob เพื่อรับไฟล์กลับมาดาวน์โหลด)
      const response = await api.post("/index.php?page=export-data", {
        category: selectedCategory,
        fields: selectedFields,
        format: format,
        academicYear: showFilters ? academicYear : "",
        semester: showFilters ? semester : ""
      }, {
        responseType: 'blob' // 👈 สำคัญมาก! บอกให้ axios รับข้อมูลเป็นไฟล์
      });

      // สร้าง Link จำลองเพื่อบังคับให้เบราว์เซอร์ดาวน์โหลดไฟล์
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // ตั้งชื่อไฟล์ เช่น ข้อมูลนักศึกษา_2568.csv, ข้อมูลรายวิชา_2572-2577.xlsx, ข้อมูลอาจารย์.xlsx
      const suffix = showFilters
        ? `_${academicYear}`
        : selectedCategory === "courses" && activeCurriculum
          ? `_${activeCurriculum.start_year}-${activeCurriculum.end_year}`
          : "";
      link.setAttribute('download', `${currentCategory?.label}${suffix}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "ส่งออกสำเร็จ",
        description: `ดาวน์โหลดไฟล์เรียบร้อยแล้ว`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออกข้อมูลได้",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="app-page">
        <div className="app-page-header">
          <div>
            <h1 className="app-page-title">ส่งออกข้อมูล</h1>
            <p className="app-page-description">เลือกข้อมูลที่ต้องการส่งออกเป็นไฟล์ Excel หรือ CSV</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Category Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="app-section-card">
              <CardHeader>
                <CardTitle className="text-base">เลือกประเภทข้อมูล</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {exportCategories.map((category) => (
                  <div
                    key={category.value}
                    className={`app-interactive-card flex cursor-pointer items-center gap-3 p-3 ${
                      selectedCategory === category.value
                        ? "bg-primary/10 border border-primary"
                        : "bg-muted/30"
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

            {/* ข้อมูลรายวิชามาจากหลักสูตรที่ใช้งาน */}
            {selectedCategory === "courses" && (
              <Card className="app-section-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Library className="h-4 w-4 text-primary" /> หลักสูตรที่ส่งออก
                  </CardTitle>
                  <CardDescription>
                    {activeCurriculum === undefined
                      ? "กำลังโหลด..."
                      : activeCurriculum
                        ? `รายวิชาทั้งหมดของหลักสูตร ${activeCurriculum.label} (หลักสูตรที่ใช้งานในระบบ เปลี่ยนได้ที่หน้า "จัดการหลักสูตรรอบ 5 ปี")`
                        : 'ยังไม่มีหลักสูตรในระบบ — จะส่งออกรายวิชาทั้งหมดจากฐานข้อมูลรายวิชาแทน'}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Filters (อาจารย์ / รายวิชา ส่งออกทั้งหมด ไม่มีตัวกรอง) */}
            {showFilters && (
            <Card className="app-section-card">
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
            )}
          </div>

          {/* Field Selection & Format */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="app-section-card">
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
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={selectedFields.includes(field.key)}
                          onCheckedChange={() => handleFieldToggle(field.key)}
                        />
                        <Label htmlFor={field.key} className="cursor-pointer">{field.label}</Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">เลือกประเภทข้อมูลจากด้านซ้าย</p>
                )}
              </CardContent>
            </Card>

            <Card className="app-section-card">
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
    </>
  );
}