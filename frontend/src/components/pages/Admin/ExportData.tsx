import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Users, BookOpen, FolderKanban, GraduationCap, Library } from "lucide-react";
import api from "@/lib/axios";

type ExportField = { key: string; label: string };
type ExportFieldGroup = { label: string; fields: ExportField[] };

const exportCategories: {
  value: string;
  label: string;
  icon: typeof Users;
  groups: ExportFieldGroup[];
}[] = [
  {
    value: "students",
    label: "ข้อมูลนักศึกษา",
    icon: Users,
    groups: [
      {
        label: "ข้อมูลระบบและการศึกษา",
        fields: [
          { key: "student_id", label: "รหัสนักศึกษา" },
          { key: "year_level", label: "ชั้นปี" },
          { key: "status", label: "สถานะการศึกษา" },
          { key: "admission_year", label: "ปีที่เข้าศึกษา" },
          { key: "graduation_date", label: "วันที่สำเร็จการศึกษา" },
          { key: "dropout_date", label: "วันที่ออกจากการศึกษา" },
          { key: "dropout_reason", label: "เหตุผลที่ออกจากการศึกษา" },
          { key: "created_at", label: "วันที่สร้างข้อมูล" },
          { key: "updated_at", label: "วันที่แก้ไขข้อมูลล่าสุด" },
          { key: "last_eval_date", label: "วันที่ประเมินล่าสุด" },
        ],
      },
      {
        label: "ข้อมูลส่วนตัวและการติดต่อ",
        fields: [
          { key: "title", label: "คำนำหน้า" },
          { key: "first_name_th", label: "ชื่อภาษาไทย" },
          { key: "last_name_th", label: "นามสกุลภาษาไทย" },
          { key: "gender", label: "เพศ" },
          { key: "birth_date", label: "วันเดือนปีเกิด" },
          { key: "height", label: "ส่วนสูง" },
          { key: "weight", label: "น้ำหนัก" },
          { key: "bmi", label: "ดัชนีมวลกาย (BMI)" },
          { key: "email", label: "อีเมล" },
          { key: "phone", label: "เบอร์โทรศัพท์มือถือ" },
          { key: "home_phone", label: "เบอร์โทรศัพท์บ้าน" },
          { key: "home_address", label: "ที่อยู่ตามทะเบียนบ้าน" },
        ],
      },
      {
        label: "ข้อมูลครอบครัว",
        fields: [
          { key: "father_first_name", label: "ชื่อบิดา" },
          { key: "father_last_name", label: "นามสกุลบิดา" },
          { key: "father_age", label: "อายุบิดา" },
          { key: "father_phone", label: "เบอร์โทรศัพท์บิดา" },
          { key: "father_address", label: "ที่อยู่ปัจจุบันของบิดา" },
          { key: "mother_first_name", label: "ชื่อมารดา" },
          { key: "mother_last_name", label: "นามสกุลมารดา" },
          { key: "mother_age", label: "อายุมารดา" },
          { key: "mother_phone", label: "เบอร์โทรศัพท์มารดา" },
          { key: "mother_address", label: "ที่อยู่ปัจจุบันของมารดา" },
        ],
      },
      {
        label: "ข้อมูลการให้คำปรึกษา",
        fields: [
          { key: "advisor_status", label: "สถานะการให้คำปรึกษา" },
          { key: "advisor_status_details", label: "รายละเอียดสถานะการให้คำปรึกษา" },
          { key: "advisor_is_employed", label: "สถานะการมีงานทำ" },
        ],
      },
      {
        label: "ข้อมูลใบประกอบวิชาชีพ",
        fields: [
          { key: "license_first_attempt_passed", label: "ผ่านใบประกอบวิชาชีพครั้งแรก" },
          { key: "license_first_attempt_passed_at", label: "วันที่บันทึกการผ่านครั้งแรก" },
          { key: "license_first_attempt_evidence_path", label: "ที่อยู่ไฟล์หลักฐานการผ่านครั้งแรก" },
          { key: "license_first_attempt_evidence_name", label: "ชื่อไฟล์หลักฐานการผ่านครั้งแรก" },
          { key: "license_within_one_year_passed", label: "ผ่านใบประกอบวิชาชีพภายในหนึ่งปี" },
          { key: "license_within_one_year_passed_at", label: "วันที่บันทึกการผ่านภายในหนึ่งปี" },
          { key: "license_within_one_year_evidence_path", label: "ที่อยู่ไฟล์หลักฐานการผ่านภายในหนึ่งปี" },
          { key: "license_within_one_year_evidence_name", label: "ชื่อไฟล์หลักฐานการผ่านภายในหนึ่งปี" },
        ],
      },
    ],
  },
  {
    value: "teachers",
    label: "ข้อมูลอาจารย์",
    icon: GraduationCap,
    groups: [
      {
        label: "ข้อมูลระบบและการทำงาน",
        fields: [
          { key: "faculty_id", label: "รหัสอาจารย์" },
          { key: "status", label: "สถานะการทำงาน" },
          { key: "start_work_date", label: "วันที่เริ่มปฏิบัติงาน" },
          { key: "contract_date", label: "วันที่สัญญาจ้าง" },
          { key: "academic_position_date", label: "วันที่รับตำแหน่งทางวิชาการ" },
          { key: "pts_date", label: "วันที่รับตำแหน่ง พตส" },
          { key: "created_at", label: "วันที่สร้างข้อมูล" },
        ],
      },
      {
        label: "ข้อมูลส่วนตัวและการติดต่อ",
        fields: [
          { key: "title", label: "คำนำหน้า" },
          { key: "first_name_th", label: "ชื่อภาษาไทย" },
          { key: "last_name_th", label: "นามสกุลภาษาไทย" },
          { key: "gender", label: "เพศ" },
          { key: "birth_date", label: "วันเดือนปีเกิด" },
          { key: "email", label: "อีเมล" },
          { key: "phone", label: "เบอร์โทรศัพท์" },
          { key: "current_address", label: "ที่อยู่ปัจจุบัน" },
        ],
      },
      {
        label: "ข้อมูลใบอนุญาตและเอกสาร",
        fields: [
          { key: "nursing_council_no", label: "เลขใบประกอบวิชาชีพ" },
          { key: "license_expiry", label: "วันหมดอายุใบอนุญาต" },
          { key: "nursing_council_file", label: "ไฟล์บัตรสภาการพยาบาล" },
          { key: "license_file", label: "ไฟล์ใบอนุญาตประกอบวิชาชีพ" },
          { key: "teaching_cert_file", label: "ไฟล์ใบประกอบวิชาชีพครู" },
          { key: "license_image", label: "รูปใบประกอบวิชาชีพ" },
        ],
      },
    ],
  },
  {
    value: "courses",
    label: "ข้อมูลรายวิชา",
    icon: BookOpen,
    groups: [
      {
        label: "ข้อมูลรายวิชา",
        fields: [
          { key: "subject_code", label: "รหัสวิชา" },
          { key: "subject_name_th", label: "ชื่อวิชา (ไทย)" },
          { key: "subject_name_en", label: "ชื่อวิชา (อังกฤษ)" },
          { key: "credit", label: "จำนวนหน่วยกิต" },
          { key: "credit_desc", label: "รายละเอียดหน่วยกิต" },
          { key: "subject_type", label: "ประเภทวิชา" },
          { key: "semester", label: "ภาคเรียน" },
          { key: "academic_year", label: "ปีการศึกษา" },
        ],
      },
    ],
  },
  {
    value: "projects",
    label: "ข้อมูลโครงการ",
    icon: FolderKanban,
    groups: [
      {
        label: "ข้อมูลโครงการ",
        fields: [
          { key: "project_id", label: "รหัสโครงการ" },
          { key: "project_name_th", label: "ชื่อโครงการ" },
          { key: "project_type", label: "ประเภทโครงการ" },
          { key: "responsible_faculty_id", label: "ผู้ดำเนินโครงการ" },
          { key: "academic_year", label: "ปีการศึกษา" },
          { key: "status", label: "สถานะโครงการ" },
          { key: "start_date", label: "วันที่เริ่มต้น" },
          { key: "end_date", label: "วันที่สิ้นสุด" },
          { key: "strategy", label: "ยุทธศาสตร์" },
        ],
      },
      {
        label: "ข้อมูลการเชื่อมโยง",
        fields: [
          { key: "member_faculty_ids", label: "ผู้เข้าร่วมโครงการ" },
          { key: "plo_codes", label: "รหัส PLO" },
          { key: "clo_codes", label: "รหัส CLO" },
        ],
      },
      {
        label: "ข้อมูลระบบ",
        fields: [
          { key: "created_at", label: "วันที่สร้างข้อมูล" },
          { key: "updated_at", label: "วันที่แก้ไขข้อมูลล่าสุด" },
        ],
      },
    ],
  },
];

interface ActiveCurriculum {
  start_year: number;
  end_year: number;
  label: string;
}

export default function ExportData() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  // undefined = กำลังโหลด, null = ยังไม่มีหลักสูตรในระบบ
  const [activeCurriculum, setActiveCurriculum] = useState<ActiveCurriculum | null | undefined>(undefined);
  const { toast } = useToast();

  const currentCategory = exportCategories.find((c) => c.value === selectedCategory);
  const currentFields = currentCategory?.groups.flatMap((group) => group.fields) ?? [];

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
      if (selectedFields.length === currentFields.length) {
        setSelectedFields([]);
      } else {
        setSelectedFields(currentFields.map((field) => field.key));
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
        format: "xlsx",
      }, {
        responseType: 'blob' // 👈 สำคัญมาก! บอกให้ axios รับข้อมูลเป็นไฟล์
      });

      // สร้าง Link จำลองเพื่อบังคับให้เบราว์เซอร์ดาวน์โหลดไฟล์
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const suffix = selectedCategory === "courses" && activeCurriculum
        ? `_${activeCurriculum.start_year}-${activeCurriculum.end_year}`
        : "";
      link.setAttribute('download', `${currentCategory?.label}${suffix}.xlsx`);
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
            <p className="app-page-description">เลือกข้อมูลที่ต้องการส่งออกทั้งหมดเป็นไฟล์ Excel</p>
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
          </div>

          {/* Field Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="app-section-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">เลือกฟิลด์ที่ต้องการส่งออก</CardTitle>
                    <CardDescription>
                      {currentCategory ? `${selectedFields.length}/${currentFields.length} ฟิลด์` : "เลือกประเภทข้อมูลก่อน"}
                    </CardDescription>
                  </div>
                  {currentCategory && (
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedFields.length === currentFields.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {currentCategory ? (
                  <div className="space-y-6">
                    {currentCategory.groups.map((group) => (
                      <section key={group.label} className="space-y-3">
                        <h3 className="border-b pb-2 text-sm font-semibold text-foreground">{group.label}</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {group.fields.map((field) => {
                            const inputId = `${selectedCategory}-${field.key}`;
                            return (
                              <div key={field.key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={inputId}
                                  checked={selectedFields.includes(field.key)}
                                  onCheckedChange={() => handleFieldToggle(field.key)}
                                />
                                <Label htmlFor={inputId} className="cursor-pointer">{field.label}</Label>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">เลือกประเภทข้อมูลจากด้านซ้าย</p>
                )}
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
