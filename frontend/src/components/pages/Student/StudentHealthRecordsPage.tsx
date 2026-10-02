import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Activity, Save, Loader2, AlertCircle, ImagePlus, Trash2, X } from "lucide-react";
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

interface HealthRecordItem {
  year_level: number;
  academic_year: string;
  height: string;
  weight: string;
  bmi: string;
  overall_status: "healthy" | "has_health_issue";
  health_issue_detail: string;
  existing_images: string[];
  new_images: File[];
}

const DEFAULT_RECORDS: HealthRecordItem[] = [
  { year_level: 1, academic_year: "2567", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "", existing_images: [], new_images: [] },
  { year_level: 2, academic_year: "2568", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "", existing_images: [], new_images: [] },
  { year_level: 3, academic_year: "2569", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "", existing_images: [], new_images: [] },
  { year_level: 4, academic_year: "2570", height: "", weight: "", bmi: "", overall_status: "healthy", health_issue_detail: "", existing_images: [], new_images: [] },
];

export default function StudentHealthRecordsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<HealthRecordItem[]>(DEFAULT_RECORDS);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // State สำหรับ Preview ดูรูปเต็มจอ
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // State สำหรับ Dialog ยืนยันการลบ
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    year_level: number;
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
    const trimmedH = heightStr.trim();
    const trimmedW = weightStr.trim();
    if (!trimmedH || !trimmedW) return "";
    const h = parseFloat(trimmedH);
    const w = parseFloat(trimmedW);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0 || h > 300 || w > 500) return "";
    const hMeter = h / 100;
    const computedBMI = w / (hMeter * hMeter);
    if (isNaN(computedBMI) || !isFinite(computedBMI)) return "";
    return computedBMI.toFixed(2);
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
            const status: "healthy" | "has_health_issue" = match.overall_status === "has_health_issue" ? "has_health_issue" : "healthy";

            return {
              year_level: Number(match.year_level),
              academic_year: String(match.academic_year || def.academic_year),
              height: h,
              weight: w,
              bmi: match.bmi ? String(match.bmi) : calculateBMI(h, w),
              overall_status: status,
              health_issue_detail: status === "has_health_issue" ? String(match.health_issue_detail || "") : "",
              existing_images: Array.isArray(match.evidence_images) ? match.evidence_images : [],
              new_images: [],
            };
          }
          return def;
        });

        setRecords(merged);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดข้อมูลภาวะสุขภาพไม่สำเร็จ", variant: "destructive" });
      setRecords(DEFAULT_RECORDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (yearLevel: number, field: keyof HealthRecordItem, value: any) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.year_level !== yearLevel) return r;

        const updated = { ...r, [field]: value };

        if (field === "height" || field === "weight") {
          const h = field === "height" ? value : r.height;
          const w = field === "weight" ? value : r.weight;
          updated.bmi = calculateBMI(h, w);
        }

        if (field === "overall_status" && value === "healthy") {
          updated.health_issue_detail = "";
        }

        return updated;
      })
    );
  };

  const handleFileChange = (yearLevel: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setRecords((prev) => prev.map((r) => 
        r.year_level === yearLevel ? { ...r, new_images: [...r.new_images, ...selectedFiles] } : r
      ));
    }
    if (fileInputRefs.current[yearLevel]) {
      fileInputRefs.current[yearLevel]!.value = "";
    }
  };

  // เปิด Dialog ขอยืนยันการลบรูปใหม่
  const confirmRemoveNewImage = (yearLevel: number, index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // กันไม่ให้พรีวิวรูปเด้งขึ้นมา
    setItemToDelete({ year_level: yearLevel, type: "new", index });
    setDeleteConfirmOpen(true);
  };

  // เปิด Dialog ขอยืนยันการลบรูปเก่า
  const confirmRemoveExistingImage = (yearLevel: number, imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation(); // กันไม่ให้พรีวิวรูปเด้งขึ้นมา
    setItemToDelete({ year_level: yearLevel, type: "existing", path: imagePath });
    setDeleteConfirmOpen(true);
  };

  // ฟังก์ชันลบรูปจริง (เรียกหลังจากกด ยืนยัน ใน Dialog)
  const executeDeleteImage = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "new" && itemToDelete.index !== undefined) {
      setRecords((prev) => prev.map((r) => {
        if (r.year_level !== itemToDelete.year_level) return r;
        const filtered = [...r.new_images];
        filtered.splice(itemToDelete.index!, 1);
        return { ...r, new_images: filtered };
      }));
    } else if (itemToDelete.type === "existing" && itemToDelete.path) {
      setRecords((prev) => prev.map((r) => {
        if (r.year_level !== itemToDelete.year_level) return r;
        return { ...r, existing_images: r.existing_images.filter((img) => img !== itemToDelete.path) };
      }));
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const validateBeforeSave = (): boolean => {
    for (const r of records) {
      if (r.overall_status === "has_health_issue" && !r.health_issue_detail.trim()) {
        toast({ title: "ข้อมูลไม่ครบถ้วน", description: `กรุณาระบุรายละเอียดปัญหาสุขภาพของ ชั้นปีที่ ${r.year_level}`, variant: "destructive" });
        return false;
      }
      if (r.height && (parseFloat(r.height) <= 0 || parseFloat(r.height) > 250)) {
        toast({ title: "ข้อมูลไม่ถูกต้อง", description: `ส่วนสูงของ ชั้นปีที่ ${r.year_level} ไม่สมเหตุสมผล`, variant: "destructive" });
        return false;
      }
      if (r.weight && (parseFloat(r.weight) <= 0 || parseFloat(r.weight) > 300)) {
        toast({ title: "ข้อมูลไม่ถูกต้อง", description: `น้ำหนักของ ชั้นปีที่ ${r.year_level} ไม่สมเหตุสมผล`, variant: "destructive" });
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
        bmi: r.bmi.trim() ? parseFloat(r.bmi) : null,
        overall_status: r.overall_status,
        health_issue_detail: r.overall_status === "has_health_issue" ? r.health_issue_detail.trim() : null,
        existing_images: r.existing_images 
      }));

      formData.append("records", JSON.stringify(payloadRecords));

      records.forEach((r) => {
        r.new_images.forEach((file) => {
          formData.append(`images_${r.year_level}[]`, file);
        });
      });

      const res = await api.post("/index.php?page=student-health-records", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success") {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูลและอัปโหลดหลักฐานเรียบร้อยแล้ว" });
        await fetchData();
      } else {
        throw new Error(res.data?.message || "บันทึกล้มเหลว");
      }
    } catch (error: any) {
      toast({
        title: "บันทึกล้มเหลว",
        description: error.response?.data?.message || error.message || "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
    <div className="space-y-6 max-w-5xl mx-auto p-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">2. ภาวะสุขภาพ</h1>
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
                  <Input
                    type="text"
                    maxLength={4}
                    className="w-16 h-8 text-center px-1"
                    value={record.academic_year}
                    onChange={(e) => handleChange(record.year_level, "academic_year", e.target.value.replace(/\D/g, ""))}
                    placeholder="25xx"
                  />
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">ส่วนสูง</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="250"
                    className="w-20 h-8 text-center px-1"
                    value={record.height}
                    onChange={(e) => handleChange(record.year_level, "height", e.target.value)}
                    placeholder="0.0"
                  />
                  <span className="text-muted-foreground text-xs">ซม.</span>
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">น้ำหนัก</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="300"
                    className="w-20 h-8 text-center px-1"
                    value={record.weight}
                    onChange={(e) => handleChange(record.year_level, "weight", e.target.value)}
                    placeholder="0.0"
                  />
                  <span className="text-muted-foreground text-xs">กก.</span>
                </div>

                <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
                  <span className="text-muted-foreground">BMI =</span>
                  <Input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className="w-16 h-8 text-center font-bold bg-muted cursor-default select-none px-1"
                    value={record.bmi || "—"}
                  />
                </div>
              </div>

              {/* แถวที่ 2: สถานะสุขภาพ */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3 border-t border-border/50">
                <span className="text-sm font-medium text-foreground shrink-0">ภาวะสุขภาพโดยรวม:</span>
                
                <RadioGroup
                  value={record.overall_status}
                  onValueChange={(val: "healthy" | "has_health_issue") => handleChange(record.year_level, "overall_status", val)}
                  className="flex flex-wrap items-center gap-6 text-sm"
                >
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
                    <Input
                      type="text"
                      className="h-8 text-xs flex-1 border-destructive/50 focus-visible:ring-destructive/30"
                      placeholder="ระบุรายละเอียดปัญหาสุขภาพ *"
                      value={record.health_issue_detail}
                      onChange={(e) => handleChange(record.year_level, "health_issue_detail", e.target.value)}
                    />
                    {!record.health_issue_detail.trim() && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                  </div>
                )}
              </div>

              {/* แถวที่ 3: ระบบอัปโหลดรูปภาพ */}
              <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row gap-3 items-start">
                <div className="shrink-0 pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-2 text-[13px] font-medium text-primary border-2 border-primary hover:bg-primary/5"
                    onClick={() => fileInputRefs.current[record.year_level]?.click()}
                  >
                    <ImagePlus className="h-4 w-4" />
                    แนบรูปหลักฐาน
                  </Button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    ref={(el) => (fileInputRefs.current[record.year_level] = el)}
                    onChange={(e) => handleFileChange(record.year_level, e)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 flex-1 items-center">
                  {/* แสดงรูปเก่าจาก Server */}
                  {record.existing_images.map((imgPath, idx) => (
                    <div key={`old-${idx}`} className="relative mt-2 mr-2 shrink-0">
                      <div 
                        className="w-16 h-16 rounded-md overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => setPreviewImage(getImageUrl(imgPath))}
                      >
                        <img src={getImageUrl(imgPath)} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                      <button 
                        onClick={(e) => confirmRemoveExistingImage(record.year_level, imgPath, e)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10 transition-transform hover:scale-110"
                        title="ลบรูปภาพ"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* แสดงรูปใหม่ที่เพิ่งเลือก */}
                  {record.new_images.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative mt-2 mr-2 shrink-0">
                      <div 
                        className="w-16 h-16 rounded-md overflow-hidden border-2 border-primary/50 cursor-pointer hover:ring-2 hover:ring-primary/80 transition-all relative"
                        onClick={() => setPreviewImage(URL.createObjectURL(file))}
                      >
                        <img src={URL.createObjectURL(file)} alt="New Preview" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[9px] text-center font-bold py-0.5">
                          NEW
                        </div>
                      </div>
                      <button 
                        onClick={(e) => confirmRemoveNewImage(record.year_level, idx, e)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10 transition-transform hover:scale-110"
                        title="ยกเลิกการแนบรูปนี้"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {record.existing_images.length === 0 && record.new_images.length === 0 && (
                     <span className="text-xs text-muted-foreground/60 italic pt-1.5 ml-1">ยังไม่มีหลักฐานแนบ</span>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* 4. Dialog ยืนยันการลบรูป */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบรูปภาพ?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === "new"
                ? "คุณต้องการยกเลิกการแนบรูปภาพนี้ใช่หรือไม่?"
                : "คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้? (การลบจะเสร็จสมบูรณ์เมื่อคุณกดปุ่ม 'บันทึกข้อมูล' ด้านบน)"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDeleteImage} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              ยืนยันการลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 5. Modal สำหรับดูรูปภาพแบบเต็มจอ (พรีวิว) */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Full Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
              onClick={(e) => e.stopPropagation()} // ป้องกันการกดที่รูปแล้วปิด
            />
          </div>
        </div>
      )}
    </div>
  );
}