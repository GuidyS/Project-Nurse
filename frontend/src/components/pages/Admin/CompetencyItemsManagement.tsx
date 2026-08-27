import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, ListChecks, Save, X } from "lucide-react";
import api from "@/lib/axios";

interface Framework {
  id: number;
  curriculum_year: number;
  program_name: string;
}

interface CompetencyItem {
  id: number;
  plo_id: number | null;
  year_level: number;
  sequence_no: number;
  competency_name: string;
  is_scorable: number;
}

interface PloGroup {
  plo_id: number;
  plo_code: string;
  plo_name: string;
  items: CompetencyItem[];
}

const emptyDraft = { id: null as number | null, competency_name: "", sequence_no: "", is_scorable: true };

export default function CompetencyItemsManagement() {
  const { toast } = useToast();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworkId, setFrameworkId] = useState<string>("");
  const [yearLevel, setYearLevel] = useState<string>("1");
  const [groups, setGroups] = useState<PloGroup[]>([]);
  const [isLoadingFrameworks, setIsLoadingFrameworks] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [editingPloId, setEditingPloId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFrameworks = async () => {
    try {
      setIsLoadingFrameworks(true);
      const res = await api.get("/index.php?page=competency-items");
      if (res.data.status === "success") {
        setFrameworks(res.data.data);
        if (res.data.data.length > 0) setFrameworkId(String(res.data.data[0].id));
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดรายชื่อหลักสูตรไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsLoadingFrameworks(false);
    }
  };

  const fetchItems = async () => {
    if (!frameworkId) return;
    try {
      setIsLoadingItems(true);
      const res = await api.get(
        `/index.php?page=competency-items&framework_id=${frameworkId}&year_level=${yearLevel}`
      );
      if (res.data.status === "success") {
        setGroups(res.data.data);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดรายการประเมินไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchFrameworks();
  }, []);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameworkId, yearLevel]);

  const startAdd = (ploId: number, nextSeq: number) => {
    setEditingPloId(ploId);
    setDraft({ id: null, competency_name: "", sequence_no: String(nextSeq), is_scorable: true });
  };

  const startEdit = (ploId: number, item: CompetencyItem) => {
    setEditingPloId(ploId);
    setDraft({
      id: item.id,
      competency_name: item.competency_name,
      sequence_no: String(item.sequence_no),
      is_scorable: Boolean(item.is_scorable),
    });
  };

  const cancelEdit = () => {
    setEditingPloId(null);
    setDraft(emptyDraft);
  };

  const handleSave = async (ploId: number) => {
    if (!draft.competency_name.trim() || !draft.sequence_no) {
      toast({ title: "กรอกไม่ครบ", description: "กรุณากรอกลำดับและรายการประเมิน", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post("/index.php?page=save-competency-item", {
        id: draft.id,
        plo_id: ploId, // ถ้าเป็น 0 Backend จะบันทึกเป็น NULL
        year_level: Number(yearLevel),
        sequence_no: Number(draft.sequence_no),
        competency_name: draft.competency_name.trim(),
        is_scorable: draft.is_scorable ? 1 : 0,
      });
      if (res.data.status === "success") {
        toast({ title: "บันทึกสำเร็จ" });
        cancelEdit();
        fetchItems();
      } else {
        toast({ title: "บันทึกไม่สำเร็จ", description: res.data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "บันทึกรายการไม่สำเร็จ", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    setDeletingId(itemId);
    try {
      const res = await api.delete(`/index.php?page=delete-competency-item&id=${itemId}`);
      if (res.data.status === "success") {
        toast({ title: "ลบสำเร็จ" });
        fetchItems();
      } else {
        toast({ title: "ลบไม่สำเร็จ", description: res.data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ลบรายการไม่สำเร็จ", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">จัดการรายการประเมินสมรรถนะหลัก</h1>
          <p className="text-muted-foreground text-sm">สร้าง/แก้ไข/ลบรายการประเมินแยกตามหลักสูตรและชั้นปี (ทั้งแบบผูก PLO และไม่ผูก PLO)</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
          <div className="space-y-2 min-w-[240px]">
            <Label>หลักสูตร</Label>
            {isLoadingFrameworks ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Select value={frameworkId} onValueChange={setFrameworkId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหลักสูตร" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.program_name} (ปรับปรุง {f.curriculum_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2 w-40">
            <Label>ชั้นปีที่</Label>
            <Select value={yearLevel} onValueChange={setYearLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((y) => (
                  <SelectItem key={y} value={String(y)}>ชั้นปีที่ {y}</SelectItem>
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
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.plo_id} className={group.plo_id === 0 ? "border-dashed border-primary/50 bg-muted/10" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{group.plo_code}</span>
                  <span className="text-muted-foreground font-normal">{group.plo_name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.items.length === 0 && editingPloId !== group.plo_id && (
                  <p className="text-sm text-muted-foreground italic">ยังไม่มีรายการประเมินในหมวดนี้</p>
                )}

                {group.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 border rounded-md p-3 bg-background">
                    <span className="text-sm font-medium text-muted-foreground w-8 shrink-0">{item.sequence_no}.</span>
                    <div className="flex-1 text-sm">
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
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}

                {editingPloId === group.plo_id ? (
                  <div className="border border-primary/40 rounded-md p-3 space-y-3 bg-muted/30">
                    <div className="flex gap-3">
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">ลำดับ</Label>
                        <Input
                          type="number"
                          value={draft.sequence_no}
                          onChange={(e) => setDraft((d) => ({ ...d, sequence_no: e.target.value }))}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">รายการประเมินสมรรถนะ</Label>
                        <Input
                          value={draft.competency_name}
                          onChange={(e) => setDraft((d) => ({ ...d, competency_name: e.target.value }))}
                          placeholder="พิมพ์ข้อความรายการประเมิน"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`scorable-${group.plo_id}`}
                          checked={draft.is_scorable}
                          onCheckedChange={(c) => setDraft((d) => ({ ...d, is_scorable: Boolean(c) }))}
                        />
                        <Label htmlFor={`scorable-${group.plo_id}`} className="text-sm cursor-pointer">
                          ต้องให้คะแนน (ถ้าไม่ติ๊ก = แสดงเป็น "ไม่ต้องประเมิน")
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
                    className="gap-1 text-primary"
                    onClick={() => startAdd(group.plo_id, group.items.length + 1)}
                  >
                    <Plus className="h-4 w-4" /> เพิ่มรายการในหมวดนี้
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}