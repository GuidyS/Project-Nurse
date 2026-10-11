import { useState, useEffect, useCallback, useMemo } from "react";
import { Edit, Trash2, Save, BookOpen, Loader2, AlertCircle, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";

interface Course {
  // null = วิชาที่มีเฉพาะในหน้า "จัดการหลักสูตร" (ยังไม่มีในตาราง subject) — ระบุวิชาด้วย subject_code แทน
  subject_id: number | null;
  subject_code: string;
  subject_name_th: string;
}

// หลักสูตรที่ใช้งานในระบบ (ตั้งค่าที่หน้า "จัดการหลักสูตร")
interface ActiveCurriculum {
  id: number;
  start_year: number;
  end_year: number;
  is_explicit: boolean;
  label: string;
}

/** Sub PLO มาจากหน้า "ประเมินสมรรถนะหลักแต่ละชั้นปี (YLO)" ตามชั้นปีของรายวิชา */
interface SubPlo {
  id: number;
  code: string;
  description: string;
  plo_code: string;
  plo_name: string;
  year_level: number | null;
  is_scorable: number;
}

/** คะแนนที่ CLO แบ่งให้ Sub PLO แต่ละตัว */
interface SubPloScore {
  sub_plo_id: number;
  max_score: number | null;
  pass_score: number | null;
}

interface CLO {
  clo_id: number;
  clo_code?: string | null;
  description: string;
  ylo_id: string | null;
  mapped_plos?: string[];
  sub_plos?: string[];
  sub_plo_scores?: Record<string, SubPloScore>;
}

/** ค่าที่กรอกในฟอร์มต่อ Sub PLO 1 ตัว (เก็บเป็นข้อความเพื่อให้พิมพ์/ลบได้อิสระ) */
interface ScoreDraft {
  max: string;
  pass: string;
}

interface CLOFormData {
  clo_code: string;
  description: string;
  sub_plos: string[];
  scores: Record<string, ScoreDraft>;
}

interface ScoreBudget {
  budget: number;
  used: number;
  remaining: number;
}

const EMPTY_FORM: CLOFormData = { clo_code: "", description: "", sub_plos: [], scores: {} };

const CLO_OPTIONS = Array.from({ length: 10 }, (_, i) => `CLO${i + 1}`);

/** คะแนนเต็มที่แบ่งได้ต่อ 1 รายวิชา (ต้องตรงกับ OUTCOME_SUBJECT_SCORE_BUDGET ฝั่ง backend) */
const SUBJECT_SCORE_BUDGET = 100;

// เรียงรหัส Sub PLO ตามตัวเลข (1.2 ก่อน 1.10 และ 2.1)
const subCodeOrder = (code: string): number => {
  const m = /^(\d+)\.(\d+)$/.exec(code.trim());
  return m ? Number(m[1]) * 1000 + Number(m[2]) : Number.MAX_SAFE_INTEGER;
};

const sortSubCodes = (codes: string[]): string[] =>
  [...codes].sort((a, b) => subCodeOrder(a) - subCodeOrder(b) || a.localeCompare(b));

const ploNumber = (plo: string): number => Number(plo.replace(/\D/g, "")) || 0;

const sortPloCodes = (codes: string[]): string[] =>
  [...codes].sort((a, b) => ploNumber(a) - ploNumber(b));

/** แปลงข้อความในช่องกรอกเป็นตัวเลข (ว่าง/ไม่ใช่ตัวเลข = 0) */
const toNumber = (value: string): number => {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** ตัดทศนิยมท้ายที่ไม่จำเป็นออก เช่น 12.50 -> 12.5 */
const formatScore = (value: number): string =>
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));

/** คะแนนรวมที่ฟอร์มกำลังแบ่งให้ Sub PLO ที่ติ๊กไว้ */
const sumFormScores = (form: CLOFormData): number =>
  form.sub_plos.reduce((sum, code) => sum + toNumber(form.scores[code]?.max ?? ""), 0);

/**
 * ตารางกำหนด Sub PLO ของ CLO — 1 แถวต่อ 1 Sub PLO
 * ติ๊กเลือก แล้วกรอกคะแนนที่แบ่งให้ และคะแนนผ่านของข้อนั้น
 */
function CloSubPloFields({
  formData,
  setFormData,
  subPloCatalog,
  subjectYlo,
  remaining,
}: {
  formData: CLOFormData;
  setFormData: (data: CLOFormData) => void;
  subPloCatalog: SubPlo[];
  subjectYlo: number | null;
  remaining: number;
}) {
  const toggleSub = (code: string, checked: boolean) => {
    const next = checked
      ? [...formData.sub_plos, code]
      : formData.sub_plos.filter((c) => c !== code);

    const scores = { ...formData.scores };
    if (checked) {
      if (!scores[code]) scores[code] = { max: "", pass: "" };
    } else {
      delete scores[code];
    }
    setFormData({ ...formData, sub_plos: next, scores });
  };

  const setScore = (code: string, field: keyof ScoreDraft, value: string) => {
    // รับเฉพาะตัวเลขและจุดทศนิยม
    const clean = value.replace(/[^\d.]/g, "");
    const current = formData.scores[code] ?? { max: "", pass: "" };
    const next: ScoreDraft = { ...current, [field]: clean };

    // คะแนนผ่านต้องไม่เกินคะแนนที่แบ่งให้ข้อนั้น
    if (field === "max" && toNumber(next.pass) > toNumber(next.max)) {
      next.pass = next.max;
    }
    setFormData({ ...formData, scores: { ...formData.scores, [code]: next } });
  };

  if (subjectYlo === null) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          รายวิชานี้ยังไม่ได้กำหนด YLO — ไปตั้งค่าที่หน้า "จัดการหลักสูตร" ก่อน แล้วระบบจะดึง Sub PLO ของชั้นปีนั้นมาให้อัตโนมัติ
        </span>
      </div>
    );
  }

  if (subPloCatalog.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          ยังไม่มี Sub PLO ของชั้นปีที่ {subjectYlo} — เพิ่มได้ที่หน้า "ประเมินสมรรถนะหลักแต่ละชั้นปี (YLO)"
        </span>
      </div>
    );
  }

  // จัดกลุ่มตาม PLO แม่ เพื่อให้อ่านง่ายเหมือนเอกสารหลักสูตร
  const groups: Record<string, SubPlo[]> = {};
  subPloCatalog.forEach((s) => {
    (groups[s.plo_code] ||= []).push(s);
  });

  return (
    <div className="space-y-3">
      <Label className="text-xs">
        Sub PLO ของ YLO{subjectYlo} (ติ๊กข้อที่ CLO นี้วัด แล้วกำหนดคะแนนให้แต่ละข้อ)
      </Label>

      <div className="rounded-md border border-border divide-y divide-border">
        <div className="grid grid-cols-[1fr_7rem_7rem] gap-2 bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
          <span>Sub PLO</span>
          <span className="text-center">คะแนน</span>
          <span className="text-center">คะแนนผ่าน</span>
        </div>

        {sortPloCodes(Object.keys(groups)).map((plo) => (
          <div key={plo} className="divide-y divide-border/60">
            <div className="bg-accent/20 px-3 py-1.5 text-xs font-semibold text-foreground">{plo}</div>
            {groups[plo].map((sub) => {
              const checked = formData.sub_plos.includes(sub.code);
              const draft = formData.scores[sub.code] ?? { max: "", pass: "" };
              return (
                <div key={sub.code} className="grid grid-cols-[1fr_7rem_7rem] items-center gap-2 px-3 py-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Checkbox
                      id={`sub-${sub.code}`}
                      checked={checked}
                      onCheckedChange={(c) => toggleSub(sub.code, Boolean(c))}
                      className="mt-0.5"
                    />
                    <Label htmlFor={`sub-${sub.code}`} className="text-xs font-normal cursor-pointer leading-relaxed">
                      <span className="font-semibold mr-1">{sub.code}</span>
                      <span className="text-muted-foreground">{sub.description}</span>
                    </Label>
                  </div>
                  <Input
                    inputMode="decimal"
                    className="h-8 text-xs text-center"
                    placeholder="-"
                    disabled={!checked}
                    value={draft.max}
                    onChange={(e) => setScore(sub.code, "max", e.target.value)}
                  />
                  <Input
                    inputMode="decimal"
                    className="h-8 text-xs text-center"
                    placeholder="-"
                    disabled={!checked || toNumber(draft.max) <= 0}
                    value={draft.pass}
                    onChange={(e) => setScore(sub.code, "pass", e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        กรอกคะแนนรวมได้ไม่เกินคะแนนคงเหลือของรายวิชา ({formatScore(Math.max(remaining, 0))} คะแนน)
        และคะแนนผ่านของแต่ละข้อต้องไม่เกินคะแนนที่แบ่งให้ข้อนั้น
      </p>
    </div>
  );
}

/** กล่องแสดงคะแนนคงเหลือของรายวิชา (ดูอย่างเดียว) */
function RemainingScoreBox({ remaining }: { remaining: number }) {
  const over = remaining < 0;
  return (
    <div
      className={
        "rounded-md border px-3 py-2 " +
        (over ? "border-destructive/50 bg-destructive/10" : "border-border bg-muted/30")
      }
    >
      <p className="text-xs text-muted-foreground">คะแนนคงเหลือของรายวิชา (เต็ม {SUBJECT_SCORE_BUDGET})</p>
      <p className={"text-lg font-bold " + (over ? "text-destructive" : "text-foreground")}>
        {formatScore(remaining)} คะแนน
      </p>
      {over && <p className="text-xs text-destructive">แบ่งคะแนนเกินโควตาของรายวิชาแล้ว</p>}
    </div>
  );
}

export default function CLOPage() {
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  // selectedCourse = รหัสวิชา (subject_code)
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  // รายวิชาตามหลักสูตรที่ใช้งานในระบบ — null = ยังไม่มีหลักสูตร (แสดงรายวิชาทั้งหมดแบบเดิม)
  const [curriculum, setCurriculum] = useState<ActiveCurriculum | null>(null);
  const [clos, setClos] = useState<CLO[]>([]);
  const [subPloCatalog, setSubPloCatalog] = useState<SubPlo[]>([]);
  const [subjectYlo, setSubjectYlo] = useState<number | null>(null);
  const [scoreBudget, setScoreBudget] = useState<ScoreBudget>({
    budget: SUBJECT_SCORE_BUDGET,
    used: 0,
    remaining: SUBJECT_SCORE_BUDGET,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [addFormData, setAddFormData] = useState<CLOFormData>(EMPTY_FORM);
  const [editFormData, setEditFormData] = useState<CLOFormData>(EMPTY_FORM);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        // API คืนเฉพาะรายวิชาของหลักสูตรที่ใช้งานในระบบ (ยังไม่มีหลักสูตร = รายวิชาทั้งหมดแบบเดิม)
        const res = await api.get('/index.php?page=get-subjects');
        if (cancelled) return;
        if (res.data.status === 'success') {
          const list: Course[] = res.data.data || [];
          setCourses(list);
          setIsAdmin(res.data.is_admin === true);
          setCurriculum(res.data.curriculum ?? null);
          setSelectedCourse((prev) =>
            list.some((course) => course.subject_code === prev) ? prev : list[0]?.subject_code ?? ""
          );
        } else {
          toast({ title: "ข้อผิดพลาด", description: res.data?.message || "ดึงข้อมูลรายวิชาไม่สำเร็จ", variant: "destructive" });
        }
      } catch {
        if (!cancelled) {
          toast({ title: "ข้อผิดพลาด", description: "ดึงข้อมูลรายวิชาไม่สำเร็จ", variant: "destructive" });
        }
      } finally {
        if (!cancelled) setIsLoadingCourses(false);
      }
    };
    fetchCourses();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const fetchCLOs = useCallback(async (withSpinner = true) => {
    if (!selectedCourse) return;
    if (withSpinner) setIsLoading(true);
    try {
      const res = await api.get('/index.php?page=get-clos', { params: { subject_code: selectedCourse } });
      if (res.data?.status === 'success') {
        const payload = res.data.data;
        if (Array.isArray(payload)) {
          setClos(payload);
        } else {
          setClos(payload?.clos || []);
          setSubPloCatalog(payload?.sub_plo_catalog || []);
          setSubjectYlo(payload?.subject_ylo ?? null);
          setScoreBudget(
            payload?.score_budget ?? { budget: SUBJECT_SCORE_BUDGET, used: 0, remaining: SUBJECT_SCORE_BUDGET }
          );
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

  /** คะแนนที่ CLO ตัวหนึ่งถือไว้ (ใช้คืนโควตาตอนแก้ไข) */
  const cloAllocated = useCallback(
    (cloId: number | null): number => {
      if (cloId === null) return 0;
      const clo = clos.find((c) => c.clo_id === cloId);
      if (!clo?.sub_plo_scores) return 0;
      return Object.values(clo.sub_plo_scores).reduce((sum, s) => sum + (s.max_score ?? 0), 0);
    },
    [clos]
  );

  // คะแนนคงเหลือแบบสด = โควตาที่เหลือ (+ ของ CLO ที่กำลังแก้) − ที่กรอกในฟอร์ม
  const addRemaining = useMemo(
    () => scoreBudget.remaining - sumFormScores(addFormData),
    [scoreBudget.remaining, addFormData]
  );
  const editRemaining = useMemo(
    () => scoreBudget.remaining + cloAllocated(isEditing) - sumFormScores(editFormData),
    [scoreBudget.remaining, cloAllocated, isEditing, editFormData]
  );

  /** แปลงฟอร์มเป็น payload ของ API */
  const buildScorePayload = (form: CLOFormData) => {
    const out: Record<string, { max_score: string; pass_score: string }> = {};
    form.sub_plos.forEach((code) => {
      const draft = form.scores[code] ?? { max: "", pass: "" };
      out[code] = { max_score: draft.max.trim(), pass_score: draft.pass.trim() };
    });
    return out;
  };

  const validateForm = (form: CLOFormData, remaining: number): string | null => {
    if (!form.description.trim()) return "กรุณากรอกคำอธิบาย CLO";
    if (subjectYlo === null) return 'รายวิชานี้ยังไม่ได้กำหนด YLO — ตั้งค่าที่หน้า "จัดการหลักสูตร" ก่อน';
    if (remaining < 0) return "คะแนนที่แบ่งให้ Sub PLO รวมกันเกินคะแนนคงเหลือของรายวิชา";
    for (const code of form.sub_plos) {
      const draft = form.scores[code] ?? { max: "", pass: "" };
      if (draft.pass.trim() !== "" && toNumber(draft.pass) > toNumber(draft.max)) {
        return `คะแนนผ่านของ Sub PLO ${code} ต้องไม่เกินคะแนนที่แบ่งให้ข้อนั้น`;
      }
    }
    return null;
  };

  const handleAdd = async () => {
    const error = validateForm(addFormData, addRemaining);
    if (error) {
      toast({ title: "แจ้งเตือน", description: error, variant: "destructive" });
      return;
    }

    try {
      const res = await api.post('/index.php?page=add-clo', {
        subject_code: selectedCourse,
        clo_code: addFormData.clo_code || null,
        description: addFormData.description,
        sub_plos: addFormData.sub_plos,
        sub_plo_scores: buildScorePayload(addFormData),
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
    } catch (err: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: err?.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const handleEditSave = async () => {
    const error = validateForm(editFormData, editRemaining);
    if (error) {
      toast({ title: "แจ้งเตือน", description: error, variant: "destructive" });
      return;
    }

    try {
      const res = await api.post('/index.php?page=update-clo', {
        clo_id: isEditing,
        subject_code: selectedCourse,
        clo_code: editFormData.clo_code || null,
        description: editFormData.description,
        sub_plos: editFormData.sub_plos,
        sub_plo_scores: buildScorePayload(editFormData),
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
    } catch (err: any) {
      toast({
        title: "ข้อผิดพลาด",
        description: err?.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const openDeleteConfirm = (clo_id: number) => {
    setPendingDeleteId(clo_id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (pendingDeleteId == null) return;

    setIsDeleting(true);
    try {
      const res = await api.post('/index.php?page=delete-clo', {
        clo_id: pendingDeleteId,
        subject_code: selectedCourse,
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
      setIsConfirmOpen(false);
      setPendingDeleteId(null);
      await fetchCLOs(false);
    } catch {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถลบข้อมูลได้", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (clo: CLO) => {
    const codeById = new Map(subPloCatalog.map((s) => [s.id, s.code]));
    const scores: Record<string, ScoreDraft> = {};
    Object.entries(clo.sub_plo_scores || {}).forEach(([code, score]) => {
      const key = code || codeById.get(score.sub_plo_id) || "";
      if (!key) return;
      scores[key] = {
        max: score.max_score === null ? "" : formatScore(score.max_score),
        pass: score.pass_score === null ? "" : formatScore(score.pass_score),
      };
    });

    setIsEditing(clo.clo_id);
    setEditFormData({
      clo_code: clo.clo_code || "",
      description: clo.description,
      sub_plos: clo.sub_plos || [],
      scores,
    });
    setEditOpen(true);
  };

  const closeEditDialog = () => {
    setEditOpen(false);
    setIsEditing(null);
    setEditFormData(EMPTY_FORM);
  };

  /** ข้อความคะแนนของ Sub PLO ใช้แสดงบนรายการ CLO */
  const scoreLabel = (clo: CLO, code: string): string => {
    const score = clo.sub_plo_scores?.[code];
    if (!score || score.max_score === null) return "";
    const pass = score.pass_score === null ? "" : ` / ผ่าน ${formatScore(score.pass_score)}`;
    return ` (${formatScore(score.max_score)} คะแนน${pass})`;
  };

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">การจัดการ CLO รายวิชา</h1>
          <p className="app-page-description">Course Learning Outcomes Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card rounded-xl shadow-card p-4 space-y-5">
            {curriculum && (
              <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Library className="h-4 w-4 text-primary" /> หลักสูตร {curriculum.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  แสดงเฉพาะรายวิชาของหลักสูตรที่ใช้งานในระบบ (เปลี่ยนได้ที่หน้า "จัดการหลักสูตร")
                </p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> เลือกรายวิชา
              </h3>
              <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={courses.length === 0}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingCourses ? "กำลังโหลดรายวิชา..." : "-- เลือกรหัสวิชา --"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.subject_code} value={course.subject_code}>
                      {course.subject_code} - {course.subject_name_th}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">YLO ของรายวิชา</p>
                  {subjectYlo === null ? (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ยังไม่กำหนด — ตั้งค่าที่หน้า "จัดการหลักสูตร"
                    </p>
                  ) : (
                    <Badge variant="secondary" className="mt-1 font-medium">
                      YLO{subjectYlo} — ชั้นปีที่ {subjectYlo}
                    </Badge>
                  )}
                </div>
                <RemainingScoreBox remaining={scoreBudget.remaining} />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          {selectedCourse ? (
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">รายการ CLO</h2>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg mb-6 border border-border">
                <h4 className="text-sm font-semibold mb-3">เพิ่ม CLO ใหม่</h4>
                <div className="grid gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">รหัส CLO</Label>
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
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">กำหนดคะแนนสำหรับ CLO</Label>
                      <RemainingScoreBox remaining={addRemaining} />
                    </div>
                  </div>
                  <Textarea
                    placeholder="รายละเอียด CLO..."
                    value={addFormData.description}
                    onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  />
                  <CloSubPloFields
                    formData={addFormData}
                    setFormData={setAddFormData}
                    subPloCatalog={subPloCatalog}
                    subjectYlo={subjectYlo}
                    remaining={addRemaining}
                  />
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleAdd} className="gap-2" disabled={subjectYlo === null}>
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
                            <Badge className="bg-primary/10 text-primary">
                              {clo.clo_code || `CLO ${index + 1}`}
                            </Badge>
                            {clo.ylo_id && <Badge variant="secondary">{clo.ylo_id}</Badge>}
                            {sortPloCodes(clo.mapped_plos || []).map((plo) => (
                              <Badge key={plo} variant="outline">{plo}</Badge>
                            ))}
                          </div>
                          {(clo.sub_plos || []).length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                              {sortSubCodes(clo.sub_plos || []).map((sub) => (
                                <Badge
                                  key={sub}
                                  variant="outline"
                                  className="border-amber-500/60 text-amber-600 dark:text-amber-400"
                                >
                                  Sub {sub}{scoreLabel(clo, sub)}
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
                            onClick={() => openDeleteConfirm(clo.clo_id)}
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
              {isLoadingCourses ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              ) : (
              <>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              {courses.length === 0 ? (
                <>
                  <h3 className="font-semibold text-foreground mb-2">ไม่มีรายวิชาที่คุณรับผิดชอบ</h3>
                  <p className="text-sm text-muted-foreground">
                    หน้านี้แสดงเฉพาะรายวิชาที่คุณเป็นผู้รับผิดชอบ
                    {curriculum ? ` ในหลักสูตร ${curriculum.label}` : ""}
                    <br />
                    {isAdmin
                      ? 'มอบหมายรายวิชาให้ตัวเองได้ที่หน้า "จัดอาจารย์ผู้สอน"'
                      : "หากต้องการสิทธิ์ กรุณาติดต่อผู้ดูแลระบบเพื่อมอบหมายรายวิชา"}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-foreground mb-2">เลือกรายวิชา</h3>
                  <p className="text-sm text-muted-foreground">กรุณาเลือกรายวิชาด้านซ้ายมือเพื่อดูและแก้ไข CLO</p>
                </>
              )}
              </>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) closeEditDialog(); }}>
        <DialogContent className="app-dialog-2xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>แก้ไข CLO</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">รหัส CLO</Label>
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
              </div>
              <div className="space-y-1">
                <Label className="text-xs">กำหนดคะแนนสำหรับ CLO</Label>
                <RemainingScoreBox remaining={editRemaining} />
              </div>
            </div>
            <Textarea
              placeholder="รายละเอียด CLO..."
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
            <CloSubPloFields
              formData={editFormData}
              setFormData={setEditFormData}
              subPloCatalog={subPloCatalog}
              subjectYlo={subjectYlo}
              remaining={editRemaining}
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

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) setPendingDeleteId(null);
        }}
        title="ยืนยันการลบ"
        description="คุณต้องการลบ CLO นี้ใช่หรือไม่?"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
