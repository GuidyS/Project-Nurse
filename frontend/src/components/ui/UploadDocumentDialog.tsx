import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileText } from "lucide-react";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: string[];
  defaultProject?: string;
  onUpload: (data: {
    name: string;
    project: string;
    type: string;
    file: File;
  }) => void;
}

const documentTypes = [
  { value: "proposal", label: "ข้อเสนอโครงการ" },
  { value: "progress", label: "รายงานความก้าวหน้า" },
  { value: "financial", label: "เอกสารการเงิน" },
  { value: "summary", label: "สรุปโครงการ" },
];

const UploadDocumentDialog = ({
  open,
  onOpenChange,
  projects,
  defaultProject,
  onUpload,
}: UploadDocumentDialogProps) => {
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [type, setType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (open) {
      setProject(defaultProject ?? "");
    }
  }, [defaultProject, open]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = () => {
    if (!name || !project || !type || !file) return;
    onUpload({ name, project, type, file });
    setName("");
    setProject("");
    setType("");
    setFile(null);
    onOpenChange(false);
  };

  const resetForm = () => {
    setName("");
    setProject("");
    setType("");
    setFile(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            อัพโหลดเอกสาร
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="doc-name">ชื่อเอกสาร</Label>
            <Input
              id="doc-name"
              placeholder="กรอกชื่อเอกสาร"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>โครงการ</Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกโครงการ" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ประเภทเอกสาร</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทเอกสาร" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ไฟล์เอกสาร</Label>
            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="ml-2 rounded-full p-1 hover:bg-muted"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    ลากไฟล์มาวางที่นี่ หรือ
                  </p>
                  <label className="mt-1 cursor-pointer text-sm font-medium text-primary hover:underline">
                    เลือกไฟล์
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFile(f);
                      }}
                    />
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    รองรับ PDF, DOC, DOCX, XLS, XLSX (สูงสุด 20MB)
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name || !project || !type || !file}
            >
              <Upload className="mr-1 h-4 w-4" />
              อัพโหลด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
