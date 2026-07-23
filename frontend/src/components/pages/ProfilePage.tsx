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
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
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

  const handleSaveProfile = async () => {
    try {
      const res = await api.post("/index.php?page=profile", formData);
      if (res.data.status === "success") {
        toast({ title: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว" });
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      toast({ title: "บันทึกข้อมูลล้มเหลว", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">กำลังโหลดข้อมูลโปรไฟล์...</div>;
  if (!profileData) return <div className="p-12 text-center text-destructive">ไม่พบข้อมูลผู้ใช้งาน</div>;

  const displayFullName = `${profileData.first_name_th || ""} ${profileData.last_name_th || ""}`.trim();
  const displayEmail = profileData.email || `${profileData.student_id || profileData.faculty_id}@siam.edu`;
  const userInitial = profileData.first_name_th?.charAt(0) || "U";
  const pdfDocuments = Array.isArray(profileData.pdf_documents) ? profileData.pdf_documents : [];
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
  const profilePictureRaw = profileData.profile_picture_url || profileData.profile_picture || "";
  const profilePictureUrl = profilePictureRaw
    ? (profilePictureRaw.startsWith("http") ? profilePictureRaw : `${apiBaseUrl}/${profilePictureRaw.replace(/^\//, "")}`)
    : "";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* 🎯 ส่วนหัว Card ข้อมูลส่วนตัว */}
      <div className="bg-card rounded-2xl shadow-lg p-8 relative">
        <div className="absolute top-6 right-6">
          <Button size="sm" className="gap-2" onClick={() => { setFormData(profileData); setEditing(true); }}>
            <Edit className="h-4 w-4" />
            แก้ไขข้อมูล
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <Avatar className="h-32 w-32 ring-4 ring-primary/20 shadow-md">
            {profilePictureUrl ? <AvatarImage src={profilePictureUrl} alt={displayFullName} /> : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">
              {displayFullName || "ไม่ระบุชื่อ"}
            </h1>
            <p className="text-muted-foreground mt-1">
              รหัสประจำตัว: {userRole === "student" ? profileData.student_id : profileData.faculty_id}
            </p>
            <Badge className="mt-3">
              {userRole === "student" ? "นักศึกษาพยาบาลศาสตร์" : "อาจารย์ / บุคลากร"}
            </Badge>
          </div>
        </div>

        <div className="border-t border-border my-8" />

        {/* 🎯 ข้อมูลอื่นๆ ที่ดึงมาแสดงตามสิทธิ์ โดยใช้ UI เดิมเป๊ะๆ */}
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {userRole === "teacher" ? (
            <>
              <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="ชื่อภาษาอังกฤษ" value={`${profileData.first_name_en || ""} ${profileData.last_name_en || ""}`.trim()} />
              <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="เพศ" value={profileData.gender} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วัน/เดือน/ปี เกิด" value={profileData.birth_date} />
              <InfoRow icon={<Mail className="h-4 w-4 text-primary" />} label="อีเมล" value={displayEmail} />
              <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์" value={profileData.phone} />
              <InfoRow icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="เลขที่บัตรสภาการพยาบาล" value={profileData.nursing_council_no} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วันหมดอายุใบอนุญาต" value={profileData.license_expiry} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วันที่เริ่มปฏิบัติงาน" value={profileData.start_work_date} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วันที่รับตำแหน่งทางวิชาการ" value={profileData.academic_position_date} />
              <InfoRow icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="สถานะการทำงาน" value={profileData.status} />
              <div className="md:col-span-2">
                <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ที่อยู่ปัจจุบัน" value={profileData.current_address} />
              </div>
              <PdfDocumentsSection documents={pdfDocuments} />
            </>
          ) : (
            <>
              <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="ชื่อภาษาอังกฤษ" value={`${profileData.first_name_en || ""} ${profileData.last_name_en || ""}`.trim()} />
              <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="เพศ" value={profileData.gender} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วัน/เดือน/ปี เกิด" value={profileData.birth_date} />
              <InfoRow icon={<Mail className="h-4 w-4 text-primary" />} label="อีเมล" value={displayEmail} />
              <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์มือถือ" value={profileData.phone} />
              <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์บ้าน" value={profileData.home_phone} />
              <InfoRow icon={<GraduationCap className="h-4 w-4 text-primary" />} label="ชั้นปีปัจจุบัน" value={profileData.year_level ? `ปี ${profileData.year_level}` : null} />
              <InfoRow icon={<GraduationCap className="h-4 w-4 text-primary" />} label="เกรดเฉลี่ย (GPA)" value={profileData.gpa} />
              <InfoRow icon={<Activity className="h-4 w-4 text-primary" />} label="ส่วนสูง / น้ำหนัก" value={profileData.height && profileData.weight ? `${profileData.height} ซม. / ${profileData.weight} กก.` : null} />
              <InfoRow icon={<Activity className="h-4 w-4 text-primary" />} label="ดัชนีมวลกาย (BMI)" value={profileData.bmi} />
              <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ภูมิลำเนา (จังหวัด)" value={profileData.hometown_province} />
              <InfoRow icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="รหัสประจำตัวประชาชน" value={profileData.id_card_number} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="ปีการศึกษาที่เข้าศึกษา" value={profileData.admission_year} />
              <div className="md:col-span-2">
                <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ที่อยู่ตามทะเบียนบ้าน" value={profileData.home_address} />
              </div>
              <PdfDocumentsSection documents={pdfDocuments} />
            </>
          )}
        </div>
      </div>

      {/* 🎯 Dialog แบบฟอร์มแก้ไขข้อมูลส่วนตัว */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อภาษาไทย</Label>
                <Input value={formData.first_name_th || ""} onChange={e => setFormData({...formData, first_name_th: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>นามสกุลภาษาไทย</Label>
                <Input value={formData.last_name_th || ""} onChange={e => setFormData({...formData, last_name_th: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>ชื่อภาษาอังกฤษ</Label>
                <Input value={formData.first_name_en || ""} onChange={e => setFormData({...formData, first_name_en: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>นามสกุลภาษาอังกฤษ</Label>
                <Input value={formData.last_name_en || ""} onChange={e => setFormData({...formData, last_name_en: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>เพศ</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกเพศ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ชาย">ชาย</SelectItem>
                    <SelectItem value="หญิง">หญิง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>วันเกิด</Label>
                <Input type="date" value={formData.birth_date || ""} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>อีเมลติดต่อ</Label>
              <Input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            
            {userRole === "teacher" ? (
              <>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์</Label>
                  <Input value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>ที่อยู่ปัจจุบัน</Label>
                  <Textarea value={formData.current_address || ""} onChange={e => setFormData({...formData, current_address: e.target.value})} rows={2} />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>โทรศัพท์มือถือ</Label>
                    <Input value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>โทรศัพท์บ้าน</Label>
                    <Input value={formData.home_phone || ""} onChange={e => setFormData({...formData, home_phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ภูมิลำเนา จังหวัด</Label>
                  <Input value={formData.hometown_province || ""} onChange={e => setFormData({...formData, hometown_province: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>ที่อยู่ตามทะเบียนบ้าน</Label>
                  <Textarea value={formData.home_address || ""} onChange={e => setFormData({...formData, home_address: e.target.value})} rows={2} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>ยกเลิก</Button>
            <Button onClick={handleSaveProfile}>บันทึกข้อมูล</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 🎯 โครงสร้างแถว InfoRow ตาม UI ต้นฉบับที่คุณกำหนดไว้
const InfoRow = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) => (
  <div className="flex items-center gap-3">
    <div className="bg-primary/10 p-2 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-foreground">{value || "-"}</p>
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
  if (!documents || documents.length === 0) {
    return (
      <div className="md:col-span-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        ยังไม่มีเอกสาร PDF — ไฟล์ที่อัปโหลดจากหน้าจัดการผู้ใช้ หรือลิงก์ Google Drive จะแสดงที่นี่
      </div>
    );
  }
  if (!documents || documents.length === 0) {
    return (
      <div className="md:col-span-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        ไม่มีเอกสาร
      </div>
    );
  }

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

  return (
    <div className="md:col-span-2 space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <p className="font-semibold text-foreground">เอกสาร PDF</p>
      </div>
      <p className="text-xs text-muted-foreground">
        แสดงเฉพาะ PDF จาก Google Drive หรือไฟล์ที่อัปโหลดในระบบ — ไม่ดึงรูปจาก Excel อีกต่อไป
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
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
                {kind === "image" ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
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
              className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/60 hover:bg-primary/5"
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
};