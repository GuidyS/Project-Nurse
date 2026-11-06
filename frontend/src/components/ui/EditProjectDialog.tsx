import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectData: any | null;
  onUpdate: (data: { project_id: string; project_name_th: string }) => void;
}

const EditProjectDialog = ({ open, onOpenChange, projectData, onUpdate }: EditProjectDialogProps) => {
  const [nameTh, setNameTh] = useState("");

  // อัปเดตข้อมูลในฟอร์มเมื่อได้รับข้อมูล projectData ใหม่
  useEffect(() => {
    if (projectData) {
      setNameTh(projectData.project_name_th || projectData.name || "");
    }
  }, [projectData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData) return;

    onUpdate({
      project_id: projectData.project_id,
      project_name_th: nameTh,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>แก้ไขโครงการ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ชื่อโครงการ</label>
            <Input
              required
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              placeholder="กรอกชื่อโครงการ..."
            />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">บันทึกการแก้ไข</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
