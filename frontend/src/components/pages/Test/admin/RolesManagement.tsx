import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { Shield, Search, UserCog } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  fullName: string;
  currentRole: string;
  teacherSubRole?: string;
}

const mockUsersWithRoles: UserWithRole[] = [
  { id: "1", email: "dean@faculty.edu", fullName: "ศ.ดร.สมศักดิ์ ใจดี", currentRole: "teacher", teacherSubRole: "dean" },
  { id: "2", email: "instructor1@faculty.edu", fullName: "ผศ.ดร.มานี รักเรียน", currentRole: "teacher", teacherSubRole: "instructor" },
  { id: "3", email: "advisor@faculty.edu", fullName: "รศ.ดร.ประยุทธ์ ช่วยเหลือ", currentRole: "teacher", teacherSubRole: "advisor" },
  { id: "4", email: "student1@student.edu", fullName: "นายสมชาย เก่งมาก", currentRole: "student" },
  { id: "5", email: "student2@student.edu", fullName: "นางสาวสมหญิง ขยันเรียน", currentRole: "student" },
];

const roles = [
  { value: "admin", label: "ผู้ดูแลระบบ", description: "สิทธิ์เต็มในการจัดการระบบ" },
  { value: "teacher", label: "อาจารย์", description: "สิทธิ์ในการจัดการข้อมูลการเรียนการสอน" },
  { value: "student", label: "นักศึกษา", description: "สิทธิ์ในการดูข้อมูลตนเอง" },
];

const teacherSubRoles = [
  { value: "dean", label: "คณบดี" },
  { value: "instructor", label: "อาจารย์ประจำ" },
  { value: "course_instructor", label: "อาจารย์ประจำหลักสูตร" },
  { value: "project_manager", label: "อาจารย์รับผิดชอบโครงการ" },
  { value: "program_manager", label: "อาจารย์รับผิดชอบหลักสูตร" },
  { value: "advisor", label: "อาจารย์ที่ปรึกษา" },
  { value: "practical_instructor", label: "อาจารย์ภาคปฏิบัติ" },
  { value: "dummy", label: "อาจารย์สมมติ" },
];

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

export default function RolesManagement() {
  const [users, setUsers] = useState<UserWithRole[]>(mockUsersWithRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newSubRole, setNewSubRole] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignRole = () => {
    if (!selectedUser || !newRole) return;
    
    setUsers(users.map((u) =>
      u.id === selectedUser.id
        ? { ...u, currentRole: newRole, teacherSubRole: newRole === "teacher" ? newSubRole : undefined }
        : u
    ));
    
    setIsDialogOpen(false);
    setSelectedUser(null);
    setNewRole("");
    setNewSubRole("");
    toast({ title: "มอบหมาย Role สำเร็จ", description: `อัปเดต Role ของ ${selectedUser.fullName} เรียบร้อยแล้ว` });
  };

  const openAssignDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.currentRole);
    setNewSubRole(user.teacherSubRole || "");
    setIsDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">จัดการ Role</h1>
            <p className="text-muted-foreground">มอบหมายและถอด Role ของผู้ใช้ในระบบ</p>
          </div>
        </div>

        {/* Role Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.value}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{role.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{role.description}</p>
                <p className="mt-2 text-2xl font-bold">
                  {users.filter((u) => u.currentRole === role.value).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>จัดการ Role ผู้ใช้</CardTitle>
                <CardDescription>เลือกผู้ใช้เพื่อมอบหมายหรือถอด Role</CardDescription>
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
                  <TableHead>อีเมล</TableHead>
                  <TableHead>Role ปัจจุบัน</TableHead>
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
                        <Badge variant="outline">{roleLabels[user.currentRole]}</Badge>
                        {user.teacherSubRole && (
                          <Badge variant="secondary" className="text-xs">{subRoleLabels[user.teacherSubRole]}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openAssignDialog(user)} className="gap-2">
                        <UserCog className="h-4 w-4" />
                        จัดการ Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>มอบหมาย Role</DialogTitle>
              <DialogDescription>
                {selectedUser && `เปลี่ยน Role ของ ${selectedUser.fullName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role หลัก</Label>
                <Select value={newRole} onValueChange={setNewRole}>
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
                <div className="space-y-2">
                  <Label>ตำแหน่งอาจารย์</Label>
                  <Select value={newSubRole} onValueChange={setNewSubRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherSubRoles.map((subRole) => (
                        <SelectItem key={subRole.value} value={subRole.value}>{subRole.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleAssignRole}>บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
