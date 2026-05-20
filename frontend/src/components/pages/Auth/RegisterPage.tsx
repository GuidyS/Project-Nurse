import { useState } from "react";
<<<<<<< HEAD
import { Eye, EyeOff, User, Lock, ArrowLeft, GraduationCap, Briefcase } from "lucide-react";
=======
import { Briefcase, Eye, EyeOff, GraduationCap } from "lucide-react";
>>>>>>> ef0b0ff (Fix Login)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/axios";
<<<<<<< HEAD
=======
import { cn } from "@/lib/utils";
>>>>>>> ef0b0ff (Fix Login)

interface RegisterPageProps {
  onBackToLogin: () => void;
}

<<<<<<< HEAD
=======
type RegisterErrors = {
  username?: string;
  password?: string;
  confirmPassword?: string;
};

>>>>>>> ef0b0ff (Fix Login)
const RegisterPage = ({ onBackToLogin }: RegisterPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
<<<<<<< HEAD
=======
  const [errors, setErrors] = useState<RegisterErrors>({});
>>>>>>> ef0b0ff (Fix Login)
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);

<<<<<<< HEAD
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);

    try {
      // ยิง API ในรูปแบบ JSON
      const response = await api.post("/index.php?page=register", {
        username: username,
        password: password,
        role: role,
=======
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
>>>>>>> ef0b0ff (Fix Login)
      });

      if (response.data.status === "success") {
        toast.success("ลงทะเบียนสำเร็จ!", {
          description: "คุณสามารถเข้าสู่ระบบได้ทันที",
        });
<<<<<<< HEAD
        onBackToLogin(); 
=======
        onBackToLogin();
>>>>>>> ef0b0ff (Fix Login)
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="w-full max-w-md space-y-6">
      {/* Header - ธีมเดียวกับ Login */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Create New Account</h2>
        <p className="text-sm text-muted-foreground">
          Enter your ID and set a password to register
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-4">
          
          {/* Role Selection (เพิ่มเข้ามาเพื่อให้ตรงกับ logic ของคุณ) */}
=======
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
>>>>>>> ef0b0ff (Fix Login)
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("student")}
<<<<<<< HEAD
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                role === "student" ? "bg-foreground text-background" : "bg-background text-muted-foreground border-input hover:bg-accent"
              }`}
=======
              className={cn(
                "h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                role === "student"
                  ? "bg-[#8a2be2] text-white border-[#8a2be2] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#8a2be2]/50 hover:text-[#8a2be2]",
              )}
>>>>>>> ef0b0ff (Fix Login)
            >
              <GraduationCap size={18} />
              <span className="text-xs font-medium">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
<<<<<<< HEAD
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                role === "teacher" ? "bg-foreground text-background" : "bg-background text-muted-foreground border-input hover:bg-accent"
              }`}
=======
              className={cn(
                "h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                role === "teacher"
                  ? "bg-[#8a2be2] text-white border-[#8a2be2] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#8a2be2]/50 hover:text-[#8a2be2]",
              )}
>>>>>>> ef0b0ff (Fix Login)
            >
              <Briefcase size={18} />
              <span className="text-xs font-medium">Teacher</span>
            </button>
          </div>

<<<<<<< HEAD
          {/* Username/ID - ใช้สไตล์เดียวกับ LoginPage */}
          <div className="space-y-2">
            <Label htmlFor="reg-username" className="text-sm font-medium text-foreground">Username (ID)</Label>
=======
          <div className="space-y-2">
            <Label
              htmlFor="reg-username"
              className={cn("text-sm font-medium text-slate-700", errors.username && "text-red-600")}
            >
              Username (ID)
            </Label>
>>>>>>> ef0b0ff (Fix Login)
            <Input
              id="reg-username"
              placeholder="Your ID (e.g. 41172008)"
              className="h-12"
              value={username}
<<<<<<< HEAD
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
=======
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
>>>>>>> ef0b0ff (Fix Login)
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 pr-12"
                value={password}
<<<<<<< HEAD
                onChange={(e) => setPassword(e.target.value)}
                required
=======
                error={Boolean(errors.password)}
                aria-invalid={Boolean(errors.password)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
>>>>>>> ef0b0ff (Fix Login)
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
<<<<<<< HEAD
=======
                aria-label={showPassword ? "Hide password" : "Show password"}
>>>>>>> ef0b0ff (Fix Login)
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
<<<<<<< HEAD
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
=======
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
>>>>>>> ef0b0ff (Fix Login)
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12"
              value={confirmPassword}
<<<<<<< HEAD
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Submit Button - ใช้ปุ่มมน (rounded-xl) เหมือน Login */}
        <Button 
          type="submit" 
          className="w-full h-12 font-medium bg-foreground text-background hover:bg-foreground/90 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
             <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
=======
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
>>>>>>> ef0b0ff (Fix Login)
          ) : (
            "Sign up"
          )}
        </Button>
      </form>

<<<<<<< HEAD
      {/* Footer link กลับไปหน้า Login */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button 
          onClick={onBackToLogin}
          className="text-foreground font-semibold hover:underline underline-offset-4"
=======
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-semibold text-slate-700 hover:text-[#8a2be2] hover:underline underline-offset-4"
>>>>>>> ef0b0ff (Fix Login)
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

<<<<<<< HEAD
export default RegisterPage;
=======
export default RegisterPage;
>>>>>>> ef0b0ff (Fix Login)
