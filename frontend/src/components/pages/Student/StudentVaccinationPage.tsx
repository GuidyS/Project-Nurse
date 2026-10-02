import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Save, Loader2, Plus, Trash2, PlusCircle, Calendar, ImagePlus, X, FileText } from "lucide-react";
import api from "@/lib/axios";

// UI Components สำหรับ Dialog ยืนยัน
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  advisor_name: string;
  remark: string;
  doses: DoseItem[];
  existing_images: string[];
  new_images: File[];
}

const DEFAULT_GROUPS: VaccineGroup[] = [
  {
    id: "group-1",
    sequence_no: 1,
    vaccine_name: "โรคตับอักเสบบี",
    immunity_status: "none_uninfected",
    evidence_attached: false,
    advisor_name: "",
    remark: "กรณี นศ. ไปรับวัคซีนเพิ่มเติม ภายหลังให้ขอเอกสารรับรองจากโรงพยาบาลนั้นๆ มาแนบเป็นหลักฐาน ไม่จำเป็นต้องตรวจภูมิต่างหาก",
    doses: [
      { id: "d-1-1", label_type: "dose", received_date: "" },
      { id: "d-1-2", label_type: "dose", received_date: "" },
      { id: "d-1-3", label_type: "dose", received_date: "" }
    ],
    existing_images: [], new_images: []
  },
  {
    id: "group-2",
    sequence_no: 2,
    vaccine_name: "โรคอีสุกอีใส",
    immunity_status: "none_uninfected",
    evidence_attached: false,
    advisor_name: "",
    remark: "กรณี นศ. ไปรับวัคซีนเพิ่มเติม ภายหลังให้ขอเอกสารรับรองจากโรงพยาบาลนั้นๆ มาแนบเป็นหลักฐาน ไม่จำเป็นต้องตรวจภูมิซ้ำ",
    doses: [
      { id: "d-2-1", label_type: "dose", received_date: "" },
      { id: "d-2-2", label_type: "dose", received_date: "" }
    ],
    existing_images: [], new_images: []
  },
  {
    id: "group-4",
    sequence_no: 4,
    vaccine_name: "โรคไข้หวัดใหญ่\n(ฉีดวัคซีนปีละ 1 ครั้ง)",
    immunity_status: "none_uninfected",
    evidence_attached: false,
    advisor_name: "",
    remark: "ตามความสมัครใจ",
    doses: [
      { id: "d-4-1", label_type: "year", received_date: "" },
      { id: "d-4-2", label_type: "year", received_date: "" },
      { id: "d-4-3", label_type: "year", received_date: "" },
      { id: "d-4-4", label_type: "year", received_date: "" }
    ],
    existing_images: [], new_images: []
  }
];

export default function StudentVaccinationPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<VaccineGroup[]>(DEFAULT_GROUPS);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // States สำหรับพรีวิวและลบ
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    groupId: string;
    type: "new" | "existing";
    index?: number;
    path?: string;
  } | null>(null);

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

  const getImageUrl = (path: string) => `${apiBaseUrl}/${path}`;
  const isPdf = (pathOrName: string) => pathOrName.toLowerCase().endsWith('.pdf');

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
              advisor_name: row.advisor_name || "",
              remark: row.remark || "",
              doses: [],
              existing_images: Array.isArray(row.existing_images) ? row.existing_images : [],
              new_images: []
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
      advisor_name: "",
      remark: "",
      doses: [{ id: `dose-${Date.now()}-1`, label_type: "dose", received_date: "" }],
      existing_images: [], new_images: []
    };
    
    setGroups([...groups, newGroup]);
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 150);
  };

  const handleDeleteGroup = (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการวัคซีนนี้? ข้อมูลที่ยังไม่ได้บันทึกจะหายไป")) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const handleAddDose = (groupId: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, doses: [...g.doses, { id: `dose-${Date.now()}-${Math.random()}`, label_type: "dose", received_date: "" }] } : g));
  };

  const handleAddYear = (groupId: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, doses: [...g.doses, { id: `year-${Date.now()}-${Math.random()}`, label_type: "year", received_date: "" }] } : g));
  };

  const handleDeleteSpecificDose = (groupId: string, doseId: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเข็ม/ปี นี้?")) {
      setGroups(groups.map(g => g.id === groupId ? { ...g, doses: g.doses.filter(d => d.id !== doseId) } : g));
    }
  };

  const handleDoseDateChange = (groupId: string, doseId: string, date: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, doses: g.doses.map(d => d.id === doseId ? { ...d, received_date: date } : d) } : g));
  };

  const handleFileChange = (groupId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setGroups(groups.map(g => g.id === groupId ? { 
        ...g, 
        new_images: [...g.new_images, ...selectedFiles],
        evidence_attached: true
      } : g));
    }
    if (fileInputRefs.current[groupId]) {
      fileInputRefs.current[groupId]!.value = "";
    }
  };

  const confirmRemoveNewImage = (groupId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ groupId, type: "new", index });
    setDeleteConfirmOpen(true);
  };

  const confirmRemoveExistingImage = (groupId: string, imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ groupId, type: "existing", path: imagePath });
    setDeleteConfirmOpen(true);
  };

  //  แก้ไข Error `let` เป็น `const` ตรงบรรทัดนี้ครับ
  const executeDeleteImage = () => {
    if (!itemToDelete) return;
    const { groupId, type, index, path } = itemToDelete;

    setGroups(groups.map(g => {
      if (g.id !== groupId) return g;
      
      const updatedG = { ...g }; // เปลี่ยนเป็น const
      if (type === "new" && index !== undefined) {
        const filtered = [...updatedG.new_images];
        filtered.splice(index, 1);
        updatedG.new_images = filtered;
      } else if (type === "existing" && path) {
        updatedG.existing_images = updatedG.existing_images.filter(img => img !== path);
      }
      
      if (updatedG.existing_images.length === 0 && updatedG.new_images.length === 0) {
        updatedG.evidence_attached = false;
      }
      
      return updatedG;
    }));

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const getDoseLabel = (doses: DoseItem[], currentIndex: number) => {
    const currentItem = doses[currentIndex];
    const subList = doses.slice(0, currentIndex + 1);
    if (currentItem.label_type === "year") {
      return `ปี ${subList.filter(d => d.label_type === "year").length}`;
    } else {
      return `เข็มที่ ${subList.filter(d => d.label_type === "dose").length}`;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      const flatRows: any[] = [];

      groups.forEach((g) => {
        g.doses.forEach((d, idx) => {
          flatRows.push({
            group_id: g.id,
            sequence_no: g.sequence_no,
            vaccine_name: g.vaccine_name,
            dose_no: idx + 1,
            immunity_status: g.immunity_status,
            received_date: d.received_date,
            evidence_attached: g.evidence_attached ? 1 : 0,
            advisor_name: g.advisor_name || "",
            remark: g.remark,
            existing_images: g.existing_images 
          });
        });

        g.new_images.forEach((file) => {
          formData.append(`images_${g.id}[]`, file);
        });
      });

      formData.append("vaccinations", JSON.stringify(flatRows));

      const res = await api.post("/index.php?page=student-vaccinations", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.status === "success") {
        toast({ title: "บันทึกข้อมูลเรียบร้อยแล้ว" });
        await fetchData();
      }
    } catch (error: any) {
      toast({ 
        title: "บันทึกล้มเหลว", 
        description: error.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง", 
        variant: "destructive" 
      });
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
    <div className="space-y-6 max-w-7xl mx-auto p-6 animate-fade-in relative">
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
          <Button 
            variant="outline" 
            onClick={handleAddGroup} 
            className="gap-1.5 font-bold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-sm transition-all"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> เพิ่มวัคซีน/โรคใหม่
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0 shadow-sm bg-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            บันทึกข้อมูล
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0" ref={tableRef}>
          <div className="overflow-x-auto">
            <Table className="border-collapse border border-border w-full text-sm">
              <TableHeader className="bg-muted/50">
                <TableRow className="border-b border-border divide-x divide-border text-center font-semibold">
                  <TableHead className="w-16 text-center text-foreground">ลำดับ</TableHead>
                  <TableHead className="w-[320px] text-foreground">วัคซีนคุ้มกันโรค</TableHead>
                  <TableHead className="w-80 text-center text-foreground">วัน/เดือน/ปี ที่ได้รับวัคซีน (กรณีไม่มีภูมิ)</TableHead>
                  <TableHead className="w-52 text-center text-foreground">ลงชื่ออาจารย์ที่ปรึกษา</TableHead>
                  <TableHead className="text-foreground">หมายเหตุ</TableHead>
                  <TableHead className="w-14 text-center text-foreground">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {groups.map((group) => (
                  <TableRow key={group.id} className="divide-x divide-border align-top hover:bg-muted/30 transition-colors">
                    {/* ลำดับ */}
                    <TableCell className="p-3 text-center">
                      <Input
                        type="number"
                        className="w-12 text-center mx-auto h-8 px-1 font-bold"
                        value={group.sequence_no}
                        onChange={(e) => setGroups(groups.map(g => g.id === group.id ? { ...g, sequence_no: Number(e.target.value) } : g))}
                      />
                    </TableCell>

                    {/* วัคซีนคุ้มกันโรค และ การแนบหลักฐาน */}
                    <TableCell className="p-3 space-y-3">
                      <Textarea
                        rows={2}
                        className="font-bold text-foreground text-xs resize-none"
                        value={group.vaccine_name}
                        onChange={(e) => setGroups(groups.map(g => g.id === group.id ? { ...g, vaccine_name: e.target.value } : g))}
                      />

                      <div className="space-y-2 pl-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`uninf-${group.id}`} checked={group.immunity_status === "none_uninfected"} onCheckedChange={() => setGroups(groups.map(g => g.id === group.id ? { ...g, immunity_status: "none_uninfected" } : g))} />
                          <Label htmlFor={`uninf-${group.id}`} className="cursor-pointer">ไม่มีภูมิ ไม่เคยติดเชื้อ</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`inf-${group.id}`} checked={group.immunity_status === "none_infected"} onCheckedChange={() => setGroups(groups.map(g => g.id === group.id ? { ...g, immunity_status: "none_infected" } : g))} />
                          <Label htmlFor={`inf-${group.id}`} className="cursor-pointer">ไม่มีภูมิ แต่เคยติดเชื้อ</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`has-${group.id}`} checked={group.immunity_status === "has_immunity"} onCheckedChange={() => setGroups(groups.map(g => g.id === group.id ? { ...g, immunity_status: "has_immunity" } : g))} />
                          <Label htmlFor={`has-${group.id}`} className="cursor-pointer">มีภูมิคุ้มกันโรค</Label>
                        </div>

                        {/* ระบบอัปโหลดรูปภาพใหม่ */}
                        <div className="pt-2 mt-2 border-t border-border/40">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1.5 text-xs font-medium text-primary border-primary hover:bg-primary/5"
                            onClick={() => fileInputRefs.current[group.id]?.click()}
                          >
                            <ImagePlus className="h-3.5 w-3.5" />
                            แนบรูปหลักฐาน
                          </Button>
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            multiple 
                            className="hidden" 
                            ref={(el) => (fileInputRefs.current[group.id] = el)}
                            onChange={(e) => handleFileChange(group.id, e)}
                          />

                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* รูปเก่า */}
                            {group.existing_images.map((imgPath, idx) => {
                              const isPdfFile = isPdf(imgPath);
                              return (
                                <div key={`old-${idx}`} className="relative mt-1 mr-1 shrink-0">
                                  <div 
                                    className="w-10 h-10 rounded-md overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 flex items-center justify-center transition-all"
                                    onClick={() => isPdfFile ? window.open(getImageUrl(imgPath), '_blank') : setPreviewImage(getImageUrl(imgPath))}
                                  >
                                    {isPdfFile ? <FileText className="h-5 w-5 text-red-500" /> : <img src={getImageUrl(imgPath)} alt="Evidence" className="w-full h-full object-cover" />}
                                  </div>
                                  <button 
                                    onClick={(e) => confirmRemoveExistingImage(group.id, imgPath, e)}
                                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 shadow-md hover:bg-red-600 z-10 transition-transform hover:scale-110"
                                    title="ลบหลักฐาน"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              )
                            })}

                            {/* รูปใหม่ */}
                            {group.new_images.map((file, idx) => {
                              const isPdfFile = isPdf(file.name);
                              return (
                                <div key={`new-${idx}`} className="relative mt-1 mr-1 shrink-0">
                                  <div 
                                    className="w-10 h-10 rounded-md overflow-hidden border-2 border-primary/50 cursor-pointer hover:ring-2 hover:ring-primary/80 flex items-center justify-center transition-all relative"
                                    onClick={() => !isPdfFile && setPreviewImage(URL.createObjectURL(file))}
                                  >
                                    {isPdfFile ? <FileText className="h-5 w-5 text-red-500" /> : <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover opacity-90" />}
                                    <div className="absolute bottom-0 w-full bg-primary/80 text-primary-foreground text-[8px] text-center font-bold">NEW</div>
                                  </div>
                                  <button 
                                    onClick={(e) => confirmRemoveNewImage(group.id, idx, e)}
                                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 shadow-md hover:bg-red-600 z-10 transition-transform hover:scale-110"
                                    title="ยกเลิกการแนบ"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
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
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleAddDose(group.id)} className="h-7 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/10 gap-1">
                          <PlusCircle className="h-3.5 w-3.5" /> + เพิ่มเข็ม
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleAddYear(group.id)} className="h-7 px-2 text-[11px] text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 gap-1">
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
                        onChange={(e) => setGroups(groups.map(g => g.id === group.id ? { ...g, advisor_name: e.target.value } : g))}
                      />
                    </TableCell>

                    {/* หมายเหตุ */}
                    <TableCell className="p-3">
                      <Textarea
                        rows={3}
                        className="text-xs resize-none"
                        value={group.remark}
                        placeholder="ระบุหมายเหตุ"
                        onChange={(e) => setGroups(groups.map(g => g.id === group.id ? { ...g, remark: e.target.value } : g))}
                      />
                    </TableCell>

                    {/* จัดการแถว */}
                    <TableCell className="p-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-colors"
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

      {/* Dialog ยืนยันการลบรูป */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบหลักฐาน?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === "new"
                ? "คุณต้องการยกเลิกการแนบหลักฐานนี้ใช่หรือไม่?"
                : "คุณแน่ใจหรือไม่ว่าต้องการลบหลักฐานชิ้นนี้? (การลบจะเสร็จสมบูรณ์เมื่อคุณกดปุ่ม 'บันทึกข้อมูล' ด้านบน)"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteImage} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              ยืนยันการลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal พรีวิวรูปภาพเต็มจอ */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300 bg-black/50 p-1.5 rounded-full transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Full Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl border-4 border-white"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
}