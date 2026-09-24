import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, User, FileEdit, Trash2, Plus, Shield, FileUp, FileDown } from "lucide-react";
import ExportButton from "@/components/dashboard/ExportButton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: "create" | "update" | "delete" | "role_change" | "export" | "import";
  resource: string;
  details: string;
  ipAddress: string;
}

const actionIcons: Record<AuditEntry["action"], React.ReactNode> = {
  create: <Plus className="h-4 w-4" />,
  update: <FileEdit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  role_change: <Shield className="h-4 w-4" />,
  import: <FileDown className="h-4 w-4" />,
  export: <FileUp className="h-4 w-4" />,
};

const actionLabels: Record<AuditEntry["action"], string> = {
  create: "สร้าง",
  update: "แก้ไข",
  delete: "ลบ",
  role_change: "เปลี่ยน Role",
  import: "นำเข้าข้อมูล",
  export: "ส่งออกข้อมูล",
};

const actionColors: Record<AuditEntry["action"], string> = {
  create: "bg-success",
  update: "bg-blue",
  delete: "bg-destructive",
  role_change: "bg-yellow",
  import: "bg-lightorange",
  export: "bg-orange",
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/index.php?page=get-audit-logs");
        if (Array.isArray(response.data)) {
          setLogs(response.data);
        } else {
          setLogs([]);
        }
      } catch (error) {
        toast({ title: "โหลดข้อมูล Audit Log ล้มเหลว", variant: "destructive" });
        setLogs([]);
      }
    };
    fetchLogs();
  }, [toast]);

  const filteredLogs = logs.filter((entry) => {
    const matchesSearch =
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    const matchesRole = roleFilter === "all" || entry.userRole === roleFilter;
    return matchesSearch && matchesAction && matchesRole;
  });

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Audit Log</h1>
          <p className="app-page-description">ประวัติการสร้าง แก้ไข และลบข้อมูลของผู้ใช้ทั้งหมด</p>
        </div>
        <ExportButton reportName="Audit-Log" />
      </div>

      {/* Summary Cards ตัด เข้า/ออกระบบ ออก เหลือ 3 การ์ด */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="app-stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Plus className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.filter((e) => e.action === "create").length}</p>
                <p className="text-xs text-muted-foreground">สร้างใหม่</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="app-stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileEdit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.filter((e) => e.action === "update").length}</p>
                <p className="text-xs text-muted-foreground">แก้ไข</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="app-stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.filter((e) => e.action === "delete").length}</p>
                <p className="text-xs text-muted-foreground">ลบ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="app-section-card">
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
                  <SelectItem value="role_change">เปลี่ยน Role</SelectItem>
                  <SelectItem value="import">นำเข้าข้อมูล</SelectItem>
                  <SelectItem value="export">ส่งออกข้อมูล</SelectItem>
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
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    ไม่มีประวัติการใช้งาน
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((entry) => (
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
                      <Badge className={`gap-1 whitespace-nowrap ${actionColors[entry.action]}`}>
                        {actionIcons[entry.action]}
                        {actionLabels[entry.action]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">[{entry.resource}]</span> {entry.details}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{entry.ipAddress}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}