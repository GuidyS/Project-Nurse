import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Microscope,
  MinusCircle,
  PlusCircle,
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
    journals: string[];
    rules: {
      academic_year: string;
      calendar_year: string;
      kpi_roles: AuthorRole[];
    };
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

const fallbackResearchData = {
  years: [2566, 2567, 2568, 2569, 2570],
  faculty: [
    { faculty_id: 1001, name: "ผศ.ดร.พิชาภรณ์ จันทนกุล", note: "รับผิดชอบหลักสูตร" },
    { faculty_id: 1002, name: "ผศ.ดร.วัฒนีย์ ปานจินดา", note: "รับผิดชอบหลักสูตร" },
    { faculty_id: 1003, name: "ผศ.ดร.สุสารี ประคินกิจ", note: "รับผิดชอบหลักสูตร" },
    { faculty_id: 1004, name: "ดร.สุวรรณา เชียงขุนทด", note: "" },
    { faculty_id: 1005, name: "ผศ.ดร.ชนิดา มัททวางกูร", note: "" },
    { faculty_id: 1006, name: "อาจารย์สุกฤตา ตะการีย์", note: "" },
    { faculty_id: 1007, name: "อาจารย์รัฐกานต์ ขำเขียว", note: "" },
    { faculty_id: 1008, name: "อาจารย์ชัยสิทธิ์ ทันศึก", note: "" },
  ],
  publications: [
    {
      id: 1,
      title: "ผลลัพธ์การใช้นวัตกรรมนุ่มนิ่มอโรม่าคลายเครียดในนักศึกษาพยาบาลชั้นปีที่ 1-4 มหาวิทยาลัยสยาม",
      journal: "วารสารพยาบาลศาสตร์ มหาวิทยาลัยสยาม",
      publication_date: "2023-03-15",
      buddhist_year: 2566,
      publication_type: "research" as PublicationType,
      database_level: "TCI 2",
      authors: [
        { faculty_id: 1006, name: "อาจารย์สุกฤตา ตะการีย์", role: "corresponding" as AuthorRole },
        { faculty_id: 1001, name: "ผศ.ดร.พิชาภรณ์ จันทนกุล", role: "co_author" as AuthorRole },
      ],
    },
    {
      id: 2,
      title: "การรับรู้ทักษะการเรียนรู้ ความมั่นใจ การประยุกต์ใช้ความรู้และความพึงพอใจของนักศึกษาพยาบาลต่อการฝึกปฏิบัติออนไลน์",
      journal: "วารสารพยาบาลศาสตร์ มหาวิทยาลัยสยาม",
      publication_date: "2023-09-10",
      buddhist_year: 2566,
      publication_type: "research" as PublicationType,
      database_level: "TCI 2",
      authors: [{ faculty_id: 1004, name: "ดร.สุวรรณา เชียงขุนทด", role: "first_author" as AuthorRole }],
    },
    {
      id: 3,
      title: "ปัจจัยที่มีความสัมพันธ์กับความวิตกกังวลในการรับวัคซีนป้องกันโควิด 19",
      journal: "วารสารวิจัยสุขภาพและการพยาบาล",
      publication_date: "2024-03-20",
      buddhist_year: 2567,
      publication_type: "research" as PublicationType,
      database_level: "TCI 1",
      authors: [
        { faculty_id: 1006, name: "อาจารย์สุกฤตา ตะการีย์", role: "first_author" as AuthorRole },
        { faculty_id: 1003, name: "ผศ.ดร.สุสารี ประคินกิจ", role: "co_author" as AuthorRole },
      ],
    },
    {
      id: 4,
      title: "บทความวิชาการด้านการพยาบาลระยะคลอด ฉบับปรับปรุง",
      journal: "ตำราการพยาบาล",
      publication_date: "2026-05-05",
      buddhist_year: 2569,
      publication_type: "textbook" as PublicationType,
      database_level: "ตำรา",
      authors: [{ faculty_id: 1005, name: "ผศ.ดร.ชนิดา มัททวางกูร", role: "co_author" as AuthorRole }],
    },
    {
      id: 5,
      title: "แนวทางการพัฒนาระบบสุขภาพชุมชนโดยอาจารย์พยาบาล",
      journal: "วารสารวิจัยสุขภาพและการพยาบาล",
      publication_date: "2026-02-11",
      buddhist_year: 2569,
      publication_type: "research" as PublicationType,
      database_level: "TCI 1",
      authors: [{ faculty_id: 1008, name: "อาจารย์ชัยสิทธิ์ ทันศึก", role: "corresponding" as AuthorRole }],
    },
  ],
  journals: ["วารสารพยาบาลศาสตร์ มหาวิทยาลัยสยาม", "วารสารวิจัยสุขภาพและการพยาบาล", "ตำราการพยาบาล"],
};

const getBuddhistYear = (dateValue: string, mode: YearMode) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 0;
  const christianYear = date.getFullYear();
  if (mode === "academic") {
    return date.getMonth() >= 7 ? christianYear + 544 : christianYear + 543;
  }
  return christianYear + 543;
};

const dateForBuddhistYear = (year: number, mode: YearMode) => {
  const christianYear = year - 543;
  if (mode === "academic") {
    return `${christianYear - 1}-08-01`;
  }
  return `${christianYear}-01-01`;
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
  if (counts.coAuthor) parts.push({ value: counts.coAuthor, className: "font-semibold text-zinc-100" });
  if (counts.academic) parts.push({ value: counts.academic, className: "font-semibold text-sky-600" });
  return parts;
};

export default function ResearchSummary() {
  const [yearMode, setYearMode] = useState<YearMode>("calendar");
  const [years, setYears] = useState<number[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [journals, setJournals] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedJournal, setSelectedJournal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setJournals(response.data.data.journals);
        setSelectedJournal(response.data.data.journals[0] || "");
      } catch (err: unknown) {
        if (!mounted) return;
        console.warn("Using local research preview data:", err);
        setYears(fallbackResearchData.years);
        setFaculty(fallbackResearchData.faculty);
        setPublications(fallbackResearchData.publications);
        setJournals(fallbackResearchData.journals);
        setSelectedJournal(fallbackResearchData.journals[0] || "");
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

  const addQuickCellPublication = (
    person: Faculty,
    year: number,
    kind: "kpi" | "co_author" | "academic"
  ) => {
    const isAcademic = kind === "academic";
    const nextPublication: Publication = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: `บันทึกผลงาน${isAcademic ? "วิชาการ/ตำรา" : "วิจัย"} ${person.name} ปี ${year}`,
      journal: selectedJournal || journals[0] || "รอเลือกวารสาร",
      publication_date: dateForBuddhistYear(year, yearMode),
      buddhist_year: year,
      publication_type: isAcademic ? "academic" : "research",
      database_level: isAcademic ? "วิชาการ/ตำรา" : "รอตรวจสอบ",
      authors: [
        {
          faculty_id: person.faculty_id,
          name: person.name,
          role: kind === "co_author" ? "co_author" : "first_author",
        },
      ],
    };

    setPublications((current) => [nextPublication, ...current]);
  };

  const removeQuickCellPublication = (
    person: Faculty,
    year: number,
    kind: "kpi" | "co_author" | "academic"
  ) => {
    setPublications((current) => {
      const targetIndex = current.findIndex((publication) => {
        if (getBuddhistYear(publication.publication_date, yearMode) !== year) return false;

        const author = publication.authors.find((item) => item.faculty_id === person.faculty_id);
        if (!author) return false;

        const isAcademic = publication.publication_type === "academic" || publication.publication_type === "textbook";
        if (kind === "academic") return isAcademic;
        if (isAcademic) return false;
        if (kind === "kpi") return author.role === "first_author" || author.role === "corresponding";
        return author.role === "co_author";
      });

      if (targetIndex < 0) return current;

      return current.flatMap((publication, index) => {
        if (index !== targetIndex) return [publication];

        const nextAuthors = publication.authors.filter((author) => author.faculty_id !== person.faculty_id);
        if (nextAuthors.length === 0) return [];
        return [{ ...publication, authors: nextAuthors }];
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">สรุปผลงานวิจัย 5 ปี</h1>
          <p className="text-muted-foreground">บันทึกและตรวจสอบผลงานวิจัยสำหรับ Admin และ Research</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Tabs value={yearMode} onValueChange={(value) => setYearMode(value as YearMode)}>
            <TabsList>
              <TabsTrigger value="calendar">ปีปฏิทิน</TabsTrigger>
              <TabsTrigger value="academic">ปีการศึกษา</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาอาจารย์ / บทความ" className="pl-9" />
          </div>
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
            <div className="text-2xl font-bold">{summary.coAuthor}</div>
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
            {yearMode === "calendar" ? "ปีปฏิทิน: 1 มกราคม - 31 ธันวาคม" : "ปีการศึกษา: 1 สิงหาคม - 31 กรกฎาคม"}
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
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>ตารางจำนวนผลงานวิจัยและวิชาการตีพิมพ์ของอาจารย์</CardTitle>
            <CardDescription>รูปแบบใกล้เคียง D74: ช่องรวมเฉพาะผลงานสีแดง First/Corresponding</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge className="bg-red-600">แดง: นับ KPI</Badge>
            <Badge variant="outline" className="border-zinc-500 bg-zinc-900 text-zinc-50">ดำ: ชื่อร่วม</Badge>
            <Badge className="bg-sky-600">ฟ้า: วิชาการ/ตำรา</Badge>
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
                  <TableHead>หมายเหตุ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                                        disabled={counts.kpi === 0}
                                        className="h-8 w-8 border-red-400/60 text-red-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                                        onClick={() => removeQuickCellPublication(person, year, "kpi")}
                                      >
                                        <MinusCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 border-red-400/60 text-red-500 hover:bg-red-500/10 hover:text-red-400"
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
                                        disabled={counts.coAuthor === 0}
                                        className="h-8 w-8 disabled:opacity-40"
                                        onClick={() => removeQuickCellPublication(person, year, "co_author")}
                                      >
                                        <MinusCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
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
                                        disabled={counts.academic === 0}
                                        className="h-8 w-8 border-sky-400/60 text-sky-500 hover:bg-sky-500/10 hover:text-sky-400 disabled:opacity-40"
                                        onClick={() => removeQuickCellPublication(person, year, "academic")}
                                      >
                                        <MinusCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 border-sky-400/60 text-sky-500 hover:bg-sky-500/10 hover:text-sky-400"
                                        onClick={() => addQuickCellPublication(person, year, "academic")}
                                      >
                                        <PlusCircle className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
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
          <CardDescription>ข้อมูลต้นทางที่ระบบใช้คำนวณตัวเลขในตาราง</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visiblePublications.map((publication) => {
              const isAcademic = publication.publication_type === "academic" || publication.publication_type === "textbook";
              return (
                <div key={publication.id} className="rounded-md border p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <div className="font-medium leading-relaxed">{publication.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {publication.journal} · {publication.database_level} · {publication.publication_date}
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
                    <Badge variant="secondary">{typeLabel[publication.publication_type]}</Badge>
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
