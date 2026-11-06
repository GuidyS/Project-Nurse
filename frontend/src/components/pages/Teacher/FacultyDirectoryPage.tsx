import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Loader2, RefreshCw, Search, Users } from "lucide-react";
import api from "@/lib/axios";
import ProfilePage from "@/components/pages/ProfilePage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

/** ใบอนุญาตที่หมดอายุแล้วหรือใกล้หมดใน 90 วัน ให้เห็นได้ตั้งแต่ในตาราง */
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

export default function FacultyDirectoryPage() {
  const [faculty, setFaculty] = useState<FacultyListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

      {/*
        ใช้หน้า "ข้อมูลส่วนตัว" ตัวจริงมาแสดงซ้ำในโหมดดูอย่างเดียว
        หน้าตาจะได้เหมือนกันเป๊ะและไม่เพี้ยนตามกันทีหลังเมื่อมีการแก้หน้านั้น
      */}
      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-4xl">
          <SheetHeader className="sr-only">
            <SheetTitle>ข้อมูลส่วนตัวของบุคลากร</SheetTitle>
          </SheetHeader>
          {selectedId && <ProfilePage facultyId={selectedId} readOnly />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
