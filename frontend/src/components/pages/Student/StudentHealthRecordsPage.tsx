import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Activity, Save, Loader2, AlertCircle, ImagePlus, X, ClipboardList, Calendar } from "lucide-react";
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

interface EvidenceFile {
  path: string;
  date: string;
}

interface HealthRecordItem {
  year_level: number;
  academic_year: string;
  height: string;
  weight: string;
  bmi: string;
  overall_status: "healthy" | "has_health_issue";
  health_issue_detail: string;
  existing_images: EvidenceFile[];
  new_images: File[];
  existing_admission_images: EvidenceFile[]; // ของปี 1
  new_admission_images: File[];              // ของปี 1
}

const DEFAULT_RECORDS: HealthRecordItem[] = [
  { year_level: 1, academic_year: "2567", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "", existing_images: [], new_images: [], existing_admission_images: [], new_admission_images: [] },
  { year_level: 2, academic_year: "2568", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "", existing_images: [], new_images: [], existing_admission_images: [], new_admission_images: [] },
  { year_level: 3, academic_year: "2569", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "", existing_images: [], new_images: [], existing_admission_images: [], new_admission_images: [] },
  { year_level: 4, academic_year: "2570", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "", existing_images: [], new_images: [], existing_admission_images: [], new_admission_images: [] },
];

export default function StudentHealthRecordsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<HealthRecordItem[]>(DEFAULT_RECORDS);
  
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const admissionInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    year_level: number;
    category: "general" | "admission";
    type: "new" | "existing";
    index?: number;
    path?: string;
  } | null>(null);

  const getImageUrl = (path: string) => {
    const baseUrl = api.defaults.baseURL || "";
    const rootUrl = baseUrl.replace(/\/api\/?$/, "");
    return `${rootUrl}/${path}`;
  };

  const calculateBMI = useCallback((heightStr: string, weightStr: string): string => {
    const h = parseFloat(heightStr.trim());
    const w = parseFloat(weightStr.trim());
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0 || h > 300 || w > 500) return "";
    const hMeter = h / 100;
    const computedBMI = w / (hMeter * hMeter);
    return isNaN(computedBMI) || !isFinite(computedBMI) ? "" : computedBMI.toFixed(2);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/index.php?page=student-health-records");

      if (res.data?.status === "success") {
        const savedData: any[] = Array.isArray(res.data.data) ? res.data.data : [];
        
        const merged: HealthRecordItem[] = DEFAULT_RECORDS.map((def) => {
          const match = savedData.find((s) => Number(s.year_level) === def.year_level);
          if (match) {
            const h = match.height !== null && match.height !== undefined ? String(match.height) : "";
            const w = match.weight !== null && match.weight !== undefined ? String(match.weight) : "";
            const status = match.overall_status === "has_health_issue" ? "has_health_issue" : "healthy";

            return {
              year_level: Number(match.year_level),
              academic_year: String(match.academic_year || def.academic_year),
              height: h, weight: w,
              bmi: match.bmi ? String(match.bmi) : calculateBMI(h, w),
              overall_status: status,
              health_issue_detail: status === "has_health_issue" ? String(match.health_issue_detail || "") : "",
              existing_images: Array.isArray(match.evidence_images_with_date) ? match.evidence_images_with_date : [],
              new_images: [],
              existing_admission_images: Array.isArray(match.admission_images_with_date) ? match.admission_images_with_date : [],
              new_admission_images: [],
            };
          }
          return def;
        });

        setRecords(merged);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดข้อมูลภาวะสุขภาพไม่สำเร็จ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (yearLevel: number, field: keyof HealthRecordItem, value: any) => {
    setRecords((prev) => prev.map((r) => {
        if (r.year_level !== yearLevel) return r;
        const updated = { ...r, [field]: value };
        if (field === "height" || field === "weight") {
          updated.bmi = calculateBMI(field === "height" ? value : r.height, field === "weight" ? value : r.weight);
        }
        if (field === "overall_status" && value === "healthy") {
          updated.health_issue_detail = "";
        }
        return updated;
    }));
  };

  const handleFileChange = (yearLevel: number, category: "general" | "admission", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setRecords((prev) => prev.map((r) => {
        if (r.year_level === yearLevel) {
           if (category === "general") return { ...r, new_images: [...r.new_images, ...selectedFiles] };
           if (category === "admission") return { ...r, new_admission_images: [...r.new_admission_images, ...selectedFiles] };
        }
        return r;
      }));
    }
    // Clear input
    if (category === "general" && fileInputRefs.current[yearLevel]) fileInputRefs.current[yearLevel]!.value = "";
    if (category === "admission" && admissionInputRefs.current[yearLevel]) admissionInputRefs.current[yearLevel]!.value = "";
  };

  const requestDelete = (year_level: number, category: "general" | "admission", type: "new" | "existing", indexOrPath: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ 
      year_level, category, type, 
      index: typeof indexOrPath === 'number' ? indexOrPath : undefined, 
      path: typeof indexOrPath === 'string' ? indexOrPath : undefined 
    });
    setDeleteConfirmOpen(true);
  };

  const executeDeleteImage = () => {
    if (!itemToDelete) return;
    const { year_level, category, type, index, path } = itemToDelete;

    setRecords((prev) => prev.map((r) => {
      if (r.year_level !== year_level) return r;
      
      const update = { ...r };
      if (category === "general") {
         if (type === "new" && index !== undefined) update.new_images = update.new_images.filter((_, i) => i !== index);
         if (type === "existing" && path) update.existing_images = update.existing_images.filter(img => img.path !== path);
      } else {
         if (type === "new" && index !== undefined) update.new_admission_images = update.new_admission_images.filter((_, i) => i !== index);
         if (type === "existing" && path) update.existing_admission_images = update.existing_admission_images.filter(img => img.path !== path);
      }
      return update;
    }));

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const validateBeforeSave = (): boolean => {
    for (const r of records) {
      if (r.overall_status === "has_health_issue" && !r.health_issue_detail.trim()) {
        toast({ title: "ข้อมูลไม่ครบถ้วน", description: `กรุณาระบุรายละเอียดปัญหาสุขภาพของ ชั้นปีที่ ${r.year_level}`, variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateBeforeSave()) return;
    try {
      setSaving(true);
      const formData = new FormData();
      
      const payloadRecords = records.map((r) => ({
        year_level: r.year_level,
        academic_year: r.academic_year.trim(),
        height: r.height.trim() ? parseFloat(r.height) : null,
        weight: r.weight.trim() ? parseFloat(r.weight) : null,
        overall_status: r.overall_status,
        health_issue_detail: r.overall_status === "has_health_issue" ? r.health_issue_detail.trim() : null,
        existing_images: r.existing_images.map(img => img.path), 
        existing_admission_images: r.existing_admission_images.map(img => img.path) 
      }));

      formData.append("records", JSON.stringify(payloadRecords));

      records.forEach((r) => {
        r.new_images.forEach((file) => formData.append(`images_${r.year_level}[]`, file));
        r.new_admission_images.forEach((file) => formData.append(`admission_images_${r.year_level}[]`, file));
      });

      const res = await api.post("/index.php?page=student-health-records", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.status === "success") {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูลและอัปโหลดหลักฐานเรียบร้อยแล้ว" });
        await fetchData();
      } else { throw new Error(res.data?.message); }
    } catch (error: any) {
      toast({ title: "บันทึกล้มเหลว", description: error.message || "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  //  Helper: อัปเดต UI รูปและวันที่ให้อ่านง่ายและเด่นขึ้น
  const renderImageGroup = (yearLevel: number, category: "general" | "admission", existing: EvidenceFile[], newFiles: File[]) => {
    return (
      <div className="flex flex-wrap gap-5 items-start pt-1">
        {existing.map((img, idx) => (
          <div key={`old-${idx}`} className="flex flex-col items-center gap-2">
             <div className="relative group w-20 h-20 rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all shrink-0 shadow-sm" onClick={() => setPreviewImage(getImageUrl(img.path))}>
                <img src={getImageUrl(img.path)} alt="Evidence" className="w-full h-full object-cover" />
                <button onClick={(e) => requestDelete(yearLevel, category, "existing", img.path, e)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10 transition-transform hidden group-hover:block" title="ลบรูปภาพ">
                  <X className="h-4 w-4" />
                </button>
             </div>
             {/* ป้ายวันที่ที่ชัดเจนขึ้น */}
             <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-md border border-border/80 text-xs font-medium text-foreground shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{img.date}</span>
             </div>
          </div>
        ))}

        {newFiles.map((file, idx) => (
          <div key={`new-${idx}`} className="flex flex-col items-center gap-2">
            <div className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/50 cursor-pointer hover:ring-2 hover:ring-primary/80 transition-all shrink-0 shadow-sm" onClick={() => setPreviewImage(URL.createObjectURL(file))}>
              <img src={URL.createObjectURL(file)} alt="New Preview" className="w-full h-full object-cover opacity-90" />
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-bl-lg font-bold z-10">NEW</div>
              <button onClick={(e) => requestDelete(yearLevel, category, "new", idx, e)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10 transition-transform hidden group-hover:block" title="ยกเลิกการแนบรูปนี้">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* ป้ายสถานะรูปใหม่ */}
            <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 text-xs font-semibold text-primary shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>รออัปโหลด</span>
            </div>
          </div>
        ))}
        
        {existing.length === 0 && newFiles.length === 0 && (
           <span className="text-sm text-muted-foreground/60 italic pt-6 ml-2 flex items-center">ยังไม่มีหลักฐานแนบ</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">กำลังโหลดข้อมูลภาวะสุขภาพ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">ภาวะสุขภาพ</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ข้อมูลภาวะสุขภาพโดยรวม ส่วนสูง น้ำหนัก และแนบหลักฐาน (ถ้ามี) ของนักศึกษาในแต่ละชั้นปี
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0 bg-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          บันทึกข้อมูล
        </Button>
      </div>

      <div className="space-y-5">
        {records.map((record) => (
          <Card key={record.year_level} className="shadow-sm border-border/60">
            <CardContent className="p-5 space-y-4">
              
              {/* แถวที่ 1: ส่วนสูง น้ำหนัก BMI */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-bold text-base text-foreground min-w-[90px]">
                  {record.year_level}. ชั้นปีที่ {record.year_level}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">ปีการศึกษา</span>
                  <Input type="text" maxLength={4} className="w-16 h-8 text-center px-1 font-medium" value={record.academic_year} onChange={(e) => handleChange(record.year_level, "academic_year", e.target.value.replace(/\D/g, ""))} placeholder="25xx" />
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">ส่วนสูง</span>
                  <Input type="number" step="0.1" min="0" max="250" className="w-20 h-8 text-center px-1 font-medium" value={record.height} onChange={(e) => handleChange(record.year_level, "height", e.target.value)} placeholder="0.0" />
                  <span className="text-muted-foreground text-xs">ซม.</span>
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">น้ำหนัก</span>
                  <Input type="number" step="0.1" min="0" max="300" className="w-20 h-8 text-center px-1 font-medium" value={record.weight} onChange={(e) => handleChange(record.year_level, "weight", e.target.value)} placeholder="0.0" />
                  <span className="text-muted-foreground text-xs">กก.</span>
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">BMI =</span>
                  <Input type="text" readOnly tabIndex={-1} className="w-16 h-8 text-center font-bold bg-muted cursor-default select-none px-1 text-primary" value={record.bmi || "—"} />
                </div>
              </div>

              {/* แถวที่ 2: สถานะสุขภาพ */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-border/50">
                <span className="text-sm font-medium text-foreground shrink-0">ภาวะสุขภาพโดยรวม:</span>
                <RadioGroup value={record.overall_status} onValueChange={(val: "healthy" | "has_health_issue") => handleChange(record.year_level, "overall_status", val)} className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="healthy" id={`healthy-${record.year_level}`} />
                    <Label htmlFor={`healthy-${record.year_level}`} className="cursor-pointer font-medium">แข็งแรงดี</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="has_health_issue" id={`issue-${record.year_level}`} />
                    <Label htmlFor={`issue-${record.year_level}`} className="cursor-pointer font-medium text-destructive">มีปัญหาสุขภาพ..ระบุ</Label>
                  </div>
                </RadioGroup>
                {record.overall_status === "has_health_issue" && (
                  <div className="flex-1 min-w-[240px] flex items-center gap-1.5 animate-in fade-in duration-200">
                    <Input type="text" className="h-9 text-sm flex-1 border-destructive/50 focus-visible:ring-destructive/30" placeholder="ระบุรายละเอียดปัญหาสุขภาพ *" value={record.health_issue_detail} onChange={(e) => handleChange(record.year_level, "health_issue_detail", e.target.value)} />
                    {!record.health_issue_detail.trim() && <AlertCircle className="h-5 w-5 text-destructive shrink-0" />}
                  </div>
                )}
              </div>

              {/* แถวที่ 3: ระบบอัปโหลดรูปภาพ */}
              <div className="pt-4 border-t border-border/50 space-y-4">
                 
                 {/* เฉพาะปี 1 จะมีปุ่มผลตรวจร่างกายโผล่มา */}
                 {record.year_level === 1 && (
                    <div className="flex flex-col sm:flex-row gap-5 items-start bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                      <div className="shrink-0 pt-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2 text-sm font-semibold text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-100 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50 shadow-sm" onClick={() => admissionInputRefs.current[record.year_level]?.click()}>
                          <ClipboardList className="h-4 w-4" /> แนบผลตรวจร่างกาย
                        </Button>
                        <input type="file" accept="image/*" multiple className="hidden" ref={(el) => (admissionInputRefs.current[record.year_level] = el)} onChange={(e) => handleFileChange(record.year_level, "admission", e)} />
                      </div>
                      <div className="flex-1">
                        {renderImageGroup(record.year_level, "admission", record.existing_admission_images, record.new_admission_images)}
                      </div>
                    </div>
                 )}

                 {/* ปุ่มแนบหลักฐานทั่วไป (มีทุกปี) */}
                 <div className="flex flex-col sm:flex-row gap-5 items-start p-2">
                    <div className="shrink-0 pt-2">
                      <Button variant="outline" size="sm" className="h-9 gap-2 text-sm font-semibold text-primary border-2 border-primary/30 hover:bg-primary/5 shadow-sm" onClick={() => fileInputRefs.current[record.year_level]?.click()}>
                        <ImagePlus className="h-4 w-4" /> แนบรูปหลักฐานอื่น ๆ
                      </Button>
                      <input type="file" accept="image/*" multiple className="hidden" ref={(el) => (fileInputRefs.current[record.year_level] = el)} onChange={(e) => handleFileChange(record.year_level, "general", e)} />
                    </div>
                    <div className="flex-1">
                       {renderImageGroup(record.year_level, "general", record.existing_images, record.new_images)}
                    </div>
                 </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบรูปภาพ?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === "new" ? "คุณต้องการยกเลิกการแนบรูปภาพนี้ใช่หรือไม่?" : "คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้? (การลบจะเสร็จสมบูรณ์เมื่อคุณกด 'บันทึกข้อมูล')"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteImage} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold">ยืนยันการลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors" onClick={() => setPreviewImage(null)}>
              <X className="h-6 w-6" />
            </button>
            <img src={previewImage} alt="Full Preview" className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}