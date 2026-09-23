import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Save, Loader2, Plus, Trash2, PlusCircle, Calendar, Upload, FileCheck, ExternalLink, X } from "lucide-react";
import api from "@/lib/axios";

interface DoseItem {
  id: string;
  label_type: "dose" | "year";
  received_date: string;
}

interface VaccineGroup {
  id: string;
  sequence_no: number;
  vaccine_name: string;
  immunity_status: "none_uninfected" | "none_infected" | "has_immunity" | "";
  evidence_attached: boolean;
  evidence_file: File | null;
  evidence_file_path?: string;
  advisor_name: string;
  remark: string;
  doses: DoseItem[];
}

const DEFAULT_GROUPS: VaccineGroup[] = [
  {
    id: "group-1",
    sequence_no: 1,
    vaccine_name: "โรคตับอักเสบบี",
    immunity_status: "none_uninfected",
    evidence_attached: false,
    evidence_file: null,
    advisor_name: "",
    remark: "กรณี นศ. ไปรับวัคซีนเพิ่มเติม ภายหลังให้ขอเอกสารรับรองจากโรงพยาบาลนั้นๆ มาแนบเป็นหลักฐาน ไม่จำเป็นต้องตรวจภูมิต่างหาก",
    doses: [
      { id: "d-1-1", label_type: "dose", received_date: "" },
      { id: "d-1-2", label_type: "dose", received_date: "" },
      { id: "d-1-3", label_type: "dose", received_date: "" }
    ]
  },
  {
    id: "group-2",
    sequence_no: 2,
    vaccine_name: "โรคอีสุกอีใส",
    immunity_status: "none_uninfected",
    evidence_attached: false,
    evidence_file: null,
    advisor_name: "",
    remark: "กรณี นศ. ไปรับวัคซีนเพิ่มเติม ภายหลังให้ขอเอกสารรับรองจากโรงพยาบาลนั้นๆ มาแนบเป็นหลักฐาน ไม่จำเป็นต้องตรวจภูมิซ้ำ",
    doses: [
      { id: "d-2-1", label_type: "dose", received_date: "" },
      { id: "d-2-2", label_type: "dose", received_date: "" }
    ]
  },
  {
    id: "group-4",
    sequence_no: 4,
    vaccine_name: "โรคไข้หวัดใหญ่\n(ฉีดวัคซีนปีละ 1 ครั้ง)",
    immunity_status: "none_uninfected",
    evidence_attached: false,
    evidence_file: null,
    advisor_name: "",
    remark: "ตามความสมัครใจ",
    doses: [
      { id: "d-4-1", label_type: "year", received_date: "" },
      { id: "d-4-2", label_type: "year", received_date: "" },
      { id: "d-4-3", label_type: "year", received_date: "" },
      { id: "d-4-4", label_type: "year", received_date: "" }
    ]
  }
];

export default function StudentVaccinationPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<VaccineGroup[]>(DEFAULT_GROUPS);

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/index.php?page=student-vaccinations");
      if (res.data.status === "success" && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const rawRows: any[] = res.data.data;
        const groupMap = new Map<string, VaccineGroup>();

        rawRows.forEach((row) => {
          const key = `seq_${row.sequence_no}_${row.vaccine_name}`;
          if (!groupMap.has(key)) {
            groupMap.set(key, {
              id: `group-${row.sequence_no}-${Date.now()}`,
              sequence_no: Number(row.sequence_no),
              vaccine_name: row.vaccine_name,
              immunity_status: (row.immunity_status as any) || "none_uninfected",
              evidence_attached: Boolean(Number(row.evidence_attached)),
              evidence_file: null,
              evidence_file_path: row.evidence_file_path || "",
              advisor_name: row.advisor_name || "",
              remark: row.remark || "",
              doses: []
            });
          }

          const isYear = row.vaccine_name.includes("ไข้หวัดใหญ่");
          groupMap.get(key)!.doses.push({
            id: `dose-${row.sequence_no}-${row.dose_no}-${Math.random()}`,
            label_type: isYear ? "year" : "dose",
            received_date: row.received_date || ""
          });
        });

        const loadedGroups = Array.from(groupMap.values());
        setGroups(loadedGroups);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดประวัติวัคซีนไม่สำเร็จ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGroup = () => {
    const nextSeq = groups.length > 0 ? Math.max(...groups.map(g => g.sequence_no)) + 1 : 1;
    const newGroup: VaccineGroup = {
      id: `group-${Date.now()}`,
      sequence_no: nextSeq,
      vaccine_name: `วัคซีนลำดับที่ ${nextSeq}`,
      immunity_status: "none_uninfected",
      evidence_attached: false,
      evidence_file: null,
      advisor_name: "",
      remark: "",
      doses: [{ id: `dose-${Date.now()}-1`, label_type: "dose", received_date: "" }]
    };
    setGroups([...groups, newGroup]);
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  // 💉 เพิ่มเข็มใหม่
  const handleAddDose = (groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          doses: [...g.doses, { id: `dose-${Date.now()}-${Math.random()}`, label_type: "dose", received_date: "" }]
        };
      }
      return g;
    }));
  };

  // 📅 เพิ่มปีใหม่
  const handleAddYear = (groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          doses: [...g.doses, { id: `year-${Date.now()}-${Math.random()}`, label_type: "year", received_date: "" }]
        };
      }
      return g;
    }));
  };

  // 🗑️ ลบรายการเจาะจงรายบรรทัด
  const handleDeleteSpecificDose = (groupId: string, doseId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          doses: g.doses.filter(d => d.id !== doseId)
        };
      }
      return g;
    }));
  };

  const handleDoseDateChange = (groupId: string, doseId: string, date: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          doses: g.doses.map(d => d.id === doseId ? { ...d, received_date: date } : d)
        };
      }
      return g;
    }));
  };

  const handleFileChange = (groupId: string, file: File | null) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          evidence_file: file,
          evidence_attached: Boolean(file || g.evidence_file_path)
        };
      }
      return g;
    }));
  };

  // คำนวณ Label แยกตามประเภท (เข็ม หรือ ปี) อย่างอิสระ
  const getDoseLabel = (doses: DoseItem[], currentIndex: number) => {
    const currentItem = doses[currentIndex];
    const subList = doses.slice(0, currentIndex + 1);
    
    if (currentItem.label_type === "year") {
      const yearCount = subList.filter(d => d.label_type === "year").length;
      return `ปี ${yearCount}`;
    } else {
      const doseCount = subList.filter(d => d.label_type === "dose").length;
      return `เข็มที่ ${doseCount}`;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      const flatRows: any[] = [];

      groups.forEach((g) => {
        if (g.evidence_file) {
          formData.append(`evidence_file_${g.id}`, g.evidence_file);
        }

        g.doses.forEach((d, idx) => {
          flatRows.push({
            group_id: g.id,
            sequence_no: g.sequence_no,
            vaccine_name: g.vaccine_name,
            dose_no: idx + 1,
            immunity_status: g.immunity_status,
            received_date: d.received_date,
            evidence_attached: g.evidence_attached ? 1 : 0,
            evidence_file_path: g.evidence_file_path || "",
            advisor_name: g.advisor_name || "",
            remark: g.remark
          });
        });
      });

      formData.append("vaccinations", JSON.stringify(flatRows));

      const res = await api.post("/index.php?page=student-vaccinations", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.status === "success") {
        toast({ title: "บันทึกข้อมูลเรียบร้อยแล้ว" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "บันทึกล้มเหลว", description: "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        กำลังโหลดข้อมูลประวัติการได้รับภูมิคุ้มกัน...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">ส่วนที่ 3 ข้อมูลภาวะสุขภาพและการได้รับวัคซีนป้องกันโรค</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            1. ประวัติการได้รับภูมิคุ้มกันโรค (อาจารย์ที่ปรึกษาตรวจสอบจากใบรายงานผลตรวจสุขภาพแรกเข้าได้)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAddGroup} className="gap-1.5 border-dashed">
            <Plus className="h-4 w-4" /> เพิ่มวัคซีน/โรคใหม่
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            บันทึกข้อมูล
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border-collapse border border-border w-full text-sm">
              <TableHeader className="bg-muted/50">
                <TableRow className="border-b border-border divide-x divide-border text-center font-semibold">
                  <TableHead className="w-16 text-center text-foreground">ลำดับ</TableHead>
                  <TableHead className="w-80 text-foreground">วัคซีนคุ้มกันโรค</TableHead>
                  <TableHead className="w-80 text-center text-foreground">วัน/เดือน/ปี ที่ได้รับวัคซีน (กรณีไม่มีภูมิ)</TableHead>
                  <TableHead className="w-52 text-center text-foreground">ลงชื่ออาจารย์ที่ปรึกษา</TableHead>
                  <TableHead className="text-foreground">หมายเหตุ</TableHead>
                  <TableHead className="w-14 text-center text-foreground">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {groups.map((group) => (
                  <TableRow key={group.id} className="divide-x divide-border align-top">
                    {/* ลำดับ */}
                    <TableCell className="p-3 text-center">
                      <Input
                        type="number"
                        className="w-12 text-center mx-auto h-8 px-1 font-bold"
                        value={group.sequence_no}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setGroups(groups.map(g => g.id === group.id ? { ...g, sequence_no: val } : g));
                        }}
                      />
                    </TableCell>

                    {/* วัคซีนคุ้มกันโรค และ การแนบหลักฐาน */}
                    <TableCell className="p-3 space-y-3">
                      <Textarea
                        rows={2}
                        className="font-bold text-foreground text-xs resize-none"
                        value={group.vaccine_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGroups(groups.map(g => g.id === group.id ? { ...g, vaccine_name: val } : g));
                        }}
                      />

                      <div className="space-y-2 pl-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`uninf-${group.id}`} 
                            checked={group.immunity_status === "none_uninfected"} 
                            onCheckedChange={() => setGroups(groups.map(g => g.id === group.id ? { ...g, immunity_status: "none_uninfected" } : g))} 
                          />
                          <Label htmlFor={`uninf-${group.id}`} className="cursor-pointer">ไม่มีภูมิ ไม่เคยติดเชื้อ</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`inf-${group.id}`} 
                            checked={group.immunity_status === "none_infected"} 
                            onCheckedChange={() => setGroups(groups.map(g => g.id === group.id ? { ...g, immunity_status: "none_infected" } : g))} 
                          />
                          <Label htmlFor={`inf-${group.id}`} className="cursor-pointer">ไม่มีภูมิ แต่เคยติดเชื้อ</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`has-${group.id}`} 
                            checked={group.immunity_status === "has_immunity"} 
                            onCheckedChange={() => setGroups(groups.map(g => g.id === group.id ? { ...g, immunity_status: "has_immunity" } : g))} 
                          />
                          <Label htmlFor={`has-${group.id}`} className="cursor-pointer">มีภูมิคุ้มกันโรค</Label>
                        </div>

                        {/* แนบหลักฐาน */}
                        <div className="space-y-2 pl-6 pt-1 border-t border-border/40">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`doc-${group.id}`} 
                              checked={group.evidence_attached} 
                              onCheckedChange={(c) => setGroups(groups.map(g => g.id === group.id ? { ...g, evidence_attached: Boolean(c) } : g))} 
                            />
                            <Label htmlFor={`doc-${group.id}`} className="text-xs text-muted-foreground cursor-pointer font-medium">
                              (แนบหลักฐาน)
                            </Label>
                          </div>

                          {group.evidence_attached && (
                            <div className="pt-1.5 space-y-1.5 animate-fade-in">
                              <label className="flex items-center gap-1.5 text-[11px] text-primary hover:underline cursor-pointer bg-primary/5 px-2.5 py-1.5 rounded-md border border-primary/20 w-fit">
                                <Upload className="h-3.5 w-3.5" />
                                <span>{group.evidence_file ? "เปลี่ยนไฟล์" : "อัปโหลดไฟล์หลักฐาน"}</span>
                                <input
                                  type="file"
                                  accept=".pdf,image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileChange(group.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>

                              {group.evidence_file && (
                                <p className="text-[11px] text-foreground flex items-center gap-1 truncate max-w-[200px]">
                                  <FileCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                  <span className="truncate">{group.evidence_file.name}</span>
                                </p>
                              )}

                              {group.evidence_file_path && !group.evidence_file && (
                                <a
                                  href={`${apiBaseUrl}/${group.evidence_file_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" /> เปิดดูหลักฐานเดิม
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* วัน/เดือน/ปี ที่ได้รับวัคซีน */}
                    <TableCell className="p-3 space-y-2">
                      {group.doses.map((dose, idx) => (
                        <div key={dose.id} className="flex items-center gap-2 group/dose">
                          <span className="w-14 text-xs text-muted-foreground shrink-0 font-medium">
                            {getDoseLabel(group.doses, idx)}
                          </span>
                          <Input
                            type="date"
                            className="h-8 text-xs flex-1"
                            value={dose.received_date}
                            onChange={(e) => handleDoseDateChange(group.id, dose.id, e.target.value)}
                          />
                          {group.doses.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSpecificDose(group.id, dose.id)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                              title={`ลบ${getDoseLabel(group.doses, idx)}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAddDose(group.id)} 
                          className="h-7 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/10 gap-1"
                        >
                          <PlusCircle className="h-3.5 w-3.5" /> + เพิ่มเข็ม
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAddYear(group.id)} 
                          className="h-7 px-2 text-[11px] text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 gap-1"
                        >
                          <Calendar className="h-3.5 w-3.5" /> + เพิ่มปี
                        </Button>
                      </div>
                    </TableCell>

                    {/* ลงชื่ออาจารย์ที่ปรึกษา */}
                    <TableCell className="p-3">
                      <Input
                        placeholder="ชื่ออาจารย์ที่ปรึกษา"
                        className="text-xs h-8 text-center"
                        value={group.advisor_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGroups(groups.map(g => g.id === group.id ? { ...g, advisor_name: val } : g));
                        }}
                      />
                    </TableCell>

                    {/* หมายเหตุ */}
                    <TableCell className="p-3">
                      <Textarea
                        rows={3}
                        className="text-xs resize-none"
                        value={group.remark}
                        placeholder="ระบุหมายเหตุ"
                        onChange={(e) => {
                          const val = e.target.value;
                          setGroups(groups.map(g => g.id === group.id ? { ...g, remark: val } : g));
                        }}
                      />
                    </TableCell>

                    {/* จัดการแถว */}
                    <TableCell className="p-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteGroup(group.id)}
                        title="ลบแถวนี้"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {groups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      ยังไม่มีรายการวัคซีน กรุณากดปุ่ม <b>"เพิ่มวัคซีน/โรคใหม่"</b> ด้านบน
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}