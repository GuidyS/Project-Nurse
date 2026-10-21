import { useEffect, useMemo, useRef, useState } from "react";
import { getAcademicYear, academicYearOptions, academicNow } from "@/lib/academicYear";
import { useAcademicYear } from "@/hooks/use-academic-year";
import {
  BarChart3,
  Banknote,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Microscope,
  MinusCircle,
  PlusCircle,
  Pencil,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AuthorRole = "first_author" | "corresponding" | "co_author";
type PublicationType = "research" | "academic" | "textbook";
type YearMode = "calendar" | "academic";
type WorkCategory = "research" | "innovation";
type FundingType = "none" | "internal" | "external";
type IntellectualPropertyStatus = "none" | "applying" | "copyright" | "petty_patent" | "patent";

interface Faculty {
  faculty_id: number;
  name: string;
  note?: string;
}

interface PublicationAuthor {
  faculty_id: number;
  name: string;
  role: AuthorRole;
}

interface Publication {
  id: number;
  revision: string;
  title: string;
  journal: string;
  publication_date: string;
  buddhist_year: number;
  publication_type: PublicationType;
  database_level: string;
  work_category: WorkCategory;
  funding_type: FundingType;
  funding_source: string;
  funding_amount: number;
  irb_approved: boolean;
  intellectual_property_status: IntellectualPropertyStatus;
  award_name: string;
  authors: PublicationAuthor[];
}

interface ResearchSummaryResponse {
  status: "success" | "error";
  message?: string;
  data?: {
    years: number[];
    faculty: Faculty[];
    publications: Publication[];
    can_manage: boolean;
  };
}

const roleLabel: Record<AuthorRole, string> = {
  first_author: "Head",
  corresponding: "Head",
  co_author: "ชื่อร่วม",
};

const typeLabel: Record<PublicationType, string> = {
  research: "วิจัย",
  academic: "บทความวิชาการ",
  textbook: "ตำรา",
};

const workCategoryLabel: Record<WorkCategory, string> = {
  research: "งานวิจัย",
  innovation: "งานนวัตกรรม",
};

const fundingTypeLabel: Record<FundingType, string> = {
  none: "ไม่มีทุน",
  internal: "ทุนภายใน",
  external: "ทุนภายนอก",
};

const intellectualPropertyLabel: Record<IntellectualPropertyStatus, string> = {
  none: "ไม่มี",
  applying: "กำลังขอ",
  copyright: "ลิขสิทธิ์",
  petty_patent: "อนุสิทธิบัตร",
  patent: "สิทธิบัตร",
};

const formatCurrency = (value: number) => new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
}).format(value);

const getBuddhistYear = (dateValue: string, mode: YearMode) => {
  const date = new Date(`${dateValue}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return 0;
  const christianYear = Number(dateValue.slice(0, 4));
  if (mode === "academic") {
    return getAcademicYear(date);
  }
  return christianYear + 543;
};

interface AuthorCounts {
  kpi: number;
  coAuthor: number;
  academic: number;
}

const emptyAuthorCounts: Readonly<AuthorCounts> = { kpi: 0, coAuthor: 0, academic: 0 };
const facultyPageSize = 20;

const formatCell = (counts: { kpi: number; coAuthor: number; academic: number }) => {
  const parts = [];
  if (counts.kpi) parts.push({ value: counts.kpi, className: "font-semibold text-red-600" });
  if (counts.coAuthor) parts.push({ value: counts.coAuthor, className: "font-semibold text-black" });
  if (counts.academic) parts.push({ value: counts.academic, className: "font-semibold text-sky-600" });
  return parts;
};

export default function ResearchSummary() {
  const currentAcademicYear = useAcademicYear();
  const [yearMode, setYearMode] = useState<YearMode>("calendar");
  const [availableYears, setYears] = useState<number[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const currentYear = yearMode === "academic" ? currentAcademicYear : Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", year: "numeric" }).format(academicNow())) + 543;
  const publicationYears = useMemo(() => new Map(
    publications.map((publication) => [publication, getBuddhistYear(publication.publication_date, yearMode)] as const)
  ), [publications, yearMode]);
  const years = useMemo(() => academicYearOptions([
    ...availableYears,
    ...publicationYears.values(),
  ], currentYear).map(Number).reverse(), [availableYears, publicationYears, currentYear]);
  const [search, setSearch] = useState("");
  const [facultyPage, setFacultyPage] = useState(1);
  const [workCategoryFilter, setWorkCategoryFilter] = useState<"all" | WorkCategory>("all");
  const [fundingTypeFilter, setFundingTypeFilter] = useState<"all" | FundingType>("all");
  const [irbFilter, setIrbFilter] = useState<"all" | "approved" | "not_approved">("all");
  const [intellectualPropertyFilter, setIntellectualPropertyFilter] = useState<"all" | IntellectualPropertyStatus>("all");
  const [yearFilter, setYearFilter] = useState<"all" | string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [canManageResearch, setCanManageResearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [quickSaveError, setQuickSaveError] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const savingRef = useRef(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [editingHeadFacultyId, setEditingHeadFacultyId] = useState<number | null>(null);
  const [editingCoAuthorIds, setEditingCoAuthorIds] = useState<number[]>([]);
  const [facultyPickerSearch, setFacultyPickerSearch] = useState("");
  const [editError, setEditError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<ResearchSummaryResponse>("/index.php?page=get-research-summary");
        if (response.data.status !== "success" || !response.data.data) {
          throw new Error(response.data.message || "ไม่สามารถโหลดข้อมูลงานวิจัยได้");
        }

        if (!mounted) return;
        setYears(response.data.data.years);
        setFaculty(response.data.data.faculty);
        setPublications(response.data.data.publications);
        setCanManageResearch(response.data.data.can_manage);
      } catch (err: unknown) {
        if (!mounted) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          setError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลสรุปผลงานวิจัย");
          return;
        }

        setError("ไม่สามารถโหลดข้อมูลงานวิจัยได้ กรุณาลองใหม่");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredFaculty = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faculty;
    return faculty.filter((item) => item.name.toLowerCase().includes(query));
  }, [faculty, search]);
  const facultyPageCount = Math.max(1, Math.ceil(filteredFaculty.length / facultyPageSize));
  const currentFacultyPage = Math.min(facultyPage, facultyPageCount);
  const paginatedFaculty = useMemo(() => filteredFaculty.slice(
    (currentFacultyPage - 1) * facultyPageSize,
    currentFacultyPage * facultyPageSize
  ), [filteredFaculty, currentFacultyPage]);

  const countsByFacultyAndYear = useMemo(() => {
    const counts = new Map<number, Map<number, AuthorCounts>>();
    publications.forEach((publication) => {
      const year = publicationYears.get(publication) ?? 0;
      const seenFaculty = new Set<number>();
      publication.authors.forEach((author) => {
        if (seenFaculty.has(author.faculty_id)) return;
        seenFaculty.add(author.faculty_id);
        let facultyCounts = counts.get(author.faculty_id);
        if (!facultyCounts) {
          facultyCounts = new Map();
          counts.set(author.faculty_id, facultyCounts);
        }
        let yearCounts = facultyCounts.get(year);
        if (!yearCounts) {
          yearCounts = { kpi: 0, coAuthor: 0, academic: 0 };
          facultyCounts.set(year, yearCounts);
        }
        if (publication.publication_type === "academic" || publication.publication_type === "textbook") {
          yearCounts.academic += 1;
        } else if (author.role === "first_author" || author.role === "corresponding") {
          yearCounts.kpi += 1;
        } else {
          yearCounts.coAuthor += 1;
        }
      });
    });
    return counts;
  }, [publications, publicationYears]);

  const summary = useMemo(() => {
    let kpi = 0;
    let coAuthor = 0;
    let academic = 0;
    const facultyWithKpi = new Set<number>();

    publications.forEach((publication) => {
      publication.authors.forEach((author) => {
        if (publication.publication_type === "academic" || publication.publication_type === "textbook") {
          academic += 1;
        } else if (author.role === "first_author" || author.role === "corresponding") {
          kpi += 1;
          facultyWithKpi.add(author.faculty_id);
        } else {
          coAuthor += 1;
        }
      });
    });

    return { kpi, coAuthor, academic, facultyWithKpi: facultyWithKpi.size };
  }, [publications]);

  const chartData = useMemo(() => {
    return years.map((year) => {
      const totals = faculty.reduce(
        (acc, person) => {
          const counts = countsByFacultyAndYear.get(person.faculty_id)?.get(year) ?? emptyAuthorCounts;
          acc.kpi += counts.kpi;
          acc.coAuthor += counts.coAuthor;
          acc.academic += counts.academic;
          return acc;
        },
        { kpi: 0, coAuthor: 0, academic: 0 }
      );
      return {
        year: String(year),
        "นับ KPI": totals.kpi,
        "ชื่อร่วม": totals.coAuthor,
        "วิชาการ/ตำรา": totals.academic,
      };
    });
  }, [faculty, countsByFacultyAndYear, years]);

  const publicationsMatchingResearchFilters = useMemo(() => publications.filter((publication) => {
    if (workCategoryFilter !== "all" && publication.work_category !== workCategoryFilter) return false;
    if (fundingTypeFilter !== "all" && publication.funding_type !== fundingTypeFilter) return false;
    if (irbFilter === "approved" && !publication.irb_approved) return false;
    if (irbFilter === "not_approved" && publication.irb_approved) return false;
    if (intellectualPropertyFilter !== "all" && publication.intellectual_property_status !== intellectualPropertyFilter) return false;
    return true;
  }), [publications, workCategoryFilter, fundingTypeFilter, irbFilter, intellectualPropertyFilter]);

  const fundingChartData = useMemo(() => {
    const totalsByYear = new Map<number, { internal: number; external: number }>();
    publicationsMatchingResearchFilters.forEach((publication) => {
      const year = publicationYears.get(publication) ?? 0;
      let totals = totalsByYear.get(year);
      if (!totals) {
        totals = { internal: 0, external: 0 };
        totalsByYear.set(year, totals);
      }
      if (publication.funding_type === "internal") totals.internal += publication.funding_amount;
      if (publication.funding_type === "external") totals.external += publication.funding_amount;
    });
    return years.map((year) => ({
      year: String(year),
      "ทุนภายใน": totalsByYear.get(year)?.internal ?? 0,
      "ทุนภายนอก": totalsByYear.get(year)?.external ?? 0,
    }));
  }, [publicationsMatchingResearchFilters, publicationYears, years]);

  const fundingSummary = useMemo(() => publicationsMatchingResearchFilters.reduce((summary, publication) => {
    if (yearFilter !== "all" && publicationYears.get(publication) !== Number(yearFilter)) return summary;
    summary.total += publication.funding_amount;
    if (publication.funding_type === "internal") summary.internal += publication.funding_amount;
    if (publication.funding_type === "external") summary.external += publication.funding_amount;
    if (publication.irb_approved) summary.irb += 1;
    if (publication.work_category === "research") summary.research += 1;
    if (publication.work_category === "innovation") summary.innovation += 1;
    return summary;
  }, { total: 0, internal: 0, external: 0, irb: 0, research: 0, innovation: 0 }), [publicationsMatchingResearchFilters, yearFilter, publicationYears]);

  const visiblePublications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return publicationsMatchingResearchFilters.filter(
      (publication) =>
        (yearFilter === "all" || publicationYears.get(publication) === Number(yearFilter)) &&
        (!query || publication.title.toLowerCase().includes(query) ||
          publication.journal.toLowerCase().includes(query) ||
          publication.funding_source.toLowerCase().includes(query) ||
          publication.authors.some((author) => author.name.toLowerCase().includes(query)))
    );
  }, [publicationsMatchingResearchFilters, search, yearFilter, publicationYears]);

  const saveChange = async (payload: Record<string, string | number | boolean | number[]>) => {
    if (savingRef.current || saveFailed || !canManageResearch) return false;
    savingRef.current = true;
    setIsSaving(true);
    setSaveFailed(false);
    setQuickSaveError('');
    setEditError('');
    setSaveMessage('กำลังบันทึก...');
    try {
      const response = await api.post<ResearchSummaryResponse>('/index.php?page=save-research-summary', payload);
      if (response.data.status !== 'success' || !response.data.data) {
        throw new Error('Save failed');
      }
      setPublications(response.data.data.publications);
      setFaculty(response.data.data.faculty);
      setYears(response.data.data.years);
      setCanManageResearch(response.data.data.can_manage);
      setSaveMessage(payload.action === 'update' ? 'บันทึกการแก้ไขแล้ว' : 'บันทึกอัตโนมัติแล้ว');
      return true;
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } }).response;
      if (payload.action === 'update' && response?.status === 422) {
        setEditError(response.data?.message || 'กรุณาตรวจสอบข้อมูล');
        setSaveMessage('ยังไม่ได้บันทึกการแก้ไข');
        return false;
      }
      const failureMessage = response?.data?.message || 'บันทึกไม่สำเร็จ';
      if (payload.action !== 'update') setQuickSaveError(failureMessage);
      // The request might have reached the server even when its response was lost.
      // Reconcile with the server before allowing another click, so a retry
      // cannot accidentally remove a second publication.
      try {
        const latest = await api.get<ResearchSummaryResponse>('/index.php?page=get-research-summary');
        if (latest.data.status !== 'success' || !latest.data.data) throw new Error('Reload failed');
        setPublications(latest.data.data.publications);
        setFaculty(latest.data.data.faculty);
        setYears(latest.data.data.years);
        setCanManageResearch(latest.data.data.can_manage);
        setSaveFailed(false);
        setSaveMessage(`${failureMessage} ตรวจสอบข้อมูลล่าสุดแล้ว สามารถลองอีกครั้งได้`);
      } catch {
        setSaveFailed(true);
        setSaveMessage(`${failureMessage} กรุณาโหลดข้อมูลใหม่เพื่อตรวจสอบก่อนทำรายการต่อ`);
      }
      return false;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const addQuickCellPublication = (person: Faculty, year: number, kind: 'kpi' | 'co_author' | 'academic') => {
    void saveChange({ action: 'add', faculty_id: person.faculty_id, year, year_mode: yearMode, kind });
  };

  const removeQuickCellPublication = (person: Faculty, year: number, kind: 'kpi' | 'co_author' | 'academic') => {
    const target = publications.find((publication) => {
      if (getBuddhistYear(publication.publication_date, yearMode) !== year) return false;
      const author = publication.authors.find((item) => item.faculty_id === person.faculty_id);
      if (!author) return false;
      const academic = publication.publication_type === 'academic' || publication.publication_type === 'textbook';
      if (kind === 'academic') return academic;
      if (academic) return false;
      return kind === 'kpi' ? author.role !== 'co_author' : author.role === 'co_author';
    });
    if (target) void saveChange({ action: 'remove', faculty_id: person.faculty_id, publication_id: target.id });
  };

  const openPublicationEditor = (publication: Publication) => {
    const head = publication.authors.find((author) => author.role === "first_author" || author.role === "corresponding")
      ?? null;
    setEditError("");
    setFacultyPickerSearch("");
    setEditingPublication({ ...publication });
    setEditingHeadFacultyId(head?.faculty_id ?? null);
    setEditingCoAuthorIds(publication.authors
      .filter((author) => author.role === "co_author" && author.faculty_id !== head?.faculty_id)
      .map((author) => author.faculty_id));
  };

  const closePublicationEditor = () => {
    setEditingPublication(null);
    setEditingHeadFacultyId(null);
    setEditingCoAuthorIds([]);
    setFacultyPickerSearch("");
    setEditError("");
  };

  const filteredPickerFaculty = useMemo(() => {
    const query = facultyPickerSearch.trim().toLocaleLowerCase("th-TH");
    if (!query) return faculty;
    return faculty.filter((person) =>
      `${person.name} ${person.note ?? ""}`.toLocaleLowerCase("th-TH").includes(query));
  }, [faculty, facultyPickerSearch]);

  const showAuthorInFacultyTable = (author: PublicationAuthor) => {
    setSearch(author.name);
    setFacultyPage(1);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(`research-faculty-${author.faculty_id}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <Microscope className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium text-destructive">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>ลองใหม่</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={editingPublication !== null} onOpenChange={(open) => { if (!open && !isSaving) closePublicationEditor(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขรายละเอียดผลงาน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลแล้วกดบันทึก วันที่และประเภทผลงานจะใช้คำนวณตารางและ KPI ใหม่</DialogDescription>
          </DialogHeader>
          {editingPublication && (
            <form className="space-y-4" onSubmit={async (event) => {
              event.preventDefault();
              if (editingHeadFacultyId === null) {
                setEditError("กรุณาเลือก Head อย่างน้อย 1 คน");
                return;
              }
              const saved = await saveChange({
                action: 'update', publication_id: editingPublication.id,
                faculty_id: editingPublication.authors[0].faculty_id,
                revision: editingPublication.revision, title: editingPublication.title,
                publication_date: editingPublication.publication_date,
                publication_type: editingPublication.publication_type,
                journal: editingPublication.journal, database_level: editingPublication.database_level,
                work_category: editingPublication.work_category,
                funding_type: editingPublication.funding_type,
                funding_source: editingPublication.funding_source,
                funding_amount: editingPublication.funding_amount,
                irb_approved: editingPublication.irb_approved,
                intellectual_property_status: editingPublication.intellectual_property_status,
                award_name: editingPublication.award_name,
                head_faculty_id: editingHeadFacultyId,
                co_author_ids: editingCoAuthorIds,
              });
              if (saved) closePublicationEditor();
            }}>
              <fieldset disabled={isSaving || saveFailed} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="research-title">ชื่อผลงาน</Label>
                  <Input id="research-title" required maxLength={255} value={editingPublication.title} onChange={(e) => setEditingPublication({ ...editingPublication, title: e.target.value })} />
                </div>
                <div className="space-y-2"><Label htmlFor="research-date">วันที่ตีพิมพ์</Label>
                  <Input id="research-date" type="date" required min="1957-01-01" max="2157-12-31" value={editingPublication.publication_date} onChange={(e) => setEditingPublication({ ...editingPublication, publication_date: e.target.value })} />
                </div>
                <div className="space-y-2"><Label htmlFor="research-type">ประเภทผลงาน</Label>
                  <select id="research-type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editingPublication.publication_type} onChange={(e) => setEditingPublication({ ...editingPublication, publication_type: e.target.value as PublicationType })}>
                    {Object.entries(typeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label htmlFor="research-journal">วารสาร / แหล่งตีพิมพ์</Label>
                  <Input id="research-journal" maxLength={255} value={editingPublication.journal} onChange={(e) => setEditingPublication({ ...editingPublication, journal: e.target.value })} />
                </div>
                <div className="space-y-2"><Label htmlFor="research-category">หมวดหมู่</Label>
                  <Input id="research-category" maxLength={100} value={editingPublication.database_level} onChange={(e) => setEditingPublication({ ...editingPublication, database_level: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="research-work-category">หมวดผลงาน</Label>
                    <select id="research-work-category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editingPublication.work_category} onChange={(e) => setEditingPublication({ ...editingPublication, work_category: e.target.value as WorkCategory })}>
                      {Object.entries(workCategoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="research-funding-type">ประเภททุน</Label>
                    <select id="research-funding-type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editingPublication.funding_type} onChange={(e) => {
                      const fundingType = e.target.value as FundingType;
                      setEditingPublication({ ...editingPublication, funding_type: fundingType, ...(fundingType === "none" ? { funding_source: "", funding_amount: 0 } : {}) });
                    }}>
                      {Object.entries(fundingTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>
                {editingPublication.funding_type !== "none" && <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="research-funding-source">แหล่งทุน</Label>
                    <Input id="research-funding-source" required maxLength={255} value={editingPublication.funding_source} onChange={(e) => setEditingPublication({ ...editingPublication, funding_source: e.target.value })} placeholder="ระบุหน่วยงานผู้ให้ทุน" />
                  </div>
                  <div className="space-y-2"><Label htmlFor="research-funding-amount">จำนวนทุน (บาท)</Label>
                    <Input id="research-funding-amount" required type="number" min="0" max="9999999999.99" step="0.01" value={editingPublication.funding_amount} onChange={(e) => setEditingPublication({ ...editingPublication, funding_amount: Number(e.target.value) })} />
                  </div>
                </div>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="research-ip-status">สถานะทรัพย์สินทางปัญญา</Label>
                    <select id="research-ip-status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editingPublication.intellectual_property_status} onChange={(e) => setEditingPublication({ ...editingPublication, intellectual_property_status: e.target.value as IntellectualPropertyStatus })}>
                      {Object.entries(intellectualPropertyLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="research-award">รางวัลที่ได้รับ</Label>
                    <Input id="research-award" maxLength={255} value={editingPublication.award_name} onChange={(e) => setEditingPublication({ ...editingPublication, award_name: e.target.value })} placeholder="เว้นว่างได้ หากไม่มีรางวัล" />
                  </div>
                </div>
                <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium" htmlFor="research-irb-approved">
                  <input id="research-irb-approved" type="checkbox" className="h-4 w-4 rounded border-input" checked={editingPublication.irb_approved} onChange={(e) => setEditingPublication({ ...editingPublication, irb_approved: e.target.checked })} />
                  งานวิจัยนี้ผ่าน IRB แล้ว
                </label>
                <div className="space-y-2">
                  <div>
                    <Label>ผู้รับผิดชอบผลงาน</Label>
                    <p className="text-xs text-muted-foreground">
                      {editingHeadFacultyId === null
                        ? "เลือก Head ได้ 1 คน และเลือก Co ได้หลายคน"
                        : "ผลงานนี้มี Head แล้ว ระบบจึงปิดการเลือก Head เพิ่ม แต่ยังแก้ไข Co ได้"}
                    </p>
                  </div>
                  <div className="relative">
                    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={facultyPickerSearch}
                      onChange={(event) => setFacultyPickerSearch(event.target.value)}
                      placeholder="ค้นหาชื่อหรือตำแหน่งอาจารย์..."
                      className="pl-9"
                      aria-label="ค้นหาอาจารย์สำหรับกำหนด Head หรือ Co"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-md border">
                    <div className="sticky top-0 grid grid-cols-[1fr_64px_64px] gap-2 border-b bg-muted/95 px-3 py-2 text-xs font-medium backdrop-blur">
                      <span>อาจารย์</span>
                      <span className="text-center">Head</span>
                      <span className="text-center">Co</span>
                    </div>
                    {filteredPickerFaculty.length === 0 && (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">ไม่พบอาจารย์ที่ตรงกับคำค้น</p>
                    )}
                    {filteredPickerFaculty.map((person) => {
                      const isHead = editingHeadFacultyId === person.faculty_id;
                      const isCo = editingCoAuthorIds.includes(person.faculty_id);
                      return (
                        <div key={person.faculty_id} className="grid grid-cols-[1fr_64px_64px] items-center gap-2 border-b px-3 py-2 last:border-b-0">
                          <span className="text-sm">{person.name}</span>
                          <label className="flex justify-center" title={`เลือก ${person.name} เป็น Head`}>
                            <input
                              type="radio"
                              name="research-head-faculty"
                              value={person.faculty_id}
                              checked={isHead}
                              disabled={editingHeadFacultyId !== null}
                              onChange={() => {
                                setEditingHeadFacultyId(person.faculty_id);
                                setEditingCoAuthorIds((current) => current.filter((id) => id !== person.faculty_id));
                              }}
                              className="h-4 w-4"
                              aria-label={`เลือก ${person.name} เป็น Head`}
                            />
                          </label>
                          <label className="flex justify-center" title={`เลือก ${person.name} เป็น Co`}>
                            <input
                              type="checkbox"
                              checked={isCo}
                              disabled={isHead}
                              onChange={(event) => setEditingCoAuthorIds((current) => event.target.checked
                                ? [...current, person.faculty_id]
                                : current.filter((id) => id !== person.faculty_id))}
                              className="h-4 w-4 rounded border-input"
                              aria-label={`เลือก ${person.name} เป็น Co`}
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </fieldset>
              {saveFailed && <p role="alert" className="text-sm text-destructive">{saveMessage}</p>}
              {editError && <p role="alert" className="text-sm text-destructive">{editError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" disabled={isSaving} onClick={closePublicationEditor}>ยกเลิก</Button>
                {saveFailed ? <Button type="button" onClick={() => window.location.reload()}>โหลดข้อมูลใหม่</Button> : <Button type="submit" disabled={isSaving}>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</Button>}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {saveMessage && <div role="status" aria-live="polite" className={cn('text-sm', saveFailed ? 'text-destructive' : 'text-muted-foreground')}>
        {saveMessage}
        {saveFailed && <Button variant="outline" className="ml-2" onClick={() => window.location.reload()}>โหลดข้อมูลใหม่</Button>}
      </div>}
      <div className="app-page-header">
        <div className="space-y-2">
          <h1 className="app-page-title">สรุปผลงานวิจัย 5 ปี</h1>
          <p className="app-page-description">บันทึกและตรวจสอบผลงานวิจัยสำหรับอาจารย์งานวิจัย</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Tabs value={yearMode} onValueChange={(value) => setYearMode(value as YearMode)}>
            <TabsList>
              <TabsTrigger value="calendar">ปีปฏิทิน</TabsTrigger>
              <TabsTrigger value="academic">ปีการศึกษา</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผลงานวิจัยรวม</CardTitle>
            <ShieldCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.kpi}</div>
            <p className="text-xs text-muted-foreground">นับเฉพาะ Head</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ชื่อร่วม</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{summary.coAuthor}</div>
            <p className="text-xs text-muted-foreground">นับภาระงาน ไม่นับ KPI</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">วิชาการ/ตำรา</CardTitle>
            <CalendarDays className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">{summary.academic}</div>
            <p className="text-xs text-muted-foreground">แยกจาก KPI วิจัย</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อาจารย์มี KPI</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.facultyWithKpi}</div>
            <p className="text-xs text-muted-foreground">คนที่มีผลงานสีแดง</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            แนวโน้มผลงานตามรอบปี
          </CardTitle>
          <CardDescription>
            {yearMode === "calendar" ? "ปีปฏิทิน: 1 มกราคม - 31 ธันวาคม" : "ปีการศึกษา: 1 เมษายน - 31 มีนาคม"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="นับ KPI" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ชื่อร่วม" fill="#27272a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="วิชาการ/ตำรา" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Dashboard สรุปทุนวิจัยรายปี
          </CardTitle>
          <CardDescription>ตัวเลขสรุปใช้ทุกตัวกรองที่เลือก ส่วนกราฟคงการเปรียบเทียบรายปีและแยกทุนภายในกับทุนภายนอก</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">ทุนรวม</p><p className="mt-1 font-semibold">{formatCurrency(fundingSummary.total)}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">ทุนภายใน</p><p className="mt-1 font-semibold">{formatCurrency(fundingSummary.internal)}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">ทุนภายนอก</p><p className="mt-1 font-semibold">{formatCurrency(fundingSummary.external)}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">งานวิจัย</p><p className="mt-1 font-semibold">{fundingSummary.research} ผลงาน</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">นวัตกรรม</p><p className="mt-1 font-semibold">{fundingSummary.innovation} ผลงาน</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">ผ่าน IRB</p><p className="mt-1 font-semibold">{fundingSummary.irb} ผลงาน</p></div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fundingChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => new Intl.NumberFormat("th-TH", { notation: "compact" }).format(Number(value))} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="ทุนภายใน" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ทุนภายนอก" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>ตารางจำนวนผลงานวิจัยและวิชาการตีพิมพ์ของอาจารย์</CardTitle>
            <CardDescription>
              {canManageResearch
                ? "กดช่องปีเพื่อเพิ่ม/ลดจำนวน โดยช่องรวมเฉพาะ KPI รับเฉพาะผลงานสีแดงที่เป็น Head"
                : "รูปแบบใกล้เคียง D74: ช่องรวมเฉพาะผลงานสีแดงที่เป็น Head"}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full min-w-0 lg:max-w-sm lg:flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="ค้นหาอาจารย์หรือบทความ"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setFacultyPage(1); }}
                placeholder="ค้นหาอาจารย์ / บทความ"
                className="h-10 bg-background pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs lg:shrink-0 lg:justify-end" aria-label="ประเภทผลงาน">
              <Badge className="bg-red-600">แดง: นับ KPI</Badge>
              <Badge variant="outline" className="border-zinc-500 bg-zinc-900 text-zinc-50">ดำ: ชื่อร่วม</Badge>
              <Badge className="bg-sky-600">ฟ้า: วิชาการ/ตำรา</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="w-12 text-center">ที่</TableHead>
                  <TableHead className="min-w-64">ชื่อ - นามสกุล</TableHead>
                  {years.map((year) => <TableHead key={year} className="text-center">จำนวน<br />{year}</TableHead>)}
                  <TableHead className="text-center text-red-600">เฉพาะ KPI</TableHead>
                  <TableHead>คำนำหน้า / ตำแหน่งวิชาการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.length === 0 && <TableRow><TableCell colSpan={years.length + 4} className="text-center text-muted-foreground">ไม่พบอาจารย์</TableCell></TableRow>}
                {paginatedFaculty.map((person, index) => {
                  const facultyCounts = countsByFacultyAndYear.get(person.faculty_id);
                  const totalKpi = years.reduce((acc, year) => acc + (facultyCounts?.get(year)?.kpi ?? 0), 0);
                  return (
                    <TableRow key={person.faculty_id} id={`research-faculty-${person.faculty_id}`}>
                      <TableCell className="text-center text-muted-foreground">{(currentFacultyPage - 1) * facultyPageSize + index + 1}</TableCell>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      {years.map((year) => {
                        const counts = facultyCounts?.get(year) ?? emptyAuthorCounts;
                        const parts = formatCell(counts);
                        return (
                          <TableCell key={year} className="text-center">
                            {canManageResearch ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 min-w-16 gap-1 px-2 text-center hover:bg-primary/10"
                                  >
                                    {parts.length ? (
                                      <span className="inline-flex items-center justify-center gap-1">
                                        {parts.map((part, partIndex) => (
                                          <span key={`${part.value}-${partIndex}`} className={part.className}>{part.value}</span>
                                        ))}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                    <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3" align="center">
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm font-medium">{person.name}</p>
                                      <p className="text-xs text-muted-foreground">เพิ่มหรือลดจำนวนในปี {year}</p>
                                    </div>
                                    {quickSaveError && <p role="alert" className="text-xs text-destructive">{quickSaveError}</p>}
                                    {saveFailed && <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>โหลดข้อมูลใหม่</Button>}
                                    {isSaving && <p role="status" className="text-xs text-muted-foreground">กำลังบันทึก...</p>}
                                    <div className="grid gap-2">
                                      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                                        <span className="text-sm font-medium text-red-500">ผลงานนับ KPI</span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          disabled={isSaving || saveFailed || counts.kpi === 0}
                                          className="h-8 w-8 border-red-400/60 text-red-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                                          aria-label="ลดผลงานและบันทึกอัตโนมัติ"
                                          onClick={() => removeQuickCellPublication(person, year, "kpi")}
                                        >
                                          <MinusCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 border-red-400/60 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                          disabled={isSaving || saveFailed}
                                          aria-label="เพิ่มผลงานและบันทึกอัตโนมัติ"
                                          onClick={() => addQuickCellPublication(person, year, "kpi")}
                                        >
                                          <PlusCircle className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                                        <span className="text-sm font-medium">ผลงานชื่อร่วม</span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          disabled={isSaving || saveFailed || counts.coAuthor === 0}
                                          className="h-8 w-8 disabled:opacity-40"
                                          aria-label="ลดผลงานและบันทึกอัตโนมัติ"
                                          onClick={() => removeQuickCellPublication(person, year, "co_author")}
                                        >
                                          <MinusCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8"
                                          disabled={isSaving || saveFailed}
                                          aria-label="เพิ่มผลงานและบันทึกอัตโนมัติ"
                                          onClick={() => addQuickCellPublication(person, year, "co_author")}
                                        >
                                          <PlusCircle className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                                        <span className="text-sm font-medium text-sky-500">วิชาการ/ตำรา</span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          disabled={isSaving || saveFailed || counts.academic === 0}
                                          className="h-8 w-8 border-sky-400/60 text-sky-500 hover:bg-sky-500/10 hover:text-sky-400 disabled:opacity-40"
                                          aria-label="ลดผลงานและบันทึกอัตโนมัติ"
                                          onClick={() => removeQuickCellPublication(person, year, "academic")}
                                        >
                                          <MinusCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8 border-sky-400/60 text-sky-500 hover:bg-sky-500/10 hover:text-sky-400"
                                          disabled={isSaving || saveFailed}
                                          aria-label="เพิ่มผลงานและบันทึกอัตโนมัติ"
                                          onClick={() => addQuickCellPublication(person, year, "academic")}
                                        >
                                          <PlusCircle className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="inline-flex h-8 min-w-16 items-center justify-center gap-1 px-2">
                                {parts.length ? (
                                  parts.map((part, partIndex) => (
                                    <span key={`${part.value}-${partIndex}`} className={part.className}>{part.value}</span>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-semibold text-red-600">{totalKpi}</TableCell>
                      <TableCell className="text-muted-foreground">{person.note || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              {filteredFaculty.length === 0
                ? "ไม่พบอาจารย์"
                : `แสดง ${(currentFacultyPage - 1) * facultyPageSize + 1}-${Math.min(currentFacultyPage * facultyPageSize, filteredFaculty.length)} จาก ${filteredFaculty.length} คน`}
            </p>
            {facultyPageCount > 1 && <div className="flex items-center gap-2" aria-label="หน้ารายชื่ออาจารย์">
              <Button type="button" variant="outline" size="sm" disabled={currentFacultyPage === 1} onClick={() => setFacultyPage(currentFacultyPage - 1)}>ก่อนหน้า</Button>
              <span>หน้า {currentFacultyPage} / {facultyPageCount}</span>
              <Button type="button" variant="outline" size="sm" disabled={currentFacultyPage === facultyPageCount} onClick={() => setFacultyPage(currentFacultyPage + 1)}>ถัดไป</Button>
            </div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>ตัวกรองงานวิจัยและนวัตกรรม</CardTitle>
            <CardDescription>ใช้กรองรายการผลงานและข้อมูลสรุปทุนวิจัยรายปี</CardDescription>
          </div>
          <Tabs value={workCategoryFilter} onValueChange={(value) => setWorkCategoryFilter(value as "all" | WorkCategory)}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="research">งานวิจัย</TabsTrigger>
              <TabsTrigger value="innovation">งานนวัตกรรม</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="funding-filter">ประเภททุน</Label>
              <select id="funding-filter" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={fundingTypeFilter} onChange={(event) => setFundingTypeFilter(event.target.value as "all" | FundingType)}>
                <option value="all">ทุกประเภททุน</option>
                {Object.entries(fundingTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="irb-filter">สถานะ IRB</Label>
              <select id="irb-filter" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={irbFilter} onChange={(event) => setIrbFilter(event.target.value as typeof irbFilter)}>
                <option value="all">ทุกสถานะ IRB</option>
                <option value="approved">ผ่าน IRB</option>
                <option value="not_approved">ยังไม่ผ่าน IRB</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip-filter">ทรัพย์สินทางปัญญา</Label>
              <select id="ip-filter" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={intellectualPropertyFilter} onChange={(event) => setIntellectualPropertyFilter(event.target.value as "all" | IntellectualPropertyStatus)}>
                <option value="all">ทุกสถานะ</option>
                {Object.entries(intellectualPropertyLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="research-year-filter">ปี</Label>
              <select id="research-year-filter" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
                <option value="all">ทุกปี</option>
                {years.map((year) => <option key={year} value={String(year)}>{year}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" className="w-full" onClick={() => {
                setWorkCategoryFilter("all");
                setFundingTypeFilter("all");
                setIrbFilter("all");
                setIntellectualPropertyFilter("all");
                setYearFilter("all");
              }}>ล้างตัวกรอง</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="recorded-research-publications">
        <CardHeader>
          <CardTitle>รายการผลงานที่บันทึก</CardTitle>
          <CardDescription>
            ข้อมูลที่บันทึกในฐานข้อมูลและใช้คำนวณตัวเลขในตาราง เปิดป้ายผู้รับผิดชอบแล้วเลือกชื่อเพื่อไปยังแถวของอาจารย์คนนั้น รายการที่เพิ่มด้วยปุ่ม + เป็นบันทึกจำนวนผลงาน โดยใช้วันเริ่มต้นของปีที่เลือกเป็นวันที่อ้างอิง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visiblePublications.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่มีผลงานที่ตรงกับเงื่อนไข</p>}
            {visiblePublications.map((publication) => {
              const isAcademic = publication.publication_type === "academic" || publication.publication_type === "textbook";
              const responsibleAuthors = [...publication.authors].sort((first, second) =>
                Number(first.role === "co_author") - Number(second.role === "co_author"));
              const authorBadgeColor = (author: PublicationAuthor) => {
                if (isAcademic) return "border-sky-600 bg-sky-600 text-white hover:bg-sky-600";
                if (author.role !== "co_author") return "border-red-600 bg-red-600 text-white hover:bg-red-600";
                return "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-900";
              };
              return (
                <div key={publication.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <div className="font-medium leading-relaxed">{publication.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {[publication.journal, publication.database_level, publication.publication_date].filter(Boolean).join(" · ") || "ยังไม่ระบุรายละเอียดการตีพิมพ์"}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge variant="secondary">{workCategoryLabel[publication.work_category]}</Badge>
                        <Badge variant="outline">{fundingTypeLabel[publication.funding_type]}</Badge>
                        {publication.funding_type !== "none" && <Badge variant="outline">{formatCurrency(publication.funding_amount)}</Badge>}
                        <Badge variant={publication.irb_approved ? "default" : "outline"}>{publication.irb_approved ? "ผ่าน IRB" : "ยังไม่ผ่าน IRB"}</Badge>
                        {publication.intellectual_property_status !== "none" && <Badge variant="outline">{intellectualPropertyLabel[publication.intellectual_property_status]}</Badge>}
                      </div>
                      {(publication.funding_source || publication.award_name) && <div className="space-y-1 pt-1 text-sm text-muted-foreground">
                        {publication.funding_source && <p>แหล่งทุน: {publication.funding_source}</p>}
                        {publication.award_name && <p>รางวัล: {publication.award_name}</p>}
                      </div>}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {responsibleAuthors.length === 1 && (
                          <button
                            type="button"
                            onClick={() => showAuthorInFacultyTable(responsibleAuthors[0])}
                            className="rounded-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            title={`ไปยังข้อมูลของ ${responsibleAuthors[0].name} ในตาราง`}
                          >
                            <Badge
                              variant="default"
                              className={cn(
                                "cursor-pointer py-1",
                                responsibleAuthors[0].role === "co_author" ? "text-sm font-medium" : "text-base font-bold",
                                authorBadgeColor(responsibleAuthors[0])
                              )}
                            >
                              {responsibleAuthors[0].name}: {roleLabel[responsibleAuthors[0].role]}
                            </Badge>
                          </button>
                        )}
                        {responsibleAuthors.length > 1 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="rounded-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                title="เปิดรายชื่อผู้รับผิดชอบผลงาน"
                              >
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer gap-1 py-1 text-sm font-medium"
                                >
                                  ผู้รับผิดชอบ {responsibleAuthors.length} คน
                                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                </Badge>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[28rem] max-w-[calc(100vw-2rem)] p-2" align="start">
                              <p className="px-2 pb-2 text-sm font-semibold">ผู้รับผิดชอบผลงาน</p>
                              <div className="max-h-64 space-y-1 overflow-y-auto">
                                {responsibleAuthors.map((author) => {
                                  const isHead = author.role !== "co_author";
                                  return (
                                    <button
                                      key={`${publication.id}-${author.faculty_id}-${author.role}`}
                                      type="button"
                                      onClick={() => showAuthorInFacultyTable(author)}
                                      className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                      <span
                                        className={cn("min-w-0 flex-1 truncate whitespace-nowrap text-sm", isHead ? "font-bold" : "font-medium")}
                                        title={author.name}
                                      >
                                        {author.name}
                                      </span>
                                      <Badge
                                        variant="default"
                                        className={cn(
                                          "shrink-0",
                                          authorBadgeColor(author)
                                        )}
                                      >
                                        {roleLabel[author.role]}
                                      </Badge>
                                    </button>
                                  );
                                })}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{typeLabel[publication.publication_type]}</Badge>
                      {canManageResearch && <Button type="button" size="sm" variant="outline" disabled={isSaving || saveFailed || publication.authors.length === 0} onClick={() => openPublicationEditor(publication)}>
                        <Pencil className="mr-1 h-4 w-4" />แก้ไข
                      </Button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
