import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Save, Edit } from 'lucide-react';
import { useState } from 'react';

// Mock data
const courses = [
  { code: 'NUR101', name: 'พื้นฐานการพยาบาล' },
  { code: 'NUR201', name: 'การพยาบาลผู้ใหญ่ 1' },
  { code: 'NUR202', name: 'การพยาบาลผู้ใหญ่ 2' },
  { code: 'NUR301', name: 'การพยาบาลเด็ก' },
  { code: 'NUR302', name: 'การพยาบาลจิตเวช' },
  { code: 'NUR401', name: 'การบริหารการพยาบาล' },
];

const plos = ['PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5'];

interface CLOMapData {
  [courseCode: string]: string[];
}

const initialMap: CLOMapData = {
  'NUR101': ['PLO1', 'PLO2'],
  'NUR201': ['PLO1', 'PLO2', 'PLO3'],
  'NUR202': ['PLO2', 'PLO3'],
  'NUR301': ['PLO1', 'PLO3', 'PLO4'],
  'NUR302': ['PLO3', 'PLO4', 'PLO5'],
  'NUR401': ['PLO4', 'PLO5'],
};

export default function CLOMap() {
  const [cloMap, setCloMap] = useState(initialMap);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = () => {
    console.log('Saving CLO Map:', cloMap);
    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CLO Map</h1>
            <p className="text-muted-foreground">แผนที่การเชื่อมโยง CLO กับ PLO</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  บันทึก
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                แก้ไข
              </Button>
            )}
          </div>
        </div>

        {/* CLO Map Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ตาราง CLO Mapping
            </CardTitle>
            <CardDescription>
              การเชื่อมโยงระหว่างรายวิชาและผลลัพธ์การเรียนรู้ระดับหลักสูตร
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสวิชา</TableHead>
                  <TableHead>ชื่อวิชา</TableHead>
                  {plos.map((plo) => (
                    <TableHead key={plo} className="text-center">{plo}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-5">
          {plos.map((plo) => {
            const count = Object.values(cloMap).filter(plos => plos.includes(plo)).length;
            return (
              <Card key={plo}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-sm text-muted-foreground">รายวิชา</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
