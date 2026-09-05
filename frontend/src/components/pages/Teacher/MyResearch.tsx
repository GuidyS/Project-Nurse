import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Info } from "lucide-react";
import api from "@/lib/axios";

export default function MyResearch() {
  const [researchList, setResearchList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/index.php?page=get-research");
      setResearchList(res.data.data || []);
    } catch (error) {
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredList = researchList.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.journal_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ผลงานวิจัยของฉัน (My Research)</h2>
        <p className="text-muted-foreground">ผลงานวิจัยและบทความวิชาการที่มีชื่อของคุณร่วมอยู่ด้วย</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center">
              นับผลงานสภาการพยาบาลได้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">คุณเป็นผู้เขียนหลัก (First Author) หรือผู้ติดต่อประสานงาน (Corresponding Author)</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-800">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-slate-800 flex items-center">
              นับผลงานมหาวิทยาลัย (อว.) ได้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">คุณเป็นผู้เขียนร่วม (Co-Author) นับตามรอบปีการศึกษา</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
              บทความวิชาการ / ตำรา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">ไม่สามารถนับเป็นคุณสมบัติหลักสูตรของสภาการพยาบาลได้</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>รายการผลงาน</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่องานวิจัย/วารสาร..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสสี</TableHead>
                  <TableHead>ชื่องานวิจัย/บทความ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>วารสาร/ฉบับที่</TableHead>
                  <TableHead>วันที่ตีพิมพ์</TableHead>
                  <TableHead>บทบาทของคุณ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">ไม่พบข้อมูลผลงานวิจัยของคุณ</TableCell></TableRow>
                ) : filteredList.map((item) => (
                  <TableRow key={item.research_id}>
                    <TableCell>
                      {item.color_code === 'red' && <Badge variant="destructive" className="bg-red-500">แดง</Badge>}
                      {item.color_code === 'black' && <Badge variant="secondary" className="bg-slate-800 text-white hover:bg-slate-700">ดำ</Badge>}
                      {item.color_code === 'blue' && <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">ฟ้า</Badge>}
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate" title={item.title}>
                      {item.title}
                    </TableCell>
                    <TableCell>
                      {item.article_type === "research" ? "งานวิจัย" : "บทความวิชาการ/ตำรา"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.journal_name || "-"}</div>
                      <div className="text-xs text-muted-foreground">{item.issue_number}</div>
                    </TableCell>
                    <TableCell>{item.publication_date ? new Date(item.publication_date).toLocaleDateString("th-TH") : "-"}</TableCell>
                    <TableCell>
                      {item.color_code === 'red' ? "First / Corresponding" : "Co-Author"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
