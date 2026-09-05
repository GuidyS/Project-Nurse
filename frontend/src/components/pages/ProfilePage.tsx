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

  const displayFullNameTH = `${profileData.first_name_th || ""} ${profileData.last_name_th || ""}`.trim();
  const displayFullNameEN = `${profileData.first_name_en || ""} ${profileData.last_name_en || ""}`.trim();
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
            {profilePictureUrl ? <AvatarImage src={profilePictureUrl} alt={displayFullNameTH} /> : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">
              {displayFullNameTH || "ไม่ระบุชื่อ"}
            </h1>
            <h1 className="text-ms font-bold">
              {displayFullNameEN || "ไม่ระบุชื่อ"}
            </h1>
            <p className="text-muted-foreground mt-1">
              รหัสประจำตัว: {userRole === "student" ? profileData.student_id : profileData.faculty_id}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Badge>
                {userRole === "student" ? "นักศึกษาพยาบาลศาสตร์" : "อาจารย์ / บุคลากร"}
              </Badge>
              {userRole === "teacher" && getWorkStatusBadge(profileData.status)}
            </div>
          </div>
        </div>

        <div className="border-t border-border my-8" />

        {/* 🎯 ข้อมูลอื่นๆ ที่ดึงมาแสดงตามสิทธิ์ โดยใช้ UI เดิมเป๊ะๆ */}
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {userRole === "teacher" ? (
            <>
              <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="เพศ" value={profileData.gender} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วัน/เดือน/ปี เกิด" value={formatThaiDate(profileData.birth_date)} />
              <InfoRow icon={<Mail className="h-4 w-4 text-primary" />} label="อีเมล" value={displayEmail} />
              <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์" value={profileData.phone} />
              <InfoRow icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="เลขที่บัตรสภาการพยาบาล" value={profileData.nursing_council_no} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วันหมดอายุใบอนุญาต" value={formatThaiDate(profileData.license_expiry)} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วันที่เริ่มปฏิบัติงาน" value={formatThaiDate(profileData.start_work_date)} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วันที่รับตำแหน่งทางวิชาการ" value={formatThaiDate(profileData.academic_position_date)} />
              <div className="md:col-span-2">
                <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ที่อยู่ปัจจุบัน" value={profileData.current_address} />
              </div>
              <PdfDocumentsSection documents={pdfDocuments} />
            </>
          ) : (
            <>
              <InfoRow icon={<User className="h-4 w-4 text-primary" />} label="เพศ" value={profileData.gender} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="วัน/เดือน/ปี เกิด" value={formatThaiDate(profileData.birth_date)} />
              <InfoRow icon={<Mail className="h-4 w-4 text-primary" />} label="อีเมล" value={displayEmail} />
              <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์มือถือ" value={profileData.phone} />
              <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์บ้าน" value={profileData.home_phone} />
              <InfoRow icon={<GraduationCap className="h-4 w-4 text-primary" />} label="ชั้นปีปัจจุบัน" value={profileData.year_level ? `ปี ${profileData.year_level}` : null} />
              <InfoRow icon={<GraduationCap className="h-4 w-4 text-primary" />} label="เกรดเฉลี่ย (GPA)" value={profileData.gpa} />
              <InfoRow icon={<Activity className="h-4 w-4 text-primary" />} label="ส่วนสูง / น้ำหนัก" value={profileData.height && profileData.weight ? `${profileData.height} ซม. / ${profileData.weight} กก.` : null} />
              <InfoRow icon={<Activity className="h-4 w-4 text-primary" />} label="ดัชนีมวลกาย (BMI)" value={profileData.bmi} />
              <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ภูมิลำเนา (จังหวัด)" value={profileData.hometown_province} />
              <InfoRow icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="รหัสประจำตัวประชาชน" value={profileData.id_card_number} />
              <InfoRow icon={<Calendar className="h-4 w-4 text-primary" />} label="ปีการศึกษาที่เข้าศึกษา" value={formatThaiYear(profileData.admission_year)} />
              <div className="md:col-span-2">
                <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="ที่อยู่ตามทะเบียนบ้าน" value={profileData.home_address} />
              </div>
              <div className="md:col-span-2 rounded-lg border p-4 bg-muted/10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">ข้อมูลสุขภาพ / โรคประจำตัว</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">โรคประจำตัว / ข้อควรระวังด้านสุขภาพ</p>
                    <p className="font-medium whitespace-pre-wrap">{profileData.health_conditions || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">ประวัติการรับวัคซีน</p>
                    <p className="font-medium whitespace-pre-wrap">{profileData.vaccine_history || "-"}</p>
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
        <DialogContent className="app-dialog-3xl">
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
                <div className="border-t my-4 pt-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" /> ข้อมูลสุขภาพ
                  </h3>
                  <div className="space-y-2">
                    <Label>โรคประจำตัว / ข้อควรระวังด้านสุขภาพ</Label>
                    <Textarea placeholder="ระบุโรคประจำตัว หรือแพ้ยา/อาหาร..." value={formData.health_conditions || ""} onChange={e => setFormData({...formData, health_conditions: e.target.value})} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>ประวัติการรับวัคซีน</Label>
                    <Textarea placeholder="ระบุประวัติการรับวัคซีน..." value={formData.vaccine_history || ""} onChange={e => setFormData({...formData, vaccine_history: e.target.value})} rows={2} />
                  </div>
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

/** Format YYYY-MM-DD (or Date) as "6 สิงหาคม 2568" (Buddhist year). */
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

/** Format year-only values (admission year) to Buddhist year when stored as CE. */
const formatThaiYear = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  const year = Number(String(value).trim());
  if (!Number.isFinite(year) || year <= 0) return String(value);
  return String(year < 2400 ? year + 543 : year);
};

// 🎯 Badge สถานะการทำงาน (อิง --success / --destructive จาก index.css)
const getWorkStatusBadge = (status?: string | null) => {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (normalized === "active") {
    return <Badge className="bg-success text-success-foreground hover:bg-success/90">Active</Badge>;
  }
  if (normalized === "retired") {
    return (
      <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Retired
      </Badge>
    );
  }
  if (!status) return "-";
  return <Badge variant="secondary">{status}</Badge>;
};

// 🎯 โครงสร้างแถว InfoRow ตาม UI ต้นฉบับที่คุณกำหนดไว้
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