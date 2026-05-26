import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Edit
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

interface UserData {
  id: string | number;
  title?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  faculty?: string | null;
  // แก้ไขจาก programe เป็น program ให้ตรงกับ Backend
  program?: string | null; 
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/index.php?page=statcard", {
          params: { page: "profile" },
          // สำคัญมาก: ต้องแนบ withCredentials เพื่อให้ Axios ส่ง Session Cookie ไปให้ PHP
          withCredentials: true 
        });

        if (res.data?.status === "success") {
          setUser(res.data.data);
        } else {
          console.warn("Profile API error:", res.data);
        }
      } catch (err) {
        console.error("Fetch profile failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditOpen = () => {
    if (!user) return;

    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      position: user.position,
      faculty: user.faculty,
      program: user.program // แก้ให้ตรงกับ Interface
    });

    setEditing(true);
  };

  const handleSave = () => {
    if (!user) return;

    setUser({ ...user, ...formData } as UserData);
    setEditing(false);
  };

  if (loading) {
    return <div className="p-10 text-center flex items-center justify-center min-h-[50vh]">กำลังโหลดข้อมูล...</div>;
  }

  if (!user) {
    return <div className="p-10 text-center text-red-500">ไม่พบข้อมูล หรือคุณยังไม่ได้เข้าสู่ระบบ</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card rounded-2xl shadow-lg p-8 relative">

        <div className="absolute top-6 right-6">
          <Dialog open={editing} onOpenChange={setEditing}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2" onClick={handleEditOpen}>
                <Edit className="h-4 w-4" />
                แก้ไขข้อมูล
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
                <DialogDescription>
                  คุณสามารถปรับรายละเอียดของคุณได้ที่นี่
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">ชื่อ</label>
                    <input
                      className="w-full border rounded p-2 focus:ring-2 focus:ring-primary"
                      value={formData.first_name || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          first_name: e.target.value
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">นามสกุล</label>
                    <input
                      className="w-full border rounded p-2 focus:ring-2 focus:ring-primary"
                      value={formData.last_name || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          last_name: e.target.value
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">เบอร์โทรศัพท์</label>
                    <input 
                      className="w-full border rounded p-2 focus:ring-2 focus:ring-primary" 
                      value={formData.phone || ''} 
                      onChange={e => 
                        setFormData(prev => ({ 
                          ...prev, 
                          phone: e.target.value 
                        }))
                      } 
                    /> 
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSave}>
                  บันทึก
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  ยกเลิก
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <Avatar className="h-32 w-32 ring-4 ring-primary/20 shadow-md">
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
              {user.first_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">
              {user.title || ""} {user.first_name} {user.last_name}
            </h1>

            <p className="text-muted-foreground mt-1">
              รหัสประจำตัว: {user.id}
            </p>

            {user.position && (
              <Badge className="mt-3">
                {user.position}
              </Badge>
            )}
          </div>
        </div>

        <div className="border-t border-border my-8" />

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {user.email && (
            <InfoRow icon={<Mail className="h-4 w-4 text-primary" />} label="อีเมล" value={user.email} />
          )}

          {user.phone && (
            <InfoRow icon={<Phone className="h-4 w-4 text-primary" />} label="เบอร์โทรศัพท์" value={user.phone} />
          )}

          {user.faculty && (
            <InfoRow icon={<MapPin className="h-4 w-4 text-primary" />} label="คณะ" value={user.faculty} />
          )}

          {user.program && ( // เปลี่ยนเป็น user.program ตรงนี้
            <InfoRow icon={<GraduationCap className="h-4 w-4 text-primary" />} label="หลักสูตร" value={user.program} />
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="bg-primary/10 p-2 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default ProfilePage;