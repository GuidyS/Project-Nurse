import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calendar, Users, BookOpen, Building, ExternalLink } from 'lucide-react';

// Mock data
const mockAnnouncements = [
  { id: '1', title: 'ประกาศปิดรับสมัครนักศึกษาใหม่ ปีการศึกษา 2567', date: '2024-01-15', category: 'ประชาสัมพันธ์' },
  { id: '2', title: 'กำหนดการลงทะเบียนเรียน ภาคเรียนที่ 2/2566', date: '2024-01-10', category: 'วิชาการ' },
  { id: '3', title: 'วันหยุดราชการประจำเดือนมกราคม 2567', date: '2024-01-05', category: 'ปฏิทิน' },
  { id: '4', title: 'ขอเชิญร่วมงานสัมมนาวิชาการ', date: '2024-01-03', category: 'กิจกรรม' },
];

const mockCalendar = [
  { id: '1', event: 'เปิดภาคเรียน 2/2566', date: '2024-01-08', type: 'academic' },
  { id: '2', event: 'วันสุดท้ายลงทะเบียนเพิ่ม/ถอน', date: '2024-01-22', type: 'deadline' },
  { id: '3', event: 'สอบกลางภาค', date: '2024-03-04', type: 'exam' },
  { id: '4', event: 'สอบปลายภาค', date: '2024-05-06', type: 'exam' },
];

const mockPrograms = [
  { id: '1', name: 'หลักสูตรพยาบาลศาสตรบัณฑิต', students: 480, duration: '4 ปี' },
  { id: '2', name: 'หลักสูตรสาธารณสุขศาสตรบัณฑิต', students: 320, duration: '4 ปี' },
  { id: '3', name: 'หลักสูตรวิทยาศาสตรบัณฑิต (เทคนิคการแพทย์)', students: 240, duration: '4 ปี' },
];

const mockFacultyInfo = {
  name: 'คณะพยาบาลศาสตร์',
  dean: 'รศ.ดร.สมศักดิ์ รักวิชา',
  established: 'พ.ศ. 2520',
  totalStudents: 1040,
  totalStaff: 85,
  address: '123 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
  phone: '02-123-4567',
  email: 'nursing@university.ac.th',
  website: 'https://nursing.university.ac.th',
};

export default function PublicInfo() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ข้อมูลสาธารณะ</h1>
          <p className="text-muted-foreground">ข้อมูลทั่วไปของคณะและมหาวิทยาลัย</p>
        </div>

        {/* Faculty Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {mockFacultyInfo.name}
            </CardTitle>
            <CardDescription>ข้อมูลทั่วไปของคณะ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">คณบดี:</span>
                  <p className="font-medium">{mockFacultyInfo.dean}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">ก่อตั้งเมื่อ:</span>
                  <p className="font-medium">{mockFacultyInfo.established}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">จำนวนนักศึกษา:</span>
                  <p className="font-medium">{mockFacultyInfo.totalStudents} คน</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">จำนวนบุคลากร:</span>
                  <p className="font-medium">{mockFacultyInfo.totalStaff} คน</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">ที่อยู่:</span>
                  <p className="font-medium">{mockFacultyInfo.address}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">โทรศัพท์:</span>
                  <p className="font-medium">{mockFacultyInfo.phone}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">อีเมล:</span>
                  <p className="font-medium">{mockFacultyInfo.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">เว็บไซต์:</span>
                  <Button variant="link" className="h-auto p-0">
                    {mockFacultyInfo.website}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="announcements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="announcements">ประกาศ</TabsTrigger>
            <TabsTrigger value="calendar">ปฏิทินการศึกษา</TabsTrigger>
            <TabsTrigger value="programs">หลักสูตร</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  ประกาศล่าสุด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{announcement.category}</Badge>
                        </div>
                        <p className="font-medium">{announcement.title}</p>
                        <p className="text-sm text-muted-foreground">{announcement.date}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        อ่านเพิ่มเติม
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  ปฏิทินการศึกษา ปีการศึกษา 2566
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCalendar.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <span className="text-xs">
                            {event.date.split('-')[1]}/{event.date.split('-')[2]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{event.event}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          event.type === 'exam'
                            ? 'destructive'
                            : event.type === 'deadline'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {event.type === 'exam'
                          ? 'สอบ'
                          : event.type === 'deadline'
                          ? 'กำหนดส่ง'
                          : 'วิชาการ'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  หลักสูตรที่เปิดสอน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {mockPrograms.map((program) => (
                    <Card key={program.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{program.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{program.students} คน</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>ระยะเวลา {program.duration}</span>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-4 w-full">
                          ดูรายละเอียด
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
