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
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import type { ReactNode } from "react";


interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  /** destructive = ลบ/ปฏิเสธ/ระงับ, default = อนุมัติ/เปิดใช้งาน */
  variant?: "destructive" | "default";
  children?: ReactNode;
  showCloseButton?: boolean;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title = "ยืนยันการลบ",
  description,
  confirmLabel = "ลบ",
  cancelLabel = "ยกเลิก",
  onConfirm,
  isLoading = false,
  variant = "destructive",
  children,
  showCloseButton = false,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isLoading) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="app-dialog-md">
        {showCloseButton && (
          <AlertDialogCancel
            disabled={isLoading}
            className="absolute right-4 top-4 mt-0 h-6 w-6 border-0 bg-transparent p-0 opacity-70 shadow-none hover:bg-transparent hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">ปิด</span>
          </AlertDialogCancel>
        )}
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            className={cn(
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
