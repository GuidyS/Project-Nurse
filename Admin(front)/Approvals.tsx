import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface ApprovalRequest {
  id: string;
  type: string;
  title: string;
  requester: string;
  description: string;
  date: string;
  status: ApprovalStatus;
}

const typeLabels: Record<string, string> = {
  grade_change: "แก้ไขเกรด",
  student_transfer: "รับมอบนักศึกษา",
  project_request: "โครงการ",
  document_approve: "เอกสาร",
};

export default function Approvals() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const { toast } = useToast();

  const fetchApprovals = async () => {
    try {
      const response = await api.get("/components/Admin/get_approval_requests.php");
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setApprovals(response.data.data);
      } else if (Array.isArray(response.data)) {
        setApprovals(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch approvals", error);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      // เรียกใช้ API ตามการกระทำ
      const endpoint = action === "approved" 
          ? "/components/Admin/approve_request.php" 
          : "/components/Admin/reject_request.php";
          
      await api.post(endpoint, { id: id, reviewNote: "" });
      
      setApprovals(approvals.map(app => app.id === id ? { ...app, status: action } : app));
      toast({ title: action === "approved" ? "อนุมัติสำเร็จ" : "ปฏิเสธคำขอ" });
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาดในการบันทึก", variant: "destructive" });
    }
  };

  const pendingApprovals = approvals.filter(a => a.status === "pending");

  const renderRows = (data: ApprovalRequest[], isPendingView: boolean) => (
    data.map((approval) => (
      <TableRow key={approval.id}>
        <TableCell>
          <Badge variant="outline">{typeLabels[approval.type] || approval.type}</Badge>
        </TableCell>
        <TableCell className="font-medium">{approval.requester}</TableCell>
        <TableCell>
          <p className="font-medium text-sm">{approval.title}</p>
          <p className="text-xs text-muted-foreground">{approval.description}</p>
        </TableCell>
        <TableCell className="text-muted-foreground">{approval.date}</TableCell>
        {isPendingView ? (
          <TableCell>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-success hover:bg-success/10" onClick={() => handleAction(approval.id, "approved")}>
                <CheckCircle className="h-4 w-4 mr-1" /> อนุมัติ
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleAction(approval.id, "rejected")}>
                <XCircle className="h-4 w-4 mr-1" /> ปฏิเสธ
              </Button>
            </div>
          </TableCell>
        ) : (
          <TableCell>
            {approval.status === "pending" && <Badge variant="secondary" className="bg-warning text-white"><Clock className="h-3 w-3 mr-1"/> รอดำเนินการ</Badge>}
            {approval.status === "approved" && <Badge variant="secondary" className="bg-success text-white"><CheckCircle className="h-3 w-3 mr-1"/> อนุมัติแล้ว</Badge>}
            {approval.status === "rejected" && <Badge variant="secondary" className="bg-destructive text-white"><XCircle className="h-3 w-3 mr-1"/> ปฏิเสธ</Badge>}
          </TableCell>
        )}
      </TableRow>
    ))
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">อนุมัติคำขอ</h1>
        <p className="text-muted-foreground">จัดการคำขออนุมัติต่างๆ ในระบบ</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">รออนุมัติ ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="all">คำขอทั้งหมด</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>รายการรออนุมัติ</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>ผู้ร้องขอ</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead>การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderRows(pendingApprovals, true)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>คำขอทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>ผู้ร้องขอ</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead>สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderRows(approvals, false)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}