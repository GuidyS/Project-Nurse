import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Library,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Cycle {
  id: number;
  start_year: number;
  end_year: number;
  is_active: number;
  subject_count: number;
  total_credits: number;
}

// หลักสูตรที่หน้ารายวิชาอื่นๆ ใช้อยู่ — is_explicit = false คือยังไม่ได้กดเลือก ระบบเลือกตามปีปัจจุบันให้
interface ActiveCycleInfo {
  id: number;
  start_year: number;
  end_year: number;
  is_explicit: boolean;
  label: string;
}

interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  credit: number;
  credit_desc: string | null;
}

interface ImportRow {
  row: number;
  subject_code: string;
  subject_name: string;
  credit: string;
  error: string | null;
}

type SubjectField = 'subject_code' | 'subject_name' | 'credit';
type SubjectErrors = Partial<Record<SubjectField, string>>;
type ImportMode = 'merge' | 'replace';

// หลักสูตรปรับปรุงทุก 5 ปี — ใช้เติมปีสิ้นสุดให้อัตโนมัติ
const CURRICULUM_SPAN = 5;
const YEAR_MIN = 2500;
const YEAR_MAX = 2700;
const CREDIT_MAX = 30;
const CREDIT_PATTERN = /^(\d{1,2})(?:\.0+)?\s*(\(\s*[\d\s\-–]+\s*\))?$/;

// หัวคอลัมน์ที่ยอมรับในไฟล์ Excel (เทียบแบบไม่สนช่องว่าง/ตัวพิมพ์)
const HEADER_ALIASES: Record<SubjectField, string[]> = {
  subject_code: ['รหัสวิชา', 'รหัส', 'subject_code', 'subjectcode', 'code', 'coursecode'],
  subject_name: ['ชื่อวิชา', 'ชื่อรายวิชา', 'ชื่อ', 'subject_name', 'subjectname', 'name', 'coursename'],
  credit: ['จำนวนหน่วยกิต', 'หน่วยกิต', 'credit', 'credits'],
};

const normalizeHeader = (value: unknown) =>
  String(value ?? '').replace(/\s+/g, '').toLowerCase();

const cycleLabel = (cycle: Pick<Cycle, 'start_year' | 'end_year'>) =>
  `พ.ศ. ${cycle.start_year} – ${cycle.end_year}`;

const apiErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string } }; request?: unknown };
  // ส่งคำขอไปแล้วแต่ไม่มีคำตอบ = เซิร์ฟเวอร์ล่ม ไม่ใช่ข้อมูลผิด
  if (err?.request && !err.response) {
    return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่า Docker / Backend ยังทำงานอยู่';
  }
  return err?.response?.data?.message ?? fallback;
};

// เรียงรหัสวิชาแบบตัวเลข: 103-111 อยู่บนสุด และ 103-99 มาก่อน 103-111
const compareSubjectCode = (a: Subject, b: Subject) =>
  a.subject_code.localeCompare(b.subject_code, 'th', { numeric: true, sensitivity: 'base' });

function validateSubject(code: string, name: string, credit: string): SubjectErrors {
  const errors: SubjectErrors = {};
  const trimmedCredit = credit.trim();
  const creditMatch = trimmedCredit.match(CREDIT_PATTERN);

  if (!code.trim()) errors.subject_code = 'กรุณาระบุรหัสวิชา';
  else if (code.trim().length > 50) errors.subject_code = 'รหัสวิชายาวเกิน 50 ตัวอักษร';

  if (!name.trim()) errors.subject_name = 'กรุณาระบุชื่อวิชา';
  else if (name.trim().length > 255) errors.subject_name = 'ชื่อวิชายาวเกิน 255 ตัวอักษร';

  if (!trimmedCredit) errors.credit = 'กรุณาระบุจำนวนหน่วยกิต';
  else if (!creditMatch) errors.credit = 'หน่วยกิตต้องเป็นตัวเลข เช่น 3 หรือ 3(2-2-5)';
  else if (Number(creditMatch[1]) > CREDIT_MAX) errors.credit = `หน่วยกิตต้องไม่เกิน ${CREDIT_MAX}`;

  return errors;
}

function validateYear(value: string, label: string): string | null {
  if (!/^\d{4}$/.test(value.trim())) return `${label}ต้องเป็นปี พ.ศ. 4 หลัก`;
  const year = Number(value);
  if (year < YEAR_MIN || year > YEAR_MAX) return `${label}ต้องอยู่ระหว่าง ${YEAR_MIN} - ${YEAR_MAX}`;
  return null;
}

async function parseCurriculumFile(file: File): Promise<ImportRow[]> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet || !sheet['!ref']) throw new Error('ไม่พบข้อมูลในไฟล์');

  // เก็บเลขแถวให้ตรงกับ Excel เพื่อแจ้งผู้ใช้ว่าแถวไหนผิด
  const firstRow = XLSX.utils.decode_range(sheet['!ref']).s.r;
  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', raw: false, blankrows: true });

  let headerIndex = -1;
  const columns: Record<SubjectField, number> = { subject_code: -1, subject_name: -1, credit: -1 };

  // หัวตารางอาจไม่ได้อยู่แถวแรก (เช่นมีชื่อหลักสูตรอยู่ด้านบน) จึงหาใน 10 แถวแรก
  for (let i = 0; i < Math.min(grid.length, 10); i++) {
    const cells = (grid[i] ?? []).map(normalizeHeader);
    const found = (Object.keys(HEADER_ALIASES) as SubjectField[]).map((field) => {
      const aliases = HEADER_ALIASES[field].map(normalizeHeader);
      return [field, cells.findIndex((cell) => aliases.includes(cell))] as const;
    });
    if (found.every(([, index]) => index >= 0)) {
      headerIndex = i;
      found.forEach(([field, index]) => { columns[field] = index; });
      break;
    }
  }

  if (headerIndex < 0) {
    throw new Error('ไม่พบหัวคอลัมน์ "รหัสวิชา", "ชื่อวิชา" และ "จำนวนหน่วยกิต" ในไฟล์ — ดาวน์โหลดแพทเทิร์นเพื่อดูตัวอย่าง');
  }

  const rows: ImportRow[] = [];
  const seen = new Map<string, number>();

  for (let i = headerIndex + 1; i < grid.length; i++) {
    const cells = grid[i] ?? [];
    const code = String(cells[columns.subject_code] ?? '').trim();
    const name = String(cells[columns.subject_name] ?? '').trim();
    const credit = String(cells[columns.credit] ?? '').trim();
    if (!code && !name && !credit) continue;

    const rowNo = firstRow + i + 1;
    let error = Object.values(validateSubject(code, name, credit))[0] ?? null;
    if (!error) {
      const key = code.toLowerCase();
      if (seen.has(key)) error = `รหัสวิชาซ้ำกับแถวที่ ${seen.get(key)}`;
      else seen.set(key, rowNo);
    }
    rows.push({ row: rowNo, subject_code: code, subject_name: name, credit, error });
  }

  if (rows.length === 0) throw new Error('ไม่พบรายวิชาในไฟล์ (มีแต่หัวตาราง)');
  return rows;
}

function downloadTemplate() {
  const sheet = XLSX.utils.aoa_to_sheet([
    ['รหัสวิชา', 'ชื่อวิชา', 'จำนวนหน่วยกิต'],
    ['103-111', 'ภาษาอังกฤษพื้นฐาน', 3],
    ['103-112', 'การสื่อสารภาษาอังกฤษในชีวิตประจำวัน', '3(2-2-5)'],
  ]);
  sheet['!cols'] = [{ wch: 14 }, { wch: 45 }, { wch: 16 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'รายวิชา');
  XLSX.writeFile(workbook, 'แพทเทิร์นหลักสูตร.xlsx');
}

const emptyCycleForm = { id: null as number | null, start: '', end: '', endTouched: false, error: '' };
const emptySubjectForm = { id: null as number | null, subject_code: '', subject_name: '', credit: '' };

export default function CurriculumCycles() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingCycles, setIsLoadingCycles] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [search, setSearch] = useState('');

  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [cycleForm, setCycleForm] = useState(emptyCycleForm);
  const [isSavingCycle, setIsSavingCycle] = useState(false);

  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [subjectErrors, setSubjectErrors] = useState<SubjectErrors>({});
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<
    | { kind: 'cycle'; cycle: Cycle }
    | { kind: 'subject'; subject: Subject }
    | { kind: 'subjects'; subjects: Subject[] }
    | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [activeCycle, setActiveCycle] = useState<ActiveCycleInfo | null>(null);
  const [activateConfirmOpen, setActivateConfirmOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const selectedCycle = cycles.find((c) => String(c.id) === selectedCycleId) ?? null;

  const fetchCycles = useCallback(async (preferId?: number) => {
    setIsLoadingCycles(true);
    try {
      const res = await api.get('/index.php?page=get-curriculum-cycles');
      const list: Cycle[] = res.data?.data?.cycles ?? [];
      const active: ActiveCycleInfo | null = res.data?.data?.active_cycle ?? null;
      setCycles(list);
      setActiveCycle(active);
      setSelectedCycleId((current) => {
        // เปิดหน้าครั้งแรก → แสดงหลักสูตรที่ใช้งานในระบบก่อน
        const wanted = preferId ?? (current ? Number(current) : active?.id);
        const target = list.find((c) => c.id === wanted) ?? list[0];
        return target ? String(target.id) : '';
      });
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: apiErrorMessage(error, 'โหลดรายการหลักสูตรไม่สำเร็จ'), variant: 'destructive' });
    } finally {
      setIsLoadingCycles(false);
    }
  }, [toast]);

  const fetchSubjects = useCallback(async (cycleId: string) => {
    if (!cycleId) {
      setSubjects([]);
      return;
    }
    setIsLoadingSubjects(true);
    try {
      const res = await api.get('/index.php?page=get-curriculum-cycles', { params: { cycle_id: cycleId } });
      const list: Subject[] = [...(res.data?.data?.subjects ?? [])].sort(compareSubjectCode);
      setSubjects(list);
      // วิชาที่ถูกลบไปแล้วต้องไม่ค้างอยู่ในรายการที่เลือก
      setSelectedIds((prev) => new Set(list.filter((s) => prev.has(s.id)).map((s) => s.id)));
      // อัปเดตจำนวนวิชา/หน่วยกิตรวม และหลักสูตรที่ใช้งานไปพร้อมกัน
      setCycles(res.data?.data?.cycles ?? []);
      setActiveCycle(res.data?.data?.active_cycle ?? null);
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: apiErrorMessage(error, 'โหลดรายวิชาไม่สำเร็จ'), variant: 'destructive' });
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    setSearch('');
    setSelectedIds(new Set());
    fetchSubjects(selectedCycleId);
  }, [selectedCycleId, fetchSubjects]);

  const filteredSubjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return subjects;
    return subjects.filter(
      (s) => s.subject_code.toLowerCase().includes(keyword) || s.subject_name.toLowerCase().includes(keyword),
    );
  }, [subjects, search]);

  const allVisibleSelected =
    filteredSubjects.length > 0 && filteredSubjects.every((s) => selectedIds.has(s.id));

  const toggleSubject = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // "เลือกทั้งหมด" มีผลกับวิชาที่แสดงอยู่ (ตามคำค้นหา)
  const toggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredSubjects.forEach((s) => {
        if (checked) next.add(s.id);
        else next.delete(s.id);
      });
      return next;
    });
  };

  const openBulkDelete = () => {
    const chosen = subjects.filter((s) => selectedIds.has(s.id));
    if (chosen.length > 0) setPendingDelete({ kind: 'subjects', subjects: chosen });
  };

  // ---------- หลักสูตร ----------
  const openCreateCycle = () => {
    setCycleForm(emptyCycleForm);
    setCycleDialogOpen(true);
  };

  const openEditCycle = () => {
    if (!selectedCycle) return;
    setCycleForm({
      id: selectedCycle.id,
      start: String(selectedCycle.start_year),
      end: String(selectedCycle.end_year),
      endTouched: true,
      error: '',
    });
    setCycleDialogOpen(true);
  };

  const handleStartYearChange = (value: string) => {
    const start = value.replace(/\D/g, '').slice(0, 4);
    setCycleForm((form) => ({
      ...form,
      start,
      // ยังไม่ได้แก้ปีสิ้นสุดเอง → เติมให้ +5 ปี
      end: !form.endTouched && start.length === 4 ? String(Number(start) + CURRICULUM_SPAN) : form.end,
      error: '',
    }));
  };

  const saveCycle = async () => {
    const error =
      validateYear(cycleForm.start, 'ปีเริ่มต้น') ??
      validateYear(cycleForm.end, 'ปีสิ้นสุด') ??
      (Number(cycleForm.end) <= Number(cycleForm.start) ? 'ปีสิ้นสุดต้องมากกว่าปีเริ่มต้น' : null);
    if (error) {
      setCycleForm((form) => ({ ...form, error }));
      return;
    }

    setIsSavingCycle(true);
    try {
      const res = await api.post('/index.php?page=save-curriculum-cycle', {
        id: cycleForm.id,
        start_year: Number(cycleForm.start),
        end_year: Number(cycleForm.end),
      });
      toast({ title: 'บันทึกสำเร็จ', description: res.data.message });
      setCycleDialogOpen(false);
      await fetchCycles(res.data?.data?.id);
    } catch (err) {
      setCycleForm((form) => ({ ...form, error: apiErrorMessage(err, 'บันทึกหลักสูตรไม่สำเร็จ') }));
    } finally {
      setIsSavingCycle(false);
    }
  };

  // ตั้งหลักสูตรที่เลือกเป็นหลักสูตรที่ใช้งานทั้งระบบ (หน้ารายวิชาอื่นๆ แสดงเฉพาะวิชาของหลักสูตรนี้)
  const activateSelectedCycle = async () => {
    if (!selectedCycle) return;
    setIsActivating(true);
    try {
      const res = await api.post('/index.php?page=activate-curriculum-cycle', { id: selectedCycle.id });
      toast({ title: 'ตั้งค่าสำเร็จ', description: res.data.message });
      setActivateConfirmOpen(false);
      await fetchSubjects(selectedCycleId);
    } catch (err) {
      toast({ title: 'ตั้งค่าไม่สำเร็จ', description: apiErrorMessage(err, 'ตั้งหลักสูตรที่ใช้งานไม่สำเร็จ'), variant: 'destructive' });
    } finally {
      setIsActivating(false);
    }
  };

  // ---------- รายวิชา ----------
  const openAddSubject = () => {
    setSubjectForm(emptySubjectForm);
    setSubjectErrors({});
    setSubjectDialogOpen(true);
  };

  const openEditSubject = (subject: Subject) => {
    setSubjectForm({
      id: subject.id,
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      credit: subject.credit_desc ?? String(subject.credit),
    });
    setSubjectErrors({});
    setSubjectDialogOpen(true);
  };

  const updateSubjectField = (field: SubjectField, value: string) => {
    setSubjectForm((form) => ({ ...form, [field]: value }));
    setSubjectErrors((errors) => ({ ...errors, [field]: undefined }));
  };

  const saveSubject = async () => {
    const errors = validateSubject(subjectForm.subject_code, subjectForm.subject_name, subjectForm.credit);
    if (Object.keys(errors).length > 0) {
      setSubjectErrors(errors);
      return;
    }

    setIsSavingSubject(true);
    try {
      const res = await api.post('/index.php?page=save-curriculum-subject', {
        cycle_id: Number(selectedCycleId),
        id: subjectForm.id,
        subject_code: subjectForm.subject_code.trim(),
        subject_name: subjectForm.subject_name.trim(),
        credit: subjectForm.credit.trim(),
      });
      toast({ title: 'บันทึกสำเร็จ', description: res.data.message });
      setSubjectDialogOpen(false);
      await fetchSubjects(selectedCycleId);
    } catch (err) {
      const message = apiErrorMessage(err, 'บันทึกรายวิชาไม่สำเร็จ');
      // รหัสซ้ำ → แสดงใต้ช่องรหัสวิชา
      if ((err as { response?: { status?: number } })?.response?.status === 409) {
        setSubjectErrors({ subject_code: message });
      } else {
        toast({ title: 'บันทึกไม่สำเร็จ', description: message, variant: 'destructive' });
      }
    } finally {
      setIsSavingSubject(false);
    }
  };

  // ---------- ลบ ----------
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const res =
        pendingDelete.kind === 'cycle'
          ? await api.post('/index.php?page=delete-curriculum-cycle', { id: pendingDelete.cycle.id })
          : pendingDelete.kind === 'subject'
            ? await api.post('/index.php?page=delete-curriculum-subject', { id: pendingDelete.subject.id })
            : await api.post('/index.php?page=delete-curriculum-subjects', {
                cycle_id: Number(selectedCycleId),
                ids: pendingDelete.subjects.map((s) => s.id),
              });
      toast({ title: 'ลบสำเร็จ', description: res.data.message });
      const kind = pendingDelete.kind;
      setPendingDelete(null);
      if (kind === 'cycle') await fetchCycles();
      else await fetchSubjects(selectedCycleId);
    } catch (err) {
      toast({ title: 'ลบไม่สำเร็จ', description: apiErrorMessage(err, 'ลบข้อมูลไม่สำเร็จ'), variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------- นำเข้า Excel ----------
  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // เลือกไฟล์เดิมซ้ำได้หลังแก้ไฟล์
    if (!file) return;

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      toast({ title: 'ไฟล์ไม่ถูกต้อง', description: 'รองรับเฉพาะไฟล์ .xlsx และ .xls', variant: 'destructive' });
      return;
    }

    setIsParsing(true);
    try {
      const rows = await parseCurriculumFile(file);
      setImportFileName(file.name);
      setImportRows(rows);
      setImportMode('merge');
      setImportDialogOpen(true);
    } catch (err) {
      toast({
        title: 'อ่านไฟล์ไม่สำเร็จ',
        description: err instanceof Error ? err.message : 'ไฟล์เสียหรือไม่ใช่ไฟล์ Excel',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const existingCodes = useMemo(
    () => new Set(subjects.map((s) => s.subject_code.toLowerCase())),
    [subjects],
  );
  const importErrorCount = importRows.filter((r) => r.error).length;
  const importUpdateCount =
    importMode === 'merge'
      ? importRows.filter((r) => !r.error && existingCodes.has(r.subject_code.toLowerCase())).length
      : 0;
  const importNewCount = importRows.length - importErrorCount - importUpdateCount;

  const submitImport = async () => {
    setIsImporting(true);
    try {
      const res = await api.post('/index.php?page=import-curriculum-subjects', {
        cycle_id: Number(selectedCycleId),
        mode: importMode,
        subjects: importRows.map(({ row, subject_code, subject_name, credit }) => ({
          row,
          subject_code,
          subject_name,
          credit,
        })),
      });
      toast({ title: 'นำเข้าสำเร็จ', description: res.data.message });
      setImportDialogOpen(false);
      await fetchSubjects(selectedCycleId);
    } catch (err) {
      const serverErrors = (err as { response?: { data?: { errors?: { row: number; message: string }[] } } })
        ?.response?.data?.errors;
      if (serverErrors?.length) {
        const byRow = new Map(serverErrors.map((e) => [e.row, e.message]));
        setImportRows((rows) => rows.map((r) => ({ ...r, error: byRow.get(r.row) ?? r.error })));
      }
      toast({ title: 'นำเข้าไม่สำเร็จ', description: apiErrorMessage(err, 'นำเข้ารายวิชาไม่สำเร็จ'), variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight leading-snug">จัดการหลักสูตร</h1>
          <p className="text-muted-foreground">
            กำหนดรายวิชาของหลักสูตรแต่ละรอบ (ปรับปรุงทุก {CURRICULUM_SPAN} ปี) ด้วยไฟล์ Excel หรือเพิ่ม-ลดรายวิชาทีละวิชา
          </p>
        </div>
        <Button onClick={openCreateCycle}>
          <Plus className="mr-2 h-4 w-4" /> สร้างหลักสูตรใหม่
        </Button>
      </div>

      {isLoadingCycles && cycles.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : cycles.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-14 text-center">
            <Library className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="font-medium">ยังไม่มีหลักสูตรในระบบ</p>
            <p className="text-sm text-muted-foreground">
              เริ่มจากสร้างหลักสูตรพร้อมระบุปี เช่น 2566 – 2571 แล้วอัปโหลดไฟล์รายวิชา
            </p>
            <Button onClick={openCreateCycle}>
              <Plus className="mr-2 h-4 w-4" /> สร้างหลักสูตรใหม่
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-end gap-4 pt-6">
              <div className="min-w-[260px] space-y-2">
                <Label>หลักสูตร</Label>
                <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหลักสูตร" />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        หลักสูตร {cycleLabel(c)}
                        {activeCycle?.id === c.id ? ' • ใช้งานในระบบ' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={openEditCycle} disabled={!selectedCycle}>
                <Pencil className="mr-2 h-4 w-4" /> แก้ไขปี
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => selectedCycle && setPendingDelete({ kind: 'cycle', cycle: selectedCycle })}
                disabled={!selectedCycle}
              >
                <Trash2 className="mr-2 h-4 w-4" /> ลบหลักสูตร
              </Button>
              {selectedCycle && activeCycle?.id === selectedCycle.id && (
                <Badge className="h-10 gap-1.5 bg-emerald-600 px-3 text-sm text-white hover:bg-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {activeCycle.is_explicit ? 'หลักสูตรที่ใช้งานในระบบ' : 'ใช้งานในระบบ (เลือกอัตโนมัติตามปีปัจจุบัน)'}
                </Badge>
              )}
              {selectedCycle && !(activeCycle?.id === selectedCycle.id && activeCycle.is_explicit) && (
                <Button onClick={() => setActivateConfirmOpen(true)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> ใช้หลักสูตรนี้ทั้งระบบ
                </Button>
              )}
              {selectedCycle && (
                <div className="ml-auto flex gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {selectedCycle.subject_count} วิชา
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    รวม {selectedCycle.total_credits} หน่วยกิต
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedCycle && (
            <Card>
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Library className="h-5 w-5 text-primary" /> รายวิชาในหลักสูตร {cycleLabel(selectedCycle)}
                  </CardTitle>
                  <CardDescription>
                    ไฟล์ Excel ต้องมีคอลัมน์ รหัสวิชา, ชื่อวิชา และ จำนวนหน่วยกิต
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="ค้นหารหัสวิชาหรือชื่อวิชา"
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" /> ดาวน์โหลดแพทเทิร์น
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isParsing}>
                    {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    อัปโหลด Excel
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                  <Button onClick={openAddSubject}>
                    <Plus className="mr-2 h-4 w-4" /> เพิ่มวิชา
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedIds.size > 0 && (
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2">
                    <span className="text-sm font-medium">เลือกแล้ว {selectedIds.size} วิชา</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                      ยกเลิกการเลือก
                    </Button>
                    <Button variant="destructive" size="sm" className="ml-auto" onClick={openBulkDelete}>
                      <Trash2 className="mr-2 h-4 w-4" /> ลบที่เลือก ({selectedIds.size})
                    </Button>
                  </div>
                )}
                {isLoadingSubjects ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="space-y-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                    <FileSpreadsheet className="mx-auto h-8 w-8" />
                    <p>ยังไม่มีรายวิชาในหลักสูตรนี้ — อัปโหลดไฟล์ Excel หรือกด "เพิ่มวิชา"</p>
                  </div>
                ) : filteredSubjects.length === 0 ? (
                  <p className="py-12 text-center text-muted-foreground">ไม่พบรายวิชาที่ตรงกับ "{search}"</p>
                ) : (
                  <div className="max-h-[36rem] overflow-auto overscroll-contain rounded-lg border [&>div]:overflow-visible">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-card">
                        <TableRow>
                          <TableHead className="w-[50px] text-center">
                            <Checkbox
                              checked={allVisibleSelected}
                              onCheckedChange={(checked) => toggleAllVisible(checked === true)}
                              aria-label="เลือกทั้งหมด"
                              title="เลือกทั้งหมด"
                              className="align-middle"
                            />
                          </TableHead>
                          <TableHead className="w-[70px] text-center">ลำดับ</TableHead>
                          <TableHead className="w-[140px]">รหัสวิชา</TableHead>
                          <TableHead>ชื่อวิชา</TableHead>
                          <TableHead className="w-[140px] text-center">หน่วยกิต</TableHead>
                          <TableHead className="w-[110px] text-right">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubjects.map((subject, index) => (
                          <TableRow key={subject.id} data-state={selectedIds.has(subject.id) ? 'selected' : undefined}>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={selectedIds.has(subject.id)}
                                onCheckedChange={(checked) => toggleSubject(subject.id, checked === true)}
                                aria-label={`เลือกวิชา ${subject.subject_code}`}
                                className="align-middle"
                              />
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium">{subject.subject_code}</TableCell>
                            <TableCell>{subject.subject_name}</TableCell>
                            <TableCell className="text-center">{subject.credit_desc ?? subject.credit}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="แก้ไขวิชา"
                                onClick={() => openEditSubject(subject)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="ลบวิชา"
                                onClick={() => setPendingDelete({ kind: 'subject', subject })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Pop-up สร้าง/แก้ไขปีหลักสูตร */}
      <Dialog open={cycleDialogOpen} onOpenChange={(open) => !isSavingCycle && setCycleDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveCycle();
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>{cycleForm.id ? 'แก้ไขปีของหลักสูตร' : 'สร้างหลักสูตรใหม่'}</DialogTitle>
              <DialogDescription>
                กรอกปีเริ่มต้น ระบบจะเติมปีสิ้นสุดให้อีก {CURRICULUM_SPAN} ปี (แก้ไขได้)
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycle-start" className={cn(cycleForm.error && 'text-red-600')}>ปีเริ่มต้น (พ.ศ.)</Label>
                <Input
                  id="cycle-start"
                  inputMode="numeric"
                  placeholder="2566"
                  value={cycleForm.start}
                  onChange={(e) => handleStartYearChange(e.target.value)}
                  error={Boolean(cycleForm.error)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle-end" className={cn(cycleForm.error && 'text-red-600')}>ปีสิ้นสุด (พ.ศ.)</Label>
                <Input
                  id="cycle-end"
                  inputMode="numeric"
                  placeholder="2571"
                  value={cycleForm.end}
                  onChange={(e) =>
                    setCycleForm((form) => ({
                      ...form,
                      end: e.target.value.replace(/\D/g, '').slice(0, 4),
                      endTouched: true,
                      error: '',
                    }))
                  }
                  error={Boolean(cycleForm.error)}
                />
              </div>
            </div>
            {cycleForm.error ? (
              <p className="text-sm text-red-600">{cycleForm.error}</p>
            ) : (
              cycleForm.start.length === 4 &&
              cycleForm.end.length === 4 && (
                <p className="text-sm text-muted-foreground">
                  จะบันทึกเป็น <span className="font-medium text-foreground">หลักสูตร พ.ศ. {cycleForm.start} – {cycleForm.end}</span>
                </p>
              )
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCycleDialogOpen(false)} disabled={isSavingCycle}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSavingCycle}>
                {isSavingCycle && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pop-up เพิ่ม/แก้ไขวิชา */}
      <Dialog open={subjectDialogOpen} onOpenChange={(open) => !isSavingSubject && setSubjectDialogOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSubject();
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>{subjectForm.id ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชา'}</DialogTitle>
              <DialogDescription>
                {selectedCycle ? `หลักสูตร ${cycleLabel(selectedCycle)}` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="subject-code" className={cn(subjectErrors.subject_code && 'text-red-600')}>รหัสวิชา</Label>
              <Input
                id="subject-code"
                placeholder="เช่น 103-111"
                value={subjectForm.subject_code}
                onChange={(e) => updateSubjectField('subject_code', e.target.value)}
                error={Boolean(subjectErrors.subject_code)}
                autoFocus
              />
              {subjectErrors.subject_code && <p className="text-sm text-red-600">{subjectErrors.subject_code}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-name" className={cn(subjectErrors.subject_name && 'text-red-600')}>ชื่อวิชา</Label>
              <Input
                id="subject-name"
                placeholder="เช่น ภาษาอังกฤษพื้นฐาน"
                value={subjectForm.subject_name}
                onChange={(e) => updateSubjectField('subject_name', e.target.value)}
                error={Boolean(subjectErrors.subject_name)}
              />
              {subjectErrors.subject_name && <p className="text-sm text-red-600">{subjectErrors.subject_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-credit" className={cn(subjectErrors.credit && 'text-red-600')}>จำนวนหน่วยกิต</Label>
              <Input
                id="subject-credit"
                placeholder="เช่น 3 หรือ 3(2-2-5)"
                value={subjectForm.credit}
                onChange={(e) => updateSubjectField('credit', e.target.value)}
                error={Boolean(subjectErrors.credit)}
              />
              {subjectErrors.credit && <p className="text-sm text-red-600">{subjectErrors.credit}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubjectDialogOpen(false)} disabled={isSavingSubject}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSavingSubject}>
                {isSavingSubject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {subjectForm.id ? 'บันทึก' : 'เพิ่มวิชา'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pop-up ตรวจสอบไฟล์ก่อนนำเข้า */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => !isImporting && setImportDialogOpen(open)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" /> ตรวจสอบข้อมูลก่อนนำเข้า
            </DialogTitle>
            <DialogDescription>
              {importFileName} → หลักสูตร {selectedCycle ? cycleLabel(selectedCycle) : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">ทั้งหมด {importRows.length} แถว</Badge>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">เพิ่มใหม่ {importNewCount}</Badge>
            {importMode === 'merge' && (
              <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">อัปเดตวิชาเดิม {importUpdateCount}</Badge>
            )}
            {importErrorCount > 0 && <Badge variant="destructive">ผิดพลาด {importErrorCount}</Badge>}
          </div>

          {importErrorCount > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>พบข้อมูลไม่ถูกต้อง {importErrorCount} แถว (แถบสีแดงด้านล่าง) กรุณาแก้ไขไฟล์แล้วอัปโหลดใหม่</span>
            </div>
          )}

          <div className="max-h-[20rem] overflow-auto overscroll-contain rounded-lg border [&>div]:overflow-visible">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-[70px] text-center">แถว</TableHead>
                  <TableHead className="w-[120px]">รหัสวิชา</TableHead>
                  <TableHead>ชื่อวิชา</TableHead>
                  <TableHead className="w-[100px] text-center">หน่วยกิต</TableHead>
                  <TableHead className="w-[170px]">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importRows.map((r) => (
                  <TableRow key={r.row} className={cn(r.error && 'bg-red-50 hover:bg-red-50')}>
                    <TableCell className="text-center text-muted-foreground">{r.row}</TableCell>
                    <TableCell className="font-medium">{r.subject_code || '-'}</TableCell>
                    <TableCell>{r.subject_name || '-'}</TableCell>
                    <TableCell className="text-center">{r.credit || '-'}</TableCell>
                    <TableCell>
                      {r.error ? (
                        <span className="text-xs text-red-600">{r.error}</span>
                      ) : importMode === 'merge' && existingCodes.has(r.subject_code.toLowerCase()) ? (
                        <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">อัปเดต</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">ใหม่</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {subjects.length > 0 && (
            <RadioGroup
              value={importMode}
              onValueChange={(value) => setImportMode(value as ImportMode)}
              className="space-y-2"
            >
              <Label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 font-normal">
                <RadioGroupItem value="merge" className="mt-0.5" />
                <span>
                  <span className="font-medium">เพิ่ม/อัปเดตรายวิชา</span>
                  <span className="block text-sm text-muted-foreground">
                    วิชาใหม่จะถูกเพิ่ม วิชาที่รหัสซ้ำจะอัปเดตชื่อและหน่วยกิต วิชาเดิมที่ไม่มีในไฟล์ยังอยู่ครบ
                  </span>
                </span>
              </Label>
              <Label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 font-normal">
                <RadioGroupItem value="replace" className="mt-0.5" />
                <span>
                  <span className="font-medium text-destructive">แทนที่รายวิชาทั้งหมด</span>
                  <span className="block text-sm text-muted-foreground">
                    ลบรายวิชาเดิม {subjects.length} วิชาของหลักสูตรนี้ แล้วใช้ตามไฟล์เท่านั้น
                  </span>
                </span>
              </Label>
            </RadioGroup>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={isImporting}>
              ยกเลิก
            </Button>
            <Button
              onClick={submitImport}
              disabled={isImporting || importErrorCount > 0}
              variant={importMode === 'replace' ? 'destructive' : 'default'}
            >
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {importMode === 'replace' ? 'แทนที่ด้วย' : 'นำเข้า'} {importRows.length - importErrorCount} วิชา
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ยืนยันการตั้งหลักสูตรที่ใช้งานทั้งระบบ */}
      <AlertDialog open={activateConfirmOpen} onOpenChange={(open) => !isActivating && setActivateConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ใช้หลักสูตร {selectedCycle ? cycleLabel(selectedCycle) : ''} ทั้งระบบ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              หน้าที่เกี่ยวกับรายวิชาจะแสดงเฉพาะ {selectedCycle?.subject_count ?? 0} วิชาของหลักสูตรนี้ ได้แก่ กำหนด CLO รายวิชา,
              จัดการ CLO, ตาราง CLO Map, จัดอาจารย์ผู้สอน, เชื่อมโยงระดับ LO, จัดส่งคลังเอกสาร
              และหน้ารายวิชาของอาจารย์ (รายวิชา, วิชาที่รับผิดชอบ, ผล CLO รายบุคคล, จัดการผลการเรียน, รายชื่อนักศึกษา)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivating}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              disabled={isActivating}
              onClick={(e) => {
                e.preventDefault();
                activateSelectedCycle();
              }}
            >
              {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ใช้หลักสูตรนี้
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ยืนยันการลบ */}
      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && !isDeleting && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === 'cycle'
                ? `ลบหลักสูตร ${cycleLabel(pendingDelete.cycle)}?`
                : pendingDelete?.kind === 'subjects'
                  ? `ลบรายวิชาที่เลือก ${pendingDelete.subjects.length} วิชา?`
                  : `ลบวิชา ${pendingDelete?.kind === 'subject' ? pendingDelete.subject.subject_code : ''}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === 'cycle'
                ? `รายวิชาทั้งหมด ${pendingDelete.cycle.subject_count} วิชาในหลักสูตรนี้จะถูกลบไปด้วย และกู้คืนไม่ได้`
                : pendingDelete?.kind === 'subject'
                  ? `"${pendingDelete.subject.subject_name}" จะถูกนำออกจากหลักสูตรนี้`
                  : pendingDelete?.kind === 'subjects'
                    ? 'รายวิชาต่อไปนี้จะถูกนำออกจากหลักสูตรนี้ และกู้คืนไม่ได้'
                    : ''}
            </AlertDialogDescription>
            {pendingDelete?.kind === 'subjects' && (
              <ul className="max-h-48 overflow-y-auto rounded-md border px-4 py-2 text-left text-sm">
                {pendingDelete.subjects.map((s) => (
                  <li key={s.id} className="py-0.5">
                    <span className="font-medium">{s.subject_code}</span> {s.subject_name}
                  </li>
                ))}
              </ul>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}