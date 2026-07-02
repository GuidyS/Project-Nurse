import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, MoreHorizontal, UserPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "student" | "teacher";
  teacherSubRole?: string;
  status: "active" | "inactive";
  createdAt: string;
}

const mockUsers: User[] = [
  { id: "1", email: "admin@faculty.edu", fullName: "ผู้ดูแลระบบ", role: "admin", status: "active", createdAt: "2568-01-01" },
  { id: "2", email: "dean@faculty.edu", fullName: "ศ.ดร.สมศักดิ์ ใจดี", role: "teacher", teacherSubRole: "dean", status: "active", createdAt: "2568-01-05" },
  { id: "3", email: "instructor1@faculty.edu", fullName: "ผศ.ดร.มานี รักเรียน", role: "teacher", teacherSubRole: "instructor", status: "active", createdAt: "2568-01-10" },
  { id: "4", email: "student1@student.edu", fullName: "นายสมชาย เก่งมาก", role: "student", status: "active", createdAt: "2568-02-01" },
  { id: "5", email: "student2@student.edu", fullName: "นางสาวสมหญิง ขยันเรียน", role: "student", status: "active", createdAt: "2568-02-01" },
  { id: "6", email: "advisor@faculty.edu", fullName: "รศ.ดร.ประยุทธ์ ช่วยเหลือ", role: "teacher", teacherSubRole: "advisor", status: "inactive", createdAt: "2567-06-15" },
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

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ email: string; fullName: string; role: "admin" | "student" | "teacher" }>({ email: "", fullName: "", role: "student" });
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, user]);
    setIsAddDialogOpen(false);
    setNewUser({ email: "", fullName: "", role: "student" });
    toast({ title: "เพิ่มผู้ใช้สำเร็จ", description: `เพิ่ม ${user.fullName} เรียบร้อยแล้ว` });
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    toast({ title: "ลบผู้ใช้สำเร็จ", description: "ลบผู้ใช้ออกจากระบบแล้ว" });
  };

  const handleToggleStatus = (id: string) => {
    setUsers(users.map((u) => 
      u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
    ));
    toast({ title: "อัปเดตสถานะสำเร็จ" });
  };

  return (
    <MainLayout>
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
                  <TableHead>อีเมล</TableHead>
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
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" /> แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)} className="gap-2">
                            {user.status === "active" ? "ระงับการใช้งาน" : "เปิดใช้งาน"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" /> ลบ
                          </DropdownMenuItem>
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
    </MainLayout>
  );
}
