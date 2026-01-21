import { Mail, Phone, MapPin, Building2, GraduationCap, Calendar, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditProfileDialog from "@/components/EditProfileDialog";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

interface UserData {
  id: string | number;
  title: string;
  first_name: string;
  last_name: string;
}

const ProfilePage = () => {
  // 1. เปลี่ยนจาก [] เป็น null เพราะเรารับข้อมูลแค่ "ก้อนเดียว" ไม่ใช่ "ลิสต์"
  const userId = 6604800015;
  
  const [user, setUser] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // อย่าลืมใส่ id ต่อท้าย (ตามที่แก้ Backend ไป)
    api.get('/api.php', {
      params: {
        page: 'profile',
        id: userId // axios จะแปลงเป็น ?id=41172008 ให้เอง
      }
    }) 
      .then((res) => {
          console.log("Data from API:", res.data); // เช็คดูข้อมูลใน Console
          setUser(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. ถ้าข้อมูลยังไม่มา ให้แสดง Loading หรือค่าว่างไปก่อน (ไม่งั้นจะ Error จอดำ)
  if (!user) {
    return <div className="p-10 text-center">ไม่มีข้อมูล</div>;
  }

  const profileForDialog = {
    name: `${user.title ?? ""}${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
    position: "",
    department: "",
    faculty: "",
    email: "",
    phone: "",
    office: "",
    education: [],
    expertise: [],
  };

  // 3. ลบ .map() ทิ้ง แล้วเรียกใช้ตัวแปร user ตรงๆ
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ข้อมูลส่วนตัว</h1>
          <p className="text-muted-foreground mt-1">ดูและแก้ไขข้อมูลส่วนตัวของคุณ</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Edit className="h-4 w-4" />
          แก้ไขข้อมูล
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-card p-6 text-center">
            <Avatar className="h-28 w-28 mx-auto mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
                {user.first_name ? user.first_name.charAt(0) : "U"}
              </AvatarFallback>
            </Avatar>
            
            {/* เรียกใช้ข้อมูลตรงๆ ได้เลย */}
            <h2 className="text-xl font-bold text-foreground">
               {user.id} {user.title}{user.first_name} {user.last_name}
            </h2>
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        profile={profileForDialog}
        onSave={(data) => {
          console.log("Save profile payload:", data);
          setDialogOpen(false);
        }}
      />
    </div>
  );
};

export default ProfilePage;