import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Filter, Download, User, FileEdit, Trash2, Plus, LogIn, LogOut, Shield } from "lucide-react";
import { ExportButton } from "@/components/dashboard/ExportButton";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: "create" | "update" | "delete" | "login" | "logout" | "role_change";
  resource: string;
  details: string;
  ipAddress: string;
}

const mockAuditLog: AuditEntry[] = [
  { id: "1", timestamp: "2569-02-03 14:32:15", user: "admin@faculty.edu", userRole: "admin", action: "create", resource: "ผู้ใช้", details: "สร้างบัญชี instructor2@faculty.edu", ipAddress: "192.168.1.100" },
  { id: "2", timestamp: "2569-02-03 14:15:42", user: "dean@faculty.edu", userRole: "teacher", action: "update", resource: "รายงาน", details: "แก้ไขรายงาน KPI ประจำเดือน", ipAddress: "192.168.1.105" },
  { id: "3", timestamp: "2569-02-03 13:58:20", user: "student1@student.edu", userRole: "student", action: "login", resource: "ระบบ", details: "เข้าสู่ระบบสำเร็จ", ipAddress: "10.0.0.55" },
  { id: "4", timestamp: "2569-02-03 13:45:33", user: "admin@faculty.edu", userRole: "admin", action: "role_change", resource: "Role", details: "เปลี่ยน Role ของ advisor@faculty.edu เป็น advisor", ipAddress: "192.168.1.100" },
  { id: "5", timestamp: "2569-02-03 12:30:18", user: "instructor1@faculty.edu", userRole: "teacher", action: "update", resource: "เกรด", details: "บันทึกเกรดวิชา CS101", ipAddress: "192.168.1.110" },
  { id: "6", timestamp: "2569-02-03 11:22:05", user: "admin@faculty.edu", userRole: "admin", action: "delete", resource: "ผู้ใช้", details: "ลบบัญชี temp@faculty.edu", ipAddress: "192.168.1.100" },
  { id: "7", timestamp: "2569-02-03 10:15:42", user: "student2@student.edu", userRole: "student", action: "create", resource: "Portfolio", details: "อัปโหลดใบประกาศนียบัตร", ipAddress: "10.0.0.60" },
  { id: "8", timestamp: "2569-02-03 09:45:30", user: "dean@faculty.edu", userRole: "teacher", action: "logout", resource: "ระบบ", details: "ออกจากระบบ", ipAddress: "192.168.1.105" },
  { id: "9", timestamp: "2569-02-02 16:30:00", user: "admin@faculty.edu", userRole: "admin", action: "create", resource: "รายวิชา", details: "เพิ่มรายวิชา CS201", ipAddress: "192.168.1.100" },
  { id: "10", timestamp: "2569-02-02 15:20:45", user: "advisor@faculty.edu", userRole: "teacher", action: "update", resource: "Advice Note", details: "เพิ่ม Advice Note ให้นักศึกษา 64010001", ipAddress: "192.168.1.115" },
];

const actionIcons: Record<AuditEntry["action"], React.ReactNode> = {
  create: <Plus className="h-4 w-4" />,
  update: <FileEdit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  role_change: <Shield className="h-4 w-4" />,
};

const actionLabels: Record<AuditEntry["action"], string> = {
  create: "สร้าง",
  update: "แก้ไข",
  delete: "ลบ",
  login: "เข้าสู่ระบบ",
  logout: "ออกจากระบบ",
  role_change: "เปลี่ยน Role",
};

const actionColors: Record<AuditEntry["action"], string> = {
  create: "bg-success",
  update: "bg-primary",
  delete: "bg-destructive",
  login: "bg-success",
  logout: "bg-muted-foreground",
  role_change: "bg-warning",
};

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredLogs = mockAuditLog.filter((entry) => {
    const matchesSearch = 
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    const matchesRole = roleFilter === "all" || entry.userRole === roleFilter;
    return matchesSearch && matchesAction && matchesRole;
  });

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
            <p className="text-muted-foreground">ประวัติการใช้งานระบบของผู้ใช้ทั้งหมด</p>
          </div>
          <ExportButton reportName="Audit-Log" />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Plus className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockAuditLog.filter((e) => e.action === "create").length}</p>
                  <p className="text-xs text-muted-foreground">สร้างใหม่</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileEdit className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockAuditLog.filter((e) => e.action === "update").length}</p>
                  <p className="text-xs text-muted-foreground">แก้ไข</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockAuditLog.filter((e) => e.action === "delete").length}</p>
                  <p className="text-xs text-muted-foreground">ลบ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <LogIn className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockAuditLog.filter((e) => e.action === "login" || e.action === "logout").length}</p>
                  <p className="text-xs text-muted-foreground">เข้า/ออกระบบ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>รายการ Audit Log</CardTitle>
                <CardDescription>แสดง {filteredLogs.length} รายการ</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหา..."
                    className="pl-9 w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="การกระทำ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="create">สร้าง</SelectItem>
                    <SelectItem value="update">แก้ไข</SelectItem>
                    <SelectItem value="delete">ลบ</SelectItem>
                    <SelectItem value="login">เข้าสู่ระบบ</SelectItem>
                    <SelectItem value="logout">ออกจากระบบ</SelectItem>
                    <SelectItem value="role_change">เปลี่ยน Role</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">อาจารย์</SelectItem>
                    <SelectItem value="student">นักศึกษา</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>การกระทำ</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {entry.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{entry.user}</p>
                          <Badge variant="outline" className="text-xs">{entry.userRole}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${actionColors[entry.action]}`}>
                        {actionIcons[entry.action]}
                        {actionLabels[entry.action]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">[{entry.resource}]</span> {entry.details}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{entry.ipAddress}</TableCell>
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
