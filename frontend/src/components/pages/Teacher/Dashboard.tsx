import { useEffect, useState } from "react";
import { Bell, BookOpen, GraduationCap, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";

type DashboardStats = {
  total_students: number;
  total_faculties: number;
  total_subjects: number;
  unread_notifications: number;
};

const emptyStats: DashboardStats = {
  total_students: 0,
  total_faculties: 0,
  total_subjects: 0,
  unread_notifications: 0,
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("?page=teacher-dashboard");
        if (data.status === "success") {
          setStats(data.data);
        } else {
          setError(data.message || "ไม่สามารถโหลดข้อมูล Dashboard ได้");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "ไม่สามารถเชื่อมต่อ Teacher Dashboard API ได้");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const items = [
    { label: "นักศึกษา", value: stats.total_students, icon: GraduationCap },
    { label: "อาจารย์", value: stats.total_faculties, icon: Users },
    { label: "รายวิชา", value: stats.total_subjects, icon: BookOpen },
    { label: "แจ้งเตือน", value: stats.unread_notifications, icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">ข้อมูลจาก backend Teacher Dashboard API</p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : item.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}