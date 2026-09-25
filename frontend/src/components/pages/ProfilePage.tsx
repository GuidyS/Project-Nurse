import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Edit,
  User,
  Calendar,
  ShieldCheck,
  Activity,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle,
  Users,
  Heart,
  Loader2,
  Upload,
  BellRing,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

// Helper สำหรับคำนวณปีการศึกษาและชั้นปี Real-time (ตัดรอบ 10 สิงหาคม)
export const calculateAcademicInfo = (studentIdOrEntryYear: string | number) => {
  const now = new Date();
  const currentYearCE = now.getFullYear();
  const currentYearBE = currentYearCE + 543;

  // วันตัดรอบเลื่อนชั้นปี: 10 สิงหาคม ของทุกปี
  const cutOffDate = new Date(currentYearCE, 7, 10, 0, 0, 0);
  const academicYear = now >= cutOffDate ? currentYearBE : currentYearBE - 1;

  const val = String(studentIdOrEntryYear || "").trim();
  let entryYear = 0;

  // 1. ดึงกรณีเป็น พ.ศ. 4 หลัก
  if (val.length === 4 && parseInt(val, 10) >= 2500 && parseInt(val, 10) <= 2600) {
    entryYear = parseInt(val, 10);
  } 
  // 2. ดึงจาก 2 ตัวแรกของรหัสนักศึกษา (เช่น "6603400001" -> 66 -> 2566)
  else if (val.length >= 2) {
    const prefix = parseInt(val.substring(0, 2), 10);
    if (!isNaN(prefix) && prefix >= 40 && prefix <= 99) {
      entryYear = 2500 + prefix;
    }
  }

  if (entryYear === 0) {
    entryYear = academicYear;
  }

  let yearLevel = academicYear - entryYear + 1;
  if (yearLevel < 1) yearLevel = 1;
  if (yearLevel > 8) yearLevel = 8;

  return {
    academicYear,
    yearLevel,
    entryYear: String(entryYear),
    yearLevelText: `ปี ${yearLevel}`,
  };
};

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  // รูปใบประกอบวิชาชีพที่เลือกไว้ (อัปโหลดตอนกดบันทึก)
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreviewUrl, setLicensePreviewUrl] = useState("");
  const [licenseFileError, setLicenseFileError] = useState("");
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/index.php?page=profile");
      if (res.data.status === "success") {
        setUserRole(res.data.role);
        setProfileData(res.data.data);
      }
    } catch (error) {
      toast({ title: "โหลดข้อมูลโปรไฟล์ล้มเหลว", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // สร้าง/คืนหน่วยความจำรูปตัวอย่างเมื่อเปลี่ยนรูป
  useEffect(() => {
    if (!licenseFile) {
      setLicensePreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(licenseFile);
    setLicensePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [licenseFile]);

  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    if (!LICENSE_IMAGE_TYPES.includes(file.type)) {
      setLicenseFileError("รองรับเฉพาะรูปภาพ JPG, PNG หรือ WEBP");
      return;
    }
    if (file.size > LICENSE_IMAGE_MAX_BYTES) {
      setLicenseFileError("รูปภาพต้องมีขนาดไม่เกิน 5 MB");
      return;
    }
    setLicenseFileError("");
    setLicenseFile(file);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // ดักกรองให้รับเฉพาะตัวเลข 0-9
  const handleNumericInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    maxLength?: number
  ) => {
    const { name, value } = e.target;
    const cleanValue = value.replace(/\D/g, "");
    const finalValue = maxLength ? cleanValue.slice(0, maxLength) : cleanValue;
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันคำนวณ BMI อัตโนมัติ
  const calculateBMI = (height?: number | string, weight?: number | string) => {
    if (!height || !weight) return "-";
    const h = parseFloat(String(height)) / 100;
    const w = parseFloat(String(weight));
    if (isNaN(h) || isNaN(w) || h <= 0) return "-";
    return (w / (h * h)).toFixed(1);
  };

  const handleSaveProfile = async () => {
    try {
      // ตรวจสอบความถูกต้องของเลขบัตรประชาชน (ถ้ามีการกรอก)
      if (userRole === "student" && formData.id_card_number && formData.id_card_number.length !== 13) {
        toast({
          title: "ข้อมูลไม่ถูกต้อง",
          description: "รหัสประจำตัวประชาชนต้องมีครบ 13 หลัก",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      const res = await api.post("/index.php?page=profile", formData);
      if (res.data.status === "success") {
        // บันทึกข้อมูลแล้วค่อยอัปโหลดรูปใบประกอบวิชาชีพ (ถ้าเลือกรูปใหม่)
        if (userRole === "teacher" && licenseFile) {
          try {
            const upload = new FormData();
            upload.append("file", licenseFile);
            await api.post("/index.php?page=upload-license-image", upload, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            setLicenseFile(null);
          } catch (uploadError) {
            // ข้อมูลอื่นบันทึกแล้ว — เปิด dialog ค้างไว้ให้ลองอัปโหลดรูปใหม่
            const uploadMessage = (uploadError as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast({
              title: "บันทึกข้อมูลแล้ว แต่อัปโหลดรูปไม่สำเร็จ",
              description: uploadMessage || "กรุณาลองอัปโหลดรูปใบประกอบวิชาชีพอีกครั้ง",
              variant: "destructive",
            });
            return;
          }
        }
        toast({ title: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว" });
        setEditing(false);
        fetchProfile();
      } else {
        toast({
          title: "บันทึกข้อมูลล้มเหลว",
          description: res.data.message || "เกิดข้อผิดพลาดในการบันทึก",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || "บันทึกข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง";
      toast({ title: "บันทึกข้อมูลล้มเหลว", description: errMsg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">กำลังโหลดข้อมูลโปรไฟล์...</div>;
  if (!profileData) return <div className="p-12 text-center text-destructive">ไม่พบข้อมูลผู้ใช้งาน</div>;

  const studentId = profileData.student_id || profileData.username || "6603400001";
  const academicCalculated = calculateAcademicInfo(studentId);

  const displayFullNameTH = `${profileData.first_name_th || ""} ${profileData.last_name_th || ""}`.trim();
  const displayFullNameEN = `${profileData.first_name_en || ""} ${profileData.last_name_en || ""}`.trim();
  const displayEmail = profileData.email || `${studentId}@siam.edu`;
  const userInitial = profileData.first_name_th?.charAt(0) || "ญ";
  const pdfDocuments = Array.isArray(profileData.pdf_documents) ? profileData.pdf_documents : [];
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
  const profilePictureRaw =
    userRole === "teacher"
      ? profileData.profile_picture_url || ""
      : profileData.profile_picture_url || profileData.profile_picture || "";
  const profilePictureUrl = profilePictureRaw
    ? (profilePictureRaw.startsWith("http") ? profilePictureRaw : `${apiBaseUrl}/${profilePictureRaw.replace(/^\//, "")}`)
    : "";

  const currentLicenseImageUrl = resolveUploadUrl(profileData.license_image, apiBaseUrl);

  const fatherFullName = `${profileData.father_first_name || ""} ${profileData.father_last_name || ""}`.trim();
  const motherFullName = `${profileData.mother_first_name || ""} ${profileData.mother_last_name || ""}`.trim();
  const parentAddress = profileData.parent_address || profileData.father_address || profileData.mother_address || null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* 🎯 ส่วนหัว Card ข้อมูลส่วนตัว */}
      <div className="bg-card rounded-2xl shadow-lg p-8 relative">
        <div className="absolute top-6 right-6">
          <Button 
            size="sm" 
            className="gap-2" 
            onClick={() => { 
              setFormData({
                ...profileData,
                parent_address: parentAddress || "",
                home_address: profileData.home_address || profileData.address || ""
              });
              setLicenseFile(null);
              setLicenseFileError(""); 
              setEditing(true); 
            }}
          >
            <Edit className="h-4 w-4" />
            แก้ไขข้อมูล
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <Avatar className="h-32 w-32 ring-4 ring-primary/20 shadow-md">
            {profilePictureUrl ? <AvatarImage src={profilePictureUrl} alt={displayFullNameTH} /> : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-foreground">
              {displayFullNameTH || "ญาณัณธร โอนอิง"}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              {displayFullNameEN || "Yananthon Oning"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              รหัสประจำตัว: {userRole === "student" ? studentId : profileData.faculty_id}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Badge className="border-primary/25 bg-primary/15 text-primary font-normal">
                {userRole === "student" ? "นักศึกษาพยาบาลศาสตร์" : "อาจารย์ / บุคลากร"}
              </Badge>
              {userRole === "teacher" && getWorkStatusBadge(profileData.status)}
            </div>
          </div>
        </div>

        <div className="border-t border-border my-8" />
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-foreground text-base">ข้อมูลทั่วไป</h3>
          </div>

          {/* 🎯 ข้อมูลอื่นๆ ที่ดึงมาแสดงตามสิทธิ์ */}
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            {userRole === "teacher" ? (
              <>
                {/* โครงสร้างเดิมของอาจารย์ ไม่แตะต้อง */}
                <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="เพศ" value={profileData.gender} />
                <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วัน/เดือน/ปี เกิด" value={formatThaiDate(profileData.birth_date)} />
                <InfoRow icon={<Mail className="h-4 w-4 text-primary" />} label="อีเมล" value={displayEmail} />
                <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์" value={profileData.phone} />
                <InfoRow icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="เลขที่บัตรสภาการพยาบาล" value={profileData.nursing_council_no} />
                <InfoRow
                  icon={<Calendar className="h-4 w-4 text-primary" />}
                  label="วันหมดอายุใบอนุญาต"
                  value={
                    profileData.license_expiry ? (
                      <span className="flex flex-wrap items-center gap-2">
                        {formatThaiDate(profileData.license_expiry)}
                        <LicenseStatusBadge expiry={profileData.license_expiry} />
                      </span>
                    ) : null
                  }
                />
                <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วันที่เริ่มปฏิบัติงาน" value={formatThaiDate(profileData.start_work_date)} />
                <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วันที่รับตำแหน่งทางวิชาการ" value={formatThaiDate(profileData.academic_position_date)} />
                <div className="md:col-span-2">
                  <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ที่อยู่ปัจจุบัน" value={profileData.current_address} />
                </div>
                <div className="md:col-span-2">
                  <LicenseImageRow url={currentLicenseImageUrl} />
                </div>
                <PdfDocumentsSection documents={pdfDocuments} />
              </>
            ) : (
              <>
                {/* ส่วนแสดงผลของ Student ที่คำนวณ Real-time */}
                <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="เพศ" value={profileData.gender || "หญิง"} />
                <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วัน/เดือน/ปี เกิด" value={formatThaiDate(profileData.birth_date)} />
                <InfoRow icon={<Mail className="h-4 w-4 text-primary" />} label="อีเมล" value={displayEmail} />
                <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์มือถือ" value={profileData.phone} />
                <InfoRow icon={<GraduationCap className="h-4 w-4 text-primary" />} label="ชั้นปีปัจจุบัน" value={academicCalculated.yearLevelText} />
                <InfoRow icon={<GraduationCap className="h-4 w-4 text-primary" />} label="เกรดเฉลี่ย (GPA)" value={profileData.gpa} />
                <InfoRow icon={<Activity className="h-4 w-4 text-primary" />} label="ส่วนสูง / น้ำหนัก" value={profileData.height && profileData.weight ? `${profileData.height} ซม. / ${profileData.weight} กก.` : null} />
                <InfoRow icon={<Activity className="h-4 w-4 text-primary" />} label="ดัชนีมวลกาย (BMI)" value={profileData.bmi || calculateBMI(profileData.height, profileData.weight)} />
                <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="ปีการศึกษาที่เข้าศึกษา" value={academicCalculated.entryYear} />
                <div className="md:col-span-2">
                  <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ที่อยู่ปัจจุบัน" value={profileData.home_address || profileData.address} />
                </div>

                {/* 👨‍👩‍👧 ส่วนข้อมูลครอบครัว (บิดา-มารดา) */}
                <div className="md:col-span-2 border-t border-border pt-6 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-foreground text-base">ข้อมูลครอบครัว (บิดา-มารดา)</h3>
                  </div>
                  
                  <div className="bg-muted/20 p-4 rounded-xl border border-border space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* ข้อมูลบิดา */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary font-medium border-b border-border pb-1">
                          <User className="h-4 w-4" />
                          <span>ข้อมูลบิดา</span>
                        </div>
                        <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="ชื่อ-นามสกุลบิดา" value={fatherFullName || null} />
                        <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์บิดา" value={profileData.father_phone} />
                      </div>

                      {/* ข้อมูลมารดา */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary font-medium border-b border-border pb-1">
                          <Heart className="h-4 w-4" />
                          <span>ข้อมูลมารดา</span>
                        </div>
                        <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="ชื่อ-นามสกุลมารดา" value={motherFullName || null} />
                        <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์มารดา" value={profileData.mother_phone} />
                      </div>
                    </div>

                    {/* ที่อยู่ผู้ปกครอง (รวมเป็นแถวเดียว) */}
                    <div className="border-t border-border pt-3">
                      <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ที่อยู่ผู้ปกครอง" value={parentAddress} />
                    </div>
                  </div>
                </div>

                <PdfDocumentsSection documents={pdfDocuments} />
              </>
            )}
          </div>
        </div>

      {/* 🎯 Dialog แบบฟอร์มแก้ไขข้อมูลส่วนตัว */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="app-dialog-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
            <DialogDescription>
              {userRole === "student"
                ? "แก้ไขข้อมูลประวัตินักศึกษา ข้อมูลสุขภาพ และข้อมูลครอบครัว"
                : "แก้ไขข้อมูลส่วนตัวของอาจารย์และบุคลากร"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2 text-sm">
            {/* หมวดที่ 1: ข้อมูลทั่วไป */}
            <div className="space-y-4">
              <h4 className="font-semibold text-primary border-b border-border pb-1">
                1. ข้อมูลทั่วไป
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name_th">ชื่อภาษาไทย</Label>
                  <Input
                    id="first_name_th"
                    name="first_name_th"
                    value={formData.first_name_th || ""}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name_th">นามสกุลภาษาไทย</Label>
                  <Input
                    id="last_name_th"
                    name="last_name_th"
                    value={formData.last_name_th || ""}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name_en">ชื่อภาษาอังกฤษ</Label>
                  <Input
                    id="first_name_en"
                    name="first_name_en"
                    value={formData.first_name_en || ""}
                    onChange={handleInputChange}
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name_en">นามสกุลภาษาอังกฤษ</Label>
                  <Input
                    id="last_name_en"
                    name="last_name_en"
                    value={formData.last_name_en || ""}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">เพศ</Label>
                  <Select
                    value={formData.gender || "หญิง"}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="เลือกเพศ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ชาย">ชาย</SelectItem>
                      <SelectItem value="หญิง">หญิง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">วันเกิด</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    value={formData.birth_date || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมลติดต่อ</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="example@siam.edu"
                  />
                </div>

                {userRole === "teacher" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="current_address">ที่อยู่ปัจจุบัน</Label>
                      <Textarea
                        id="current_address"
                        name="current_address"
                        value={formData.current_address || ""}
                        onChange={handleInputChange}
                        rows={2}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">โทรศัพท์มือถือ</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={(e) => handleNumericInputChange(e, 10)}
                        placeholder="08XXXXXXXX"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gpa">เกรดเฉลี่ย (GPA)</Label>
                      <Input
                        id="gpa"
                        name="gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={formData.gpa ?? ""}
                        onChange={handleInputChange}
                        placeholder="เช่น 3.50"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="home_address">ที่อยู่ปัจจุบัน</Label>
                      <Textarea
                        id="home_address"
                        name="home_address"
                        value={formData.home_address || formData.address || ""}
                        onChange={handleInputChange}
                        placeholder="ระบุที่อยู่ปัจจุบัน"
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* หมวดที่ 2: ใบประกอบวิชาชีพการพยาบาล (เฉพาะอาจารย์) */}
            {userRole === "teacher" && (
              <div className="space-y-4">
                <h4 className="font-semibold text-primary border-b border-border pb-1">
                  2. ใบประกอบวิชาชีพการพยาบาล
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nursing_council_no">เลขที่ใบประกอบวิชาชีพ</Label>
                    <Input
                      id="nursing_council_no"
                      name="nursing_council_no"
                      value={formData.nursing_council_no || ""}
                      onChange={handleInputChange}
                      placeholder="เลขที่ใบอนุญาต"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_expiry">วันหมดอายุใบประกอบวิชาชีพ</Label>
                    <Input
                      id="license_expiry"
                      name="license_expiry"
                      type="date"
                      value={formData.license_expiry || ""}
                      onChange={handleInputChange}
                    />
                    {formData.license_expiry && (
                      <div>
                        <LicenseStatusBadge expiry={formData.license_expiry} showRemaining />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>รูปใบประกอบวิชาชีพ</Label>
                    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed p-3">
                      {licensePreviewUrl || currentLicenseImageUrl ? (
                        <img
                          src={licensePreviewUrl || currentLicenseImageUrl}
                          alt="ตัวอย่างรูปใบประกอบวิชาชีพ"
                          className="h-24 w-36 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-36 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => licenseInputRef.current?.click()}
                          disabled={isSaving}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {licensePreviewUrl || currentLicenseImageUrl ? "เปลี่ยนรูป" : "เลือกรูปภาพ"}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          {licenseFile
                            ? `รูปใหม่: ${licenseFile.name} (อัปโหลดเมื่อกดบันทึกข้อมูล)`
                            : "JPG, PNG หรือ WEBP ขนาดไม่เกิน 5 MB"}
                        </p>
                        {licenseFileError && <p className="text-xs text-red-600">{licenseFileError}</p>}
                      </div>
                      <input
                        ref={licenseInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleLicenseFileChange}
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                    <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p>ระบบจะแจ้งเตือนในระบบและทางอีเมล ก่อนใบประกอบวิชาชีพหมดอายุ 6 เดือน, 3 เดือน และ 1 เดือน</p>
                      {!String(formData.email || "").trim() && (
                        <p className="text-red-600">ยังไม่ได้กรอกอีเมลติดต่อ — จะได้รับแจ้งเตือนเฉพาะในระบบ</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* หมวดที่ 2: ข้อมูลสุขภาพ (เฉพาะ Student) */}
            {userRole === "student" && (
              <div className="space-y-4">
                <h4 className="font-semibold text-primary border-b border-border pb-1">
                  2. ข้อมูลสุขภาพ
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">ส่วนสูง (ซม.)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.height ?? ""}
                      onChange={handleInputChange}
                      placeholder="เช่น 160"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">น้ำหนัก (กก.)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight ?? ""}
                      onChange={handleInputChange}
                      placeholder="เช่น 48"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ดัชนีมวลกาย (BMI)</Label>
                    <Input
                      value={calculateBMI(formData.height, formData.weight)}
                      disabled
                      className="bg-muted/50 font-semibold text-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* หมวดที่ 3: ข้อมูลครอบครัว (เฉพาะ Student) */}
            {userRole === "student" && (
              <div className="space-y-4">
                <h4 className="font-semibold text-primary border-b border-border pb-1">
                  3. ข้อมูลครอบครัว (บิดา-มารดา)
                </h4>

                {/* ข้อมูลบิดา */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> ข้อมูลบิดา
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="father_first_name">ชื่อบิดา</Label>
                      <Input
                        id="father_first_name"
                        name="father_first_name"
                        value={formData.father_first_name || ""}
                        onChange={handleInputChange}
                        placeholder="ระบุชื่อบิดา"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="father_last_name">นามสกุลบิดา</Label>
                      <Input
                        id="father_last_name"
                        name="father_last_name"
                        value={formData.father_last_name || ""}
                        onChange={handleInputChange}
                        placeholder="ระบุนามสกุลบิดา"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="father_phone">เบอร์โทรศัพท์บิดา</Label>
                    <Input
                      id="father_phone"
                      name="father_phone"
                      value={formData.father_phone || ""}
                      onChange={(e) => handleNumericInputChange(e, 10)}
                      placeholder="ระบุเบอร์โทรศัพท์บิดา (10 หลัก)"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* ข้อมูลมารดา */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" /> ข้อมูลมารดา
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mother_first_name">ชื่อมารดา</Label>
                      <Input
                        id="mother_first_name"
                        name="mother_first_name"
                        value={formData.mother_first_name || ""}
                        onChange={handleInputChange}
                        placeholder="ระบุชื่อมารดา"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mother_last_name">นามสกุลมารดา</Label>
                      <Input
                        id="mother_last_name"
                        name="mother_last_name"
                        value={formData.mother_last_name || ""}
                        onChange={handleInputChange}
                        placeholder="ระบุนามสกุลมารดา"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_phone">เบอร์โทรศัพท์มารดา</Label>
                    <Input
                      id="mother_phone"
                      name="mother_phone"
                      value={formData.mother_phone || ""}
                      onChange={(e) => handleNumericInputChange(e, 10)}
                      placeholder="ระบุเบอร์โทรศัพท์มารดา (10 หลัก)"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* ที่อยู่ผู้ปกครอง */}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="parent_address">ที่อยู่ผู้ปกครอง</Label>
                  <Textarea
                    id="parent_address"
                    name="parent_address"
                    value={formData.parent_address || ""}
                    onChange={handleInputChange}
                    placeholder="ระบุที่อยู่ผู้ปกครอง"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              disabled={isSaving}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const LICENSE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LICENSE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const resolveUploadUrl = (path: unknown, apiBaseUrl: string) => {
  const raw = String(path ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${apiBaseUrl}/${raw.replace(/^\//, "")}`;
};

// จำนวนวันจากวันนี้ถึงวันหมดอายุ (เทียบเฉพาะวันที่)
const daysUntil = (value: unknown): number | null => {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const now = new Date();
  const target = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
};

// ป้ายสถานะ: หมดอายุแล้ว / ใกล้หมดอายุ (ภายใน 6 เดือน) — showRemaining แสดงวันคงเหลือแม้ยังไม่ใกล้หมด
const LicenseStatusBadge = ({ expiry, showRemaining = false }: { expiry: unknown; showRemaining?: boolean }) => {
  const days = daysUntil(expiry);
  if (days === null) return null;
  if (days < 0) {
    return <Badge variant="destructive">หมดอายุแล้ว</Badge>;
  }
  if (days <= 180) {
    return (
      <Badge
        className={
          days <= 30
            ? "bg-destructive text-destructive-foreground"
            : "bg-warning text-warning-foreground"
        }
      >
        ใกล้หมดอายุ · เหลือ {days} วัน
      </Badge>
    );
  }
  return showRemaining ? <Badge variant="secondary">เหลือ {days} วัน</Badge> : null;
};

const LicenseImageRow = ({ url }: { url: string }) => (
  <div className="flex items-start gap-3">
    <div className="bg-primary/10 p-2 rounded-full flex items-center justify-center">
      <ImageIcon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-muted-foreground text-xs">รูปใบประกอบวิชาชีพการพยาบาล</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 block" title="เปิดดูรูปขนาดเต็ม">
          <img
            src={url}
            alt="ใบประกอบวิชาชีพการพยาบาล"
            className="h-28 max-w-[14rem] rounded-md border object-cover transition-opacity hover:opacity-90"
          />
        </a>
      ) : (
        <div className="font-medium text-foreground">-</div>
      )}
    </div>
  </div>
);

const formatThaiDate = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return raw;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return raw;

  const buddhistYear = year < 2400 ? year + 543 : year;
  return `${day} ${THAI_MONTHS[month - 1]} ${buddhistYear}`;
};

const getWorkStatusBadge = (status?: string | null) => {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (normalized === "active") {
    return <Badge className="bg-success text-success-foreground">Active</Badge>;
  }
  if (normalized === "retired") {
    return (
      <Badge className="bg-destructive text-destructive-foreground">
        Retired
      </Badge>
    );
  }
  if (!status) return "-";
  return <Badge variant="secondary">{status}</Badge>;
};

const InfoRow = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center gap-3">
    <div className="bg-primary/10 p-2 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="font-medium text-foreground">{value || "-"}</div>
    </div>
  </div>
);

const resolveDocumentUrl = (doc: any, apiBaseUrl: string) => {
  if (doc.available !== true) return "";
  const raw = String(doc.file_url || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${apiBaseUrl}/${raw.replace(/^\//, "")}`;
};

const PdfDocumentsSection = ({ documents }: { documents: any[] }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="md:col-span-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        ยังไม่มีไฟล์ PDF ในระบบ — ลิงก์ Google Drive ในฐานข้อมูล (เช่น ประวัติ/Resume) หรือไฟล์ที่อัปโหลดผ่านผู้ดูแลระบบจะแสดงที่นี่
        เอกสารรับรองอื่น (บัตรสภา, ใบอนุญาต, ใบรับรองการสอน) ให้ผู้ใช้อัปโหลดภายหลัง
      </div>
    );
  }

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

  return (
    <div className="md:col-span-2 space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <p className="font-semibold text-foreground">เอกสาร</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-5">
        {documents.map((doc, index) => {
          const fileUrl = resolveDocumentUrl(doc, apiBaseUrl);
          const available = doc.available === true && Boolean(fileUrl);
          const kind = doc.kind || "file";
          const sourceLabel =
            doc.source === "google_drive"
              ? "Google Drive"
              : doc.source === "local"
                ? "ไฟล์ในระบบ"
                : doc.source === "missing"
                  ? "ยังไม่มีไฟล์บนเซิร์ฟเวอร์"
                  : "ลิงก์ภายนอก";

          const iconWrapClass =
            kind === "pdf" || kind === "drive"
              ? "bg-red-50 text-red-600 ring-red-100"
              : kind === "image"
                ? "bg-sky-50 text-sky-700 ring-sky-100"
                : "bg-amber-50 text-amber-700 ring-amber-100";

          const content = (
            <>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ring-1 ${iconWrapClass}`}>
                {kind === "image" ? (
                  <ImageIcon className="h-6 w-6" />
                ) : kind === "pdf" || kind === "drive" ? (
                  <img src="/pdf.svg" alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{doc.title || "เอกสารแนบ"}</p>
                <p className="truncate text-xs text-muted-foreground">{doc.file_name || doc.file_path}</p>
                <p className="truncate text-[11px] text-muted-foreground/80">{sourceLabel}</p>
              </div>
              {available ? (
                <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </>
          );

          if (!available) {
            return (
              <div
                key={`${doc.title || doc.file_name}-${index}`}
                className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3 opacity-80"
                title="ยังไม่มีไฟล์ PDF บนเซิร์ฟเวอร์ — อัปโหลดภายหลังได้"
              >
                {content}
              </div>
            );
          }

          return (
            <a
              key={`${doc.title || doc.file_name}-${index}`}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={doc.title || doc.file_name || "เปิดดูเอกสาร PDF"}
              aria-label={doc.title || doc.file_name || "เปิดดูเอกสาร PDF"}
              className="group inline-flex flex-col items-center gap-1.5 rounded-xl p-2 transition-opacity hover:opacity-90"
            >
              <img
                src="/pdf.svg"
                alt=""
                className="h-14 w-14 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                aria-hidden="true"
              />
              <span className="max-w-[7rem] truncate text-center text-[11px] text-muted-foreground">
                {doc.title || "เอกสาร PDF"}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
