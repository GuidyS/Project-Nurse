import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface Course {
  subject_id: number;
  subject_code: string;
  subject_name_th: string;
}

interface PloOption {
  id: string;
  name: string;
}

interface ManagementCLO {
  id: string;
  code: string;
  description: string;
  mapped_plos?: string[];
  plo_weights: Record<string, number>;
  status: string;
}

interface CloFormState {
  code: string;
  description: string;
  plo_weights: Record<string, string>;
}

const EMPTY_CLO: CloFormState = { code: '', description: '', plo_weights: {} };

function sumPloWeights(ploWeights: Record<string, number | string>): number {
  return Object.values(ploWeights).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function getDisplayPloBadges(
  clo: ManagementCLO,
  coursePlos: string[],
): [string, number][] {
  const selected = new Set<string>([
    ...(clo.mapped_plos || []),
    ...coursePlos,
  ]);

  return Array.from(selected)
    .sort()
    .map((ploId) => [ploId, Number(clo.plo_weights?.[ploId]) || 0] as [string, number]);
}

function normalizePloWeightsInput(raw: Record<string, string>): Record<string, number> {
  const result: Record<string, number> = {};
  Object.entries(raw).forEach(([ploId, weight]) => {
    const parsed = Number(weight);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      result[ploId] = parsed;
    }
  });
  return result;
}

export default function CLOManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [subjectCode, setSubjectCode] = useState('');
  const [ploOptions, setPloOptions] = useState<PloOption[]>([]);

  const [clos, setClos] = useState<ManagementCLO[]>([]);
  const [coursePlos, setCoursePlos] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newCLO, setNewCLO] = useState<CloFormState>(EMPTY_CLO);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/index.php?page=get-subjects');
        if (res.data.status === 'success') {
          const list: Course[] = res.data.data || [];
          setCourses(list);
          if (list.length > 0) {
            setSubjectCode(list[0].subject_code);
          }
        }
      } catch {
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถดึงรายวิชาได้", variant: "destructive" });
      }
    };
    fetchCourses();
  }, [toast]);

  const fetchCLOData = useCallback(async () => {
    if (!subjectCode) return;
    try {
      const response = await api.get(`/index.php?page=get-clo-management&subject_code=${encodeURIComponent(subjectCode)}`);
      if (response.data.status === 'success') {
        setClos(response.data.data.clos || []);
        setPloOptions(response.data.data.plos || []);
        setCoursePlos(response.data.data.course_plos || []);
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถดึงข้อมูลได้",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูลได้", variant: "destructive" });
    }
  }, [subjectCode, toast]);

  useEffect(() => {
    fetchCLOData();
  }, [fetchCLOData]);

  const syncToDatabase = async (updatedClos: ManagementCLO[]) => {
    try {
      const response = await api.post('/index.php?page=save-clo-management', {
        subject_code: subjectCode,
        clos: updatedClos,
      });

      if (response.data.status === 'success') {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูล CLO เรียบร้อยแล้ว" });
        await fetchCLOData();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้";
      toast({ title: "ล้มเหลว", description: message, variant: "destructive" });
      await fetchCLOData();
    }
  };

  const resetForm = () => {
    setNewCLO(EMPTY_CLO);
    setEditingId(null);
  };

  const togglePlo = (ploId: string, checked: boolean) => {
    setNewCLO((prev) => {
      const nextWeights = { ...prev.plo_weights };
      if (checked) {
        if (!(ploId in nextWeights)) {
          nextWeights[ploId] = '';
        }
      } else {
        delete nextWeights[ploId];
      }
      return { ...prev, plo_weights: nextWeights };
    });
  };

  const setPloWeight = (ploId: string, weight: string) => {
    setNewCLO((prev) => ({
      ...prev,
      plo_weights: { ...prev.plo_weights, [ploId]: weight },
    }));
  };

  const handleSave = () => {
    if (!newCLO.code || !newCLO.description) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกรหัสและคำอธิบาย CLO", variant: "destructive" });
      return;
    }

    const ploWeights = normalizePloWeightsInput(newCLO.plo_weights);
    if (Object.keys(ploWeights).length === 0) {
      toast({ title: "แจ้งเตือน", description: "กรุณาเลือก PLO อย่างน้อย 1 รายการ", variant: "destructive" });
      return;
    }

    const cloPayload: ManagementCLO = {
      id: editingId || Date.now().toString(),
      code: newCLO.code,
      description: newCLO.description,
      plo_weights: ploWeights,
      status: 'active',
    };

    const updatedClos = editingId
      ? clos.map((c) => (c.id === editingId ? { ...c, ...cloPayload, id: editingId } : c))
      : [...clos, cloPayload];

    setIsDialogOpen(false);
    resetForm();
    syncToDatabase(updatedClos);
  };

  const handleEdit = (clo: ManagementCLO) => {
    setEditingId(clo.id);
    const ploWeights: Record<string, string> = {};
    const selectedPlos = new Set<string>([
      ...(clo.mapped_plos || []),
      ...coursePlos,
      ...Object.entries(clo.plo_weights || {})
        .filter(([, weight]) => Number(weight) > 0)
        .map(([ploId]) => ploId),
    ]);

    selectedPlos.forEach((ploId) => {
      const weight = clo.plo_weights?.[ploId];
      ploWeights[ploId] = weight !== undefined ? String(weight) : '';
    });

    setNewCLO({
      code: clo.code,
      description: clo.description,
      plo_weights: ploWeights,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const updatedClos = clos.filter((c) => c.id !== deleteId);
    setIsDeleteOpen(false);
    setDeleteId(null);
    syncToDatabase(updatedClos);
  };

  const totalWeight = clos.reduce((acc, clo) => acc + sumPloWeights(clo.plo_weights || {}), 0);
  const linkedPloCount = new Set([
    ...coursePlos,
    ...clos.flatMap((clo) => clo.mapped_plos || []),
  ]).size;
  const formPloTotal = sumPloWeights(newCLO.plo_weights);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">กำหนด CLO</h1>
          <p className="text-muted-foreground">กำหนดผลลัพธ์การเรียนรู้ระดับรายวิชา (เชื่อมโยง PLO หลายรายการ)</p>
        </div>
        <div className="w-full sm:w-72">
          <Select value={subjectCode} onValueChange={setSubjectCode}>
            <SelectTrigger>
              <BookOpen className="h-4 w-4 mr-2" />
              <SelectValue placeholder="-- เลือกรายวิชา --" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.subject_id} value={course.subject_code}>
                  {course.subject_code} - {course.subject_name_th}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button disabled={!subjectCode}>
              <Plus className="mr-2 h-4 w-4" />
              {editingId ? 'แก้ไข CLO' : 'เพิ่ม CLO'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'แก้ไข CLO' : 'เพิ่ม CLO ใหม่'}</DialogTitle>
              <DialogDescription>เลือก PLO ที่เกี่ยวข้องและกำหนดน้ำหนัก (%) แยกแต่ละ PLO</DialogDescription>
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
                <div className="flex items-center justify-between">
                  <Label>เชื่อมโยง PLO และน้ำหนัก (%)</Label>
                  <span className={`text-xs font-medium ${formPloTotal === 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    รวม CLO นี้: {formPloTotal}%
                  </span>
                </div>
                <div className="space-y-2 rounded-md border p-3 max-h-64 overflow-y-auto">
                  {ploOptions.length > 0 ? (
                    ploOptions.map((plo) => {
                      const checked = plo.id in newCLO.plo_weights;
                      return (
                        <div key={plo.id} className="flex items-center gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => togglePlo(plo.id, !!value)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{plo.id}</p>
                            <p className="text-xs text-muted-foreground truncate">{plo.name}</p>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            className="w-20"
                            disabled={!checked}
                            value={checked ? (newCLO.plo_weights[plo.id] ?? '') : ''}
                            onChange={(e) => setPloWeight(plo.id, e.target.value)}
                            placeholder="%"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">ไม่พบรายการ PLO ในโครงสร้างหลักสูตร</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleSave}>บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
            <CardTitle className="text-sm font-medium">เปอร์เซ็นรวมทั้งวิชา</CardTitle>
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
            <div className="text-2xl font-bold">{linkedPloCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการ CLO</CardTitle>
          <CardDescription>
            แต่ละ CLO สามารถเชื่อมหลาย PLO พร้อมน้ำหนักแยกกัน — sync กับหน้า CLO รายวิชาและ CLO Map
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>คำอธิบาย</TableHead>
                  <TableHead>PLO / น้ำหนัก</TableHead>
                  <TableHead className="text-center">รวม CLO</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clos.map((clo) => {
                  const cloTotal = sumPloWeights(clo.plo_weights || {});
                  const ploEntries = getDisplayPloBadges(clo, coursePlos);
                  return (
                    <TableRow key={clo.id}>
                      <TableCell className="font-medium">{clo.code}</TableCell>
                      <TableCell className="max-w-[280px]">{clo.description}</TableCell>
                      <TableCell>
                        {ploEntries.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {ploEntries.map(([ploId, weight]) => (
                              <Badge key={ploId} variant="outline">
                                {ploId} ({weight}%)
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">{cloTotal}%</TableCell>
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
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-6">ยังไม่มี CLO สำหรับวิชานี้</p>
          )}
        </CardContent>
      </Card>

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
