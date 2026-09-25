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
import { Upload, FileText, Award, FolderOpen, Plus, Eye, Download, Trash2, Calendar, Loader2, ExternalLink, Pencil } from "lucide-react";
import api from "@/lib/axios";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

type PortfolioType = "certificate" | "project" | "activity" | "award";

interface PortfolioItem {
  id: string;
  title: string;
  type: PortfolioType | string;
  description?: string | null;
  date: string;
  file_name?: string | null; // ปรับให้ตรงกับฐานข้อมูล
  fileName?: string | null;
  file_path?: string | null;
  filePath?: string | null;
  fileUrl?: string | null;
  mime_type?: string | null;
  file_category?: string | null;
}

type PortfolioDetail = PortfolioItem;
type PortfolioFormState = { title: string; type: PortfolioType; description: string; google_drive_link: string };

const typeLabels: Record<PortfolioType, string> = {
  certificate: "ใบประกาศนียบัตร",
  project: "โครงการ",
  activity: "กิจกรรม",
  award: "รางวัล",
};

const typeColors: Record<PortfolioType, string> = {
  certificate: "bg-blue",
  project: "bg-success",
  activity: "bg-yellow",
  award: "bg-lightpurple",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const isExternalUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value));

const getPortfolioFilePath = (item?: Partial<PortfolioItem> | null) => item?.file_path || item?.filePath || "";

const getPortfolioFileName = (item?: Partial<PortfolioItem> | null) => {
  const explicitName = item?.file_name || item?.fileName;
  if (explicitName) return explicitName;

  const filePath = getPortfolioFilePath(item);
  if (!filePath) return "";
  if (isExternalUrl(filePath)) return "Google Drive";

  return filePath.split(/[\\/]/).pop() || "ไฟล์แนบ";
};

const getPortfolioFileUrl = (item?: Partial<PortfolioItem> | null) => {
  if (item?.fileUrl) return item.fileUrl;

  const filePath = getPortfolioFilePath(item);
  if (!filePath) return "";
  if (isExternalUrl(filePath)) return filePath;

  return `${API_BASE_URL}/${filePath.replace(/^\/+/, "")}`;
};

const getPortfolioTypeLabel = (type?: string | null) =>
  type && type in typeLabels ? typeLabels[type as PortfolioType] : "ทั่วไป";

const getPortfolioTypeColor = (type?: string | null) =>
  type && type in typeColors ? typeColors[type as PortfolioType] : "bg-blue";

const normalizePortfolioType = (type?: string | null): PortfolioType =>
  type && type in typeLabels ? type as PortfolioType : "certificate";

const Portfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<PortfolioFormState>({
    title: "",
    type: "certificate",
    description: "",
    google_drive_link: "",
  });
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<PortfolioDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<PortfolioFormState>({
    title: "",
    type: "certificate",
    description: "",
    google_drive_link: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
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

  const GoogleDriveIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#0F9D58" d="M8.3 3h7.4l7.4 12.8h-7.4L8.3 3Z" />
      <path fill="#F4B400" d="M.9 15.8 8.3 3l3.7 6.4-3.7 6.4H.9Z" />
      <path fill="#4285F4" d="M8.3 15.8h14.8L19.4 22H4.6l3.7-6.2Z" />
    </svg>
  );

  const handleAddItem = async () => {
    const title = newItem.title.trim();
    const description = newItem.description.trim();
    const googleDriveLink = newItem.google_drive_link.trim();

    if (!title || !googleDriveLink) {
      toast({ title: "กรุณากรอกข้อมูลและแนบลิงก์ Google Drive ให้ครบถ้วน", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const payload = {
      title,
      type: newItem.type,
      description,
      google_drive_link: googleDriveLink,
    };

    try {
      const res = await api.post('/index.php?page=save-portfolio', payload);

      if (res.data.status === 'success') {
        toast({ title: "อัปโหลดสำเร็จ", description: `เพิ่ม ${title} เรียบร้อยแล้ว` });
        setIsAddDialogOpen(false);
        setNewItem({ title: "", type: "certificate", description: "", google_drive_link: "" });
        fetchPortfolio(); // รีเฟรชข้อมูลใหม่
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "อัปโหลดไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const openEditDialog = (item: PortfolioItem) => {
    const filePath = getPortfolioFilePath(item);
    setEditItemId(item.id);
    setEditItem({
      title: item.title || "",
      type: normalizePortfolioType(item.type),
      description: item.description || "",
      google_drive_link: isExternalUrl(filePath) ? filePath : "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!editItemId) return;

    const title = editItem.title.trim();
    const description = editItem.description.trim();
    const googleDriveLink = editItem.google_drive_link.trim();

    if (!title) {
      toast({ title: "กรุณาระบุชื่อผลงาน", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await api.post('/index.php?page=update-portfolio', {
        id: editItemId,
        title,
        type: editItem.type,
        description,
        google_drive_link: googleDriveLink,
      });

      if (res.data.status === 'success') {
        toast({ title: "แก้ไขสำเร็จ", description: `อัปเดต ${title} เรียบร้อยแล้ว` });
        setIsEditDialogOpen(false);
        const updatedId = editItemId;
        setEditItemId(null);
        await fetchPortfolio();
        if (isDetailDialogOpen && detailItem?.id === updatedId) {
          await handleViewDetail(updatedId);
        }
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error?.response?.data?.message || "แก้ไขผลงานไม่สำเร็จ",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
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

  const getItemsByType = (type: PortfolioType) => items.filter((item) => item.type === type);

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
                  <Select value={newItem.type} onValueChange={(value) => setNewItem({ ...newItem, type: value as PortfolioType })}>
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
                  <Label>ลิงก์ Google Drive (ต้องตั้งค่าเป็น Anyone with the link)</Label>
                  <Input 
                    type="url" 
                    placeholder="https://drive.google.com/file/d/..."
                    value={newItem.google_drive_link}
                    onChange={(e) => setNewItem({ ...newItem, google_drive_link: e.target.value })} 
                  />
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

        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditItemId(null);
          }}
        >
          <DialogContent className="app-dialog-3xl">
            <DialogHeader>
              <DialogTitle>แก้ไขผลงาน</DialogTitle>
              <DialogDescription>ปรับข้อมูลผลงานและลิงก์เอกสารแนบ</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ประเภท</Label>
                <Select value={editItem.type} onValueChange={(value) => setEditItem({ ...editItem, type: value as PortfolioType })}>
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
                  value={editItem.title}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                  placeholder="ระบุชื่อผลงาน"
                />
              </div>
              <div className="space-y-2">
                <Label>รายละเอียด</Label>
                <Textarea
                  value={editItem.description}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  placeholder="อธิบายรายละเอียดผลงาน"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>ลิงก์ Google Drive</Label>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={editItem.google_drive_link}
                  onChange={(e) => setEditItem({ ...editItem, google_drive_link: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>ยกเลิก</Button>
              <Button onClick={handleUpdateItem} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                บันทึกการแก้ไข
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                    <Badge className={getPortfolioTypeColor(detailItem.type)}>
                      {getPortfolioTypeLabel(detailItem.type)}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> อัปโหลดเมื่อ: {detailItem.date}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground">{detailItem.title}</h3>
                  
                  <div className="bg-muted/30 p-4 rounded-lg text-sm text-foreground whitespace-pre-wrap border border-border mt-2">
                    {detailItem.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                  </div>

                  {getPortfolioFileName(detailItem) && (
                    <div className="mt-6 border border-border rounded-lg p-3 flex items-center justify-between bg-card">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 text-primary rounded-md shrink-0">
                          <GoogleDriveIcon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{getPortfolioFileName(detailItem)}</span>
                          <span className="text-xs text-muted-foreground truncate" title={getPortfolioFilePath(detailItem)}>
                            {getPortfolioFilePath(detailItem) || "ไฟล์แนบระบบ"}
                          </span>
                        </div>
                      </div>
                      
                      {/* ปุ่มเปิดดูไฟล์แนบบนหน้าเบราว์เซอร์แยกต่างหาก */}
                      {getPortfolioFileUrl(detailItem) && (
                        <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
                          <a href={getPortfolioFileUrl(detailItem)} target="_blank" rel="noopener noreferrer">
                            เปิดดู <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        openEditDialog(detailItem);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      แก้ไข
                    </Button>
                  </div>
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
                  {(tab === "all" ? items : getItemsByType(tab as PortfolioType)).length === 0 ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground">ไม่พบผลงานในหมวดหมู่นี้</div>
                  ) : (
                    (tab === "all" ? items : getItemsByType(tab as PortfolioType)).map((item) => (
                      <Card key={item.id} onClick={() => handleViewDetail(item.id)} className="hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Badge className={getPortfolioTypeColor(item.type)}>{getPortfolioTypeLabel(item.type)}</Badge>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(item);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
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
                              <GoogleDriveIcon className="h-3 w-3" />
                              {getPortfolioFileName(item) || 'ไม่มีไฟล์แนบ'}
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
