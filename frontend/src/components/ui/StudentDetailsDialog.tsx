import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Student } from '@/components/pages/Teacher/PracticalStudents';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function StudentDetailsDialog({ isOpen, onOpenChange, student }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="app-dialog-lg">
        <DialogHeader>
          <DialogTitle>รายละเอียดนักศึกษา</DialogTitle>
          <DialogDescription>
            ข้อมูลการฝึกปฏิบัติของ {student?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right text-muted-foreground">รหัสนักศึกษา:</span>
            <span className="col-span-3 font-semibold">{student?.studentId}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right text-muted-foreground">สถานที่ฝึก:</span>
            <span className="col-span-3">{student?.workplace}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right text-muted-foreground">ความคืบหน้า:</span>
            <div className="col-span-3 flex items-center gap-2">
              <Progress value={student?.progress || 0} className="w-[150px]" />
              <span className="text-sm font-medium">{student?.progress}%</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium text-right text-muted-foreground">จำนวนงาน:</span>
            <span className="col-span-3">
              ทำเสร็จ <span className="text-green-600 font-bold">{student?.tasksCompleted}</span> จากทั้งหมด <span className="font-bold">{student ? student.tasksCompleted + student.tasksPending : 0}</span> งาน
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
