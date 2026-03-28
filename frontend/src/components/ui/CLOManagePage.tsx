import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CLOManagePageProps {
  courseCode?: string;
  onBack?: () => void;
  onBackToDetail?: () => void;
}

interface CLO {
  id: string;
  code: string;
  description: string;
  bloomLevel: string;
  ploMapping: string;
  weight: number;
}

const bloomLevels = ["จำ", "เข้าใจ", "ประยุกต์ใช้", "วิเคราะห์", "ประเมินค่า", "สร้างสรรค์"];

const courseNames: Record<string, string> = {
  NUR101: "พื้นฐานการพยาบาล",
  NUR201: "การพยาบาลผู้ใหญ่ 1",
  NUR301: "การพยาบาลเด็ก",
};

const initialCLOs: Record<string, CLO[]> = {
  NUR101: [
    { id: "1", code: "CLO1", description: "อธิบายหลักการพื้นฐานของการพยาบาลได้", bloomLevel: "เข้าใจ", ploMapping: "PLO1", weight: 20 },
    { id: "2", code: "CLO2", description: "สาธิตทักษะการพยาบาลพื้นฐานได้อย่างถูกต้อง", bloomLevel: "ประยุกต์ใช้", ploMapping: "PLO2", weight: 30 },
    { id: "3", code: "CLO3", description: "วิเคราะห์สถานการณ์ปัญหาสุขภาพเบื้องต้นได้", bloomLevel: "วิเคราะห์", ploMapping: "PLO3", weight: 25 },
    { id: "4", code: "CLO4", description: "แสดงจริยธรรมในการปฏิบัติการพยาบาลได้", bloomLevel: "ประเมินค่า", ploMapping: "PLO4", weight: 25 },
  ],
  NUR201: [
    { id: "1", code: "CLO1", description: "ประเมินภาวะสุขภาพของผู้ใหญ่ได้", bloomLevel: "วิเคราะห์", ploMapping: "PLO2", weight: 30 },
    { id: "2", code: "CLO2", description: "วางแผนการพยาบาลผู้ใหญ่ที่มีปัญหาสุขภาพได้", bloomLevel: "สร้างสรรค์", ploMapping: "PLO3", weight: 35 },
    { id: "3", code: "CLO3", description: "ปฏิบัติการพยาบาลผู้ใหญ่ได้อย่างปลอดภัย", bloomLevel: "ประยุกต์ใช้", ploMapping: "PLO2", weight: 35 },
  ],
  NUR301: [
    { id: "1", code: "CLO1", description: "อธิบายพัฒนาการเด็กแต่ละวัยได้", bloomLevel: "เข้าใจ", ploMapping: "PLO1", weight: 25 },
    { id: "2", code: "CLO2", description: "ประเมินภาวะสุขภาพเด็กตามวัยได้", bloomLevel: "วิเคราะห์", ploMapping: "PLO2", weight: 35 },
    { id: "3", code: "CLO3", description: "ปฏิบัติการพยาบาลเด็กป่วยได้อย่างเหมาะสม", bloomLevel: "ประยุกต์ใช้", ploMapping: "PLO3", weight: 40 },
  ],
};

const bloomColors: Record<string, string> = {
  "จำ": "bg-muted text-muted-foreground",
  "เข้าใจ": "bg-secondary text-secondary-foreground",
  "ประยุกต์ใช้": "bg-primary/10 text-primary",
  "วิเคราะห์": "bg-warning/10 text-warning",
  "ประเมินค่า": "bg-destructive/10 text-destructive",
  "สร้างสรรค์": "bg-success/10 text-success",
};

export default function CLOManagePage({ courseCode, onBack, onBackToDetail }: CLOManagePageProps) {
  const code = courseCode || "NUR101";
  const courseName = courseNames[code] || code;

  const [clos, setClos] = useState<CLO[]>(initialCLOs[code] || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCLO, setEditingCLO] = useState<CLO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({ code: "", description: "", bloomLevel: "", ploMapping: "", weight: 0 });

  const totalWeight = clos.reduce((sum, c) => sum + c.weight, 0);

  const openAdd = () => {
    setEditingCLO(null);
    setForm({ code: `CLO${clos.length + 1}`, description: "", bloomLevel: "เข้าใจ", ploMapping: "PLO1", weight: 0 });
    setDialogOpen(true);
  };

  const openEdit = (clo: CLO) => {
    setEditingCLO(clo);
    setForm({ code: clo.code, description: clo.description, bloomLevel: clo.bloomLevel, ploMapping: clo.ploMapping, weight: clo.weight });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code || !form.description) return;
    if (editingCLO) {
      setClos(clos.map((c) => (c.id === editingCLO.id ? { ...c, ...form } : c)));
    } else {
      setClos([...clos, { ...form, id: Date.now().toString() }]);
    }
    setDialogOpen(false);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) setClos(clos.filter((c) => c.id !== deletingId));
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleBack = () => {
    if (onBack) onBack();
  };

  return (
    <Dialog open={!!courseCode} onOpenChange={(open) => !open && handleBack()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>จัดการ CLO</DialogTitle>
          <p className="text-muted-foreground text-sm">
            {code} — {courseName}
          </p>
        </DialogHeader>

        {onBackToDetail && (
          <div className="mb-4">
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={onBackToDetail}>ย้อนกลับไปหน้ารายละเอียด</Button>
          </div>
        )}

        {/* Summary bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">จำนวน CLO</p>
          <p className="text-2xl font-bold text-foreground">{clos.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">น้ำหนักรวม</p>
          <p className={`text-2xl font-bold ${totalWeight === 100 ? "text-success" : "text-destructive"}`}>
            {totalWeight}%
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">PLO ที่เชื่อมโยง</p>
          <p className="text-2xl font-bold text-foreground">
            {new Set(clos.map((c) => c.ploMapping)).size}
          </p>
        </div>
      </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">รายการ CLO</h2>
          <Button onClick={openAdd} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            เพิ่ม CLO
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-24">รหัส</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead className="w-32">ระดับ Bloom</TableHead>
              <TableHead className="w-24">PLO</TableHead>
              <TableHead className="w-24 text-right">น้ำหนัก</TableHead>
              <TableHead className="w-24 text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  ยังไม่มี CLO — กดปุ่ม "เพิ่ม CLO" เพื่อเริ่มต้น
                </TableCell>
              </TableRow>
            ) : (
              clos.map((clo) => (
                <TableRow key={clo.id}>
                  <TableCell>
                    <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                  </TableCell>
                  <TableCell className="font-medium text-primary">{clo.code}</TableCell>
                  <TableCell>{clo.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={bloomColors[clo.bloomLevel] || ""}>
                      {clo.bloomLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{clo.ploMapping}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{clo.weight}%</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(clo)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete(clo.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCLO ? "แก้ไข CLO" : "เพิ่ม CLO ใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">รหัส CLO</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CLO1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">น้ำหนัก (%)</label>
                <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} placeholder="20" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">คำอธิบาย</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="อธิบาย CLO..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">ระดับ Bloom's Taxonomy</label>
                <Select value={form.bloomLevel} onValueChange={(v) => setForm({ ...form, bloomLevel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {bloomLevels.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">เชื่อมโยง PLO</label>
                <Select value={form.ploMapping} onValueChange={(v) => setForm({ ...form, ploMapping: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["PLO1", "PLO2", "PLO3", "PLO4", "PLO5"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave}>{editingCLO ? "บันทึก" : "เพิ่ม"}</Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ CLO</AlertDialogTitle>
            <AlertDialogDescription>การลบ CLO นี้จะไม่สามารถกู้คืนได้ คุณต้องการดำเนินการต่อหรือไม่?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
