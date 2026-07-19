import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Student } from '@/components/pages/Teacher/PracticalStudents';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  score: string;
  onScoreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  comment: string;
  onCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
}

export function StudentEvaluateDialog({
  isOpen, onOpenChange, student, score, onScoreChange, comment, onCommentChange, onSave
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ประเมินนักศึกษา</DialogTitle>
          <DialogDescription>
            บันทึกผลการประเมินการฝึกปฏิบัติสำหรับ {student?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="score">คะแนนประเมิน (0-100)</Label>
            <Input 
              id="score" 
              type="number" 
              placeholder="ระบุคะแนน..." 
              max="100" 
              min="0" 
              value={score}
              onChange={onScoreChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">ความคิดเห็นเพิ่มเติม / ข้อเสนอแนะ</Label>
            <Textarea 
              id="comment" 
              placeholder="พิมพ์ความคิดเห็นที่นี่..." 
              rows={4} 
              value={comment}
              onChange={onCommentChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button onClick={() => { onSave(); onOpenChange(false); }}>บันทึกผลการประเมิน</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
