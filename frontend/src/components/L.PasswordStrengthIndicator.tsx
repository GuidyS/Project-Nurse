import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "อย่างน้อย 8 ตัวอักษร", test: (p) => p.length >= 8 },
  { label: "มีตัวพิมพ์ใหญ่ (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "มีตัวพิมพ์เล็ก (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "มีตัวเลข (0-9)", test: (p) => /[0-9]/.test(p) },
];

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const passedCount = requirements.filter((req) => req.test(password)).length;
  const strengthPercentage = (passedCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage <= 25) return "bg-destructive";
    if (strengthPercentage <= 50) return "bg-warning";
    if (strengthPercentage <= 75) return "bg-warning";
    return "bg-success";
  };

  const getStrengthLabel = () => {
    if (strengthPercentage <= 25) return "อ่อน";
    if (strengthPercentage <= 50) return "พอใช้";
    if (strengthPercentage <= 75) return "ดี";
    return "แข็งแรง";
  };

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">ความแข็งแรงของรหัสผ่าน</span>
          <span className={cn(
            "font-medium",
            strengthPercentage <= 25 && "text-destructive",
            strengthPercentage > 25 && strengthPercentage <= 75 && "text-warning",
            strengthPercentage > 75 && "text-success"
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", getStrengthColor())}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-200",
                passed ? "text-success" : "text-muted-foreground"
              )}
            >
              {passed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
