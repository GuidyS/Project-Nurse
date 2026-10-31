import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import api from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FacultyListItem {
  faculty_id: string;
  name: string;
  positions: string[];
  status: string | null;
  license_expiry: string | null;
  profile_picture: string | null;
}

interface FacultyDocument {
  title: string;
  url: string;
  source: "google_drive" | "external" | "upload";
  file_name: string;
  available: boolean;
}

interface FacultyDetail extends FacultyListItem {
  name_en: string | null;
  gender: string | null;
  birth_date: string | null;
  email: string | null;
  phone: string | null;
  current_address: string | null;
  start_work_date: string | null;
  academic_position_date: string | null;
  nursing_council_no: string | null;
  documents: FacultyDocument[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** ไฟล์ที่อัปโหลดไว้ในระบบเก็บเป็น path สัมพัทธ์ ต้องต่อ origin ของ backend ให้ก่อน */
const documentHref = (doc: FacultyDocument) =>
  doc.source === "upload" ? `${API_BASE}/${doc.url}` : doc.url;

const STATUS_LABELS: Record<string, string> = {
  Active: "ปฏิบัติงาน",
  Retired: "เกษียณ",
  Resigned: "ลาออก",
};

const formatDateTh = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
};

/** ใบอนุญาตที่หมดอายุแล้วหรือใกล้หมดใน 90 วัน ให้เห็นชัดตั้งแต่ในตาราง */
const licenseTone = (expiry: string | null) => {
  if (!expiry) return "none";
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return "none";
  const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 90) return "soon";
  return "ok";
};

function StatusBadge({ status }: { status: string | null }) {
  const label = status ? STATUS_LABELS[status] ?? status : "ไม่ระบุ";
  if (status === "Active") {
    return <Badge className="rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">{label}</Badge>;
  }
  return <Badge variant="outline" className="rounded-md text-muted-foreground">{label}</Badge>;
}

function LicenseText({ expiry }: { expiry: string | null }) {
  const tone = licenseTone(expiry);
  const className =
    tone === "expired" ? "text-destructive" : tone === "soon" ? "text-amber-600" : "text-muted-foreground";
  return (
    <span className={`text-xs ${className}`}>
      {expiry ? `ใบอนุญาตถึง ${formatDateTh(expiry)}` : "ไม่ระบุวันหมดอายุ"}
      {tone === "expired" && " (หมดอายุแล้ว)"}
      {tone === "soon" && " (ใกล้หมดอายุ)"}
    </span>
  );
}

/** แถวข้อมูลแบบอ่านอย่างเดียว ไม่ใช้ input เพื่อไม่ให้เผลอแก้ไขได้ */
function InfoRow({ icon: Icon, label, value }: { icon?: typeof Mail; label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="max-w-[60%] text-right text-sm text-foreground">{value?.trim() || "-"}</span>
    </div>
  );
}

export default function FacultyDirectoryPage() {
  const [faculty, setFaculty] = useState<FacultyListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<FacultyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/index.php?page=faculty-directory");
        if (response.data?.status !== "success" || !response.data?.data) {
          throw new Error(response.data?.message || "ไม่สามารถโหลดรายชื่อบุคลากรได้");
        }
        if (mounted) setFaculty(response.data.data.faculty ?? []);
      } catch (requestError: any) {
        if (mounted) {
          setError(requestError?.response?.data?.message || requestError?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      return;
    }

    let mounted = true;
    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const response = await api.get(
          `/index.php?page=faculty-directory&faculty_id=${encodeURIComponent(selectedId)}`,
        );
        if (response.data?.status !== "success" || !response.data?.data) {
          throw new Error(response.data?.message || "ไม่สามารถโหลดข้อมูลส่วนตัวได้");
        }
        if (mounted) setDetail(response.data.data as FacultyDetail);
      } catch (requestError: any) {
        if (mounted) {
          setDetailError(requestError?.response?.data?.message || requestError?.message || "โหลดข้อมูลไม่สำเร็จ");
        }
      } finally {
        if (mounted) setDetailLoading(false);
      }
    };
    loadDetail();
    return () => {
      mounted = false;
    };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("th-TH");
    if (keyword === "") return faculty;
    return faculty.filter(
      (person) =>
        person.name.toLocaleLowerCase("th-TH").includes(keyword) ||
        person.faculty_id.includes(keyword) ||
        person.positions.some((position) => position.toLocaleLowerCase("th-TH").includes(keyword)),
    );
  }, [faculty, search]);

  if (loading && faculty.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังโหลดรายชื่อบุคลากร...
      </div>
    );
  }

  if (error && faculty.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => setReloadKey((value) => value + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          โหลดอีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="app-page-header">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="app-page-title">บุคลากรภายในคณะ</h1>
            <p className="app-page-description">
              รายชื่ออาจารย์และบุคลากรทั้งหมดในระบบ คลิกที่ชื่อเพื่อดูข้อมูลส่วนตัว (ดูได้อย่างเดียว)
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          title="รีเฟรชข้อมูล"
          onClick={() => setReloadKey((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อ รหัสประจำตัว หรือตำแหน่ง"
            className="pl-9"
          />
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[340px]">ชื่อ-สกุล</TableHead>
                  <TableHead>ตำแหน่งในคณะ</TableHead>
                  <TableHead className="w-[260px]">สถานะ</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                      ไม่พบบุคลากรตามเงื่อนไขที่ค้นหา
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((person) => (
                    <TableRow
                      key={person.faculty_id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(person.faculty_id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            {person.profile_picture && <AvatarImage src={person.profile_picture} alt={person.name} />}
                            <AvatarFallback className="text-xs">{person.name.trim().charAt(0) || "อ"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{person.name || "ไม่ระบุชื่อ"}</p>
                            <p className="text-xs text-muted-foreground">{person.faculty_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {person.positions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {person.positions.map((position) => (
                              <Badge key={position} variant="secondary" className="rounded-md text-xs font-normal">
                                {position}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={person.status} />
                          <div>
                            <LicenseText expiry={person.license_expiry} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={`ดูข้อมูลส่วนตัวของ ${person.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedId(person.faculty_id);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            แสดง {filtered.length} จาก {faculty.length} คน
          </div>
        </div>
      </div>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {detailLoading && (
            <div className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              กำลังโหลดข้อมูลส่วนตัว...
            </div>
          )}

          {!detailLoading && detailError && (
            <div className="flex h-40 items-center justify-center text-sm text-destructive">{detailError}</div>
          )}

          {!detailLoading && !detailError && detail && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border">
                    {detail.profile_picture && <AvatarImage src={detail.profile_picture} alt={detail.name} />}
                    <AvatarFallback>{detail.name.trim().charAt(0) || "อ"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle>{detail.name || "ไม่ระบุชื่อ"}</SheetTitle>
                    <SheetDescription>
                      รหัสประจำตัว {detail.faculty_id}
                      {detail.name_en ? ` · ${detail.name_en}` : ""}
                    </SheetDescription>
                  </div>
                </div>
                <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  หน้านี้แสดงข้อมูลอย่างเดียว แก้ไขข้อมูลได้ที่หน้า "จัดการผู้ใช้" ของผู้ดูแลระบบเท่านั้น
                </p>
              </SheetHeader>

              <div className="mt-5 space-y-4">
                <section className="rounded-lg border p-4">
                  <h3 className="mb-2 text-sm font-semibold">ตำแหน่งและสถานะ</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={detail.status} />
                    {detail.positions.map((position) => (
                      <Badge key={position} variant="secondary" className="rounded-md text-xs font-normal">
                        {position}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3">
                    <InfoRow icon={CalendarDays} label="วันที่เริ่มงาน" value={formatDateTh(detail.start_work_date)} />
                    <InfoRow
                      icon={CalendarDays}
                      label="วันที่รับตำแหน่งทางวิชาการ"
                      value={formatDateTh(detail.academic_position_date)}
                    />
                  </div>
                </section>

                <section className="rounded-lg border p-4">
                  <h3 className="mb-2 text-sm font-semibold">ข้อมูลติดต่อ</h3>
                  <InfoRow icon={Mail} label="อีเมล" value={detail.email} />
                  <InfoRow icon={Phone} label="เบอร์โทรศัพท์" value={detail.phone} />
                  <InfoRow icon={MapPin} label="ที่อยู่ปัจจุบัน" value={detail.current_address} />
                </section>

                <section className="rounded-lg border p-4">
                  <h3 className="mb-2 text-sm font-semibold">ข้อมูลส่วนตัว</h3>
                  <InfoRow label="เพศ" value={detail.gender} />
                  <InfoRow icon={CalendarDays} label="วัน/เดือน/ปีเกิด" value={formatDateTh(detail.birth_date)} />
                </section>

                <section className="rounded-lg border p-4">
                  <h3 className="mb-2 text-sm font-semibold">ใบอนุญาตประกอบวิชาชีพ</h3>
                  <InfoRow icon={ShieldCheck} label="เลขที่ใบอนุญาต" value={detail.nursing_council_no} />
                  <InfoRow icon={CalendarDays} label="วันหมดอายุ" value={formatDateTh(detail.license_expiry)} />
                  <div className="pt-2">
                    <LicenseText expiry={detail.license_expiry} />
                  </div>
                </section>

                <section className="rounded-lg border p-4">
                  <h3 className="mb-3 text-sm font-semibold">เอกสารแนบ</h3>
                  {detail.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">ยังไม่มีเอกสารแนบในระบบ</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.documents.map((doc) => (
                        <a
                          key={`${doc.title}-${doc.url}`}
                          href={documentHref(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted/50"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{doc.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{doc.file_name}</p>
                            {!doc.available && (
                              <p className="text-[11px] text-amber-600">ไฟล์ไม่อยู่บนเซิร์ฟเวอร์แล้ว</p>
                            )}
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
