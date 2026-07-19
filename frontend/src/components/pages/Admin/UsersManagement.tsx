import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Edit, Trash2, MoreHorizontal, UserPlus, Upload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "student" | "teacher";
  teacherSubRole?: string;
  status: "active" | "inactive";
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  admin: "ผู้ดูแลระบบ",
  student: "นักศึกษา",
  teacher: "อาจารย์",
};

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
];

const studentPdfOptions = [
  { value: "student_id_card_file", label: "ไฟล์สำเนาบัตรประชาชน" },
  { value: "student_record_file", label: "ไฟล์ระเบียนนักศึกษา" },
  { value: "student_certificate_file", label: "ไฟล์ประกาศนียบัตร/ใบรับรอง" },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ email: string; fullName: string; role: "admin" | "student" | "teacher" }>({ email: "", fullName: "", role: "student" });
  // 🎯 States สำหรับ Dialog แก้ไขข้อมูลเชิงลึก
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserRole, setEditingUserRole] = useState<number | null>(null);
  const [detailForm, setDetailForm] = useState<any>({});
  const [pdfFiles, setPdfFiles] = useState<Record<string, File[]>>({});
  const [selectedPdfField, setSelectedPdfField] = useState("nursing_council_file");
  const [isSaving, setIsSaving] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleAddUser = () => {
    // แนะนำให้นำไปเปิดหน้า Register หรือเรียก API register.php แทนครับ
    toast({ title: "แนะนำ", description: "กรุณาใช้หน้าสมัครสมาชิกเพื่อเพิ่มผู้ใช้ใหม่" });
    setIsAddDialogOpen(false);
  };

  // 🎯 ดึงข้อมูลเข้าฟอร์มแก้ไข
  const handleEditClick = async (userId: string) => {
    try {
      setEditingUserId(userId);
      setDetailForm({});
      setPdfFiles({});
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
      const res = await api.get(`/index.php?page=manage-user&id=${userId}`);
      if (res.data.status === "success") {
        setEditingUserRole(res.data.data.role_id);
        setSelectedPdfField(res.data.data.role_id === 3 ? "student_id_card_file" : "nursing_council_file");
        setDetailForm(res.data.data.details || {});
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
      const pdfFieldNames = [...teacherPdfOptions, ...studentPdfOptions].map((option) => option.value);
      const formFiles: Record<string, File[]> = {};
      const sanitizedDetails = { ...detailForm };

      Object.entries(pdfFiles).forEach(([field, files]) => {
        if (files.length > 0) {
          formFiles[field] = files;
        }
      });

      const inputFiles = Array.from(pdfInputRef.current?.files || []);
      if (inputFiles.length > 0 && !(formFiles[selectedPdfField]?.length > 0)) {
        formFiles[selectedPdfField] = [...(formFiles[selectedPdfField] || []), ...inputFiles];
      }

      pdfFieldNames.forEach((field) => {
        const value = detailForm[field];

        if (value instanceof File) {
          formFiles[field] = [...(formFiles[field] || []), value];
          delete sanitizedDetails[field];
          return;
        }

        if (typeof FileList !== "undefined" && value instanceof FileList) {
          const files = Array.from(value);
          if (files.length > 0) {
            formFiles[field] = [...(formFiles[field] || []), ...files];
          }
          delete sanitizedDetails[field];
        }
      });

      const hasPdfFiles = Object.values(formFiles).some((files) => files.length > 0);

      if (hasPdfFiles) {
        const formData = new FormData();
        formData.append("user_id", editingUserId || "");
        formData.append("details", JSON.stringify(sanitizedDetails));

        Object.entries(formFiles).forEach(([field, files]) => {
          files.forEach((file) => formData.append(`${field}[]`, file));
        });

        await api.post("/index.php?page=manage-user", formData);
      } else {
        await api.post("/index.php?page=manage-user", { user_id: editingUserId, details: detailForm });
      }

      toast({ title: "อัปเดตข้อมูลสำเร็จ" });
      setIsEditDialogOpen(false);
      setPdfFiles({});
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

  const handleDeleteUser = async (id: string) => {
    try {
      await api.delete(`/index.php?page=manage-user&id=${id}`);
      setUsers(users.filter((u) => u.id !== id));
      toast({ title: "ลบผู้ใช้สำเร็จ" });
    } catch (error) {
      toast({ title: "ลบผู้ใช้ล้มเหลว", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    setUsers(users.map((u) => 
      u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
    ));
    toast({ title: "อัปเดตสถานะสำเร็จ" });
  };

  const handlePdfFileChange = (field: string, fileList?: FileList | null) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) {
      setPdfFiles((prev) => ({ ...prev, [field]: [] }));
      return;
    }

    const invalidFile = files.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
    if (invalidFile) {
      toast({ title: "ไฟล์ไม่ถูกต้อง", description: "กรุณาเลือกไฟล์ PDF เท่านั้น", variant: "destructive" });
      return;
    }

    setPdfFiles((prev) => ({ ...prev, [field]: files }));
  };

  const pdfOptions = editingUserRole === 3 ? studentPdfOptions : teacherPdfOptions;
  const selectedPdfFiles = pdfFiles[selectedPdfField] || [];
  const selectedPdfLabel = pdfOptions.find((option) => option.value === selectedPdfField)?.label || "เอกสาร PDF";

  const PdfUploadSection = ({ description }: { description: string }) => (
    <div className="col-span-2 rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-primary" />
        <Label className="text-base font-semibold">อัปโหลดเอกสาร PDF</Label>
      </div>

      <div className="space-y-2">
        <Label>ประเภทไฟล์ที่จะอัปโหลด</Label>
        <Select value={selectedPdfField} onValueChange={setSelectedPdfField}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกประเภทไฟล์" />
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

      <label
        htmlFor="pdf-upload-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handlePdfFileChange(selectedPdfField, event.dataTransfer.files);
        }}
        className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/5"
      >
        <Upload className="mb-3 h-10 w-10 text-primary" />
        <p className="font-medium text-foreground">Choose a file or Drag it here</p>
        <p className="mt-2 text-xs text-muted-foreground">รองรับหลายไฟล์พร้อมกัน เฉพาะ PDF ขนาดไม่เกิน 50MB ต่อไฟล์</p>
        <Input
          ref={pdfInputRef}
          id="pdf-upload-dropzone"
          type="file"
          multiple
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => handlePdfFileChange(selectedPdfField, event.currentTarget.files)}
        />
      </label>

      {selectedPdfFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">ไฟล์ที่เลือก ({selectedPdfFiles.length})</p>
          <div className="space-y-1">
            {selectedPdfFiles.map((file) => (
              <div key={`${selectedPdfField}-${file.name}-${file.size}`} className="rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                {file.name}
              </div>
            ))}
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
            <h1 className="text-2xl font-bold text-foreground">จัดการผู้ใช้</h1>
            <p className="text-muted-foreground">เพิ่ม แก้ไข ลบ ผู้ใช้ในระบบ</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                เพิ่มผู้ใช้
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
                <DialogDescription>กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="example@faculty.edu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">บทบาท</Label>
                  <Select value={newUser.role} onValueChange={(value: "admin" | "student" | "teacher") => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกบทบาท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                      <SelectItem value="student">นักศึกษา</SelectItem>
                      <SelectItem value="teacher">อาจารย์</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
                <Button onClick={handleAddUser}>เพิ่มผู้ใช้</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>รายชื่อผู้ใช้ทั้งหมด</CardTitle>
                <CardDescription>ผู้ใช้ในระบบ {users.length} คน</CardDescription>
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
                {filteredUsers.map((user) => (
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
                        <Badge variant="outline">{roleLabels[user.role]}</Badge>
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
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)} className="gap-2">
                            {user.status === "active" ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> ลบ</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 🎯 Dialog แก้ไขข้อมูลแบบฟอร์มยาว */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
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
    </>
  );
}
