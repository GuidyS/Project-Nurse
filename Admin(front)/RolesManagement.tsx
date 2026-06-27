import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Search, UserCog } from "lucide-react";
import api from "@/lib/axios";

interface ApiUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  teacherSubRole?: string;
}

const roles = [
  { value: "admin", label: "ผู้ดูแลระบบ", description: "สิทธิ์เต็มในการจัดการระบบ" },
  { value: "teacher", label: "อาจารย์", description: "สิทธิ์ในการจัดการข้อมูลการเรียนการสอน" },
  { value: "student", label: "นักศึกษา", description: "สิทธิ์ในการดูข้อมูลตนเอง" },
];

const teacherSubRoles = [
  { value: "dean", label: "คณบดี" },
  { value: "instructor", label: "อาจารย์ประจำ" },
  { value: "course_instructor", label: "อาจารย์ประจำหลักสูตร" },
  { value: "project_manager", label: "ผู้รับผิดชอบโครงการ" },
  { value: "advisor", label: "อาจารย์ที่ปรึกษา" },
];

const subRoleLabels: Record<string, string> = {
  dean: "คณบดี", instructor: "อาจารย์ประจำ", course_instructor: "อ.ประจำหลักสูตร", project_manager: "ผู้รับผิดชอบโครงการ", advisor: "อาจารย์ที่ปรึกษา", dummy: "อาจารย์สมมติ"
};

export default function RolesManagement() {
  const [users, setUsers] = useState<ApiUserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ApiUserResponse | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newSubRole, setNewSubRole] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const response = await api.get<ApiUserResponse[]>("/get_role_users.php");
      setUsers(response.data);
    } catch (error) {
      toast({ title: "โหลดข้อมูลล้มเหลว", variant: "destructive" });
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAssignRole = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await api.post("/manage_role.php", { userId: selectedUser.id, newRole, newSubRole });
      toast({ title: "มอบหมาย Role สำเร็จ" });
      setIsDialogOpen(false); fetchUsers(); 
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter((u) => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

  const openAssignDialog = (user: ApiUserResponse) => {
    setSelectedUser(user); setNewRole(user.role); setNewSubRole(user.teacherSubRole || ""); setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-foreground">จัดการ Role</h1><p className="text-muted-foreground">มอบหมายสิทธิ์การเข้าถึงข้อมูลตามสายบังคับบัญชา</p></div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>รายชื่อบุคลากรและสิทธิ์ปัจจุบัน</CardTitle>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="ค้นหาผู้ใช้..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>ผู้ใช้</TableHead><TableHead>Role หลัก</TableHead><TableHead>ตำแหน่งบริหาร/ย่อย</TableHead><TableHead className="text-right">จัดการ</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{user.fullName.charAt(0)}</AvatarFallback></Avatar><span className="font-medium">{user.fullName}</span></div></TableCell>
                  <TableCell><Badge variant="outline">{user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role === 'teacher' ? 'อาจารย์' : 'นักศึกษา'}</Badge></TableCell>
                  <TableCell>
                    {user.teacherSubRole && (
                      <Badge variant={user.teacherSubRole === 'project_manager' ? 'default' : 'secondary'} className={user.teacherSubRole === 'project_manager' ? 'bg-purple-600' : ''}>
                        {subRoleLabels[user.teacherSubRole] || user.teacherSubRole}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openAssignDialog(user)} className="gap-2"><UserCog className="h-4 w-4" />เปลี่ยนสิทธิ์</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>ปรับปรุงสิทธิ์การใช้งาน</DialogTitle><DialogDescription>กำหนดสิทธิ์ให้ {selectedUser?.fullName}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>สิทธิ์หลักระบบ</Label>
              <Select value={newRole} onValueChange={setNewRole}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select>
            </div>
            {newRole === "teacher" && (
              <div className="space-y-2"><Label>ตำแหน่งย่อย (สายบังคับบัญชา)</Label>
                <Select value={newSubRole} onValueChange={setNewSubRole}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{teacherSubRoles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button><Button onClick={handleAssignRole}>บันทึกข้อมูล</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}