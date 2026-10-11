import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Save, X, AlertCircle, Library } from "lucide-react";
import api from "@/lib/axios";

/** หลักสูตรที่ใช้งานในระบบ — ตัวเดียวกับที่หน้า "จัดการหลักสูตร" ตั้งค่าไว้ */
interface ActiveCurriculum {
  id: number;
  start_year: number;
  end_year: number;
  is_explicit: boolean;
  label: string;
}

interface CompetencyItem {
  id: number;
  plo_id: number;
  year_level: number;
  sequence_no: number;
  sub_plo_code: string;
  competency_name: string;
  is_scorable: number;
}

interface PloGroup {
  plo_id: number;
  plo_code: string;
  plo_name: string;
  items: CompetencyItem[];
  /** จำนวนรายการของ PLO นี้รวมทุกชั้นปี — ใช้บอกว่ามีรายการอยู่ในชั้นปีอื่นด้วย */
  total_all_years: number;
}

const emptyDraft = { id: null as number | null, competency_name: "", is_scorable: true };

/** งานลบที่รอการยืนยัน */
type PendingDelete =
  | { scope: "item"; id: number; label: string }
  | { scope: "plo"; ploId: number; label: string; count: number }
  | { scope: "all"; label: string; count: number };

export default function CompetencyItemsManagement() {
  const { toast } = useToast();
  const [curriculum, setCurriculum] = useState<ActiveCurriculum | null>(null);
  const [frameworkId, setFrameworkId] = useState<string>("");
  const [yearLevel, setYearLevel] = useState<string>("1");
  const [groups, setGroups] = useState<PloGroup[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [editingPloId, setEditingPloId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);

  // แก้ไขหัวข้อ PLO (ข้อความของ PLO1–PLO8)
  const [headingPloId, setHeadingPloId] = useState<number | null>(null);
  const [headingDraft, setHeadingDraft] = useState("");
  const [isSavingHeading, setIsSavingHeading] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // จำนวนรายการของ "ชั้นปีที่เลือกอยู่" เท่านั้น — ปุ่มลบทั้งหมดทำงานในขอบเขตชั้นปีนี้
  const totalThisYear = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups]
  );

  const fetchItems = useCallback(async () => {
    try {
      setIsLoadingItems(true);
      // ไม่ส่ง framework_id — backend ยึดหลักสูตรที่ใช้งานในระบบให้เอง
      const res = await api.get(`/index.php?page=competency-items&year_level=${yearLevel}`);
      if (res.data.status === "success") {
        setGroups(res.data.data || []);
        setCurriculum(res.data.curriculum ?? null);
        setFrameworkId(res.data.framework_id ? String(res.data.framework_id) : "");
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดรายการประเมินไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsLoadingItems(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearLevel]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const startAdd = (ploId: number) => {
    setHeadingPloId(null);
    setEditingPloId(ploId);
    setDraft({ id: null, competency_name: "", is_scorable: true });
  };

  const startEdit = (ploId: number, item: CompetencyItem) => {
    setHeadingPloId(null);
    setEditingPloId(ploId);
    setDraft({
      id: item.id,
      competency_name: item.competency_name,
      is_scorable: Boolean(item.is_scorable),
    });
  };

  const cancelEdit = () => {
    setEditingPloId(null);
    setDraft(emptyDraft);
  };

  const startEditHeading = (group: PloGroup) => {
    cancelEdit();
    setHeadingPloId(group.plo_id);
    setHeadingDraft(group.plo_name || "");
  };

  const handleSaveHeading = async (ploId: number) => {
    if (!headingDraft.trim()) {
      toast({ title: "ข้อมูลไม่ครบถ้วน", description: "กรุณาระบุข้อความหัวข้อ PLO", variant: "destructive" });
      return;
    }
    setIsSavingHeading(true);
    try {
      const res = await api.post("/index.php?page=save-plo-heading", {
        plo_id: ploId,
        plo_name: headingDraft.trim(),
      });
      if (res.data.status === "success") {
        toast({ title: "บันทึกสำเร็จ", description: res.data.message });
        setHeadingPloId(null);
        fetchItems();
      } else {
        toast({ title: "บันทึกไม่สำเร็จ", description: res.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error.response?.data?.message || "แก้ไขหัวข้อ PLO ไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setIsSavingHeading(false);
    }
  };

  const handleSave = async (ploId: number) => {
    if (!draft.competency_name.trim()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาระบุข้อความรายการประเมิน",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post("/index.php?page=save-competency-item", {
        id: draft.id,
        plo_id: ploId,
        year_level: Number(yearLevel),
        competency_name: draft.competency_name.trim(),
        is_scorable: draft.is_scorable ? 1 : 0,
      });
      if (res.data.status === "success") {
        toast({ title: "บันทึกสำเร็จ", description: res.data.message });
        cancelEdit();
        fetchItems();
      } else {
        toast({ title: "บันทึกไม่สำเร็จ", description: res.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error.response?.data?.message || "บันทึกรายการไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      let url = "";
      if (pendingDelete.scope === "item") {
        url = `/index.php?page=delete-competency-item&scope=item&id=${pendingDelete.id}`;
      } else if (pendingDelete.scope === "plo") {
        url = `/index.php?page=delete-competency-item&scope=plo&framework_id=${frameworkId}&plo_id=${pendingDelete.ploId}&year_level=${yearLevel}`;
      } else {
        url = `/index.php?page=delete-competency-item&scope=all&framework_id=${frameworkId}&year_level=${yearLevel}`;
      }

      const res = await api.delete(url);
      if (res.data.status === "success") {
        toast({ title: "ลบสำเร็จ", description: res.data.message });
        setPendingDelete(null);
        fetchItems();
      } else {
        toast({ title: "ลบไม่สำเร็จ", description: res.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: error.response?.data?.message || "ลบรายการไม่สำเร็จ",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteDescription = (() => {
    if (!pendingDelete) return "";
    if (pendingDelete.scope === "item") {
      return `ต้องการลบรายการ "${pendingDelete.label}" ใช่หรือไม่? รหัส Sub PLO ของข้ออื่นใน PLO นี้จะถูกจัดเรียงใหม่อัตโนมัติ และคะแนนที่นักศึกษาเคยได้จากข้อนี้จะถูกลบไปด้วย`;
    }
    if (pendingDelete.scope === "plo") {
      return `ต้องการลบรายการทั้งหมดของ ${pendingDelete.label} เฉพาะชั้นปีที่ ${yearLevel} จำนวน ${pendingDelete.count} รายการ ใช่หรือไม่? ชั้นปีอื่นจะไม่ถูกลบ และคะแนนที่นักศึกษาเคยได้จากรายการเหล่านี้จะถูกลบไปด้วย`;
    }
    return `ต้องการลบรายการทั้งหมดตั้งแต่ PLO1 ถึง PLO8 เฉพาะชั้นปีที่ ${yearLevel} จำนวน ${pendingDelete.count} รายการ ใช่หรือไม่? ชั้นปีอื่นจะไม่ถูกลบ แต่คะแนนที่นักศึกษาเคยได้จากรายการเหล่านี้จะถูกลบไปด้วย การกระทำนี้ย้อนกลับไม่ได้`;
  })();

  return (
    <div className="app-page max-w-5xl animate-fade-in">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">ประเมินสมรรถนะหลักแต่ละชั้นปี (YLO)</h1>
          <p className="app-page-description">
            สร้าง/แก้ไข/ลบรายการประเมินตามหัวข้อ PLO แต่ละหลักสูตรและชั้นปี — รายการเหล่านี้คือ Sub PLO
            ที่หน้า "จัดการ CLO รายวิชา" จะดึงไปใช้ตาม YLO ของรายวิชา (ระบบออกรหัสให้อัตโนมัติ)
          </p>
        </div>
        {groups.length > 0 && (
          <Button
            variant="destructive"
            disabled={totalThisYear === 0}
            title={`ลบรายการทั้งหมดของ PLO1–PLO8 เฉพาะชั้นปีที่ ${yearLevel}`}
            onClick={() =>
              setPendingDelete({ scope: "all", label: "PLO1 ถึง PLO8", count: totalThisYear })
            }
          >
            <Trash2 className="h-4 w-4 mr-1" /> ลบทั้งหมดของชั้นปีที่ {yearLevel} (PLO1–PLO8)
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
          <div className="space-y-2 min-w-[320px]">
            <Label>หลักสูตร</Label>
            <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Library className="h-4 w-4 text-primary" />
                {curriculum ? `หลักสูตร ${curriculum.label}` : "ยังไม่มีหลักสูตรในระบบ"}
                {curriculum?.is_explicit && (
                  <Badge variant="secondary" className="text-xs">ใช้งานในระบบ</Badge>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ใช้หลักสูตรเดียวกับหน้า "จัดการหลักสูตร" (เปลี่ยนได้ที่หน้านั้น) — PLO และ Sub PLO ใช้ร่วมกันทุกรอบหลักสูตร
              </p>
            </div>
          </div>
          <div className="space-y-2 w-48">
            <Label>ชั้นปีที่ (YLO)</Label>
            <Select value={yearLevel} onValueChange={(val) => { setYearLevel(val); cancelEdit(); setHeadingPloId(null); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((y) => (
                  <SelectItem key={y} value={String(y)}>ชั้นปีที่ {y} (YLO{y})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoadingItems ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
            <p>ไม่พบรายการ PLO ในหลักสูตรนี้ กรุณาสร้าง PLO ในระบบก่อนเพิ่มรายการประเมิน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.plo_id}>
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                {headingPloId === group.plo_id ? (
                  <div className="space-y-2">
                    <Label className="text-xs">หัวข้อ {group.plo_code}</Label>
                    <Textarea
                      rows={3}
                      value={headingDraft}
                      onChange={(e) => setHeadingDraft(e.target.value)}
                      placeholder="พิมพ์ข้อความหัวข้อ PLO"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setHeadingPloId(null)}>
                        <X className="h-4 w-4 mr-1" /> ยกเลิก
                      </Button>
                      <Button size="sm" disabled={isSavingHeading} onClick={() => handleSaveHeading(group.plo_id)}>
                        {isSavingHeading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                        บันทึกหัวข้อ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-semibold text-foreground leading-relaxed">
                      <span className="text-primary mr-1.5">{group.plo_code}</span> {group.plo_name}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={`แก้ไขหัวข้อ ${group.plo_code}`}
                        onClick={() => startEditHeading(group)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-destructive hover:bg-destructive/10 gap-1"
                        disabled={group.items.length === 0}
                        title={`ลบรายการทั้งหมดของ ${group.plo_code} เฉพาะชั้นปีที่ ${yearLevel}`}
                        onClick={() =>
                          setPendingDelete({
                            scope: "plo",
                            ploId: group.plo_id,
                            label: group.plo_code,
                            count: group.items.length,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" /> ลบทั้งหมด
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {group.items.length === 0 && editingPloId !== group.plo_id && (
                  <p className="text-sm text-muted-foreground italic">
                    ยังไม่มีรายการประเมินใน PLO นี้สำหรับชั้นปีที่ {yearLevel}
                    {group.total_all_years > 0 && ` (มีในชั้นปีอื่นรวม ${group.total_all_years} รายการ)`}
                  </p>
                )}

                {group.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 border border-border/80 rounded-md p-3 hover:bg-muted/10 transition-colors">
                    <Badge variant="outline" className="shrink-0 font-mono text-xs mt-0.5">
                      {item.sub_plo_code}
                    </Badge>
                    <div className="flex-1 text-sm leading-relaxed">
                      {item.competency_name}
                      {!item.is_scorable && (
                        <Badge variant="secondary" className="ml-2 text-xs">ไม่ต้องประเมิน</Badge>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(group.plo_id, item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setPendingDelete({ scope: "item", id: item.id, label: item.competency_name })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {editingPloId === group.plo_id ? (
                  <div className="border border-primary/40 rounded-md p-4 space-y-3 bg-muted/30 animate-in fade-in-50">
                    <div className="space-y-1">
                      <Label className="text-xs">รายการประเมินสมรรถนะ (Sub PLO)</Label>
                      <Input
                        value={draft.competency_name}
                        onChange={(e) => setDraft((d) => ({ ...d, competency_name: e.target.value }))}
                        placeholder="พิมพ์ข้อความรายการประเมิน (รหัส Sub PLO จะถูกกำหนดให้อัตโนมัติ)"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`scorable-${group.plo_id}`}
                          checked={draft.is_scorable}
                          onCheckedChange={(c) => setDraft((d) => ({ ...d, is_scorable: Boolean(c) }))}
                        />
                        <Label htmlFor={`scorable-${group.plo_id}`} className="text-xs cursor-pointer text-muted-foreground">
                          ต้องให้คะแนน (หากไม่เลือก จะแสดงเป็น "ไม่ต้องประเมินเพราะไม่กำหนดตัวชี้วัด")
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" /> ยกเลิก
                        </Button>
                        <Button size="sm" disabled={isSaving} onClick={() => handleSave(group.plo_id)}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                          บันทึก
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-primary hover:bg-primary/10"
                    onClick={() => startAdd(group.plo_id)}
                  >
                    <Plus className="h-4 w-4" /> เพิ่มรายการใน PLO นี้
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmActionDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => { if (!next) setPendingDelete(null); }}
        title="ยืนยันการลบ"
        description={deleteDescription}
        confirmLabel="ลบ"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
