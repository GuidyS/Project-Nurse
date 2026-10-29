import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Loader2, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CLOMapData {
  [courseCode: string]: string[];
}

interface CourseData {
  code: string;
  name: string;
  /** YLO (ชั้นปี) ของรายวิชา ตั้งค่าที่หน้า "จัดการหลักสูตร" — null = ยังไม่กำหนด */
  ylo: number | null;
}

const YLO_FILTER_ALL = 'all';
const YLO_FILTER_NONE = 'none';
const YLO_OPTIONS = [1, 2, 3, 4];

export default function CLOMap() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [plos, setPlos] = useState<string[]>([]);
  const [cloMap, setCloMap] = useState<CLOMapData>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [courseSearch, setCourseSearch] = useState('');
  const [yloFilter, setYloFilter] = useState<string>(YLO_FILTER_ALL);

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
    return courses.filter((c) => {
      // กรองตาม YLO ก่อน แล้วค่อยกรองด้วยคำค้นหา
      if (yloFilter === YLO_FILTER_NONE && c.ylo !== null && c.ylo !== undefined) return false;
      if (yloFilter !== YLO_FILTER_ALL && yloFilter !== YLO_FILTER_NONE && String(c.ylo ?? '') !== yloFilter) return false;
      if (!q) return true;
      return (
        String(c.code ?? '').toLowerCase().includes(q) ||
        String(c.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [courses, courseSearch, yloFilter]);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

return (
    <>
      <div className="space-y-6">
        <div className="app-page-header">
          <div>
            <h1 className="app-page-title">CLO Map</h1>
            <p className="app-page-description">แผนที่การเชื่อมโยงรายวิชากับผลลัพธ์การเรียนรู้ระดับหลักสูตร (PLO)</p>
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
                ดูความสอดคล้องระหว่างรายวิชา (แกน Y) และ PLO (แกน X)
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
            <div className="w-full sm:w-52 shrink-0 space-y-1.5">
              <Label className="text-xs text-muted-foreground">กรองตาม YLO (ชั้นปี)</Label>
              <Select value={yloFilter} onValueChange={setYloFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={YLO_FILTER_ALL}>ทุก YLO</SelectItem>
                  {YLO_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>YLO{y} — ชั้นปีที่ {y}</SelectItem>
                  ))}
                  <SelectItem value={YLO_FILTER_NONE}>ยังไม่กำหนด YLO</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">รหัสวิชา</TableHead>
                  <TableHead className="min-w-[250px]">ชื่อวิชา</TableHead>
                  <TableHead className="w-[90px] text-center">YLO</TableHead>
                  {plos.map((plo) => (
                    <TableHead key={plo} className="text-center min-w-[80px]">{plo}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={plos.length + 3} className="text-center py-6">
                      ไม่มีรายวิชาในระบบ
                    </TableCell>
                  </TableRow>
                ) : filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={plos.length + 3} className="text-center py-6">
                      ไม่พบรายวิชาที่ตรงกับคำค้นหา
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.code}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell className="text-center">
                        {course.ylo
                          ? <Badge variant="secondary" className="font-medium">YLO{course.ylo}</Badge>
                          : <span className="text-muted-foreground text-xs">-</span>}
                      </TableCell>
                      {plos.map((plo) => (
                        <TableCell key={plo} className="text-center">
                          <Checkbox
                            checked={cloMap[course.code]?.includes(plo) || false}
                            disabled
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
