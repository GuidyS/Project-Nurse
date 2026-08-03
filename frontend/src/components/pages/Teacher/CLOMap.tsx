import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Save, Edit, Loader2, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { Input } from '@/components/ui/input';

interface CLOMapData {
  [courseCode: string]: string[];
}

interface CourseData {
  code: string;
  name: string;
}

export default function CLOMap() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [plos, setPlos] = useState<string[]>([]);
  const [cloMap, setCloMap] = useState<CLOMapData>({});
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseSearch, setCourseSearch] = useState('');

  // 🌟 ดึงข้อมูลจากฐานข้อมูลเมื่อเปิดหน้า
  const fetchMapData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-clo-map');
      if (response.data.status === 'success') {
        setCourses(response.data.data.courses || []);
        setPlos(response.data.data.plos || []);
        setCloMap(response.data.data.cloMap || {});
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดึงข้อมูล CLO Map ได้", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        String(c.code ?? '').toLowerCase().includes(q) ||
        String(c.name ?? '').toLowerCase().includes(q)
    );
  }, [courses, courseSearch]);

  const toggleMapping = (courseCode: string, plo: string) => {
    if (!isEditing) return;
    setCloMap(prev => {
      const current = prev[courseCode] || [];
      const updated = current.includes(plo)
        ? current.filter(p => p !== plo)
        : [...current, plo];
      return { ...prev, [courseCode]: updated };
    });
  };

  // 🌟 ส่งข้อมูลที่แก้ไขไปบันทึก
  const handleSave = async () => {
    try {
      const response = await api.post('/index.php?page=save-clo-map', cloMap);
      if (response.data.status === 'success') {
        toast({ title: "สำเร็จ", description: "บันทึกข้อมูล CLO Map เรียบร้อยแล้ว" });
        setIsEditing(false);
        await fetchMapData();
      } else {
        toast({
          title: "ล้มเหลว",
          description: response.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้";
      toast({ title: "ล้มเหลว", description: message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CLO Map</h1>
            <p className="text-muted-foreground">แผนที่การเชื่อมโยงรายวิชากับผลลัพธ์การเรียนรู้ระดับหลักสูตร (PLO)</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); fetchMapData(); }}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> บันทึก
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> แก้ไข
              </Button>
            )}
          </div>
        </div>
        
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
          {plos.map((plo) => {
            const count = Object.values(cloMap).filter(plos => plos.includes(plo)).length;
            return (
              <Card key={plo}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-sm text-muted-foreground">รายวิชาที่ครอบคลุม</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CLO Map Table */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ตาราง CLO Mapping
              </CardTitle>
              <CardDescription>
                ติ๊กเลือกความสอดคล้องระหว่างรายวิชา (แกน Y) และ PLO (แกน X)
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="ค้นหารหัส / ชื่อวิชา..."
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">รหัสวิชา</TableHead>
                  <TableHead className="min-w-[250px]">ชื่อวิชา</TableHead>
                  {plos.map((plo) => (
                    <TableHead key={plo} className="text-center min-w-[80px]">{plo}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={plos.length + 2} className="text-center py-6">
                      ไม่มีรายวิชาในระบบ
                    </TableCell>
                  </TableRow>
                ) : filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={plos.length + 2} className="text-center py-6">
                      ไม่พบรายวิชาที่ตรงกับคำค้นหา
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.code}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      {plos.map((plo) => (
                        <TableCell key={plo} className="text-center">
                          <Checkbox
                            checked={cloMap[course.code]?.includes(plo) || false}
                            onCheckedChange={() => toggleMapping(course.code, plo)}
                            disabled={!isEditing}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}