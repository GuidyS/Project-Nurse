import * as React from "react";
import { cn } from "@/lib/utils";

// 1. สร้าง Interface ใหม่เพื่อเพิ่ม 'error' เข้าไป
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean; // เพิ่มตัวเลือก error เข้าไปที่นี่
}

// 2. เปลี่ยนมาใช้ InputProps แทน React.ComponentProps<"input">
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => { // 3. ดึง error ออกมาแยกไว้ ไม่ให้ไหลลงไปที่ <input>
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // 4. (แถม) คุณสามารถใช้ค่า error มาเปลี่ยนสีขอบตอนผิดพลาดได้ด้วย
          error && "border-red-500 focus-visible:ring-red-500", 
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };