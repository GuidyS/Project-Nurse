import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle, Clock, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export interface ImportDataTypeOption {
  value: string;
  label: string;
  description: string;
  icon?: LucideIcon;
}

interface ImportHistory {
  id: string;
  type: string;
  fileName: string;
  recordCount: number;
  status: "success" | "failed" | "partial" | "processing";
  date: string;
}

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importTypes: ImportDataTypeOption[];
  title?: string;
  description?: string;
  onImported?: (importType: string) => void | Promise<void>;
}

const allowedExtensions = [".xlsx", ".xls", ".csv"];

const apiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as { response?: { data?: { message?: string } } };
  return maybeError.response?.data?.message || fallback;
};

export function ImportDataDialog({
  open,
  onOpenChange,
  importTypes,
  title = "Import ข้อมูล",
  description = "อัปโหลดไฟล์ Excel หรือ CSV เพื่อนำเข้าข้อมูลเข้าสู่ระบบ",
  onImported,
}: ImportDataDialogProps) {
  const { toast } = useToast();
  const uploadInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState(importTypes[0]?.value ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    if (importTypes.length === 0) {
      setImportHistory([]);
      return;
    }

    setIsHistoryLoading(true);
    try {
      const response = await api.get("/index.php?page=get-import-history", {
        params: { types: importTypes.map((type) => type.value).join(",") },
      });
      setImportHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch import history", error);
      setImportHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setSelectedType((current) =>
      importTypes.some((type) => type.value === current) ? current : importTypes[0]?.value ?? "",
    );
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, importTypes]);

  const handleFileSelect = (file?: File | null) => {
    if (!file) return;

    const isAllowed = allowedExtensions.some((extension) => file.name.toLowerCase().endsWith(extension));
    if (!isAllowed) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์ .xlsx, .xls หรือ .csv เท่านั้น",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0]);
  };

  const handleImport = async () => {
    if (!selectedType || !selectedFile) {
      toast({ title: "กรุณาเลือกประเภทและไฟล์", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("importType", selectedType);

    setIsUploading(true);
    try {
      const response = await api.post("/index.php?page=import-data", formData, {
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100)));
        },
      });

      if (response.data?.status === "success") {
        toast({ title: "สำเร็จ", description: response.data.message });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await fetchHistory();
        await onImported?.(selectedType);
      } else {
        toast({
          title: "นำเข้าไม่สำเร็จ",
          description: response.data?.message || "เกิดข้อผิดพลาด",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "นำเข้าไม่สำเร็จ",
        description: apiErrorMessage(error, "เกิดข้อผิดพลาดในการเชื่อมต่อ"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const statusBadge = (status: ImportHistory["status"]) => {
    switch (status) {
      case "success":
        return <span className="flex items-center gap-1 text-success"><CheckCircle className="h-4 w-4" /> สำเร็จ</span>;
      case "failed":
        return <span className="flex items-center gap-1 text-destructive"><AlertCircle className="h-4 w-4" /> ล้มเหลว</span>;
      case "partial":
        return <span className="flex items-center gap-1 text-warning"><AlertCircle className="h-4 w-4" /> บางส่วน</span>;
      case "processing":
        return <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /> กำลังประมวลผล</span>;
    }
  };

  const selectedTypeLabel = importTypes.find((type) => type.value === selectedType)?.label ?? "";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isUploading && onOpenChange(nextOpen)}>
      <DialogContent className="app-dialog-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {importTypes.length > 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {importTypes.map((type) => {
                const Icon = type.icon ?? FileSpreadsheet;
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedType === type.value ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            {importTypes.length === 1 && selectedTypeLabel && (
              <p className="text-sm font-medium text-foreground">{selectedTypeLabel}</p>
            )}
            <Label
              htmlFor={uploadInputId}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFileSelect(event.dataTransfer.files?.[0]);
              }}
              className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/5"
            >
              <Upload className="mb-3 h-9 w-9 text-primary" />
              <p className="font-medium text-foreground">เลือกไฟล์หรือลากไฟล์มาวางที่นี่</p>
              <p className="mt-1 text-xs text-muted-foreground">รองรับ .xlsx, .xls, .csv</p>
              <Input
                ref={fileInputRef}
                id={uploadInputId}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <div className="mt-5 flex max-w-full items-center gap-2 rounded-md bg-background px-4 py-2 text-sm text-foreground shadow-sm">
                  <FileSpreadsheet className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="truncate font-medium">{selectedFile.name}</span>
                </div>
              )}
            </Label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>กำลังนำเข้า...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">ประวัติการนำเข้าล่าสุด</h3>
              <p className="text-xs text-muted-foreground">แสดงเฉพาะประเภทข้อมูลของหน้านี้</p>
            </div>
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังโหลดประวัติ
              </div>
            ) : importHistory.length > 0 ? (
              <div className="space-y-2">
                {importHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileSpreadsheet className="h-7 w-7 flex-shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {importTypes.find((type) => type.value === item.type)?.label ?? item.type} · {item.recordCount || 0} รายการ
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right text-xs">
                      {statusBadge(item.status)}
                      <p className="mt-1 text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                ไม่พบประวัติการนำเข้า
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            ยกเลิก
          </Button>
          <Button onClick={handleImport} disabled={!selectedType || !selectedFile || isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import ข้อมูล
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
