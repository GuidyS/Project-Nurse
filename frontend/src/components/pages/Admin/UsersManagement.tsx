import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Edit, Trash2, MoreHorizontal, UserPlus, Upload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleTab, setRoleTab] = useState<RoleTab>("teacher");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
  const { toast } = useToast();

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
  }, []);

  const handleGenerateAccounts = async () => {
    try {
      setIsGenerating(true);
      const response = await api.post("/index.php?page=generate-user-accounts");
      if (response.data?.status === "success") {
        const imported = response.data.imported ?? 0;
        const skippedExisting = response.data.skippedExisting ?? 0;
        const skippedNoBirth = response.data.skippedNoBirth ?? 0;
        toast({
          title: "สร้างบัญชีสำเร็จ",
          description:
            `สร้าง ${imported} บัญชี` +
            (response.data.facultyCount || response.data.studentCount
              ? ` (อาจารย์ ${response.data.facultyCount ?? 0}, นักศึกษา ${response.data.studentCount ?? 0})`
              : "") +
            (skippedExisting ? `, มีบัญชีแล้ว ${skippedExisting}` : "") +
            (skippedNoBirth ? `, ไม่มีวันเกิด ${skippedNoBirth}` : ""),
        });
        setIsGenerateOpen(false);
        fetchUsers();
      } else {
        toast({
          title: "สร้างบัญชีไม่สำเร็จ",
          description: response.data?.message || "เกิดข้อผิดพลาด",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "สร้างบัญชีไม่สำเร็จ",
        description: error?.response?.data?.message || "เกิดข้อผิดพลาด",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
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
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground py-1">จัดการผู้ใช้</h1>
            <p className="text-muted-foreground">สร้างบัญชีจากข้อมูลอาจารย์/นักศึกษา แก้ไข ลบ และมอบบทบาท</p>
          </div>
          <Button className="gap-2" onClick={() => setIsGenerateOpen(true)} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            สร้างบัญชีจากข้อมูลในระบบ
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="py-2">รายชื่อผู้ใช้</CardTitle>
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
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                    {tab.label}
                    <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px]">
                      {tabCount(tab.value)}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>รหัสประจำตัว</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
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
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {user.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.fullName}</span>
                        </div>
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
                        <Badge variant={user.status === "active" ? "default" : "secondary"} className={user.status === "active" ? "bg-success" : ""}>
                          {user.status === "active" ? "ใช้งาน" : "ระงับ"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                <div className="space-y-2"><Label>คำนำหน้า</Label><Input value={detailForm.title || ""} onChange={e => setDetailForm({...detailForm, title: e.target.value})} /></div>
                <div className="space-y-2"><Label>ชื่อภาษาไทย</Label><Input value={detailForm.first_name_th || ""} onChange={e => setDetailForm({...detailForm, first_name_th: e.target.value})} /></div>
                <div className="space-y-2"><Label>นามสกุลภาษาไทย</Label><Input value={detailForm.last_name_th || ""} onChange={e => setDetailForm({...detailForm, last_name_th: e.target.value})} /></div>
                <div className="space-y-2"><Label>ชื่อภาษาอังกฤษ</Label><Input value={detailForm.first_name_en || ""} onChange={e => setDetailForm({...detailForm, first_name_en: e.target.value})} /></div>
                <div className="space-y-2"><Label>นามสกุลภาษาอังกฤษ</Label><Input value={detailForm.last_name_en || ""} onChange={e => setDetailForm({...detailForm, last_name_en: e.target.value})} /></div>
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
                <div className="space-y-2"><Label>สถานะการทำงาน</Label><Input value={detailForm.status || ""} onChange={e => setDetailForm({...detailForm, status: e.target.value})} placeholder="Active/Retired" /></div>
                <PdfUploadSection description="เอกสารจะถูกบันทึกตามประเภทที่เลือก และแสดงในหน้าโปรไฟล์ของอาจารย์/บุคลากร" />
              </>
            )}

            {/* 💥 กรณีแก้ไขนักศึกษา (Student) */}
            {editingUserRole === 3 && (
              <>
                <div className="space-y-2"><Label>คำนำหน้า</Label><Input value={detailForm.title || ""} onChange={e => setDetailForm({...detailForm, title: e.target.value})} /></div>
                <div className="space-y-2"><Label>ชื่อภาษาไทย</Label><Input value={detailForm.first_name_th || ""} onChange={e => setDetailForm({...detailForm, first_name_th: e.target.value})} /></div>
                <div className="space-y-2"><Label>นามสกุลภาษาไทย</Label><Input value={detailForm.last_name_th || ""} onChange={e => setDetailForm({...detailForm, last_name_th: e.target.value})} /></div>
                <div className="space-y-2"><Label>ชื่อภาษาอังกฤษ</Label><Input value={detailForm.first_name_en || ""} onChange={e => setDetailForm({...detailForm, first_name_en: e.target.value})} /></div>
                <div className="space-y-2"><Label>นามสกุลภาษาอังกฤษ</Label><Input value={detailForm.last_name_en || ""} onChange={e => setDetailForm({...detailForm, last_name_en: e.target.value})} /></div>
                <div className="space-y-2"><Label>เลขบัตรประชาชน</Label><Input value={detailForm.id_card_number || ""} onChange={e => setDetailForm({...detailForm, id_card_number: e.target.value})} /></div>
                <div className="space-y-2"><Label>ปีที่รับเข้าศึกษา</Label><Input value={detailForm.admission_year || ""} onChange={e => setDetailForm({...detailForm, admission_year: e.target.value})} /></div>
                <div className="space-y-2"><Label>ชั้นปี</Label><Input type="number" value={detailForm.year_level || ""} onChange={e => setDetailForm({...detailForm, year_level: e.target.value})} /></div>
                <div className="space-y-2"><Label>เพศ</Label><Input value={detailForm.gender || ""} onChange={e => setDetailForm({...detailForm, gender: e.target.value})} /></div>
                <div className="space-y-2"><Label>ว/ด/ป เกิด</Label><Input type="date" value={detailForm.birth_date || ""} onChange={e => setDetailForm({...detailForm, birth_date: e.target.value})} /></div>
                <div className="space-y-2"><Label>อีเมล</Label><Input type="email" value={detailForm.email || ""} onChange={e => setDetailForm({...detailForm, email: e.target.value})} /></div>
                <div className="space-y-2"><Label>เบอร์โทรศัพท์</Label><Input value={detailForm.phone || ""} onChange={e => setDetailForm({...detailForm, phone: e.target.value})} /></div>
                <div className="space-y-2"><Label>โทรศัพท์บ้าน</Label><Input value={detailForm.home_phone || ""} onChange={e => setDetailForm({...detailForm, home_phone: e.target.value})} /></div>
                <div className="space-y-2"><Label>เกรดเฉลี่ย (GPA)</Label><Input type="number" step="0.01" value={detailForm.gpa || ""} onChange={e => setDetailForm({...detailForm, gpa: e.target.value})} /></div>
                <div className="space-y-2"><Label>ภูมิลำเนา (จังหวัด)</Label><Input value={detailForm.hometown_province || ""} onChange={e => setDetailForm({...detailForm, hometown_province: e.target.value})} /></div>
                <div className="space-y-2"><Label>ส่วนสูง (ซม.)</Label><Input type="number" value={detailForm.height || ""} onChange={e => setDetailForm({...detailForm, height: e.target.value})} /></div>
                <div className="space-y-2"><Label>น้ำหนัก (กก.)</Label><Input type="number" value={detailForm.weight || ""} onChange={e => setDetailForm({...detailForm, weight: e.target.value})} /></div>
                <div className="space-y-2"><Label>BMI</Label><Input type="number" step="0.01" value={detailForm.bmi || ""} onChange={e => setDetailForm({...detailForm, bmi: e.target.value})} /></div>
                <div className="col-span-2 space-y-2"><Label>ที่อยู่ตามทะเบียนบ้าน</Label><Textarea value={detailForm.home_address || ""} onChange={e => setDetailForm({...detailForm, home_address: e.target.value})} /></div>
                <div className="space-y-2"><Label>สถานะ</Label><Input value={detailForm.status || ""} onChange={e => setDetailForm({...detailForm, status: e.target.value})} /></div>
                <div className="space-y-2"><Label>วันที่จบการศึกษา</Label><Input type="date" value={detailForm.graduation_date || ""} onChange={e => setDetailForm({...detailForm, graduation_date: e.target.value})} /></div>
                <div className="space-y-2"><Label>วันที่พ้นสภาพ</Label><Input type="date" value={detailForm.dropout_date || ""} onChange={e => setDetailForm({...detailForm, dropout_date: e.target.value})} /></div>
                <div className="col-span-2 space-y-2"><Label>เหตุผลที่พ้นสภาพ</Label><Input value={detailForm.dropout_reason || ""} onChange={e => setDetailForm({...detailForm, dropout_reason: e.target.value})} /></div>
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

      <ConfirmActionDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        title="ยืนยันการสร้างบัญชี"
        description="ระบบจะสร้างบัญชีจากข้อมูลอาจารย์และนักศึกษาที่มีวันเกิดในฐานข้อมูล โดยใช้รหัสประจำตัวเป็นชื่อผู้ใช้ และรหัสผ่านเริ่มต้นเป็นวันเกิดรูปแบบวันเดือนปี พ.ศ. (เช่น 25/12/2519 → 25122519) บัญชีที่สร้างจะอยู่ในสถานะรอจัดบทบาท และจะข้ามคนที่มีบัญชีอยู่แล้วหรือไม่มีวันเกิด"
        confirmLabel="สร้างบัญชี"
        variant="default"
        onConfirm={handleGenerateAccounts}
        isLoading={isGenerating}
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
