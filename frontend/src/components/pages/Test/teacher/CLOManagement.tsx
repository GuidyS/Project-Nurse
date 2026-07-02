import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockCLOs = [
  { id: '1', code: 'CLO1', description: 'อธิบายหลักการพื้นฐานของการพยาบาลได้', plo: 'PLO1', weight: 25, status: 'active' },
  { id: '2', code: 'CLO2', description: 'ปฏิบัติการพยาบาลพื้นฐานได้อย่างถูกต้อง', plo: 'PLO2', weight: 30, status: 'active' },
  { id: '3', code: 'CLO3', description: 'แสดงทักษะการสื่อสารกับผู้ป่วยและทีมสุขภาพ', plo: 'PLO4', weight: 20, status: 'active' },
  { id: '4', code: 'CLO4', description: 'ประยุกต์ใช้เทคโนโลยีในการดูแลผู้ป่วย', plo: 'PLO5', weight: 25, status: 'active' },
];

const ploOptions = ['PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5'];

export default function CLOManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCLO, setNewCLO] = useState({
    code: '',
    description: '',
    plo: '',
    weight: '',
  });

  const handleSave = () => {
    console.log('Saving CLO:', newCLO);
    setIsDialogOpen(false);
    setNewCLO({ code: '', description: '', plo: '', weight: '' });
  };

  const totalWeight = mockCLOs.reduce((acc, c) => acc + c.weight, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">กำหนด CLO</h1>
            <p className="text-muted-foreground">กำหนดผลลัพธ์การเรียนรู้ระดับรายวิชา</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่ม CLO
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่ม CLO ใหม่</DialogTitle>
                <DialogDescription>
                  กำหนดผลลัพธ์การเรียนรู้ระดับรายวิชา
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>รหัส CLO</Label>
                  <Input
                    value={newCLO.code}
                    onChange={(e) => setNewCLO({ ...newCLO, code: e.target.value })}
                    placeholder="เช่น CLO1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>คำอธิบาย</Label>
                  <Textarea
                    value={newCLO.description}
                    onChange={(e) => setNewCLO({ ...newCLO, description: e.target.value })}
                    placeholder="อธิบาย CLO..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>เชื่อมโยง PLO</Label>
                  <Select value={newCLO.plo} onValueChange={(value) => setNewCLO({ ...newCLO, plo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก PLO" />
                    </SelectTrigger>
                    <SelectContent>
                      {ploOptions.map((plo) => (
                        <SelectItem key={plo} value={plo}>{plo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>น้ำหนัก (%)</Label>
                  <Input
                    type="number"
                    value={newCLO.weight}
                    onChange={(e) => setNewCLO({ ...newCLO, weight: e.target.value })}
                    placeholder="เช่น 25"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave}>บันทึก</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวน CLO</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCLOs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">น้ำหนักรวม</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-destructive'}`}>
                {totalWeight}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PLO ที่เชื่อมโยง</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(mockCLOs.map(c => c.plo)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CLO Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการ CLO</CardTitle>
            <CardDescription>ผลลัพธ์การเรียนรู้ระดับรายวิชาทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>คำอธิบาย</TableHead>
                  <TableHead>PLO</TableHead>
                  <TableHead className="text-center">น้ำหนัก</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCLOs.map((clo) => (
                  <TableRow key={clo.id}>
                    <TableCell className="font-medium">{clo.code}</TableCell>
                    <TableCell className="max-w-[300px]">{clo.description}</TableCell>
                    <TableCell><Badge variant="outline">{clo.plo}</Badge></TableCell>
                    <TableCell className="text-center">{clo.weight}%</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">ใช้งาน</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
