import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  ClipboardList,
  Award,
  Loader2,
  Users,
  UserCheck,
  Stethoscope,
  Mail,
  Upload,
  Trash2,
  ExternalLink,
  FileCheck,
} from "lucide-react";
import api from "@/lib/axios";
import { calculateAcademicInfo } from "@/components/pages/ProfilePage";

interface StudentProfile {
  student_code: string;
  student_name: string;
  faculty: string;
  major: string;
  current_year: string;
  advisor_name?: string | null;
  advisor_email?: string | null;
  practical_advisor_name?: string | null;
  practical_advisor_email?: string | null;
}

interface RegistrationRecord {
  id: number;
  academic_year: string;
  semester: string;
  course_count: number;
  file_path: string;
  uploaded_at: string;
}

interface TermGradeRecord {
  id: number;
  academic_year: string;
  semester: string;
  gpa?: number | string | null;
  file_path: string;
  uploaded_at: string;
}

const Transcript = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // States เก็บข้อมูลโปรไฟล์และการลงทะเบียน/เกรด
  const [studentInfo, setStudentInfo] = useState<StudentProfile | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [termGrades, setTermGrades] = useState<TermGradeRecord[]>([]);

  // States สำหรับฟอร์มอัปโหลดใบลงทะเบียน
  const [regYear, setRegYear] = useState<string>(new Date().getFullYear() + 543 + "");
  const [regSemester, setRegSemester] = useState<string>("1");
  const [regCourseCount, setRegCourseCount] = useState<string>("6");
  const [regFile, setRegFile] = useState<File | null>(null);
  const [isUploadingReg, setIsUploadingReg] = useState(false);

  // States สำหรับฟอร์มอัปโหลดใบเกรด
  const [gradeYear, setGradeYear] = useState<string>(new Date().getFullYear() + 543 + "");
  const [gradeSemester, setGradeSemester] = useState<string>("1");
  const [gradeGpa, setGradeGpa] = useState<string>("");
  const [gradeFile, setGradeFile] = useState<File | null>(null);
  const [isUploadingGrade, setIsUploadingGrade] = useState(false);

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/index.php?page=transcript-api");
      if (response.data.status === "success") {
        const { profile, registrations: regList, term_grades: gradeList } = response.data.data;
        setStudentInfo(profile || null);
        setRegistrations(regList || []);
        setTermGrades(gradeList || []);
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error.response?.data?.message || "ไม่สามารถโหลดข้อมูลนักศึกษาได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ฟังก์ชันอัปโหลดใบลงทะเบียนเรียน
  const handleUploadRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regYear || !regSemester || !regFile) {
      toast({ title: "กรุณากรอกข้อมูลและเลือกไฟล์ใบลงทะเบียน", variant: "destructive" });
      return;
    }
    try {
      setIsUploadingReg(true);
      const formData = new FormData();
      formData.append("action", "upload-registration");
      formData.append("academic_year", regYear);
      formData.append("semester", regSemester);
      formData.append("course_count", regCourseCount || "1");
      formData.append("file", regFile);

      const res = await api.post("/index.php?page=transcript-api", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === "success") {
        toast({ title: "สำเร็จ", description: "อัปโหลดใบลงทะเบียนเรียนเรียบร้อยแล้ว" });
        setRegFile(null);
        // Reset file input
        const fileInput = document.getElementById("reg-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchData();
      } else {
        toast({ title: "ผิดพลาด", description: res.data.message || "ไม่สามารถอัปโหลดได้", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "ผิดพลาด", description: err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลด", variant: "destructive" });
    } finally {
      setIsUploadingReg(false);
    }
  };

  // ฟังก์ชันลบใบลงทะเบียนเรียน
  const handleDeleteRegistration = async (id: number) => {
    if (!confirm("คุณต้องการลบใบลงทะเบียนเรียนนี้ใช่หรือไม่?")) return;
    try {
      const formData = new FormData();
      formData.append("action", "delete-registration");
      formData.append("id", String(id));

      const res = await api.post("/index.php?page=transcript-api", formData);
      if (res.data.status === "success") {
        toast({ title: "สำเร็จ", description: "ลบใบลงทะเบียนเรียนเรียบร้อยแล้ว" });
        fetchData();
      }
    } catch (err: any) {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบรายการได้", variant: "destructive" });
    }
  };

  // ฟังก์ชันอัปโหลดใบเกรดแต่ละเทอม
  const handleUploadTermGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeYear || !gradeSemester || !gradeFile) {
      toast({ title: "กรุณากรอกข้อมูลและเลือกไฟล์ใบเกรด", variant: "destructive" });
      return;
    }
    try {
      setIsUploadingGrade(true);
      const formData = new FormData();
      formData.append("action", "upload-term-grade");
      formData.append("academic_year", gradeYear);
      formData.append("semester", gradeSemester);
      if (gradeGpa) formData.append("gpa", gradeGpa);
      formData.append("file", gradeFile);

      const res = await api.post("/index.php?page=transcript-api", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === "success") {
        toast({ title: "สำเร็จ", description: "อัปโหลดใบเกรดเรียบร้อยแล้ว" });
        setGradeFile(null);
        setGradeGpa("");
        const fileInput = document.getElementById("grade-file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchData();
      } else {
        toast({ title: "ผิดพลาด", description: res.data.message || "ไม่สามารถอัปโหลดได้", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "ผิดพลาด", description: err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลด", variant: "destructive" });
    } finally {
      setIsUploadingGrade(false);
    }
  };

  // ฟังก์ชันลบใบเกรด
  const handleDeleteTermGrade = async (id: number) => {
    if (!confirm("คุณต้องการลบใบเกรดนี้ใช่หรือไม่?")) return;
    try {
      const formData = new FormData();
      formData.append("action", "delete-term-grade");
      formData.append("id", String(id));

      const res = await api.post("/index.php?page=transcript-api", formData);
      if (res.data.status === "success") {
        toast({ title: "สำเร็จ", description: "ลบใบเกรดเรียบร้อยแล้ว" });
        fetchData();
      }
    } catch (err: any) {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถลบรายการได้", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">กำลังโหลดข้อมูลนักศึกษา...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ส่วนหัวหน้า */}
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">ข้อมูลนักศึกษาและการลงทะเบียน</h1>
          <p className="app-page-description">
            จัดการและดูใบลงทะเบียนเรียน และเอกสารรายงานผลการเรียน (เกรด) แต่ละภาคเรียน
          </p>
        </div>
      </div>

      {/* ข้อมูลนักศึกษา และ สรุปสถิติ */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card ข้อมูลนักศึกษา */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              ข้อมูลนักศึกษา
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">รหัสนักศึกษา</span>
              <span className="font-semibold">{studentInfo?.student_code || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">ชื่อ-นามสกุล</span>
              <span className="font-semibold">{studentInfo?.student_name || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">คณะ</span>
              <span className="font-semibold">{studentInfo?.faculty || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">หลักสูตร/สาขา</span>
              <span className="font-semibold">{studentInfo?.major || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ชั้นปีปัจจุบัน</span>
              <span className="font-semibold">
                ชั้นปีที่ {studentInfo?.current_year || (studentInfo?.student_code ? calculateAcademicInfo(studentInfo.student_code).yearLevel : "N/A")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* สรุปจำนวนเอกสารที่อัปโหลด */}
        <div className="grid gap-4 grid-cols-2 md:col-span-2">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{registrations.length}</p>
                  <p className="text-xs text-muted-foreground">ใบลงทะเบียนเรียนที่อัปโหลด</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{termGrades.length}</p>
                  <p className="text-xs text-muted-foreground">ใบเกรดประจำเทอมที่อัปโหลด</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* อาจารย์ผู้ดูแลคนปัจจุบัน */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            อาจารย์ผู้ดูแลคนปัจจุบัน
          </CardTitle>
          <CardDescription className="text-xs">
            อาจารย์ที่ปรึกษาและอาจารย์ปฏิบัติที่ได้รับมอบหมาย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* อาจารย์ที่ปรึกษา */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl border bg-muted/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">อาจารย์ที่ปรึกษา</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-200 text-blue-700 bg-blue-50/50">
                    คนปัจจุบัน
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground truncate mt-1">
                  {studentInfo?.advisor_name || "ยังไม่มีข้อมูลอาจารย์ที่ปรึกษา"}
                </p>
                {studentInfo?.advisor_email ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{studentInfo.advisor_email}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">บทบาท: ดูแลให้คำปรึกษาแผนการเรียน</p>
                )}
              </div>
            </div>

            {/* อาจารย์ปฏิบัติ */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl border bg-muted/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">อาจารย์ปฏิบัติ</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-200 text-emerald-700 bg-emerald-50/50">
                    คนปัจจุบัน
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground truncate mt-1">
                  {studentInfo?.practical_advisor_name || "ยังไม่มีข้อมูลอาจารย์ปฏิบัติ"}
                </p>
                {studentInfo?.practical_advisor_email ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{studentInfo.practical_advisor_email}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">บทบาท: ดูแลการฝึกปฏิบัติงานและการประเมินทักษะ</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------- */}
      {/* หมวดที่ 1: อัปโหลดใบการลงทะเบียนเรียน */}
      {/* ---------------------------------------------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              ใบการลงทะเบียนเรียน
            </CardTitle>
            <CardDescription className="text-xs">
              อัปโหลดเอกสารใบลงทะเบียนเรียนของแต่ละภาคเรียน พร้อมระบุจำนวนวิชาที่ลงทะเบียน
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ฟอร์มอัปโหลด */}
          <form onSubmit={handleUploadRegistration} className="p-4 rounded-xl border bg-muted/20 space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-primary" />
              เพิ่มใบลงทะเบียนเรียน
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="reg-year">ปีการศึกษา (พ.ศ.)</Label>
                <Input
                  id="reg-year"
                  placeholder="เช่น 2567"
                  value={regYear}
                  onChange={(e) => setRegYear(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-semester">ภาคเรียน</Label>
                <Select value={regSemester} onValueChange={setRegSemester}>
                  <SelectTrigger id="reg-semester">
                    <SelectValue placeholder="เลือกภาคเรียน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">ภาคเรียนที่ 1</SelectItem>
                    <SelectItem value="2">ภาคเรียนที่ 2</SelectItem>
                    <SelectItem value="3">ภาคฤดูร้อน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-course-count">จำนวนวิชาที่ลงทะเบียน</Label>
                <Input
                  id="reg-course-count"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="เช่น 6"
                  value={regCourseCount}
                  onChange={(e) => setRegCourseCount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-file-input">ไฟล์ใบลงทะเบียน (PDF/รูป)</Label>
                <Input
                  id="reg-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setRegFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isUploadingReg}>
                {isUploadingReg ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                บันทึกใบลงทะเบียน
              </Button>
            </div>
          </form>

          {/* ตารางรายการใบลงทะเบียนที่บันทึกแล้ว */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[120px]">ปีการศึกษา</TableHead>
                  <TableHead className="w-[140px]">ภาคเรียน</TableHead>
                  <TableHead className="text-center w-[160px]">จำนวนวิชาที่ลงทะเบียน</TableHead>
                  <TableHead>วันที่อัปโหลด</TableHead>
                  <TableHead className="text-center w-[140px]">เอกสาร</TableHead>
                  <TableHead className="text-right w-[100px]">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.length > 0 ? (
                  registrations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold">{item.academic_year}</TableCell>
                      <TableCell>
                        {item.semester === "3" ? "ภาคฤดูร้อน" : `ภาคเรียนที่ ${item.semester}`}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {item.course_count} วิชา
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(item.uploaded_at).toLocaleDateString("th-TH")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" asChild className="h-8 gap-1 text-xs">
                          <a href={`${apiBaseUrl}/${item.file_path}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            เปิดดูไฟล์
                          </a>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          onClick={() => handleDeleteRegistration(item.id)}
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      ยังไม่มีรายการใบลงทะเบียนเรียน
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------- */}
      {/* หมวดที่ 2: อัปโหลดเกรดของแต่ละเทอม */}
      {/* ---------------------------------------------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              รายงานผลการเรียน (เกรดแต่ละเทอม)
            </CardTitle>
            <CardDescription className="text-xs">
              อัปโหลดเอกสารใบรายงานผลการเรียน หรือเกรดของแต่ละภาคเรียน
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ฟอร์มอัปโหลด */}
          <form onSubmit={handleUploadTermGrade} className="p-4 rounded-xl border bg-muted/20 space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-primary" />
              เพิ่มผลการเรียนประจำเทอม
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="grade-year">ปีการศึกษา (พ.ศ.)</Label>
                <Input
                  id="grade-year"
                  placeholder="เช่น 2567"
                  value={gradeYear}
                  onChange={(e) => setGradeYear(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grade-semester">ภาคเรียน</Label>
                <Select value={gradeSemester} onValueChange={setGradeSemester}>
                  <SelectTrigger id="grade-semester">
                    <SelectValue placeholder="เลือกภาคเรียน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">ภาคเรียนที่ 1</SelectItem>
                    <SelectItem value="2">ภาคเรียนที่ 2</SelectItem>
                    <SelectItem value="3">ภาคฤดูร้อน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grade-gpa">เกรดเฉลี่ย (GPA เทอมนี้ - ถ้ามี)</Label>
                <Input
                  id="grade-gpa"
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="4.00"
                  placeholder="เช่น 3.50"
                  value={gradeGpa}
                  onChange={(e) => setGradeGpa(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grade-file-input">ไฟล์ใบเกรด (PDF/รูป)</Label>
                <Input
                  id="grade-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setGradeFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isUploadingGrade}>
                {isUploadingGrade ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                บันทึกใบเกรด
              </Button>
            </div>
          </form>

          {/* ตารางรายการใบเกรดที่บันทึกแล้ว */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[120px]">ปีการศึกษา</TableHead>
                  <TableHead className="w-[140px]">ภาคเรียน</TableHead>
                  <TableHead className="text-center w-[160px]">เกรดเฉลี่ย (GPA)</TableHead>
                  <TableHead>วันที่อัปโหลด</TableHead>
                  <TableHead className="text-center w-[140px]">เอกสาร</TableHead>
                  <TableHead className="text-right w-[100px]">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {termGrades.length > 0 ? (
                  termGrades.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold">{item.academic_year}</TableCell>
                      <TableCell>
                        {item.semester === "3" ? "ภาคฤดูร้อน" : `ภาคเรียนที่ ${item.semester}`}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.gpa !== null && item.gpa !== undefined && item.gpa !== "" ? (
                          <Badge className="bg-emerald-500 text-white font-mono">
                            {Number(item.gpa).toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(item.uploaded_at).toLocaleDateString("th-TH")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" asChild className="h-8 gap-1 text-xs">
                          <a href={`${apiBaseUrl}/${item.file_path}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            เปิดดูไฟล์
                          </a>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          onClick={() => handleDeleteTermGrade(item.id)}
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      ยังไม่มีรายการใบรายงานผลการเรียน/เกรด
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transcript;