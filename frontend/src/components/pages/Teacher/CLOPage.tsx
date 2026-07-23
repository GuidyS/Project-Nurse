import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Save, BookOpen, Target, Loader2, Settings2 } from "lucide-react";
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
}

interface SubPlo {
  code: string;
  plo: string;
  description: string;
}

interface YloPloInfo {
  active: boolean;
  description: string;
}

type YloMatrix = Record<string, Record<string, YloPloInfo>>;

interface CLO {
  clo_id: number;
  clo_code?: string | null;
  description: string;
  ylo_id: string | null;
  mapped_plos?: string[];
  sub_plos?: string[];
}

interface CLOFormData {
  clo_code: string;
  description: string;
  ylo_id: string;
  sub_plos: string[];
}

const EMPTY_FORM: CLOFormData = { clo_code: "", description: "", ylo_id: "", sub_plos: [] };

const CLO_OPTIONS = Array.from({ length: 10 }, (_, i) => `CLO${i + 1}`);
const YLO_OPTIONS = [
  { value: "YLO1", label: "YLO1 — ชั้นปีที่ 1" },
  { value: "YLO2", label: "YLO2 — ชั้นปีที่ 2" },
  { value: "YLO3", label: "YLO3 — ชั้นปีที่ 3" },
  { value: "YLO4", label: "YLO4 — ชั้นปีที่ 4" },
];

function plosOfYlo(matrix: YloMatrix, yloId: string): string[] {
  const row = matrix[yloId];
  if (!row) return [];
  return Object.keys(row)
    .filter((plo) => row[plo]?.active)
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")));
}

function CloSubPloFields({
  formData,
  setFormData,
  yloMatrix,
  subPloCatalog,
}: {
  formData: CLOFormData;
  setFormData: (data: CLOFormData) => void;
  yloMatrix: YloMatrix;
  subPloCatalog: SubPlo[];
}) {
  const derivedPlos = plosOfYlo(yloMatrix, formData.ylo_id);
  const allowed = new Set(derivedPlos);

  const toggleSub = (code: string, checked: boolean) => {
    const next = checked
      ? [...formData.sub_plos, code]
      : formData.sub_plos.filter((c) => c !== code);
    setFormData({ ...formData, sub_plos: next });
  };

  // จัดกลุ่ม Sub PLO ตาม PLO แม่
  const groups: Record<string, SubPlo[]> = {};
  subPloCatalog.forEach((s) => {
    (groups[s.plo] = groups[s.plo] || []).push(s);
  });
  const groupKeys = Object.keys(groups).sort(
    (a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))
  );

  return (
    <div className="space-y-3 rounded-md border border-border/60 bg-background/50 p-3">
      {formData.ylo_id ? (
        <div className="text-xs text-muted-foreground">
          PLO จาก {formData.ylo_id}:{" "}
          {derivedPlos.length > 0 ? (
            <span className="font-medium text-foreground">{derivedPlos.join(", ")}</span>
          ) : (
            <span>ยังไม่กำหนด PLO ของ YLO นี้ (กดปุ่ม "แก้ไข YLO")</span>
          )}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">เลือก YLO ก่อน เพื่อกำหนด PLO และติ๊ก Sub PLO</div>
      )}
      {subPloCatalog.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Sub PLO (ติ๊กได้เฉพาะตัวที่ PLO อยู่ในชุดของ YLO ที่เลือก)</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {groupKeys.map((plo) => {
              const enabled = allowed.has(plo);
              return (
                <div
                  key={plo}
                  className={`rounded-md border p-2 ${enabled ? "border-border" : "border-border/40 opacity-50"}`}
                >
                  <p className="text-xs font-semibold mb-1">{plo}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {groups[plo].map((sub) => (
                      <label
                        key={sub.code}
                        className={`flex items-center gap-1.5 text-sm ${enabled ? "cursor-pointer" : "cursor-not-allowed"}`}
                        title={sub.description}
                      >
                        <Checkbox
                          checked={formData.sub_plos.includes(sub.code)}
                          onCheckedChange={(checked) => toggleSub(sub.code, !!checked)}
                          disabled={!enabled}
                        />
                        <span>{sub.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function YloEditorDialog({
  open,
  onOpenChange,
  yloMatrix,
  ploCatalog,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  yloMatrix: YloMatrix;
  ploCatalog: PloMeta[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<YloMatrix>({});
  const [activeYlo, setActiveYlo] = useState("YLO1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    // เตรียม draft ให้ครบ YLO1-4 × PLO ทุกตัวใน catalog
    const next: YloMatrix = {};
    YLO_OPTIONS.forEach(({ value }) => {
      next[value] = {};
      ploCatalog.forEach((plo) => {
        const cur = yloMatrix[value]?.[plo.id];
        next[value][plo.id] = { active: cur?.active ?? false, description: cur?.description ?? "" };
      });
    });
    setDraft(next);
    setActiveYlo("YLO1");
  }, [open, yloMatrix, ploCatalog]);

  const setCell = (ylo: string, plo: string, patch: Partial<YloPloInfo>) => {
    setDraft((prev) => ({
      ...prev,
      [ylo]: { ...prev[ylo], [plo]: { ...prev[ylo][plo], ...patch } },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post("/index.php?page=save-ylo-matrix", { ylo_plo_matrix: draft });
      if (res.data?.status === "success") {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูล YLO เรียบร้อยแล้ว" });
        onOpenChange(false);
        onSaved();
      } else {
        toast({ title: "ข้อผิดพลาด", description: res.data?.message || "บันทึกไม่สำเร็จ", variant: "destructive" });
      }
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "บันทึกไม่สำเร็จ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const yloLabel = YLO_OPTIONS.find((y) => y.value === activeYlo)?.label || activeYlo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>แก้ไข YLO — กำหนด PLO ของแต่ละชั้นปี</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 flex-wrap">
          {YLO_OPTIONS.map((y) => (
            <Button
              key={y.value}
              size="sm"
              variant={activeYlo === y.value ? "default" : "outline"}
              onClick={() => setActiveYlo(y.value)}
            >
              {y.label}
            </Button>
          ))}
        </div>

        <div className="rounded-md border">
          <div className="bg-muted/40 px-3 py-2 text-sm font-semibold border-b">{yloLabel}</div>
          <div className="divide-y">
            {ploCatalog.map((plo) => {
              const cell = draft[activeYlo]?.[plo.id];
              if (!cell) return null;
              return (
                <div key={plo.id} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 items-start px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium">{plo.id}</span>
                    <span className="text-muted-foreground">: {plo.name}</span>
                  </div>
                  <div className="pt-0.5">
                    <Checkbox
                      checked={cell.active}
                      onCheckedChange={(checked) => setCell(activeYlo, plo.id, { active: !!checked })}
                    />
                  </div>
                  <Textarea
                    className="min-h-[38px] text-sm"
                    placeholder={cell.active ? "คำอธิบาย PLO สำหรับชั้นปีนี้..." : "-"}
                    value={cell.description}
                    disabled={!cell.active}
                    onChange={(e) => setCell(activeYlo, plo.id, { description: e.target.value })}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CLOPage() {
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [clos, setClos] = useState<CLO[]>([]);
  const [ploCatalog, setPloCatalog] = useState<PloMeta[]>([]);
  const [yloMatrix, setYloMatrix] = useState<YloMatrix>({});
  const [subPloCatalog, setSubPloCatalog] = useState<SubPlo[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [yloEditorOpen, setYloEditorOpen] = useState(false);

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
          setYloMatrix(payload?.ylo_matrix || {});
          setSubPloCatalog(payload?.sub_plo_catalog || []);
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

  // เปลี่ยน YLO แล้วตัด Sub PLO ที่ PLO แม่ไม่อยู่ในชุดใหม่ออก
  const changeYlo = (form: CLOFormData, setForm: (d: CLOFormData) => void, ylo: string) => {
    const allowed = new Set(plosOfYlo(yloMatrix, ylo));
    const parentOf = new Map(subPloCatalog.map((s) => [s.code, s.plo]));
    setForm({
      ...form,
      ylo_id: ylo,
      sub_plos: form.sub_plos.filter((c) => allowed.has(parentOf.get(c) || "")),
    });
  };

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
        sub_plos: addFormData.sub_plos,
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
        sub_plos: editFormData.sub_plos,
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
    setIsEditing(clo.clo_id);
    setEditFormData({
      clo_code: clo.clo_code || "",
      description: clo.description,
      ylo_id: clo.ylo_id || "",
      sub_plos: clo.sub_plos || [],
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">การจัดการ CLO รายวิชา</h1>
          <p className="text-muted-foreground">Course Learning Outcomes Management</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setYloEditorOpen(true)}>
          <Settings2 className="h-4 w-4" /> แก้ไข YLO
        </Button>
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
                      onValueChange={(v) => changeYlo(addFormData, setAddFormData, v)}
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
                  <CloSubPloFields
                    formData={addFormData}
                    setFormData={setAddFormData}
                    yloMatrix={yloMatrix}
                    subPloCatalog={subPloCatalog}
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
                          {(clo.sub_plos || []).length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                              {(clo.sub_plos || []).map((sub) => (
                                <Badge
                                  key={sub}
                                  variant="outline"
                                  className="border-amber-500/60 text-amber-600 dark:text-amber-400"
                                >
                                  Sub {sub}
                                </Badge>
                              ))}
                            </div>
                          )}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
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
                onValueChange={(v) => changeYlo(editFormData, setEditFormData, v)}
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
            <CloSubPloFields
              formData={editFormData}
              setFormData={setEditFormData}
              yloMatrix={yloMatrix}
              subPloCatalog={subPloCatalog}
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

      <YloEditorDialog
        open={yloEditorOpen}
        onOpenChange={setYloEditorOpen}
        yloMatrix={yloMatrix}
        ploCatalog={ploCatalog}
        onSaved={() => fetchCLOs(false)}
      />
    </div>
  );
}