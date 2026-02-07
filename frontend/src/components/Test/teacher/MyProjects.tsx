import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FolderKanban, Users, Calendar, DollarSign } from 'lucide-react';

// Mock data
const mockProjects = [
  { id: '1', name: 'โครงการพัฒนาทักษะการพยาบาล', status: 'active', progress: 65, budget: 150000, spent: 98000, members: 5, deadline: '2024-06-30' },
  { id: '2', name: 'โครงการวิจัยการดูแลผู้สูงอายุ', status: 'active', progress: 40, budget: 200000, spent: 80000, members: 8, deadline: '2024-08-15' },
  { id: '3', name: 'โครงการอบรมเทคโนโลยีการพยาบาล', status: 'completed', progress: 100, budget: 80000, spent: 75000, members: 3, deadline: '2024-01-10' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">กำลังดำเนินการ</Badge>;
    case 'completed':
      return <Badge className="bg-blue-500">เสร็จสิ้น</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">รอดำเนินการ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function MyProjects() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">โครงการของฉัน</h1>
            <p className="text-muted-foreground">โครงการที่รับผิดชอบทั้งหมด</p>
          </div>
          <Button>สร้างโครงการใหม่</Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">โครงการทั้งหมด</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockProjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กำลังดำเนินการ</CardTitle>
              <FolderKanban className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockProjects.filter(p => p.status === 'active').length}
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
                ฿{mockProjects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}
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
                {mockProjects.reduce((acc, p) => acc + p.members, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Cards */}
        <div className="grid gap-4">
          {mockProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{project.name}</CardTitle>
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
                    <span className="text-sm">{project.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">฿{project.spent.toLocaleString()} / ฿{project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{project.progress}%</span>
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
      </div>
    </MainLayout>
  );
}
