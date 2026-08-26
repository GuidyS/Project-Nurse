import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, Shield, Search, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserWithRole {
  id: string;
  email: string;
  fullName: string;
  currentRole: string;
  teacherSubRole?: string;
}

type RoleTab = "teacher" | "student" | "admin" | "unassigned";

const roles = [
  { value: "admin", label: "ผู้ดูแลระบบ", description: "สิทธิ์เต็มในการจัดการระบบ" },
  { value: "teacher", label: "อาจารย์", description: "สิทธิ์ในการจัดการข้อมูลการเรียนการสอน" },
  { value: "student", label: "นักศึกษา", description: "สิทธิ์ในการดูข้อมูลตนเอง" },
];

const teacherSubRoles = [
  { value: "dean", label: "คณบดี" },
  { value: "instructor", label: "อาจารย์ประจำ" },
  { value: "project_manager", label: "อาจารย์รับผิดชอบโครงการ" },
  { value: "research", label: "อาจารย์งานวิจัย" },
  { value: "program_manager", label: "อาจารย์รับผิดชอบหลักสูตร" },
  { value: "advisor", label: "อาจารย์ที่ปรึกษา" },
  { value: "practical_instructor", label: "อาจารย์ภาคปฏิบัติ" },
];

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
  project_manager: "อาจารย์รับผิดชอบโครงการ",
  research: "อาจารย์งานวิจัย",
  program_manager: "อาจารย์รับผิดชอบหลักสูตร",
  advisor: "อาจารย์ที่ปรึกษา",
  practical_instructor: "อาจารย์ภาคปฏิบัติ",
};

export default function RolesManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleTab, setRoleTab] = useState<RoleTab>("unassigned");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState("");
  const [primaryPosition, setPrimaryPosition] = useState("");
  const [secondaryPositions, setSecondaryPositions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.user_id != null ? String(parsed.user_id) : null;
    } catch {
      return null;
    }
  })();

  const isSelfUser = (userId: string) =>
    currentUserId != null && String(userId) === String(currentUserId);

// ดึงข้อมูลผู้ใช้จาก API ตัวเดียวกัน
  const fetchUsers = async () => {
    try {
      const response = await api.get("/index.php?page=get-users");
      // Map ให้ตรงกับ Interface UserWithRole
      setUsers(response.data.map((u: any) => ({
        id: u.id, email: u.email, fullName: u.fullName, 
        currentRole: u.role, teacherSubRole: u.teacherSubRole
      })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUser || !newRole) return;
    if (isSelfUser(selectedUser.id)) {
      toast({
        title: "ไม่สามารถแก้ไขบัญชีตัวเองได้",
        description: "กรุณาให้ผู้ดูแลระบบคนอื่นเปลี่ยน Role หรือตำแหน่งแทน",
        variant: "destructive",
      });
      return;
    }
    if (newRole === "teacher" && !primaryPosition) {
      toast({ title: "กรุณาเลือกตำแหน่งหลัก", variant: "destructive" });
      return;
    }
    
    try {
      await api.post("/index.php?page=manage-role", {
        userId: selectedUser.id,
        newRole: newRole,
        primaryPosition: newRole === "teacher" ? primaryPosition : null,
        secondaryPositions: newRole === "teacher" ? secondaryPositions.filter((position) => position !== primaryPosition) : []
      });

      toast({ title: "มอบหมาย Role สำเร็จ" });
      setIsDialogOpen(false);
      fetchUsers(); // โหลดข้อมูลใหม่เพื่อให้ UI อัปเดต
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.message || "ไม่สามารถอัปเดต Role ได้",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    if (user.currentRole !== roleTab) return false;
    const q = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const tabCount = (tab: RoleTab) => users.filter((u) => u.currentRole === tab).length;

  const handlePrimaryPositionChange = (value: string) => {
    setPrimaryPosition(value);
    setSecondaryPositions((prev) => prev.filter((position) => position !== value));
  };

  const toggleSecondaryPosition = (value: string) => {
    if (value === primaryPosition) return;

    setSecondaryPositions((prev) =>
      prev.includes(value)
        ? prev.filter((position) => position !== value)
        : [...prev, value]
    );
  };

  const openAssignDialog = async (user: UserWithRole) => {
    if (isSelfUser(user.id)) {
      toast({
        title: "ไม่สามารถแก้ไขบัญชีตัวเองได้",
        description: "กรุณาให้ผู้ดูแลระบบคนอื่นเปลี่ยน Role หรือตำแหน่งแทน",
        variant: "destructive",
      });
      return;
    }

    setSelectedUser(user);
    setNewRole(user.currentRole === "unassigned" ? "" : user.currentRole);
    setPrimaryPosition(user.teacherSubRole || "");
    setSecondaryPositions([]);
    setIsDialogOpen(true);

    if (user.currentRole === "teacher") {
      try {
        const response = await api.get(`/index.php?page=manage-role&userId=${user.id}`);
        if (response.data.status === "success") {
          setPrimaryPosition(response.data.data.primaryPosition || user.teacherSubRole || "");
          setSecondaryPositions(response.data.data.secondaryPositions || []);
        }
      } catch (error) {
        toast({ title: "โหลดตำแหน่งผู้ใช้ล้มเหลว", variant: "destructive" });
      }
    }
  };

  return (
    <>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">จัดการ Role</h1>
            <p className="text-muted-foreground">มอบหมายและถอด Role ของผู้ใช้ในระบบ</p>
          </div>
        </div>

        {/* Role Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {roles.map((role) => (
            <Card
              key={role.value}
              className={cn(
                "cursor-pointer transition-colors hover:border-primary/40",
                roleTab === role.value && "border-primary"
              )}
              onClick={() => setRoleTab(role.value as RoleTab)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{role.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{role.description}</p>
                <p className="mt-2 text-2xl font-bold">
                  {tabCount(role.value as RoleTab)}
                </p>
              </CardContent>
            </Card>
          ))}
          <Card
            className={cn(
              "cursor-pointer transition-colors hover:border-primary/40",
              roleTab === "unassigned" && "border-primary"
            )}
            onClick={() => setRoleTab("unassigned")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base">รอจัดบทบาท</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">บัญชียังไม่มี role — มอบสิทธิ์ก่อนเข้าใช้ระบบ</p>
              <p className="mt-2 text-2xl font-bold">{tabCount("unassigned")}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>จัดการ Role ผู้ใช้</CardTitle>
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
                  <TableHead>อีเมล</TableHead>
                  <TableHead>Role ปัจจุบัน</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
                            variant={user.currentRole === "unassigned" ? "secondary" : "outline"}
                            className={user.currentRole === "unassigned" ? "bg-amber-100 text-amber-900 border-amber-200" : undefined}
                          >
                            {roleLabels[user.currentRole] || user.currentRole}
                          </Badge>
                          {user.teacherSubRole && (
                            <Badge variant="secondary" className="text-xs">{subRoleLabels[user.teacherSubRole]}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelfUser(user.id) ? (
                          <Badge variant="secondary">ผู้ดูแลระบบ</Badge>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openAssignDialog(user)} className="gap-2">
                            <UserCog className="h-4 w-4" />
                            จัดการ Role
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader className="space-y-1.5">
              <DialogTitle>มอบหมาย Role</DialogTitle>
              <DialogDescription>
                {selectedUser && `เปลี่ยน Role ของ ${selectedUser.fullName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2.5">
                <Label>Role หลัก</Label>
                <Select
                  value={newRole}
                  onValueChange={(value) => {
                    setNewRole(value);
                    if (value !== "teacher") {
                      setPrimaryPosition("");
                      setSecondaryPositions([]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newRole === "teacher" && (
                <>
                  <div className="space-y-2.5">
                    <Label>ตำแหน่งหลัก</Label>
                    <Select value={primaryPosition} onValueChange={handlePrimaryPositionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกตำแหน่งหลัก" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherSubRoles.map((subRole) => (
                          <SelectItem key={subRole.value} value={subRole.value}>{subRole.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 rounded-lg border border-border/80 bg-muted/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label>ตำแหน่งรอง</Label>
                      <span className="text-xs text-muted-foreground">
                        {secondaryPositions.length} รายการ
                      </span>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {teacherSubRoles.map((subRole) => {
                        const isPrimary = primaryPosition === subRole.value;
                        const isSelected = secondaryPositions.includes(subRole.value);

                        return (
                          <Button
                            key={subRole.value}
                            type="button"
                            variant="outline"
                            disabled={isPrimary}
                            className={cn(
                              "h-auto min-h-[52px] items-center justify-between gap-3 whitespace-normal rounded-lg px-3 py-2.5 text-left leading-snug transition-all",
                              "border-border/80 bg-background/60 hover:border-primary/60 hover:bg-primary/5",
                              isSelected && "border-primary/70 bg-primary/10 text-primary hover:bg-primary/15",
                              isPrimary && "border-muted bg-muted/30 text-muted-foreground opacity-70"
                            )}
                            onClick={() => toggleSecondaryPosition(subRole.value)}
                          >
                            <span className="min-w-0 flex-1 break-words">
                              {subRole.label}
                              {isPrimary && (
                                <span className="mt-1 block text-xs text-muted-foreground">
                                  ตำแหน่งหลัก
                                </span>
                              )}
                            </span>
                            {isSelected && !isPrimary && (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">เลือกได้หลายตำแหน่ง ตำแหน่งหลักจะไม่ถูกเลือกซ้ำเป็นตำแหน่งรอง</p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="gap-2 border-t border-border/70 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleAssignRole}>บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
