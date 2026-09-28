import { useEffect, useMemo, useRef, useState } from "react";
import { getAcademicYear, academicYearOptions, academicNow } from "@/lib/academicYear";
import { useAcademicYear } from "@/hooks/use-academic-year";
import {
  BarChart3,
  CalendarDays,
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
  first_author: "First",
  corresponding: "Corresponding",
  co_author: "ชื่อร่วม",
};

const typeLabel: Record<PublicationType, string> = {
  research: "วิจัย",
  academic: "บทความวิชาการ",
  textbook: "ตำรา",
};

const getBuddhistYear = (dateValue: string, mode: YearMode) => {
  const date = new Date(`${dateValue}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return 0;
  const christianYear = Number(dateValue.slice(0, 4));
  if (mode === "academic") {
    return getAcademicYear(date);
  }
  return christianYear + 543;
};

const authorCountsForYear = (publications: Publication[], facultyId: number, year: number, mode: YearMode) => {
  return publications.reduce(
    (acc, publication) => {
      if (getBuddhistYear(publication.publication_date, mode) !== year) return acc;
      const author = publication.authors.find((item) => item.faculty_id === facultyId);
      if (!author) return acc;

      if (publication.publication_type === "academic" || publication.publication_type === "textbook") {
        acc.academic += 1;
      } else if (author.role === "first_author" || author.role === "corresponding") {
        acc.kpi += 1;
      } else {
        acc.coAuthor += 1;
      }
      return acc;
    },
    { kpi: 0, coAuthor: 0, academic: 0 }
  );
};

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
  const years = useMemo(() => academicYearOptions([
    ...availableYears,
    ...publications.map((publication) => getBuddhistYear(publication.publication_date, yearMode)),
  ], currentYear).map(Number).reverse(), [availableYears, publications, yearMode, currentYear]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [canManageResearch, setCanManageResearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const savingRef = useRef(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
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
          const counts = authorCountsForYear(publications, person.faculty_id, year, yearMode);
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
  }, [faculty, publications, years, yearMode]);

  const visiblePublications = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return publications;
    return publications.filter(
      (publication) =>
        publication.title.toLowerCase().includes(query) ||
        publication.journal.toLowerCase().includes(query) ||
        publication.authors.some((author) => author.name.toLowerCase().includes(query))
    );
  }, [publications, search]);

  const saveChange = async (payload: Record<string, string | number>) => {
    if (savingRef.current || saveFailed || !canManageResearch) return false;
    savingRef.current = true;
    setIsSaving(true);
    setSaveFailed(false);
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
      setSaveFailed(true);
      setSaveMessage('ยืนยันการบันทึกไม่สำเร็จ กรุณาโหลดข้อมูลใหม่เพื่อตรวจสอบก่อนทำรายการต่อ');
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
      <Dialog open={editingPublication !== null} onOpenChange={(open) => { if (!open && !isSaving) setEditingPublication(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขรายละเอียดผลงาน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลแล้วกดบันทึก วันที่และประเภทผลงานจะใช้คำนวณตารางและ KPI ใหม่</DialogDescription>
          </DialogHeader>
          {editingPublication && (
            <form className="space-y-4" onSubmit={async (event) => {
              event.preventDefault();
              const saved = await saveChange({
                action: 'update', publication_id: editingPublication.id,
                faculty_id: editingPublication.authors[0].faculty_id,
                revision: editingPublication.revision, title: editingPublication.title,
                publication_date: editingPublication.publication_date,
                publication_type: editingPublication.publication_type,
                journal: editingPublication.journal, database_level: editingPublication.database_level,
              });
              if (saved) setEditingPublication(null);
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
              </fieldset>
              {saveFailed && <p role="alert" className="text-sm text-destructive">{saveMessage}</p>}
              {editError && <p role="alert" className="text-sm text-destructive">{editError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" disabled={isSaving} onClick={() => setEditingPublication(null)}>ยกเลิก</Button>
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
            <p className="text-xs text-muted-foreground">รับเฉพาะ First/Corresponding</p>
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
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>ตารางจำนวนผลงานวิจัยและวิชาการตีพิมพ์ของอาจารย์</CardTitle>
            <CardDescription>
              {canManageResearch
                ? "กดช่องปีเพื่อเพิ่ม/ลดจำนวน โดยช่องรวมเฉพาะ KPI รับเฉพาะผลงานสีแดง First/Corresponding"
                : "รูปแบบใกล้เคียง D74: ช่องรวมเฉพาะผลงานสีแดง First/Corresponding"}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full min-w-0 lg:max-w-sm lg:flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="ค้นหาอาจารย์หรือบทความ"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
                {filteredFaculty.map((person, index) => {
                  const totalKpi = years.reduce((acc, year) => acc + authorCountsForYear(publications, person.faculty_id, year, yearMode).kpi, 0);
                  return (
                    <TableRow key={person.faculty_id}>
                      <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      {years.map((year) => {
                        const counts = authorCountsForYear(publications, person.faculty_id, year, yearMode);
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการผลงานที่บันทึก</CardTitle>
          <CardDescription>
            ข้อมูลที่บันทึกในฐานข้อมูลและใช้คำนวณตัวเลขในตาราง รายการที่เพิ่มด้วยปุ่ม + เป็นบันทึกจำนวนผลงาน โดยใช้วันเริ่มต้นของปีที่เลือกเป็นวันที่อ้างอิง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visiblePublications.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่มีผลงานที่ตรงกับเงื่อนไข</p>}
            {visiblePublications.map((publication) => {
              const isAcademic = publication.publication_type === "academic" || publication.publication_type === "textbook";
              return (
                <div key={publication.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <div className="font-medium leading-relaxed">{publication.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {[publication.journal, publication.database_level, publication.publication_date].filter(Boolean).join(" · ") || "ยังไม่ระบุรายละเอียดการตีพิมพ์"}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {publication.authors.map((author) => (
                          <Badge
                            key={`${publication.id}-${author.faculty_id}-${author.role}`}
                            variant={isAcademic ? "default" : author.role === "co_author" ? "outline" : "default"}
                            className={cn(
                              isAcademic && "bg-sky-600",
                              !isAcademic && author.role !== "co_author" && "bg-red-600"
                            )}
                          >
                            {author.name}: {roleLabel[author.role]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{typeLabel[publication.publication_type]}</Badge>
                      {canManageResearch && <Button type="button" size="sm" variant="outline" disabled={isSaving || saveFailed || publication.authors.length === 0} onClick={() => { setEditError(''); setEditingPublication({ ...publication }); }}>
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
