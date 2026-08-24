import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Award, FolderOpen, Plus, Eye, Download, Trash2, Calendar, Loader2, ExternalLink } from "lucide-react";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

interface PortfolioItem {
  id: string;
  title: string;
  type: "certificate" | "project" | "activity" | "award";
  description: string;
  date: string;
  file_name?: string; // ปรับให้ตรงกับฐานข้อมูล
}

const typeLabels: Record<PortfolioItem["type"], string> = {
  certificate: "ใบประกาศนียบัตร",
  project: "โครงการ",
  activity: "กิจกรรม",
  award: "รางวัล",
};

const typeColors: Record<PortfolioItem["type"], string> = {
  certificate: "bg-primary",
  project: "bg-success",
  activity: "bg-warning",
  award: "bg-purple-500",
};

const Portfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", type: "certificate" as PortfolioItem["type"], description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/index.php?page=get-portfolio');
      if (res.data.status === 'success') {
        setItems(res.data.data);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถโหลดข้อมูล Portfolio ได้", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title || !selectedFile) {
      toast({ title: "กรุณากรอกข้อมูลและแนบไฟล์ให้ครบถ้วน", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', newItem.title);
    formData.append('type', newItem.type);
    formData.append('description', newItem.description);
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/index.php?page=save-portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        toast({ title: "อัปโหลดสำเร็จ", description: `เพิ่ม ${newItem.title} เรียบร้อยแล้ว` });
        setIsAddDialogOpen(false);
        setNewItem({ title: "", type: "certificate", description: "" });
        setSelectedFile(null);
        fetchPortfolio(); // รีเฟรชข้อมูลใหม่
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "อัปโหลดไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setPendingDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!pendingDeleteId) return;

    setIsDeleting(true);
    try {
      const res = await api.delete(`/index.php?page=delete-portfolio&id=${pendingDeleteId}`);
      if (res.data.status === 'success') {
        toast({ title: "ลบสำเร็จ", description: "ลบรายการออกจาก Portfolio แล้ว" });
        setIsConfirmOpen(false);
        setPendingDeleteId(null);
        fetchPortfolio();
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถลบผลงานได้", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      setIsDetailDialogOpen(true); // เปิดหน้าต่างขึ้นมาก่อนเพื่อโชว์ Loading
      setIsLoadingDetail(true);
      setDetailItem(null); // เคลียร์ข้อมูลเก่าทิ้ง

      const res = await api.get(`/index.php?page=get-portfolio-detail&id=${id}`);
      if (res.data.status === 'success') {
        setDetailItem(res.data.data);
      } else {
        toast({ title: "ข้อผิดพลาด", description: "ไม่พบข้อมูลผลงานชิ้นนี้", variant: "destructive" });
        setIsDetailDialogOpen(false);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดรายละเอียดล้มเหลว", variant: "destructive" });
      setIsDetailDialogOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getItemsByType = (type: PortfolioItem["type"]) => items.filter((item) => item.type === type);

  return (
    <>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-snug">แฟ้มสะสมผลงาน</h1>
            <p className="text-muted-foreground">จัดการ Portfolio และใบประกาศนียบัตรของคุณ</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                เพิ่มผลงาน
              </Button>
            </DialogTrigger>
            <DialogContent className="app-dialog-3xl">
              <DialogHeader>
                <DialogTitle>เพิ่มผลงานใหม่</DialogTitle>
                <DialogDescription>อัปโหลดใบประกาศนียบัตร โครงการ หรือกิจกรรม</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>ประเภท</Label>
                  <Select value={newItem.type} onValueChange={(value: PortfolioItem["type"]) => setNewItem({ ...newItem, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">ใบประกาศนียบัตร</SelectItem>
                      <SelectItem value="project">โครงการ</SelectItem>
                      <SelectItem value="activity">กิจกรรม</SelectItem>
                      <SelectItem value="award">รางวัล</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ชื่อผลงาน</Label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="ระบุชื่อผลงาน"
                  />
                </div>
                <div className="space-y-2">
                  <Label>รายละเอียด</Label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="อธิบายรายละเอียดผลงาน"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ไฟล์แนบ</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Label htmlFor="portfolio-upload" className="cursor-pointer text-sm">
                      <span className="text-primary font-medium">คลิกเพื่อเลือกไฟล์</span>
                    </Label>
                    <Input
                      id="portfolio-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {selectedFile && (
                      <p className="mt-2 text-xs text-foreground">{selectedFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isUploading}>ยกเลิก</Button>
                <Button onClick={handleAddItem} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  อัปโหลด
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="app-dialog-3xl">
            <DialogHeader>
              <DialogTitle>รายละเอียดผลงาน</DialogTitle>
              <DialogDescription>ข้อมูลเชิงลึกของแฟ้มสะสมผลงาน</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {isLoadingDetail ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : detailItem ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={typeColors[detailItem.type as PortfolioItem["type"]] || "bg-secondary"}>
                      {typeLabels[detailItem.type as PortfolioItem["type"]] || "ทั่วไป"}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> อัปโหลดเมื่อ: {detailItem.date}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground">{detailItem.title}</h3>
                  
                  <div className="bg-muted/30 p-4 rounded-lg text-sm text-foreground whitespace-pre-wrap border border-border mt-2">
                    {detailItem.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                  </div>

                  {detailItem.fileName && (
                    <div className="mt-6 border border-border rounded-lg p-3 flex items-center justify-between bg-card">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-primary/10 text-primary rounded-md shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{detailItem.fileName}</span>
                          <span className="text-xs text-muted-foreground">ไฟล์แนบระบบ</span>
                        </div>
                      </div>
                      
                      {/* ปุ่มเปิดดูไฟล์แนบบนหน้าเบราว์เซอร์แยกต่างหาก */}
                      {detailItem.fileUrl && (
                        <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
                          <a href={detailItem.fileUrl} target="_blank" rel="noopener noreferrer">
                            เปิดดู <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">ไม่พบข้อมูล</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getItemsByType("certificate").length}</p>
                  <p className="text-xs text-muted-foreground">ใบประกาศนียบัตร</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <FolderOpen className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getItemsByType("project").length}</p>
                  <p className="text-xs text-muted-foreground">โครงการ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Calendar className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getItemsByType("activity").length}</p>
                  <p className="text-xs text-muted-foreground">กิจกรรม</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Award className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getItemsByType("award").length}</p>
                  <p className="text-xs text-muted-foreground">รางวัล</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Items */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด ({items.length})</TabsTrigger>
            <TabsTrigger value="certificate">ใบประกาศ ({getItemsByType("certificate").length})</TabsTrigger>
            <TabsTrigger value="project">โครงการ ({getItemsByType("project").length})</TabsTrigger>
            <TabsTrigger value="activity">กิจกรรม ({getItemsByType("activity").length})</TabsTrigger>
            <TabsTrigger value="award">รางวัล ({getItemsByType("award").length})</TabsTrigger>
          </TabsList>

          {["all", "certificate", "project", "activity", "award"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {isLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(tab === "all" ? items : getItemsByType(tab as PortfolioItem["type"])).length === 0 ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground">ไม่พบผลงานในหมวดหมู่นี้</div>
                  ) : (
                    (tab === "all" ? items : getItemsByType(tab as PortfolioItem["type"])).map((item) => (
                      <Card key={item.id} onClick={() => handleViewDetail(item.id)} className="hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Badge className={typeColors[item.type]}>{typeLabels[item.type]}</Badge>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 z-10" 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  openDeleteConfirm(item.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>                           
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {item.file_name || 'ไม่มีไฟล์แนบ'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.date}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) setPendingDeleteId(null);
        }}
        title="ยืนยันการลบ"
        description="คุณแน่ใจหรือไม่ที่จะลบผลงานนี้?"
        onConfirm={handleDeleteItem}
        isLoading={isDeleting}
      />
    </>
  );
}

export default Portfolio;