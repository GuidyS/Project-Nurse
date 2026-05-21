import { useState } from "react";
import { Briefcase, Eye, EyeOff, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface RegisterPageProps {
  onBackToLogin: () => void;
}

type RegisterErrors = {
  username?: string;
  password?: string;
  confirmPassword?: string;
};

const RegisterPage = ({ onBackToLogin }: RegisterPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);

  const clearError = (field: keyof RegisterErrors) => {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: RegisterErrors = {};
    if (!username.trim()) {
      nextErrors.username = "กรุณากรอก Username";
    }
    if (!password.trim()) {
      nextErrors.password = "กรุณากรอก Password";
    }
    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "กรุณากรอก Confirm Password";
    } else if (password && password !== confirmPassword) {
      nextErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await api.post("/index.php?page=register", {
        username,
        password,
        role,
      });

      if (response.data.status === "success") {
        toast.success("ลงทะเบียนสำเร็จ!", {
          description: "คุณสามารถเข้าสู่ระบบได้ทันที",
        });
        onBackToLogin();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
      <div className="space-y-4 text-center flex flex-col items-center">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full shadow-md border-4 border-[#8a2be2]/10">
          <img
            src="../../Nurse_logo.jpg"
            alt="Logo"
            className="object-cover w-full h-full scale-110"
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-700">Create New Account</h2>
          <p className="text-sm text-muted-foreground">
            Enter your ID and set a password to register
          </p>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-6" noValidate>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={cn(
                "h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                role === "student"
                  ? "bg-[#8a2be2] text-white border-[#8a2be2] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#8a2be2]/50 hover:text-[#8a2be2]",
              )}
            >
              <GraduationCap size={18} />
              <span className="text-xs font-medium">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={cn(
                "h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                role === "teacher"
                  ? "bg-[#8a2be2] text-white border-[#8a2be2] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#8a2be2]/50 hover:text-[#8a2be2]",
              )}
            >
              <Briefcase size={18} />
              <span className="text-xs font-medium">Teacher</span>
            </button>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="reg-username"
              className={cn("text-sm font-medium text-slate-700", errors.username && "text-red-600")}
            >
              Username (ID)
            </Label>
            <Input
              id="reg-username"
              placeholder="Your ID (e.g. 41172008)"
              className="h-12"
              value={username}
              error={Boolean(errors.username)}
              aria-invalid={Boolean(errors.username)}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError("username");
              }}
            />
            {errors.username && (
              <p className="text-sm font-medium text-red-600">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="reg-password"
              className={cn("text-sm font-medium text-slate-700", errors.password && "text-red-600")}
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 pr-12"
                value={password}
                error={Boolean(errors.password)}
                aria-invalid={Boolean(errors.password)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm font-medium text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className={cn("text-sm font-medium text-slate-700", errors.confirmPassword && "text-red-600")}
            >
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12"
              value={confirmPassword}
              error={Boolean(errors.confirmPassword)}
              aria-invalid={Boolean(errors.confirmPassword)}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError("confirmPassword");
              }}
            />
            {errors.confirmPassword && (
              <p className="text-sm font-medium text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium bg-[#8a2be2] text-background hover:bg-[#8a2be2]/90 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
          ) : (
            "Sign up"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-semibold text-slate-700 hover:text-[#8a2be2] hover:underline underline-offset-4"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default RegisterPage;
