import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Users, Search, UserPlus, BookOpen, Edit, Loader2, Check, ChevronsUpDown, CalendarRange } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export default function AssignInstructors() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [instructorSearch, setInstructorSearch] = useState('');
  const [instructorPickerOpen, setInstructorPickerOpen] = useState(false);

  // ค่าตั้งต้นระดับหน้า — กำหนดครั้งเดียวแล้วทุกวิชาที่มอบหมายจะใช้ค่านี้
  // จำไว้ในเครื่องผู้ใช้ จะได้ไม่ต้องกรอกใหม่ทุกครั้งที่เปิดหน้า
  const [defaultSemester, setDefaultSemester] = useState<string>(
    () => localStorage.getItem('assignDefaultSemester') || ''
  );
  const [defaultAcademicYear, setDefaultAcademicYear] = useState<string>(
    () => localStorage.getItem('assignDefaultAcademicYear') || ''
  );

  // ค่าของวิชาที่กำลังมอบหมาย (เริ่มจากค่าตั้งต้น แต่แก้รายวิชาได้)
  const [formSemester, setFormSemester] = useState<string>('');
  const [formAcademicYear, setFormAcademicYear] = useState<string>('');

  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/index.php?page=get-assign-data');
      if (response.data.status === 'success') {
        setCoursesList(response.data.data.courses || []);
        setInstructorsList(response.data.data.instructors || []);
      } else {
        toast({
          title: "ดึงข้อมูลล้มเหลว",
          description: response.data.message || "ไม่สามารถดึงข้อมูลภาระงานอาจารย์ได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching assign data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ในการดึงข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCourses = coursesList.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredInstructors = instructorsList.filter((instructor) => {
    const keyword = instructorSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      String(instructor.name || '').toLowerCase().includes(keyword) ||
      String(instructor.id || '').toLowerCase().includes(keyword)
    );
  });

  const selectedInstructorLabel = (() => {
    const found = instructorsList.find((i) => i.id === selectedInstructor);
    return found ? `${found.name} (${found.courses_count} วิชา)` : '';
  })();

  const stats = {
    totalCourses: coursesList.length,
    assigned: coursesList.filter(c => c.instructor_id).length,
    unassigned: coursesList.filter(c => !c.instructor_id).length,
    totalInstructors: instructorsList.length,
  };

  const handleAssign = async () => {
    if (!selectedCourse || !selectedInstructor) {
      toast({
        title: "แจ้งเตือน",
        description: "กรุณาเลือกอาจารย์ผู้รับผิดชอบรายวิชานี้",
        variant: "destructive"
      });
      return;
    }

    if (formSemester && !['1', '2', '3'].includes(formSemester)) {
      toast({ title: "แจ้งเตือน", description: "ภาคเรียนต้องเป็น 1, 2 หรือ 3", variant: "destructive" });
      return;
    }

    if (formAcademicYear && !/^25\d{2}$/.test(formAcademicYear)) {
      toast({ title: "แจ้งเตือน", description: "ปีการศึกษาต้องเป็น พ.ศ. 4 หลัก เช่น 2567", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.post('/index.php?page=save-assign-instructor', {
        subject_code: selectedCourse,
        faculty_id: selectedInstructor,
        semester: formSemester || null,
        academic_year: formAcademicYear || null
      });

      if (response.data.status === 'success') {
        toast({
          title: "สำเร็จ",
          description: response.data.message || "มอบหมายอาจารย์ผู้รับผิดชอบรายวิชาเรียบร้อยแล้ว"
        });
        setIsDialogOpen(false);
        setSelectedCourse(null);
        setSelectedInstructor('');
        fetchData();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error assigning instructor:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการส่งคำสั่งมอบหมายไปยังเซิร์ฟเวอร์",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnassign = async () => {
    if (!selectedCourse) return;

    try {
      setIsSaving(true);
      const response = await api.post('/index.php?page=save-assign-instructor', {
        subject_code: selectedCourse,
        faculty_id: "" // ส่งค่าว่างเพื่อยกเลิกการมอบหมาย
      });

      if (response.data.status === 'success') {
        toast({
          title: "สำเร็จ",
          description: "ยกเลิกการมอบหมายอาจารย์เรียบร้อยแล้ว"
        });
        setIsDialogOpen(false);
        setSelectedCourse(null);
        setSelectedInstructor('');
        fetchData();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: response.data.message || "ไม่สามารถยกเลิกการมอบหมายได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error unassigning instructor:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการส่งคำสั่งไปยังเซิร์ฟเวอร์",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openAssignDialog = (courseId: string) => {
    setSelectedCourse(courseId);
    // ดึงค่าอาจารย์คนเดิมที่สอนอยู่ออกมารอใน dropdown ถ้ามี
    const currentCourse = coursesList.find(c => c.id === courseId);
    setSelectedInstructor(currentCourse?.instructor_id || '');
    setInstructorSearch('');
    setInstructorPickerOpen(false);
    // ใช้ค่าที่วิชานั้นเคยบันทึกไว้ก่อน ถ้ายังไม่เคยตั้งค่อยใช้ค่าตั้งต้นของหน้า
    setFormSemester(currentCourse?.semester ? String(currentCourse.semester) : defaultSemester);
    setFormAcademicYear(
      currentCourse?.academic_year ? String(currentCourse.academic_year) : defaultAcademicYear
    );
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">มอบหมาย Course Instructor</h1>
          <p className="text-muted-foreground">มอบหมายอาจารย์ประจำวิชาให้กับรายวิชาในหลักสูตร</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายวิชาทั้งหมด</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "-" : stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">มอบหมายแล้ว</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{isLoading ? "-" : stats.assigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยังไม่มอบหมาย</CardTitle>
              <Users className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{isLoading ? "-" : stats.unassigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อาจารย์ทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "-" : stats.totalInstructors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายวิชาในหลักสูตร</CardTitle>
            <CardDescription>รายวิชาทั้งหมดและอาจารย์ผู้รับผิดชอบ</CardDescription>
            <div className="flex flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="ค้นหารหัสวิชา, ชื่อวิชา หรืออาจารย์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* ค่าตั้งต้นของทั้งหน้า — กรอกครั้งเดียวใช้กับทุกวิชาที่มอบหมายต่อจากนี้ */}
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <CalendarRange className="h-4 w-4 text-primary shrink-0" />
                <Label className="text-xs text-muted-foreground whitespace-nowrap">
                  ใช้กับทุกวิชา
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="3"
                  placeholder="เทอม"
                  value={defaultSemester}
                  onChange={(e) => {
                    setDefaultSemester(e.target.value);
                    localStorage.setItem('assignDefaultSemester', e.target.value);
                  }}
                  className="w-20 h-9 text-center"
                />
                <span className="text-muted-foreground">/</span>
                <Input
                  type="number"
                  min="2500"
                  max="2600"
                  placeholder="ปีการศึกษา"
                  value={defaultAcademicYear}
                  onChange={(e) => {
                    setDefaultAcademicYear(e.target.value);
                    localStorage.setItem('assignDefaultAcademicYear', e.target.value);
                  }}
                  className="w-28 h-9 text-center"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                ไม่พบวิชาตามเงื่อนไขที่สืบค้น
              </div>
            ) : (
              // แสดงประมาณ 10 แถวแล้วเลื่อนดูส่วนที่เหลือ (หัวตารางตรึงไว้ด้านบน)
              // [&>div]:overflow-visible จำเป็น เพราะ <Table> มี wrapper overflow ของตัวเอง
              // ถ้าไม่ปิด หัวตาราง sticky จะไปยึดกับ wrapper นั้นแทนกล่องนี้ แล้วเลื่อนตามเนื้อหา
              <div className="max-h-[47rem] overflow-auto overscroll-contain rounded-lg border [&>div]:overflow-visible">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">รหัสวิชา</TableHead>
                    <TableHead>ชื่อวิชา</TableHead>
                    <TableHead className="text-center">หน่วยกิต</TableHead>
                    <TableHead className="text-center whitespace-nowrap">ภาคเรียน</TableHead>
                    <TableHead className="text-center">อาจารย์ประจำวิชา</TableHead>
                    <TableHead className="text-center">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium whitespace-nowrap">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {course.term_label && course.term_label !== '-' ? (
                          <Badge variant="secondary">{course.term_label}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {course.instructor ? (
                          <Badge className="bg-green-500 hover:bg-green-600 px-2.5 py-0.5">{course.instructor}</Badge>
                        ) : (
                          <Badge variant="destructive" className="px-2.5 py-0.5">ยังไม่มอบหมาย</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant={course.instructor ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => openAssignDialog(course.id)}
                          className="h-8"
                        >
                          {course.instructor ? (
                            <>
                              <Edit className="mr-1.5 h-3.5 w-3.5" />
                              เปลี่ยน
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                              มอบหมาย
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructors Overview */}
        <Card>
          <CardHeader>
            <CardTitle>ภาระงานอาจารย์</CardTitle>
            <CardDescription>จำนวนรายวิชาที่อาจารย์แต่ละท่านรับผิดชอบ</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : instructorsList.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">ไม่พบข้อมูลอาจารย์</div>
            ) : (
              // แสดงประมาณ 10 คนแล้วเลื่อนดูส่วนที่เหลือ
              <div className="max-h-[23rem] overflow-y-auto overscroll-contain rounded-lg border p-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {instructorsList.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="flex items-center justify-between rounded-lg border p-4 bg-card shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{instructor.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">รหัส: {instructor.id}</p>
                    </div>
                    <Badge variant={instructor.courses_count > 0 ? 'default' : 'secondary'} className="text-xs">
                      {instructor.courses_count} วิชา
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assign Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="app-dialog-md">
            <DialogHeader>
              <DialogTitle>มอบหมายอาจารย์ผู้รับผิดชอบรายวิชา</DialogTitle>
              <DialogDescription>
                เลือกอาจารย์ผู้ที่จะดูแลรับผิดชอบหลักสูตรในรายวิชานี้
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2 border-b pb-3">
                <Label className="font-semibold">รายวิชา</Label>
                <p className="text-sm font-medium text-foreground bg-muted p-2 rounded">
                  {coursesList.find(c => c.id === selectedCourse)?.code} - {coursesList.find(c => c.id === selectedCourse)?.name}
                </p>
              </div>
              {/* ภาคเรียน/ปีการศึกษาของวิชานี้ — เริ่มจากค่าตั้งต้นด้านบน แก้รายวิชาได้ */}
              <div className="grid gap-2">
                <Label className="font-semibold">ภาคเรียน / ปีการศึกษา</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="3"
                    placeholder="เทอม"
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-24 text-center"
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    type="number"
                    min="2500"
                    max="2600"
                    placeholder="ปีการศึกษา (พ.ศ.)"
                    value={formAcademicYear}
                    onChange={(e) => setFormAcademicYear(e.target.value)}
                    className="flex-1 text-center"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  เว้นว่างได้ถ้ายังไม่กำหนด — ระบบจะแสดงเป็น "-" แทนการเดาค่า
                </p>
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold">อาจารย์ประจำวิชา</Label>
                {/*
                  ใช้ Combobox (Popover + Command) แทน Select เพราะ Select ของ Radix
                  มี typeahead ในตัวที่แย่งโฟกัสจากช่องค้นหา และจัดตำแหน่ง popup ใหม่ทุกครั้ง
                  ทำให้ช่องค้นหาเด้งขึ้นลงและพิมพ์ต่อเนื่องไม่ได้
                */}
                <Popover
                  open={instructorPickerOpen}
                  onOpenChange={setInstructorPickerOpen}
                  // modal จำเป็นเมื่อ Popover อยู่ใน Dialog — ไม่งั้น scroll lock ของ Dialog
                  // จะบล็อกล้อเมาส์/ทัชแพดในรายการ (เพราะ popover ถูก portal ออกไปนอก dialog)
                  modal
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={instructorPickerOpen}
                      className="w-full justify-between font-normal"
                    >
                      <span className={selectedInstructorLabel ? "" : "text-muted-foreground"}>
                        {selectedInstructorLabel || "กรุณาเลือกอาจารย์..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                    sideOffset={4}
                    // ความสูงกล่องคงที่เสมอ (ดูที่ CommandList) กล่องจึงไม่ถูกคำนวณตำแหน่งใหม่
                    // ตอนพิมพ์ค้นหา — ปล่อยให้ Radix เลือกด้านบน/ล่างเองครั้งเดียวตอนเปิด
                    // เพื่อไม่ให้รายการล้นออกนอกจอด้านล่าง
                    collisionPadding={12}
                  >
                    <Command
                      // ค้นเองด้วย filteredInstructors จึงปิดตัวกรองในตัวของ cmdk
                      shouldFilter={false}
                      loop
                    >
                      <CommandInput
                        placeholder="ค้นหาชื่อหรือรหัสอาจารย์..."
                        value={instructorSearch}
                        onValueChange={setInstructorSearch}
                      />
                      {/* ตรึงความสูงไว้ (ไม่ใช่ max-h) กล่องจะได้ไม่หดขยายตอนกรอง
                          overscroll-contain กัน scroll ทะลุไปเลื่อนหน้าหลังเมื่อเลื่อนสุดรายการ */}
                      <CommandList className="h-[220px] max-h-[220px] overflow-y-auto overscroll-contain">
                        <CommandEmpty>ไม่พบอาจารย์ที่ตรงกับ "{instructorSearch}"</CommandEmpty>
                        <CommandGroup>
                          {filteredInstructors.map((instructor) => (
                            <CommandItem
                              key={instructor.id}
                              value={instructor.id}
                              onSelect={() => {
                                setSelectedInstructor(instructor.id);
                                setInstructorPickerOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedInstructor === instructor.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {instructor.name} ({instructor.courses_count} วิชา)
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2">
              {coursesList.find(c => c.id === selectedCourse)?.instructor_id ? (
                <Button
                  variant="destructive"
                  onClick={handleUnassign}
                  disabled={isSaving}
                  className="sm:mr-auto w-full sm:w-auto"
                >
                  {isSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  ยกเลิกการมอบหมาย
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end sm:ml-auto">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="w-full sm:w-auto">
                  ยกเลิก
                </Button>
                <Button onClick={handleAssign} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  มอบหมาย
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
