import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";


interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "excel" | "pdf";
}

const config = {
  excel: {
    title: "อัปโหลดไฟล์ Excel",
    accept: ".xlsx,.csv,.xls",
    formats: "XLSX, CSV, XLS (สูงสุด 20MB)",
    icon: FileSpreadsheet,
    colorClass: "text-emerald-600",
    iconBgClass: "bg-emerald-50",
    borderActive: "border-emerald-500 bg-emerald-50",
    borderHover: "hover:border-emerald-300",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  pdf: {
    title: "อัปโหลดไฟล์ PDF",
    accept: ".pdf",
    formats: "PDF (สูงสุด 20MB)",
    icon: FileText,
    colorClass: "text-rose-600",
    iconBgClass: "bg-rose-50",
    borderActive: "border-rose-500 bg-rose-50",
    borderHover: "hover:border-rose-300",
    buttonClass: "bg-rose-600 hover:bg-rose-700 text-white",
  },
};

export function UploadDialog({ open, onOpenChange, type }: UploadDialogProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [note, setNote] = useState("");
  const c = config[type];
  const Icon = c.icon;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const accepted = c.accept.split(",");
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      accepted.some((ext) => f.name.toLowerCase().endsWith(ext))
    );
    addFiles(droppedFiles);
  }, [c.accept]);

  const addFiles = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((f) => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
      })),
    ]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setFiles([]);
      setNote("");
      setIsDragOver(false);
    }
    onOpenChange(val);
  };

  const inputId = `upload-${type}`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{c.title}</DialogTitle>
          <DialogDescription className="sr-only">{c.title}</DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragOver ? c.borderActive : `border-border ${c.borderHover}`
          }`}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <div className={`mb-3 rounded-full p-3 ${c.iconBgClass}`}>
            <Icon className={`h-6 w-6 ${c.colorClass}`} />
          </div>
          <p className="text-sm text-muted-foreground">คลิกหรือลากไฟล์มาวางที่นี่</p>
          <p className="text-xs text-muted-foreground mt-1">{c.formats}</p>
        </div>

        <input
          id={inputId}
          type="file"
          accept={c.accept}
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${c.colorClass}`} />
                <span className="font-mono text-xs truncate flex-1">{f.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{f.size}</span>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">หมายเหตุ (ไม่บังคับ)</label>
          <textarea
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={2}
            placeholder="ระบุรายละเอียดเพิ่มเติม"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            ยกเลิก
          </Button>
          <Button
            disabled={files.length === 0}
            className={c.buttonClass}
            onClick={() => { handleClose(false); }}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            อัปโหลด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
