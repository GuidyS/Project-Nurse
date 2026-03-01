import { useState } from "react";
import { Eye, EyeOff, User, Lock, ArrowLeft, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/axios";

interface RegisterPageProps {
  onBackToLogin: () => void;
}

const RegisterPage = ({ onBackToLogin }: RegisterPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);

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
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                role === "student" ? "bg-foreground text-background" : "bg-background text-muted-foreground border-input hover:bg-accent"
              }`}
            >
              <GraduationCap size={18} />
              <span className="text-xs font-medium">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                role === "teacher" ? "bg-foreground text-background" : "bg-background text-muted-foreground border-input hover:bg-accent"
              }`}
            >
              <Briefcase size={18} />
              <span className="text-xs font-medium">Teacher</span>
            </button>
          </div>

          {/* Username/ID - ใช้สไตล์เดียวกับ LoginPage */}
          <div className="space-y-2">
            <Label htmlFor="reg-username" className="text-sm font-medium text-foreground">Username (ID)</Label>
            <Input
              id="reg-username"
              placeholder="Your ID (e.g. 41172008)"
              className="h-12"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12"
              value={confirmPassword}
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
          ) : (
            "Sign up"
          )}
        </Button>
      </form>

      {/* Footer link กลับไปหน้า Login */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button 
          onClick={onBackToLogin}
          className="text-foreground font-semibold hover:underline underline-offset-4"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default RegisterPage;