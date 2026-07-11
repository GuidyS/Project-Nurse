import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Save, BookOpen, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface Course {
  subject_id: number;
  subject_code: string;
  subject_name_th: string;
}

interface PloMeta {
  id: string;
  name: string;
  ylo_descriptions?: Record<string, string>;
}

interface CLO {
  clo_id: number;
  clo_code?: string | null;
  description: string;
  ylo_id: string | null;
  mapped_plos?: string[];
}

interface CLOFormData {
  clo_code: string;
  description: string;
  ylo_id: string;
  extra_plos: string[];
}

const EMPTY_FORM: CLOFormData = { clo_code: "", description: "", ylo_id: "", extra_plos: [] };

const CLO_OPTIONS = Array.from({ length: 10 }, (_, i) => `CLO${i + 1}`);
const YLO_OPTIONS = [
  { value: "YLO1", label: "YLO1 — ชั้นปีที่ 1" },
  { value: "YLO2", label: "YLO2 — ชั้นปีที่ 2" },
  { value: "YLO3", label: "YLO3 — ชั้นปีที่ 3" },
  { value: "YLO4", label: "YLO4 — ชั้นปีที่ 4" },
];

function derivePlosFromYlo(plos: PloMeta[], yloId: string): string[] {
  const match = yloId.match(/YLO(\d+)/i);
  if (!match) return [];

  const yearKey = `YEAR_${match[1]}`;
  const variants = [yearKey, yearKey.toLowerCase(), `year_${match[1]}`];

  return plos
    .filter((plo) =>
      variants.some((key) => plo.ylo_descriptions && key in plo.ylo_descriptions)
    )
    .map((plo) => plo.id);
}

function splitExtraPlos(mappedPlos: string[] | undefined, derivedPlos: string[]): string[] {
  const derived = new Set(derivedPlos);
  return (mappedPlos || []).filter((plo) => !derived.has(plo));
}

function CloPloFields({
  formData,
  setFormData,
  ploCatalog,
}: {
  formData: CLOFormData;
  setFormData: (data: CLOFormData) => void;
  ploCatalog: PloMeta[];
}) {
  const derivedPlos = derivePlosFromYlo(ploCatalog, formData.ylo_id);

  const toggleExtraPlo = (ploId: string, checked: boolean) => {
    const next = checked
      ? [...formData.extra_plos, ploId]
      : formData.extra_plos.filter((p) => p !== ploId);
    setFormData({ ...formData, extra_plos: next });
  };

  return (
    <div className="space-y-3 rounded-md border border-border/60 bg-background/50 p-3">
      {formData.ylo_id && (
        <div className="text-xs text-muted-foreground">
          PLO จาก {formData.ylo_id}:{" "}
          {derivedPlos.length > 0 ? (
            <span className="font-medium text-foreground">{derivedPlos.join(", ")}</span>
          ) : (
            <span>ไม่พบ PLO ที่เชื่อมในโครงสร้างหลักสูตร</span>
          )}
        </div>
      )}
      {ploCatalog.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">PLO เพิ่มเติม (นอกเหนือจาก YLO)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ploCatalog.map((plo) => (
              <label key={plo.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={formData.extra_plos.includes(plo.id)}
                  onCheckedChange={(checked) => toggleExtraPlo(plo.id, !!checked)}
                  disabled={derivedPlos.includes(plo.id)}
                />
                <span>{plo.id}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CLOPage() {
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [clos, setClos] = useState<CLO[]>([]);
  const [ploCatalog, setPloCatalog] = useState<PloMeta[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [addFormData, setAddFormData] = useState<CLOFormData>(EMPTY_FORM);
  const [editFormData, setEditFormData] = useState<CLOFormData>(EMPTY_FORM);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/index.php?page=get-subjects');
        if (res.data.status === 'success') {
          setCourses(res.data.data);
        }
      } catch {
        toast({ title: "ข้อผิดพลาด", description: "ดึงข้อมูลรายวิชาไม่สำเร็จ", variant: "destructive" });
      }
    };
    fetchCourses();
  }, [toast]);

  const fetchCLOs = useCallback(async (withSpinner = true) => {
    if (!selectedCourse) return;
    if (withSpinner) setIsLoading(true);
    try {
      const res = await api.get(`/index.php?page=get-clos&subject_id=${selectedCourse}`);
      if (res.data?.status === 'success') {
        const payload = res.data.data;
        if (Array.isArray(payload)) {
          setClos(payload);
        } else {
          setClos(payload?.clos || []);
          setPloCatalog(payload?.plos || []);
        }
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: res.data?.message || "ดึงข้อมูล CLO ไม่สำเร็จ",
          variant: "destructive",
        });
        setClos([]);
      }
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "ดึงข้อมูล CLO ไม่สำเร็จ", variant: "destructive" });
      setClos([]);
    } finally {
      if (withSpinner) setIsLoading(false);
    }
  }, [selectedCourse, toast]);

  useEffect(() => {
    fetchCLOs();
  }, [fetchCLOs]);

  const handleAdd = async () => {
    if (!addFormData.description) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกคำอธิบาย CLO", variant: "destructive" });
      return;
    }

    try {
      const res = await api.post('/index.php?page=add-clo', {
        subject_id: parseInt(selectedCourse),
        clo_code: addFormData.clo_code || null,
        description: addFormData.description,
        ylo_id: addFormData.ylo_id || null,
        mapped_plos: addFormData.extra_plos,
      });

      if (res.data.status !== 'success') {
        toast({
          title: "ข้อผิดพลาด",
          description: res.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "สำเร็จ", description: "เพิ่ม CLO เรียบร้อยแล้ว" });
      await fetchCLOs(false);
      setAddFormData(EMPTY_FORM);
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
    }
  };

  const handleEditSave = async () => {
    if (!editFormData.description) {
      toast({ title: "แจ้งเตือน", description: "กรุณากรอกคำอธิบาย CLO", variant: "destructive" });
      return;
    }

    try {
      const res = await api.post('/index.php?page=update-clo', {
        clo_id: isEditing,
        subject_id: parseInt(selectedCourse),
        clo_code: editFormData.clo_code || null,
        description: editFormData.description,
        ylo_id: editFormData.ylo_id || null,
        mapped_plos: editFormData.extra_plos,
      });

      if (res.data.status !== 'success') {
        toast({
          title: "ข้อผิดพลาด",
          description: res.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "สำเร็จ", description: "แก้ไข CLO เรียบร้อยแล้ว" });
      await fetchCLOs(false);
      closeEditDialog();
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
    }
  };

  const handleDelete = async (clo_id: number) => {
    if (!confirm("คุณต้องการลบ CLO นี้ใช่หรือไม่?")) return;

    try {
      const res = await api.post('/index.php?page=delete-clo', {
        clo_id,
        subject_id: parseInt(selectedCourse),
      });

      if (res.data.status !== 'success') {
        toast({
          title: "ข้อผิดพลาด",
          description: res.data?.message || "ไม่สามารถลบข้อมูลได้",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "สำเร็จ", description: "ลบข้อมูลเรียบร้อยแล้ว" });
      await fetchCLOs(false);
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถลบข้อมูลได้", variant: "destructive" });
    }
  };

  const handleEditClick = (clo: CLO) => {
    const derived = derivePlosFromYlo(ploCatalog, clo.ylo_id || "");
    setIsEditing(clo.clo_id);
    setEditFormData({
      clo_code: clo.clo_code || "",
      description: clo.description,
      ylo_id: clo.ylo_id || "",
      extra_plos: splitExtraPlos(clo.mapped_plos, derived),
    });
    setEditOpen(true);
  };

  const closeEditDialog = () => {
    setEditOpen(false);
    setIsEditing(null);
    setEditFormData(EMPTY_FORM);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">การจัดการ CLO รายวิชา</h1>
          <p className="text-muted-foreground">Course Learning Outcomes Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> เลือกรายวิชา
            </h3>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- เลือกรหัสวิชา --" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.subject_id} value={`${course.subject_id}`}>
                    {course.subject_code} - {course.subject_name_th}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          {selectedCourse ? (
            <div className="bg-card rounded-xl shadow-card p-6 border-t-4 border-t-primary">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  รายการ CLO
                </h2>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg mb-6 border border-border">
                <h4 className="text-sm font-semibold mb-3">เพิ่ม CLO ใหม่</h4>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={addFormData.clo_code}
                      onValueChange={(v) => setAddFormData({ ...addFormData, clo_code: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- เลือกรหัส CLO --" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLO_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={addFormData.ylo_id}
                      onValueChange={(v) => setAddFormData({ ...addFormData, ylo_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- เลือก YLO ที่สอดคล้อง --" />
                      </SelectTrigger>
                      <SelectContent>
                        {YLO_OPTIONS.map((y) => (
                          <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="รายละเอียด CLO..."
                    value={addFormData.description}
                    onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  />
                  <CloPloFields
                    formData={addFormData}
                    setFormData={setAddFormData}
                    ploCatalog={ploCatalog}
                  />
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleAdd} className="gap-2">
                      <Save className="h-4 w-4" /> บันทึก
                    </Button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : clos.length > 0 ? (
                <div className="space-y-3">
                  {clos.map((clo, index) => (
                    <div
                      key={clo.clo_id}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                              {clo.clo_code || `CLO ${index + 1}`}
                            </Badge>
                            {clo.ylo_id && <Badge variant="secondary">{clo.ylo_id}</Badge>}
                            {(clo.mapped_plos || []).map((plo) => (
                              <Badge key={plo} variant="outline">{plo}</Badge>
                            ))}
                          </div>
                          <p className="text-foreground text-sm">{clo.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditClick(clo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(clo.clo_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">ยังไม่มีข้อมูล CLO สำหรับวิชานี้</p>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-card p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">เลือกรายวิชา</h3>
              <p className="text-sm text-muted-foreground">กรุณาเลือกรายวิชาด้านซ้ายมือเพื่อดูและแก้ไข CLO</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) closeEditDialog(); }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>แก้ไข CLO</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={editFormData.clo_code}
                onValueChange={(v) => setEditFormData({ ...editFormData, clo_code: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- เลือกรหัส CLO --" />
                </SelectTrigger>
                <SelectContent>
                  {CLO_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={editFormData.ylo_id}
                onValueChange={(v) => setEditFormData({ ...editFormData, ylo_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- เลือก YLO ที่สอดคล้อง --" />
                </SelectTrigger>
                <SelectContent>
                  {YLO_OPTIONS.map((y) => (
                    <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="รายละเอียด CLO..."
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
            <CloPloFields
              formData={editFormData}
              setFormData={setEditFormData}
              ploCatalog={ploCatalog}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>ยกเลิก</Button>
            <Button onClick={handleEditSave} className="gap-2">
              <Save className="h-4 w-4" /> บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
