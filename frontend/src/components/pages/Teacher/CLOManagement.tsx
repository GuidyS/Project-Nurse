import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function CLOManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // 🌟 1. เพิ่ม State สำหรับรหัสวิชา และ ข้อมูล PLO ที่ได้จาก Backend
  const [subjectCode, setSubjectCode] = useState("103-111"); // ตัวอย่างรหัสวิชา (สามารถทำเป็น Dropdown เลือกวิชาภายหลังได้)
  const [ploOptions, setPloOptions] = useState<any[]>([]);

  const [clos, setClos] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [newCLO, setNewCLO] = useState({
    code: '',
    description: '',
    plo: '',
    weight: '',
  });

  // 🌟 2. ดึงข้อมูลจากฐานข้อมูลตอนเปิดหน้าเว็บ
  const fetchCLOData = async () => {
    try {
      const response = await api.get(`/index.php?page=get_clo_management&subject_code=${subjectCode}`);
      if (response.data.status === "success") {
        setClos(response.data.data.clos || []); // เซ็ตรายการ CLO
        setPloOptions(response.data.data.plos || []); // เซ็ตรายการ PLO Options
      }
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลได้", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (subjectCode) {
      fetchCLOData();
    }
  }, [subjectCode]);

  // 🌟 3. ฟังก์ชันหลักสำหรับส่ง Array ก้อนใหม่ไปทับใน Database
  const syncToDatabase = async (updatedClos: any[]) => {
    try {
      const response = await api.post("/index.php?page=save_clo_management", {
        subject_code: subjectCode,
        clos: updatedClos
      });
      
      if (response.data.status === "success") {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูล CLO เรียบร้อยแล้ว" });
        setClos(updatedClos); // อัปเดตหน้าจอเมื่อบันทึกผ่าน
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast({ title: "ล้มเหลว", description: error.message || "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
      fetchCLOData(); // ถ้ายิง API พลาด ให้ดึงข้อมูลเดิมกลับมา (Rollback)
    }
  };

  const resetForm = () => {
    setNewCLO({ code: '', description: '', plo: '', weight: '' });
    setEditingId(null);
  };

  // 🌟 4. ปรับปรุง handleSave ให้เรียก syncToDatabase
  const handleSave = () => {
    let updatedClos;
    if (editingId) {
      updatedClos = clos.map((c) => (c.id === editingId ? { ...c, ...newCLO, weight: Number(newCLO.weight) } : c));
    } else {
      const id = Date.now().toString();
      updatedClos = [...clos, { id, ...newCLO, weight: Number(newCLO.weight), status: 'active' }];
    }
    
    setIsDialogOpen(false);
    resetForm();
    syncToDatabase(updatedClos); // 👈 ส่งไปบันทึก
  };

  const handleEdit = (clo: any) => {
    setEditingId(clo.id);
    setNewCLO({
      code: clo.code,
      description: clo.description,
      plo: clo.plo,
      weight: clo.weight.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  // 🌟 5. ปรับปรุง handleDelete ให้เรียก syncToDatabase
  const handleDelete = () => {
    if (deleteId) {
      const updatedClos = clos.filter((c) => c.id !== deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      syncToDatabase(updatedClos); // 👈 ส่งไปบันทึกการลบ
    }
  };

  const totalWeight = clos.reduce((acc, c) => acc + c.weight, 0);

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">กำหนด CLO</h1>
            <p className="text-muted-foreground">กำหนดผลลัพธ์การเรียนรู้ระดับรายวิชา</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? 'แก้ไข CLO' : 'เพิ่ม CLO'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'แก้ไข CLO' : 'เพิ่ม CLO ใหม่'}</DialogTitle>
                <DialogDescription>
                  กำหนดผลลัพธ์การเรียนรู้ระดับรายวิชา
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>รหัส CLO</Label>
                  <Input
                    value={newCLO.code}
                    onChange={(e) => setNewCLO({ ...newCLO, code: e.target.value })}
                    placeholder="เช่น CLO1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>คำอธิบาย</Label>
                  <Textarea
                    value={newCLO.description}
                    onChange={(e) => setNewCLO({ ...newCLO, description: e.target.value })}
                    placeholder="อธิบาย CLO..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>เชื่อมโยง PLO</Label>
                  <Select value={newCLO.plo} onValueChange={(value) => setNewCLO({ ...newCLO, plo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก PLO" />
                    </SelectTrigger>
                    <SelectContent>
                      {ploOptions.map((plo) => (
                        <SelectItem key={plo.id} value={plo.id}>{plo.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>น้ำหนัก (%)</Label>
                  <Input
                    type="number"
                    value={newCLO.weight}
                    onChange={(e) => setNewCLO({ ...newCLO, weight: e.target.value })}
                    placeholder="เช่น 25"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave}>บันทึก</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวน CLO</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เปอร์เซ็นรวม</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-destructive'}`}>
                {totalWeight}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PLO ที่เชื่อมโยง</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(clos.map(c => c.plo)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CLO Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการ CLO</CardTitle>
            <CardDescription>ผลลัพธ์การเรียนรู้ระดับรายวิชาทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>คำอธิบาย</TableHead>
                  <TableHead>PLO</TableHead>
                  <TableHead className="text-center">เปอร์เซ็น</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clos.map((clo) => (
                  <TableRow key={clo.id}>
                    <TableCell className="font-medium">{clo.code}</TableCell>
                    <TableCell className="max-w-[300px]">{clo.description}</TableCell>
                    <TableCell><Badge variant="outline">{clo.plo}</Badge></TableCell>
                    <TableCell className="text-center">{clo.weight}%</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">ใช้งาน</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(clo)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteConfirm(clo.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      {/* delete confirmation dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบ CLO นี้? การลบจะไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={handleDelete}>ลบ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}