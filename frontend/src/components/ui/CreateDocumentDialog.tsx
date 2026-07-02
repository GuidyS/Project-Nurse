import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    project: string;
    type: string;
    description: string;
  }) => void;
}

const documentTypes = [
  { value: "proposal", label: "ข้อเสนอโครงการ" },
  { value: "progress", label: "รายงานความก้าวหน้า" },
  { value: "financial", label: "เอกสารการเงิน" },
  { value: "summary", label: "สรุปโครงการ" },
];

const projects = [
  "โครงการพัฒนาทักษะการพยาบาล",
  "โครงการวิจัยการดูแลผู้สูงอายุ",
  "โครงการอบรมเทคโนโลยีการพยาบาล",
];

const CreateDocumentDialog = ({ open, onOpenChange, onCreate }: CreateDocumentDialogProps) => {
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name || !project || !type) return;
    onCreate({ name, project, type, description });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName("");
    setProject("");
    setType("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">สร้างเอกสารใหม่</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="create-doc-name">ชื่อเอกสาร</Label>
            <Input
              id="create-doc-name"
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
                  <SelectItem key={p} value={p}>{p}</SelectItem>
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
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-doc-desc">รายละเอียด (ไม่บังคับ)</Label>
            <Textarea
              id="create-doc-desc"
              placeholder="อธิบายรายละเอียดเอกสาร"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={!name || !project || !type}>
              <Plus className="mr-1 h-4 w-4" />
              สร้างเอกสาร
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentDialog;