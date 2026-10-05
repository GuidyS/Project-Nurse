import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Building, FileSignature, MapPin, Building2, BookOpen, Save, AlertCircle, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import * as XLSX from "xlsx";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LocationItem {
  id?: number;
  hospital_name: string;
  sub_district_hospital: string;
  health_center: string;
  mou_status: string;
  subject_name: string;
}

type ExcelRow = (string | number | boolean | null | undefined)[];

export default function PracticeLocationsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);

  const hasUnsavedChanges = data.some(item => item.id === undefined);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };

    const handleAppNavigate = (e: Event) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm("⚠️ คุณมีข้อมูลที่รออัปโหลดและยังไม่ได้บันทึก\n\nต้องการทิ้งข้อมูลและออกจากหน้านี้ใช่หรือไม่?");
        if (!confirmLeave) {
          e.stopImmediatePropagation(); 
          e.preventDefault();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('app:navigate', handleAppNavigate, { capture: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('app:navigate', handleAppNavigate, { capture: true });
    };
  }, [hasUnsavedChanges]);


  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/index.php?page=practice-locations");
      if (res.data?.status === "success") {
        setData(res.data.data);
      }
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดข้อมูลแหล่งฝึกไม่สำเร็จ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1 });
        const newLocations: LocationItem[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 0 && (row[0] || row[1] || row[2])) {
            newLocations.push({
              hospital_name: row[0] ? String(row[0]).trim() : "",
              sub_district_hospital: row[1] ? String(row[1]).trim() : "",
              health_center: row[2] ? String(row[2]).trim() : "",
              mou_status: row[3] ? String(row[3]).trim() : "",
              subject_name: row[4] ? String(row[4]).trim() : "",
            });
          }
        }
        
        setData(newLocations);
        toast({ title: "อ่านไฟล์สำเร็จ", description: `พบข้อมูลแหล่งฝึก ${newLocations.length} รายการ กรุณากดบันทึก` });
      } catch (err) {
        toast({ title: "เกิดข้อผิดพลาด", description: "ไฟล์ Excel ไม่ถูกต้องตามรูปแบบ", variant: "destructive" });
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleSave = async () => {
    if (data.length === 0) {
      toast({ title: "ไม่มีข้อมูล", description: "กรุณาอัปโหลดไฟล์ Excel ก่อน", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/index.php?page=practice-locations", { locations: data });
      if (res.data?.status === "success") {
        toast({ title: "บันทึกสำเร็จ", description: "อัปเดตข้อมูลแหล่งฝึกภาคปฏิบัติเรียบร้อยแล้ว" });
        fetchData(); 
      } else {
        throw new Error(res.data?.message);
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast({ 
        title: "บันทึกล้มเหลว", 
        description: err.response?.data?.message || err.message || "ไม่สามารถบันทึกข้อมูลได้", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (index: number) => {
    setItemToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete === null) return;
    const item = data[itemToDelete];

    if (item.id) {
      try {
        const res = await api.delete(`/index.php?page=practice-locations&id=${item.id}`);
        if (res.data?.status === "success") {
          toast({ title: "ลบสำเร็จ", description: "ลบข้อมูลแหล่งฝึกเรียบร้อยแล้ว" });
          fetchData();
        } else {
          throw new Error(res.data?.message);
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        toast({ title: "ลบล้มเหลว", description: err.response?.data?.message || err.message, variant: "destructive" });
      }
    } else {
      const newData = [...data];
      newData.splice(itemToDelete, 1);
      setData(newData);
      toast({ title: "นำออกแล้ว", description: "นำข้อมูลออกจากรายการที่รออัปโหลดแล้ว" });
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const executeDeleteAll = async () => {
    try {
      setLoading(true);
      const hasSavedData = data.some(item => item.id !== undefined);

      if (hasSavedData) {
        const res = await api.delete("/index.php?page=practice-locations&action=delete_all");
        if (res.data?.status === "success") {
          toast({ title: "ลบข้อมูลทั้งหมดสำเร็จ", description: "ลบข้อมูลแหล่งฝึกทั้งหมดออกจากระบบเรียบร้อยแล้ว" });
          setData([]);
        } else {
          throw new Error(res.data?.message);
        }
      } else {
        setData([]);
        toast({ title: "เคลียร์ข้อมูลสำเร็จ", description: "นำข้อมูลที่รออัปโหลดออกจากหน้าจอแล้ว" });
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast({ title: "ลบล้มเหลว", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setDeleteAllConfirmOpen(false);
    }
  };

  const dataWithIndex = data.map((item, index) => ({ ...item, originalIndex: index }));
  const hospitals = dataWithIndex.filter(d => d.hospital_name && d.hospital_name.trim() !== "");
  const subDistricts = dataWithIndex.filter(d => d.sub_district_hospital && d.sub_district_hospital.trim() !== "");
  const healthCenters = dataWithIndex.filter(d => d.health_center && d.health_center.trim() !== "");

  //  แก้ไขให้นับเฉพาะคำว่า "มี" จริงๆ (ไม่เอา "ไม่มี")
  const summary = {
    hospitalCount: hospitals.length,
    subDistrictCount: subDistricts.length,
    healthCenterCount: healthCenters.length,
    mouCount: data.filter(d => d.mou_status && String(d.mou_status).trim() === "มี").length,
    subjects: {} as Record<string, number>
  };

  data.forEach(d => {
    if (d.subject_name) {
      summary.subjects[d.subject_name] = (summary.subjects[d.subject_name] || 0) + 1;
    }
  });

  const renderLocationTable = (
    title: string,
    items: typeof dataWithIndex,
    nameKey: "hospital_name" | "sub_district_hospital" | "health_center",
    icon: React.ReactNode,
    borderColorClass: string,
    titleColorClass: string
  ) => {
    if (items.length === 0) return null; 

    return (
      <Card className={`shadow-sm border-t-4 ${borderColorClass}`}>
        <CardHeader className="bg-muted/20 border-b pb-3 pt-4 px-5">
          <CardTitle className={`text-base flex items-center gap-2 ${titleColorClass}`}>
            {icon} {title}
            <Badge variant="secondary" className="ml-auto bg-background shadow-sm border">
              {items.length} แห่ง
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-auto">
            <Table className="relative">
              <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-16 text-center">ลำดับ</TableHead>
                  <TableHead>ชื่อ{title}</TableHead>
                  <TableHead className="w-24 text-center">MOU</TableHead>
                  <TableHead>วิชาที่ฝึก</TableHead>
                  <TableHead className="w-16 text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30">
                    <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-foreground">{row[nameKey]}</TableCell>
                    
                    {/*  แก้ไขการตรวจสอบและแสดงผลป้าย MOU ให้ชัดเจน */}
                    <TableCell className="text-center">
                      {row.mou_status ? (
                        String(row.mou_status).trim() === "มี" ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">มี</Badge>
                        ) : String(row.mou_status).trim() === "ไม่มี" ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">ไม่มี</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">{row.mou_status}</Badge>
                        )
                      ) : "-"}
                    </TableCell>

                    <TableCell>
                      {row.subject_name ? <Badge variant="secondary" className="font-normal">{row.subject_name}</Badge> : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => requestDelete(row.originalIndex)} 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">แหล่งฝึกภาคปฏิบัติ</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">อัปโหลดข้อมูลจากไฟล์ Excel และดูสรุปภาพรวมแหล่งฝึก</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> นำเข้า Excel
          </Button>
          
          <Button onClick={handleSave} disabled={saving || data.length === 0} className="gap-2 bg-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
            บันทึกข้อมูลเข้าระบบ
          </Button>

          <Button 
            variant="destructive" 
            className="gap-2" 
            onClick={() => setDeleteAllConfirmOpen(true)}
            disabled={loading || data.length === 0}
          >
            <Trash2 className="h-4 w-4" /> ลบทั้งหมด
          </Button>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-md text-sm text-amber-800 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">รูปแบบไฟล์ Excel ที่รองรับ: </span>
          ให้เรียงคอลัมน์ A ถึง E ดังนี้: <span className="font-medium">1. ชื่อโรงพยาบาล, 2. ชื่อ รพ.สต., 3. อนามัย, 4. MOU (ระบุว่า มี/ไม่มี), 5. วิชาที่ฝึก</span> (ระบบจะข้ามแถวแรกที่เป็นหัวตารางอัตโนมัติ)
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-blue-100">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full"><Building2 className="h-6 w-6 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">โรงพยาบาลทั้งหมด</p>
                  <p className="text-2xl font-bold">{summary.hospitalCount} <span className="text-sm font-normal text-muted-foreground">แห่ง</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-emerald-100">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-full"><Building className="h-6 w-6 text-emerald-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">รพ.สต. ทั้งหมด</p>
                  <p className="text-2xl font-bold">{summary.subDistrictCount} <span className="text-sm font-normal text-muted-foreground">แห่ง</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-orange-100">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-full"><MapPin className="h-6 w-6 text-orange-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">อนามัย ทั้งหมด</p>
                  <p className="text-2xl font-bold">{summary.healthCenterCount} <span className="text-sm font-normal text-muted-foreground">แห่ง</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full"><FileSignature className="h-6 w-6 text-purple-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">ทำ MOU แล้ว</p>
                  <p className="text-2xl font-bold">{summary.mouCount} <span className="text-sm font-normal text-muted-foreground">แห่ง</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <Card className="shadow-sm col-span-1 sticky top-6">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> สรุปตามรายวิชา
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {Object.entries(summary.subjects).length === 0 ? (
                    <li className="p-4 text-center text-sm text-muted-foreground">ไม่มีข้อมูลรายวิชา</li>
                  ) : (
                    Object.entries(summary.subjects).map(([subject, count]) => (
                      <li key={subject} className="p-3.5 flex justify-between items-center hover:bg-muted/20">
                        <span className="text-sm font-medium">{subject}</span>
                        <Badge variant="secondary" className="rounded-full">{count}</Badge>
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>

            {data.length === 0 ? (
              <Card className="shadow-sm col-span-1 lg:col-span-3 border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                  <div className="bg-muted p-4 rounded-full">
                    <MapPin className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-lg">ยังไม่มีข้อมูลแหล่งฝึกภาคปฏิบัติ</p>
                  <p className="text-sm text-center max-w-sm">กรุณากดปุ่ม "นำเข้า Excel" เพื่ออัปโหลดรายชื่อโรงพยาบาล, รพ.สต. และอนามัยเข้าสู่ระบบ</p>
                </CardContent>
              </Card>
            ) : (
              <div className="col-span-1 lg:col-span-3 space-y-6">
                {renderLocationTable("โรงพยาบาล", hospitals, "hospital_name", <Building2 className="h-5 w-5" />, "border-blue-500", "text-blue-700")}
                {renderLocationTable("รพ.สต.", subDistricts, "sub_district_hospital", <Building className="h-5 w-5" />, "border-emerald-500", "text-emerald-700")}
                {renderLocationTable("อนามัย", healthCenters, "health_center", <MapPin className="h-5 w-5" />, "border-orange-500", "text-orange-700")}
              </div>
            )}

          </div>
        </>
      )}

      {/* กล่องยืนยันการลบทีละรายการ */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบแหล่งฝึก?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete !== null && data[itemToDelete]?.id 
                ? "คุณแน่ใจหรือไม่ว่าต้องการลบแหล่งฝึกนี้? การกระทำนี้ไม่สามารถยกเลิกได้ และจะถูกบันทึกลง Audit Log" 
                : "ต้องการนำแหล่งฝึกนี้ออกจากรายการที่กำลังจะบันทึกใช่หรือไม่?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold">
              ยืนยันการลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* กล่องยืนยันการลบทั้งหมด */}
      <AlertDialog open={deleteAllConfirmOpen} onOpenChange={setDeleteAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">ยืนยันการลบข้อมูลทั้งหมด?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลแหล่งฝึกภาคปฏิบัติ <b>ทั้งหมด {data.length} รายการ</b> ออกจากระบบ? การกระทำนี้ไม่สามารถกู้คืนได้ และจะถูกบันทึกลงใน Audit Log
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteAll} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold">
              ลบข้อมูลทั้งหมด
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}