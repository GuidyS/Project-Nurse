import { useState, useEffect} from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Edit, Trash2, MoreHorizontal, Upload, Users as UsersIcon, CalendarClock, Info } from "lucide-react";
import { onlyEnglish, onlyThai } from "@/lib/nameInput";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportDataDialog, type ImportDataTypeOption } from "@/components/shared/ImportDataDialog";
import { AcademicSettingsDialog, formatCutoff, type AcademicSettings } from "./AcademicSettingsDialog";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "student" | "teacher" | "unassigned";
  teacherSubRole?: string;
  status: "active" | "inactive";
  createdAt: string;
}

type RoleTab = "teacher" | "student" | "admin" | "unassigned";

// สถานะที่แอดมินเลือกได้ (ต้องตรงกับ backend/src/components/Admin/ManageUsers/user_status_helpers.php)
const STUDENT_STATUS_OPTIONS = [
  { value: "Active", label: "คงอยู่" },
  { value: "OnLeave", label: "พักการเรียน" },
  { value: "Resigned", label: "ลาออก" },
];
const STUDENT_STATUS_NEEDS_REASON = ["OnLeave", "Resigned"];
const STUDENT_STATUS_REASONS = ["ปัญหาการเงิน", "ย้ายที่เรียน", "ปัญหาสุขภาพ", "โดนรีไทร์"];
const FACULTY_STATUS_OPTIONS = [
  { value: "Active", label: "คงอยู่" },
  { value: "Resigned", label: "ลาออก" },
  { value: "Retired", label: "เกษียณ" },
];

// ช่องที่แอดมินดูได้อย่างเดียว (นักศึกษากรอกเอง หรือระบบคำนวณให้)
const ReadOnlyField = ({ label, value, note }: { label: string; value?: string | number | null; note?: string }) => (
  <div className="space-y-2">
    <Label className="text-muted-foreground">{label}</Label>
    <Input value={value === null || value === undefined || value === "" ? "-" : String(value)} disabled className="bg-muted/40" />
    {note && <p className="text-xs text-muted-foreground">{note}</p>}
  </div>
);

const calculateBmi = (height?: string | number, weight?: string | number) => {
  const h = parseFloat(String(height ?? ""));
  const w = parseFloat(String(weight ?? ""));
  if (!h || !w) return "";
  return (w / (h / 100) ** 2).toFixed(2);
};

const roleLabels: Record<string, string> = {
  admin: "ผู้ดูแลระบบ",
  student: "นักศึกษา",
  teacher: "อาจารย์",
  unassigned: "รอจัดบทบาท",
};

const roleTabs: { value: RoleTab; label: string }[] = [
  { value: "teacher", label: "อาจารย์" },
  { value: "student", label: "นักศึกษา" },
  { value: "admin", label: "ผู้ดูแลระบบ" },
  { value: "unassigned", label: "รอจัดบทบาท" },
];

const subRoleLabels: Record<string, string> = {
  dean: "คณบดี",
  instructor: "อาจารย์ประจำ",
  course_instructor: "อาจารย์ประจำหลักสูตร",
  project_manager: "อาจารย์รับผิดชอบโครงการ",
  program_manager: "อาจารย์รับผิดชอบหลักสูตร",
  advisor: "อาจารย์ที่ปรึกษา",
  practical_instructor: "อาจารย์ภาคปฏิบัติ",
  dummy: "อาจารย์สมมติ",
};

const teacherPdfOptions = [
  { value: "nursing_council_file", label: "ไฟล์บัตรสภาการพยาบาล" },
  { value: "license_file", label: "ไฟล์ใบอนุญาต" },
  { value: "teaching_cert_file", label: "ไฟล์ใบรับรองการสอน" },
  { value: "teaching_degree_file", label: "ไฟล์ใบคุณวุฒิการศึกษา" },
];

const studentPdfOptions = [
  { value: "student_id_card_file", label: "ไฟล์สำเนาบัตรประชาชน" },
  { value: "student_record_file", label: "ไฟล์ระเบียนนักศึกษา" },
  { value: "student_certificate_file", label: "ไฟล์ประกาศนียบัตร/ใบรับรอง" },
];

const userImportTypes: ImportDataTypeOption[] = [
  { value: "students", label: "ข้อมูลนักศึกษา", icon: UsersIcon, description: "นำเข้ารายชื่อนักศึกษาใหม่" },
  { value: "teachers", label: "ข้อมูลอาจารย์", icon: UsersIcon, description: "นำเข้ารายชื่ออาจารย์" },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleTab, setRoleTab] = useState<RoleTab>("teacher");
  const [isImportOpen, setIsImportOpen] = useState(false);
  // 🎯 States สำหรับ Dialog แก้ไขข้อมูลเชิงลึก
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserRole, setEditingUserRole] = useState<number | null>(null);
  const [detailForm, setDetailForm] = useState<any>({});
  const [pdfLinks, setPdfLinks] = useState<Record<string, string>>({});
  const [selectedPdfField, setSelectedPdfField] = useState("nursing_council_file");
  const [savedDocuments, setSavedDocuments] = useState<Array<{
    field: string;
    title: string;
    file_name: string;
    file_path: string;
    available?: boolean;
    portfolio_id?: number | null;
  }>>([]);
  const [deletingDocKey, setDeletingDocKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(null);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [pendingToggleUserId, setPendingToggleUserId] = useState<string | null>(null);
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<{
    field: string;
    file_path: string;
    file_name: string;
    portfolio_id?: number | null;
  } | null>(null);
  const [isDeleteDocOpen, setIsDeleteDocOpen] = useState(false);
  const [isAcademicSettingsOpen, setIsAcademicSettingsOpen] = useState(false);
  const [academicSettings, setAcademicSettings] = useState<AcademicSettings | null>(null);
  const { toast } = useToast();

  // ใช้บอกในฟอร์มว่าระบบเลื่อนชั้นปีให้วันไหน
  const promotionLabel = academicSettings
    ? formatCutoff(academicSettings.cutoff_month, academicSettings.cutoff_day)
    : "ที่ตั้งไว้";

  // ดึงข้อมูลผู้ใช้จาก API
  const fetchUsers = async () => {
    try {
      const response = await api.get("/index.php?page=get-users");
      setUsers(response.data);
    } catch (error) {
      toast({ title: "โหลดข้อมูลล้มเหลว", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchUsers();
    // วันเลื่อนชั้นปีที่ตั้งไว้ ใช้บอกในฟอร์มแก้ไขนักศึกษา
    api.get("/index.php?page=get-academic-settings")
      .then((res) => setAcademicSettings(res.data?.data ?? null))
      .catch(() => setAcademicSettings(null));
  }, []);

  // 🎯 ดึงข้อมูลเข้าฟอร์มแก้ไข
  const handleEditClick = async (userId: string) => {
    try {
      setEditingUserId(userId);
      setDetailForm({});
      setPdfLinks({});
      setSavedDocuments([]);
      const res = await api.get(`/index.php?page=manage-user&id=${userId}`);
      if (res.data.status === "success") {
        setEditingUserRole(res.data.data.role_id);
        setSelectedPdfField(res.data.data.role_id === 3 ? "student_id_card_file" : "nursing_council_file");
        setDetailForm(res.data.data.details || {});
        setSavedDocuments(Array.isArray(res.data.data.uploaded_documents) ? res.data.data.uploaded_documents : []);
        setIsEditDialogOpen(true);
      }
    } catch (error) {
      toast({ title: "ดึงข้อมูลผู้ใช้ล้มเหลว", variant: "destructive" });
    }
  };

  // 🎯 บันทึกข้อมูลที่แก้ไข
  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);

      const payload = {
        user_id: editingUserId,
        details: detailForm,
        pdfLinks: pdfLinks
      };

      await api.post("/index.php?page=manage-user", payload);

      toast({ title: "อัปเดตข้อมูลสำเร็จ" });
      setIsEditDialogOpen(false);
      setPdfLinks({});
      setSavedDocuments([]);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "อัปเดตข้อมูลล้มเหลว",
        description: error?.response?.data?.message || "ไม่สามารถเชื่อมต่อ backend ได้ กรุณาตรวจสอบ CORS หรือสถานะ server",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteUserConfirm = (id: string) => {
    setPendingDeleteUserId(id);
    setIsDeleteUserOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!pendingDeleteUserId) return;
    setIsDeletingUser(true);
    try {
      await api.delete(`/index.php?page=manage-user&id=${pendingDeleteUserId}`);
      setUsers((prev) => prev.filter((u) => u.id !== pendingDeleteUserId));
      toast({ title: "ลบผู้ใช้สำเร็จ" });
      setIsDeleteUserOpen(false);
      setPendingDeleteUserId(null);
    } catch (error) {
      toast({ title: "ลบผู้ใช้ล้มเหลว", variant: "destructive" });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const openDeleteDocConfirm = (doc: {
    field: string;
    file_path: string;
    file_name: string;
    portfolio_id?: number | null;
  }) => {
    setPendingDeleteDoc(doc);
    setIsDeleteDocOpen(true);
  };

  const handleDeleteSavedDocument = async () => {
    if (!editingUserId || !pendingDeleteDoc) return;
    const doc = pendingDeleteDoc;
    const docKey = `${doc.portfolio_id || ""}:${doc.file_path}`;
    try {
      setDeletingDocKey(docKey);
      const res = await api.post("/index.php?page=manage-user", {
        action: "delete_document",
        user_id: editingUserId,
        field: doc.field,
        file_path: doc.file_path,
        portfolio_id: doc.portfolio_id || null,
      });
      if (res.data.status === "success") {
        setSavedDocuments(Array.isArray(res.data.uploaded_documents) ? res.data.uploaded_documents : []);
        toast({ title: "ลบเอกสารสำเร็จ", description: doc.file_name });
        setIsDeleteDocOpen(false);
        setPendingDeleteDoc(null);
      }
    } catch (error: any) {
      toast({
        title: "ลบเอกสารล้มเหลว",
        description: error?.response?.data?.message || "ไม่สามารถลบไฟล์ได้",
        variant: "destructive",
      });
    } finally {
      setDeletingDocKey(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (user.role !== roleTab) return false;
    const q = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const tabCount = (tab: RoleTab) => users.filter((u) => u.role === tab).length;

  const pendingToggleUser = users.find((u) => u.id === pendingToggleUserId);
  const toggleNextStatus = pendingToggleUser?.status === "active" ? "inactive" : "active";

  const openToggleConfirm = (id: string) => {
    setPendingToggleUserId(id);
    setIsToggleOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!pendingToggleUserId) return;
    const current = users.find((u) => u.id === pendingToggleUserId);
    if (!current) return;
    const nextStatus = current.status === "active" ? "inactive" : "active";
    setIsToggling(true);
    try {
      const res = await api.post("/index.php?page=manage-user", {
        action: "toggle_status",
        user_id: pendingToggleUserId,
        status: nextStatus,
      });
      if (res.data.status === "success") {
        const savedStatus = (res.data.data?.status as "active" | "inactive") || nextStatus;
        setUsers((prev) =>
          prev.map((u) => (u.id === pendingToggleUserId ? { ...u, status: savedStatus } : u))
        );
        toast({
          title: savedStatus === "inactive" ? "ระงับการใช้งานสำเร็จ" : "เปิดใช้งานสำเร็จ",
        });
        setIsToggleOpen(false);
        setPendingToggleUserId(null);
      } else {
        toast({
          title: "อัปเดตสถานะล้มเหลว",
          description: res.data.message || "ไม่สามารถเปลี่ยนสถานะได้",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "อัปเดตสถานะล้มเหลว",
        description: error?.response?.data?.message || "เชื่อมต่อ API ไม่ได้",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handlePdfLinkChange = (field: string, link: string) => {
    setPdfLinks((prev) => ({ ...prev, [field]: link }));
  };

  const pdfOptions = editingUserRole === 3 ? studentPdfOptions : teacherPdfOptions;
  const selectedPdfLink = pdfLinks[selectedPdfField] || "";
  const selectedPdfLabel = pdfOptions.find((option) => option.value === selectedPdfField)?.label || "เอกสาร";

  const PdfUploadSection = ({ description }: { description: string }) => (
    <div className="col-span-2 rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-primary" />
        <Label className="text-base font-semibold">บันทึกลิงก์เอกสาร Google Drive</Label>
      </div>

      <div className="space-y-2">
        <Label>ประเภทเอกสารที่ต้องการบันทึกลิงก์</Label>
        <Select value={selectedPdfField} onValueChange={setSelectedPdfField}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกประเภทเอกสาร" />
          </SelectTrigger>
          <SelectContent>
            {pdfOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>ลิงก์ Google Drive (ต้องตั้งค่าเป็น Anyone with the link)</Label>
        <Input 
          type="url" 
          placeholder="https://drive.google.com/file/d/..."
          value={pdfLinks[selectedPdfField] || ""}
          onChange={(e) => handlePdfLinkChange(selectedPdfField, e.target.value)}
        />
      </div>

      {savedDocuments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">เอกสารที่อัปโหลดแล้ว ({savedDocuments.length})</p>
          <div className="space-y-2">
            {savedDocuments.map((doc) => {
              const docKey = `${doc.portfolio_id || ""}:${doc.file_path}`;
              const isDeleting = deletingDocKey === docKey;
              return (
                <div
                  key={docKey}
                  className="flex items-center gap-2 rounded-md border bg-card px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{doc.file_name}</p>
                    {!doc.available && (
                      <p className="text-[11px] text-amber-600">ไฟล์ไม่อยู่บนเซิร์ฟเวอร์แล้ว</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isDeleting || isSaving}
                    onClick={() => openDeleteDocConfirm(doc)}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <>
      <div className="app-page">
        <div className="app-page-header">
          <div>
            <h1 className="app-page-title">จัดการผู้ใช้</h1>
            <p className="app-page-description">สร้างบัญชีจากข้อมูลอาจารย์/นักศึกษา แก้ไข ลบ และมอบบทบาท</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsAcademicSettingsOpen(true)}>
              <CalendarClock className="h-4 w-4" />
              ตั้งค่าปีการศึกษา
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Import ข้อมูล
            </Button>
          </div>
        </div>

        <Card className="app-section-card">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>รายชื่อผู้ใช้</CardTitle>
                <CardDescription>
                  {roleLabels[roleTab]} {tabCount(roleTab)} คน · ทั้งหมด {users.length} คน
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาผู้ใช้..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Tabs value={roleTab} onValueChange={(value) => setRoleTab(value as RoleTab)}>
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
                {roleTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="group gap-2">
                    {tab.label}
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground group-data-[state=active]:text-primary">
                      {tabCount(tab.value)}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[980px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">ผู้ใช้</TableHead>
                  <TableHead className="w-[14%]">รหัสประจำตัว</TableHead>
                  <TableHead className="w-[22%]">บทบาท</TableHead>
                  <TableHead className="w-[11%]">สถานะ</TableHead>
                  <TableHead className="w-[15%]">วันที่สร้าง</TableHead>
                  <TableHead className="w-[10%] text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      ไม่พบผู้ใช้ในหมวดนี้
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <span className="font-medium">{user.fullName}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={user.role === "unassigned" ? "secondary" : "outline"}
                            className={user.role === "unassigned" ? "bg-amber-100 text-amber-900 border-amber-200" : undefined}
                          >
                            {roleLabels[user.role] || user.role}
                          </Badge>
                          {user.teacherSubRole && (
                            <Badge variant="secondary" className="text-xs">{subRoleLabels[user.teacherSubRole]}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "active" ? "default" : "destructive"}
                          className={user.status === "active" ? "bg-success" : "bg-destructive text-destructive-foreground"}
                        >
                          {user.status === "active" ? "ใช้งาน" : "ระงับ"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(user.id)} className="gap-2"><Edit className="h-4 w-4" /> แก้ไขข้อมูล</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openToggleConfirm(user.id)} className="gap-2">
                              {user.status === "active" ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteUserConfirm(user.id)} className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> ลบ</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 🎯 Dialog แก้ไขข้อมูลแบบฟอร์มยาว */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="app-dialog-3xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้ (ID: {detailForm.student_id || detailForm.faculty_id})</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4 text-sm">
            {/* 💥 กรณีแก้ไขอาจารย์ (Teacher / Admin) */}
            {(editingUserRole === 1 || editingUserRole === 2) && (
              <>
                <div className="col-span-2 space-y-2 sm:max-w-[50%] sm:pr-2"><Label>คำนำหน้า</Label><Input value={detailForm.title || ""} onChange={e => setDetailForm({...detailForm, title: onlyThai(e.target.value)})} /></div>
                <div className="space-y-2"><Label>ชื่อภาษาไทย</Label><Input value={detailForm.first_name_th || ""} onChange={e => setDetailForm({...detailForm, first_name_th: onlyThai(e.target.value)})} placeholder="ภาษาไทยเท่านั้น" /></div>
                <div className="space-y-2"><Label>นามสกุลภาษาไทย</Label><Input value={detailForm.last_name_th || ""} onChange={e => setDetailForm({...detailForm, last_name_th: onlyThai(e.target.value)})} placeholder="ภาษาไทยเท่านั้น" /></div>
                <div className="space-y-2"><Label>ชื่อภาษาอังกฤษ</Label><Input value={detailForm.first_name_en || ""} onChange={e => setDetailForm({...detailForm, first_name_en: onlyEnglish(e.target.value)})} placeholder="English only" /></div>
                <div className="space-y-2"><Label>นามสกุลภาษาอังกฤษ</Label><Input value={detailForm.last_name_en || ""} onChange={e => setDetailForm({...detailForm, last_name_en: onlyEnglish(e.target.value)})} placeholder="English only" /></div>
                <div className="space-y-2"><Label>เพศ</Label><Input value={detailForm.gender || ""} onChange={e => setDetailForm({...detailForm, gender: e.target.value})} /></div>
                <div className="space-y-2"><Label>ว/ด/ป เกิด</Label><Input type="date" value={detailForm.birth_date || ""} onChange={e => setDetailForm({...detailForm, birth_date: e.target.value})} /></div>
                <div className="space-y-2"><Label>อีเมล</Label><Input type="email" value={detailForm.email || ""} onChange={e => setDetailForm({...detailForm, email: e.target.value})} /></div>
                <div className="space-y-2"><Label>เบอร์โทรศัพท์</Label><Input value={detailForm.phone || ""} onChange={e => setDetailForm({...detailForm, phone: e.target.value})} /></div>
                <div className="col-span-2 space-y-2"><Label>ที่อยู่ปัจจุบัน</Label><Textarea value={detailForm.current_address || ""} onChange={e => setDetailForm({...detailForm, current_address: e.target.value})} /></div>
                <div className="space-y-2"><Label>เลขที่บัตรสภาการพยาบาล</Label><Input value={detailForm.nursing_council_no || ""} onChange={e => setDetailForm({...detailForm, nursing_council_no: e.target.value})} /></div>
                <div className="space-y-2"><Label>วันหมดอายุใบอนุญาต</Label><Input type="date" value={detailForm.license_expiry || ""} onChange={e => setDetailForm({...detailForm, license_expiry: e.target.value})} /></div>
                <div className="space-y-2"><Label>วันที่เริ่มปฏิบัติงาน</Label><Input type="date" value={detailForm.start_work_date || ""} onChange={e => setDetailForm({...detailForm, start_work_date: e.target.value})} /></div>
                <div className="space-y-2"><Label>วันที่รับตำแหน่งทางวิชาการ</Label><Input type="date" value={detailForm.academic_position_date || ""} onChange={e => setDetailForm({...detailForm, academic_position_date: e.target.value})} /></div>
                <div className="space-y-2"><Label>ไฟล์รูปโปรไฟล์ (URL/ชื่อไฟล์)</Label><Input value={detailForm.profile_picture || ""} onChange={e => setDetailForm({...detailForm, profile_picture: e.target.value})} /></div>
                <div className="space-y-2">
                  <Label>สถานะการทำงาน</Label>
                  <Select
                    value={FACULTY_STATUS_OPTIONS.some(o => o.value === detailForm.status) ? detailForm.status : "Active"}
                    onValueChange={(value) => setDetailForm({ ...detailForm, status: value })}
                  >
                    <SelectTrigger><SelectValue placeholder="เลือกสถานะ" /></SelectTrigger>
                    <SelectContent>
                      {FACULTY_STATUS_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <PdfUploadSection description="เอกสารจะถูกบันทึกตามประเภทที่เลือก และแสดงในหน้าโปรไฟล์ของอาจารย์/บุคลากร" />
              </>
            )}

            {/* 💥 กรณีแก้ไขนักศึกษา (Student) */}
            {editingUserRole === 3 && (
              <>
                <div className="col-span-2 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>ข้อมูลของนักศึกษาแก้ไขได้เฉพาะเจ้าของบัญชีในหน้า "ข้อมูลส่วนตัว" ผู้ดูแลระบบเปลี่ยนได้เฉพาะสถานะเท่านั้น</span>
                </div>

                <ReadOnlyField label="คำนำหน้า" value={detailForm.title} />
                <div className="hidden sm:block" />
                <ReadOnlyField label="ชื่อภาษาไทย" value={detailForm.first_name_th} />
                <ReadOnlyField label="นามสกุลภาษาไทย" value={detailForm.last_name_th} />
                <ReadOnlyField label="ชื่อภาษาอังกฤษ" value={detailForm.first_name_en} />
                <ReadOnlyField label="นามสกุลภาษาอังกฤษ" value={detailForm.last_name_en} />
                <ReadOnlyField label="เพศ" value={detailForm.gender} />
                <ReadOnlyField label="ว/ด/ป เกิด" value={detailForm.birth_date} />
                <ReadOnlyField label="อีเมล" value={detailForm.email} />
                <ReadOnlyField label="เบอร์โทรศัพท์" value={detailForm.phone} />

                <ReadOnlyField label="ปีที่รับเข้าศึกษา" value={detailForm.admission_year} note="กำหนดจากรหัสนักศึกษา แก้ไขไม่ได้" />
                <ReadOnlyField
                  label="ชั้นปี"
                  value={detailForm.year_level}
                  note={`ระบบเลื่อนชั้นปีให้อัตโนมัติทุกวันที่ ${promotionLabel}`}
                />

                <ReadOnlyField label="เบอร์โทรศัพท์บิดา" value={detailForm.father_phone} note="นักศึกษากรอกเอง" />
                <ReadOnlyField label="เบอร์โทรศัพท์มารดา" value={detailForm.mother_phone} note="นักศึกษากรอกเอง" />

                <ReadOnlyField label="ส่วนสูง (ซม.)" value={detailForm.height} note="นักศึกษากรอกเอง" />
                <ReadOnlyField label="น้ำหนัก (กก.)" value={detailForm.weight} note="นักศึกษากรอกเอง" />
                <ReadOnlyField label="BMI" value={detailForm.bmi || calculateBmi(detailForm.height, detailForm.weight)} note="คำนวณจากส่วนสูงและน้ำหนัก" />

                <div className="col-span-2 space-y-2">
                  <Label className="text-muted-foreground">ที่อยู่ปัจจุบัน</Label>
                  <Textarea value={detailForm.home_address || ""} disabled className="bg-muted/40" />
                  <p className="text-xs text-muted-foreground">นักศึกษากรอกเองในหน้าข้อมูลส่วนตัว</p>
                </div>

                <div className="space-y-2">
                  <Label>สถานะ</Label>
                  <Select
                    value={STUDENT_STATUS_OPTIONS.some(o => o.value === detailForm.status) ? detailForm.status : "Active"}
                    onValueChange={(value) =>
                      setDetailForm({
                        ...detailForm,
                        status: value,
                        dropout_reason: value === "Active" ? "" : detailForm.dropout_reason,
                      })
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="เลือกสถานะ" /></SelectTrigger>
                    <SelectContent>
                      {STUDENT_STATUS_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {STUDENT_STATUS_NEEDS_REASON.includes(detailForm.status) && (
                  <div className="space-y-2">
                    <Label>เหตุผล</Label>
                    <Select
                      value={STUDENT_STATUS_REASONS.includes(detailForm.dropout_reason) ? detailForm.dropout_reason : ""}
                      onValueChange={(value) => setDetailForm({ ...detailForm, dropout_reason: value })}
                    >
                      <SelectTrigger><SelectValue placeholder="เลือกเหตุผล" /></SelectTrigger>
                      <SelectContent>
                        {STUDENT_STATUS_REASONS.map(reason => (
                          <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {STUDENT_STATUS_NEEDS_REASON.includes(detailForm.status) && detailForm.dropout_date && (
                  <ReadOnlyField label="วันที่เปลี่ยนสถานะ" value={detailForm.dropout_date} note="ระบบบันทึกให้อัตโนมัติ" />
                )}
                <PdfUploadSection description="ไฟล์จะถูกบันทึกเป็นรายการ Portfolio ของนักศึกษา และแสดงในหน้าโปรไฟล์" />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>ยกเลิก</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AcademicSettingsDialog
        open={isAcademicSettingsOpen}
        onOpenChange={setIsAcademicSettingsOpen}
        onSaved={setAcademicSettings}
        onPurged={fetchUsers}
      />

      <ImportDataDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        importTypes={userImportTypes}
        title="Import ข้อมูลผู้ใช้"
        description="นำเข้าข้อมูลนักศึกษาและอาจารย์จากไฟล์ Excel หรือ CSV"
        onImported={fetchUsers}
      />

      <ConfirmActionDialog
        open={isDeleteUserOpen}
        onOpenChange={(open) => {
          setIsDeleteUserOpen(open);
          if (!open) setPendingDeleteUserId(null);
        }}
        title="ยืนยันการลบผู้ใช้"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การลบจะไม่สามารถย้อนกลับได้"
        onConfirm={handleDeleteUser}
        isLoading={isDeletingUser}
      />

      <ConfirmActionDialog
        open={isToggleOpen}
        onOpenChange={(open) => {
          setIsToggleOpen(open);
          if (!open) setPendingToggleUserId(null);
        }}
        title={toggleNextStatus === "inactive" ? "ยืนยันการระงับการใช้งาน" : "ยืนยันการเปิดใช้งาน"}
        description={
          toggleNextStatus === "inactive"
            ? "ผู้ใช้ที่ถูกระงับจะไม่สามารถเข้าสู่ระบบได้ คุณต้องการดำเนินการต่อหรือไม่?"
            : "ต้องการเปิดใช้งานบัญชีนี้ใหม่อีกครั้งหรือไม่?"
        }
        confirmLabel={toggleNextStatus === "inactive" ? "ระงับ" : "เปิดใช้งาน"}
        variant={toggleNextStatus === "inactive" ? "destructive" : "default"}
        onConfirm={handleToggleStatus}
        isLoading={isToggling}
      />

      <ConfirmActionDialog
        open={isDeleteDocOpen}
        onOpenChange={(open) => {
          setIsDeleteDocOpen(open);
          if (!open) setPendingDeleteDoc(null);
        }}
        title="ยืนยันการลบเอกสาร"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ "${pendingDeleteDoc?.file_name || ""}"?`}
        onConfirm={handleDeleteSavedDocument}
        isLoading={Boolean(deletingDocKey)}
      />
    </>
  );
}
