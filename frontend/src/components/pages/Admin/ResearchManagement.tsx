import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import api from "@/lib/axios";

export default function ResearchManagement() {
  const [researchList, setResearchList] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    publication_date: "",
    article_type: "research",
    journal_name: "",
    issue_number: "",
    first_author_id: "",
    corresponding_author_id: "",
    co_author_ids: [] as string[],
  });

  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [res, fac] = await Promise.all([
        api.get("/index.php?page=get-research"),
        api.get("/index.php?page=get-research-faculty")
      ]);
      setResearchList(res.data.data || []);
      setFacultyList(fac.data.data || []);
    } catch (error) {
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.research_id);
      setFormData({
        title: item.title,
        publication_date: item.publication_date || "",
        article_type: item.article_type || "research",
        journal_name: item.journal_name || "",
        issue_number: item.issue_number || "",
        first_author_id: item.first_author_id ? String(item.first_author_id) : "",
        corresponding_author_id: item.corresponding_author_id ? String(item.corresponding_author_id) : "",
        co_author_ids: Array.isArray(item.co_author_ids) ? item.co_author_ids.map(String) : [],
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        publication_date: "",
        article_type: "research",
        journal_name: "",
        issue_number: "",
        first_author_id: "",
        corresponding_author_id: "",
        co_author_ids: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.publication_date) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        research_id: editingId,
        ...formData
      };
      const res = await api.post("/index.php?page=save-research", payload);
      if (res.data.status === "success") {
        toast({ title: res.data.message });
        setIsDialogOpen(false);
        fetchData();
      } else {
        throw new Error(res.data.message);
      }
    } catch (error: any) {
      toast({ title: error.message || "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await api.post("/index.php?page=delete-research", { research_id: deletingId });
      if (res.data.status === "success") {
        toast({ title: res.data.message });
        setIsDeleteDialogOpen(false);
        fetchData();
      } else {
        throw new Error(res.data.message);
      }
    } catch (error: any) {
      toast({ title: error.message || "Failed to delete", variant: "destructive" });
    }
  };

  const filteredList = researchList.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.journal_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Research & Innovation</h2>
          <p className="text-muted-foreground">จัดการข้อมูลงานวิจัยและบทความวิชาการ (บันทึกโดย Admin)</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มผลงานใหม่
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>รายการผลงานวิจัย</CardTitle>
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
                  <TableHead>ชื่องานวิจัย/บทความ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>วารสาร/ฉบับที่</TableHead>
                  <TableHead>วันที่ตีพิมพ์</TableHead>
                  <TableHead>ผู้เขียนหลัก (First)</TableHead>
                  <TableHead>ผู้ติดต่อ (Corresponding)</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">ไม่พบข้อมูล</TableCell></TableRow>
                ) : filteredList.map((item) => (
                  <TableRow key={item.research_id}>
                    <TableCell className="font-medium max-w-[300px] truncate" title={item.title}>
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.article_type === "research" ? "default" : "secondary"}>
                        {item.article_type === "research" ? "งานวิจัย" : "บทความวิชาการ/ตำรา"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.journal_name || "-"}</div>
                      <div className="text-xs text-muted-foreground">{item.issue_number}</div>
                    </TableCell>
                    <TableCell>{item.publication_date ? new Date(item.publication_date).toLocaleDateString("th-TH") : "-"}</TableCell>
                    <TableCell>{item.first_author_name || "-"}</TableCell>
                    <TableCell>{item.corresponding_author_name || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setDeletingId(item.research_id); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "แก้ไขผลงานวิจัย" : "เพิ่มผลงานวิจัยใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>ชื่องานวิจัย/บทความ <span className="text-red-500">*</span></Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="ระบุชื่อเต็ม"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ประเภทผลงาน <span className="text-red-500">*</span></Label>
                <Select value={formData.article_type} onValueChange={(val) => setFormData({...formData, article_type: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">งานวิจัย (Research)</SelectItem>
                    <SelectItem value="academic_article">บทความวิชาการ/ตำรา</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>วันที่ตีพิมพ์ (Publication Date) <span className="text-red-500">*</span></Label>
                <Input 
                  type="date" 
                  value={formData.publication_date} 
                  onChange={(e) => setFormData({...formData, publication_date: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อวารสาร (Journal Name)</Label>
                <Input 
                  value={formData.journal_name} 
                  onChange={(e) => setFormData({...formData, journal_name: e.target.value})} 
                  placeholder="เช่น TCI กลุ่ม 1..."
                />
              </div>
              <div className="space-y-2">
                <Label>ฉบับที่/เลขหน้า (Issue/Pages)</Label>
                <Input 
                  value={formData.issue_number} 
                  onChange={(e) => setFormData({...formData, issue_number: e.target.value})} 
                  placeholder="เช่น Vol. 1 No. 2 (2024)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ผู้เขียนหลัก (First Author)</Label>
                <Select value={formData.first_author_id} onValueChange={(val) => setFormData({...formData, first_author_id: val})}>
                  <SelectTrigger><SelectValue placeholder="เลือกผู้เขียนหลัก" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- ไม่มี / บุคคลภายนอก --</SelectItem>
                    {facultyList.map(f => (
                      <SelectItem key={f.faculty_id} value={String(f.faculty_id)}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ผู้ติดต่อประสานงาน (Corresponding Author)</Label>
                <Select value={formData.corresponding_author_id} onValueChange={(val) => setFormData({...formData, corresponding_author_id: val})}>
                  <SelectTrigger><SelectValue placeholder="เลือกผู้ติดต่อประสานงาน" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- ไม่มี / บุคคลภายนอก --</SelectItem>
                    {facultyList.map(f => (
                      <SelectItem key={f.faculty_id} value={String(f.faculty_id)}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>ผู้แต่งร่วม (Co-Authors)</Label>
              <div className="text-xs text-muted-foreground mb-2">เลือกผู้แต่งร่วมอื่นๆ ในคณะ (สามารถเลือกได้หลายคน)</div>
              {/* To make it simple, we can just use checkboxes or a multi-select library. Since we only have shadcn select which is single, let's render checkboxes for faculty for co-authors */}
              <div className="border rounded-md p-4 max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
                {facultyList.map(f => (
                  <label key={f.faculty_id} className="flex items-center space-x-2 text-sm">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      checked={formData.co_author_ids.includes(String(f.faculty_id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, co_author_ids: [...formData.co_author_ids, String(f.faculty_id)]});
                        } else {
                          setFormData({...formData, co_author_ids: formData.co_author_ids.filter(id => id !== String(f.faculty_id))});
                        }
                      }}
                    />
                    <span>{f.name}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "บันทึกข้อมูล"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="ยืนยันการลบข้อมูล"
        description="คุณต้องการลบข้อมูลผลงานวิจัยนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        onConfirm={handleDelete}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        variant="destructive"
      />
    </div>
  );
}
