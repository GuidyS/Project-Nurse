import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FolderKanban, Users, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  members: number;
  deadline: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
    case 'กำลังดำเนินการ':
      return <Badge className="bg-green-500">กำลังดำเนินการ</Badge>;
    case 'completed':
    case 'เสร็จสิ้น':
      return <Badge className="bg-blue-500">เสร็จสิ้น</Badge>;
    case 'pending':
    case 'รอดำเนินการ':
      return <Badge className="bg-yellow-500">รอดำเนินการ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

interface MyProjectsProps {
  onItemClick?: (item: string) => void;
}

export default function MyProjects({ onItemClick }: MyProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMyProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-my-projects');
      if (response.data.status === 'success') {
        setProjects(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถดึงข้อมูลโครงการได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeProjectsCount = projects.filter(
    p => p.status === 'active' || p.status === 'กำลังดำเนินการ'
  ).length;

  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalMembers = projects.reduce((acc, p) => acc + p.members, 0);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">โครงการของฉัน</h1>
            <p className="text-muted-foreground">โครงการที่คุณเป็นผู้รับผิดชอบทั้งหมดในฐานข้อมูล</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">โครงการทั้งหมด</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
              <FolderKanban className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activeProjectsCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งบประมาณรวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{totalBudget.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สมาชิกรวม</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalMembers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Cards */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">ไม่พบโครงการที่คุณรับผิดชอบในขณะนี้</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription className="mt-1">ประเภท: {project.type}</CardDescription>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{project.members} คน</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">กำหนดส่ง: {project.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">ใช้จ่าย: ฿{project.spent.toLocaleString()} / ฿{project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">ความคืบหน้า: {project.progress}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>ความคืบหน้า</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">จัดการเอกสาร</Button>
                    <Button variant="outline">เชื่อมโยง PLO/YLO/CLO</Button>
                    <Button>ดูรายละเอียด</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

