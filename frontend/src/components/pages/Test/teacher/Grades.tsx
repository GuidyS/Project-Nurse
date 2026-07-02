import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Save, Edit } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockGrades = [
  { id: '1', studentId: '64010001', name: 'สมชาย ใจดี', midterm: 85, final: 78, assignment: 90, total: 84, grade: 'A', editable: true },
  { id: '2', studentId: '64010002', name: 'สมหญิง รักเรียน', midterm: 72, final: 80, assignment: 85, total: 79, grade: 'B+', editable: true },
  { id: '3', studentId: '65010001', name: 'มานะ ตั้งใจ', midterm: 68, final: 65, assignment: 75, total: 69, grade: 'B', editable: true },
  { id: '4', studentId: '65010002', name: 'มานี ขยัน', midterm: 55, final: 60, assignment: 70, total: 62, grade: 'C+', editable: true },
  { id: '5', studentId: '66010001', name: 'ปิติ สุขใจ', midterm: 92, final: 88, assignment: 95, total: 92, grade: 'A', editable: true },
];

const gradeOptions = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];

export default function Grades() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('NUR101');
  const [grades, setGrades] = useState(mockGrades);

  const filteredGrades = grades.filter(
    (grade) =>
      grade.name.includes(searchTerm) ||
      grade.studentId.includes(searchTerm)
  );

  const handleGradeChange = (id: string, newGrade: string) => {
    setGrades(grades.map(g => 
      g.id === id ? { ...g, grade: newGrade } : g
    ));
  };

  const handleSaveAll = () => {
    console.log('Saving grades:', grades);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">บันทึกเกรด</h1>
            <p className="text-muted-foreground">บันทึกและแก้ไขผลการเรียนวิชาที่สอน</p>
          </div>
          <Button onClick={handleSaveAll}>
            <Save className="mr-2 h-4 w-4" />
            บันทึกทั้งหมด
          </Button>
        </div>

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกรายวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="เลือกรายวิชา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NUR101">NUR101 - พื้นฐานการพยาบาล</SelectItem>
                <SelectItem value="NUR201">NUR201 - การพยาบาลผู้ใหญ่ 1</SelectItem>
                <SelectItem value="NUR301">NUR301 - การพยาบาลเด็ก</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ผลการเรียน - {selectedCourse}
            </CardTitle>
            <CardDescription>คะแนนและเกรดของนักศึกษา</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสนักศึกษา</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-center">สอบกลางภาค (30%)</TableHead>
                  <TableHead className="text-center">สอบปลายภาค (40%)</TableHead>
                  <TableHead className="text-center">งานมอบหมาย (30%)</TableHead>
                  <TableHead className="text-center">รวม</TableHead>
                  <TableHead className="text-center">เกรด</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.studentId}</TableCell>
                    <TableCell>{grade.name}</TableCell>
                    <TableCell className="text-center">{grade.midterm}</TableCell>
                    <TableCell className="text-center">{grade.final}</TableCell>
                    <TableCell className="text-center">{grade.assignment}</TableCell>
                    <TableCell className="text-center font-bold">{grade.total}</TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={grade.grade}
                        onValueChange={(value) => handleGradeChange(grade.id, value)}
                      >
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-3 w-3" />
                        แก้ไข
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
