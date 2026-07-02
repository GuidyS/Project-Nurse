import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { CheckCircle, XCircle, Clock, FileText, Loader2 } from "lucide-react";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface ApprovalRequest {
  id: string;
  type: string;
  targetRefType?: string | null;
  targetRefId?: string | null;
  title: string;
  requester: string;
  description: string;
  date: string;
  status: ApprovalStatus;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  reviewer?: string | null;
}

const typeLabels: Record<string, string> = {
  grade_change: "แก้ไขเกรด",
  student_transfer: "รับมอบนักศึกษา",
  project_request: "โครงการ",
  document_approve: "เอกสาร",
};

const typeColors: Record<string, string> = {
  grade_change: "bg-blue-500",
  student_transfer: "bg-purple-500",
  project_request: "bg-green-500",
  document_approve: "bg-orange-500",
};

const getTypeBadge = (type: string) => (
  <Badge className={typeColors[type] || "bg-slate-500"}>
    {typeLabels[type] || type}
  </Badge>
);

const getStatusBadge = (status: ApprovalStatus) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          <Clock className="mr-1 h-3 w-3" />
          รอดำเนินการ
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          อนุมัติ
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          ปฏิเสธ
        </Badge>
      );
  }
};

export default function Approvals() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApprovals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/index.php?page=get-approval-requests");
      const data = response.data?.data;
      setApprovals(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "โหลดคำขออนุมัติไม่สำเร็จ",
        description: "ไม่สามารถดึงข้อมูลคำขอจากฐานข้อมูลได้",
        variant: "destructive",
      });
      setApprovals([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const updateApprovalStatus = async (id: string, action: "approve" | "reject") => {
    const endpoint = action === "approve" ? "approve-request" : "reject-request";
    const successTitle = action === "approve" ? "อนุมัติคำขอสำเร็จ" : "ปฏิเสธคำขอสำเร็จ";
    const failureTitle = action === "approve" ? "อนุมัติคำขอไม่สำเร็จ" : "ปฏิเสธคำขอไม่สำเร็จ";

    try {
      setUpdatingId(id);
      await api.post(`/index.php?page=${endpoint}`, { id });
      toast({ title: successTitle });
      await fetchApprovals();
    } catch (error) {
      toast({
        title: failureTitle,
        description: "โปรดลองอีกครั้งหรือตรวจสอบการเชื่อมต่อฐานข้อมูล",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingApprovals = approvals.filter((approval) => approval.status === "pending");
  const approvedCount = approvals.filter((approval) => approval.status === "approved").length;
  const rejectedCount = approvals.filter((approval) => approval.status === "rejected").length;

  const renderRows = (rows: ApprovalRequest[], showActions: boolean) => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
            กำลังโหลดคำขออนุมัติ...
          </TableCell>
        </TableRow>
      );
    }

    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
            ไม่พบคำขออนุมัติ
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((approval) => (
      <TableRow key={approval.id}>
        <TableCell>{getTypeBadge(approval.type)}</TableCell>
        <TableCell className="font-medium">{approval.requester}</TableCell>
        <TableCell className="max-w-[360px]">
          <div className="space-y-1">
            <p>{approval.description}</p>
            {approval.targetRefId && (
              <p className="text-xs text-muted-foreground">
                อ้างอิง: {approval.targetRefType || "-"} / {approval.targetRefId}
              </p>
            )}
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap">{approval.date}</TableCell>
        {showActions ? (
          <TableCell>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={updatingId === approval.id}
                onClick={() => updateApprovalStatus(approval.id, "approve")}
              >
                {updatingId === approval.id ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle className="mr-1 h-3 w-3" />
                )}
                อนุมัติ
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={updatingId === approval.id}
                onClick={() => updateApprovalStatus(approval.id, "reject")}
              >
                <XCircle className="mr-1 h-3 w-3" />
                ปฏิเสธ
              </Button>
            </div>
          </TableCell>
        ) : (
          <TableCell>{getStatusBadge(approval.status)}</TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">อนุมัติคำขอ</h1>
        <p className="text-muted-foreground">ดำเนินการตามคำขอจากอาจารย์และผู้ใช้งานในระบบ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ปฏิเสธ</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            รอดำเนินการ
            {pendingApprovals.length > 0 && <Badge className="ml-2">{pendingApprovals.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>คำขอที่รอดำเนินการ</CardTitle>
              <CardDescription>คำขอที่รอการอนุมัติจากผู้ดูแลระบบ</CardDescription>
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
              <CardDescription>ประวัติคำขอทั้งหมดจากฐานข้อมูล</CardDescription>
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