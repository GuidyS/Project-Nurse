import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Award, FolderOpen, Plus, Eye, Download, Trash2, Calendar, Image } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  type: "certificate" | "project" | "activity" | "award";
  description: string;
  date: string;
  fileName?: string;
  imageUrl?: string;
}

const mockPortfolioItems: PortfolioItem[] = [
  { id: "1", title: "ใบประกาศนียบัตร Python Certification", type: "certificate", description: "ผ่านการอบรมหลักสูตร Python for Data Science", date: "2568-12-15", fileName: "python_cert.pdf" },
  { id: "2", title: "โครงการพัฒนาแอปพลิเคชัน", type: "project", description: "พัฒนาแอปพลิเคชันจัดการงานสำหรับนักศึกษา", date: "2568-11-20", fileName: "project_doc.pdf" },
  { id: "3", title: "รางวัลชนะเลิศ Hackathon", type: "award", description: "รางวัลชนะเลิศการแข่งขัน Hackathon ระดับมหาวิทยาลัย", date: "2568-10-05", fileName: "hackathon_award.jpg" },
  { id: "4", title: "กิจกรรมจิตอาสา", type: "activity", description: "เข้าร่วมกิจกรรมจิตอาสาช่วยเหลือชุมชน", date: "2568-09-12", fileName: "volunteer.pdf" },
];

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

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>(mockPortfolioItems);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", type: "certificate" as PortfolioItem["type"], description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddItem = () => {
    if (!newItem.title || !selectedFile) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบถ้วน", variant: "destructive" });
      return;
    }

    const item: PortfolioItem = {
      id: Date.now().toString(),
      title: newItem.title,
      type: newItem.type,
      description: newItem.description,
      date: new Date().toISOString().split("T")[0],
      fileName: selectedFile.name,
    };

    setItems([item, ...items]);
    setIsAddDialogOpen(false);
    setNewItem({ title: "", type: "certificate", description: "" });
    setSelectedFile(null);
    toast({ title: "อัปโหลดสำเร็จ", description: `เพิ่ม ${item.title} เรียบร้อยแล้ว` });
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast({ title: "ลบสำเร็จ", description: "ลบรายการออกจาก Portfolio แล้ว" });
  };

  const getItemsByType = (type: PortfolioItem["type"]) => items.filter((item) => item.type === type);

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">แฟ้มสะสมผลงาน</h1>
            <p className="text-muted-foreground">จัดการ Portfolio และใบประกาศนียบัตรของคุณ</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                เพิ่มผลงาน
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
                <Button onClick={handleAddItem}>อัปโหลด</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(tab === "all" ? items : getItemsByType(tab as PortfolioItem["type"])).map((item) => (
                  <Card key={item.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge className={typeColors[item.type]}>{typeLabels[item.type]}</Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(item.id)}>
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
                          {item.fileName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
