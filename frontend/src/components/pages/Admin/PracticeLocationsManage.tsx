import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Download, Building, FileSignature, MapPin, Building2, BookOpen, Trash2, Plus, X } from "lucide-react";
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

export default function PracticeLocationsManage() {
  const { toast } = useToast();
  const [data, setData] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // State สำหรับ Modal เพิ่มข้อมูลทีละรายการ
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<"hospital" | "sub_district" | "health_center">("hospital");
  const [newLocation, setNewLocation] = useState({ name: "", mou: "", subject: "" });
  const [isSavingManual, setIsSavingManual] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/index.php?page=practice-locations");
      if (res.data?.status === "success") setData(res.data.data);
    } catch (error) {
      toast({ title: "ข้อผิดพลาด", description: "โหลดข้อมูลแหล่งฝึกไม่สำเร็จ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ✅ ฟังก์ชันดาวน์โหลดแพทเทิร์นแบบใหม่ (ดึงไฟล์ .xlsx ที่เราทำสูตรไว้จากโฟลเดอร์ public)
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template_practice_locations.xlsx"; 
    link.download = "แบบฟอร์มนำเข้าแหล่งฝึกภาคปฏิบัติ.xlsx"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
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
        
        if (newLocations.length > 0) {
          await handleAutoSave(newLocations);
        } else {
          toast({ title: "ไฟล์ว่างเปล่า", description: "ไม่พบข้อมูลในไฟล์ Excel", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "เกิดข้อผิดพลาด", description: "ไฟล์ Excel ไม่ถูกต้องตามรูปแบบ", variant: "destructive" });
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAutoSave = async (locationsToSave: LocationItem[]) => {
    try {
      setLoading(true);
      const res = await api.post("/index.php?page=practice-locations", { locations: locationsToSave });
      
      if (res.data?.status === "success") {
        toast({ title: "ดำเนินการสำเร็จ", description: res.data.message }); 
        fetchData(); 
        return true;
      } else {
        throw new Error(res.data?.message || "บันทึกล้มเหลว");
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast({ title: "ไม่สามารถบันทึกได้", description: err.response?.data?.message || err.message, variant: "destructive" });
      setLoading(false);
      return false;
    }
  };

  const submitManualAdd = async () => {
    if (!newLocation.name.trim()) return toast({ title: "ข้อมูลไม่ครบ", description: "กรุณาระบุชื่อสถานที่", variant: "destructive" });
    
    setIsSavingManual(true);
    const payload: LocationItem = {
      hospital_name: addType === 'hospital' ? newLocation.name : "",
      sub_district_hospital: addType === 'sub_district' ? newLocation.name : "",
      health_center: addType === 'health_center' ? newLocation.name : "",
      mou_status: newLocation.mou,
      subject_name: newLocation.subject
    };

    const success = await handleAutoSave([payload]);
    setIsSavingManual(false);

    if (success) {
      setAddModalOpen(false);
      setNewLocation({ name: "", mou: "", subject: "" });
    }
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
        } else throw new Error(res.data?.message);
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        toast({ title: "ลบล้มเหลว", description: err.response?.data?.message || err.message, variant: "destructive" });
      }
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const dataWithIndex = data.map((item, index) => ({ ...item, originalIndex: index }));
  
  // กรองข้อมูลว่างทิ้ง
  const hospitals = dataWithIndex.filter(d => d.hospital_name && String(d.hospital_name).trim() !== "");
  const subDistricts = dataWithIndex.filter(d => d.sub_district_hospital && String(d.sub_district_hospital).trim() !== "");
  const healthCenters = dataWithIndex.filter(d => d.health_center && String(d.health_center).trim() !== "");

  const summary = {
    hospitalCount: hospitals.length,
    subDistrictCount: subDistricts.length,
    healthCenterCount: healthCenters.length,
    mouCount: data.filter(d => d.mou_status && String(d.mou_status).trim() === "มี").length,
    subjects: {} as Record<string, number>
  };

  data.forEach(d => {
    if (d.subject_name) summary.subjects[d.subject_name] = (summary.subjects[d.subject_name] || 0) + 1;
  });

  const renderLocationTable = (
    title: string, 
    items: typeof dataWithIndex, 
    nameKey: "hospital_name" | "sub_district_hospital" | "health_center", 
    typeValue: "hospital" | "sub_district" | "health_center",
    icon: React.ReactNode, 
    borderColorClass: string, 
    titleColorClass: string
  ) => {
    return (
      <Card className={`shadow-sm border-t-4 ${borderColorClass}`}>
        <CardHeader className="bg-muted/20 border-b pb-3 pt-4 px-5">
          <CardTitle className={`text-base flex items-center gap-2 ${titleColorClass}`}>
            {icon} {title}
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="bg-background shadow-sm border text-foreground font-medium">
                {items.length} แห่ง
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2 text-xs border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => { setAddType(typeValue); setAddModalOpen(true); }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> เพิ่ม
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-auto">
            <Table className="relative">
              <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[80px] text-center">ลำดับ</TableHead>
                  <TableHead className="w-[35%]">ชื่อ{title}</TableHead>
                  <TableHead className="w-[120px] text-center">MOU</TableHead>
                  <TableHead className="w-[35%]">วิชาที่ฝึก</TableHead>
                  <TableHead className="w-[80px] text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</TableCell>
                  </TableRow>
                ) : (
                  items.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{row[nameKey]}</TableCell>
                      <TableCell className="text-center">
                        {row.mou_status ? (
                          String(row.mou_status).trim() === "มี" ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">มี</Badge>
                          : String(row.mou_status).trim() === "ไม่มี" ? <Badge className="bg-red-100 text-red-700 hover:bg-red-100">ไม่มี</Badge>
                          : <Badge variant="outline">{row.mou_status}</Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{row.subject_name ? <Badge variant="secondary" className="font-normal">{row.subject_name}</Badge> : "-"}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(row.originalIndex); setDeleteConfirmOpen(true); }} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">จัดการแหล่งฝึกภาคปฏิบัติ</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">อัปโหลดข้อมูลจากไฟล์ Excel หรือเพิ่มข้อมูลทีละรายการ</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4" /> ดาวน์โหลดแพทเทิร์น
          </Button>
          <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 
            นำเข้า Excel
          </Button>
        </div>
      </div>

      {loading ? <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-blue-100"><CardContent className="p-5 flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-full"><Building2 className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm text-muted-foreground font-medium">โรงพยาบาล</p><p className="text-2xl font-bold">{summary.hospitalCount} <span className="text-sm font-normal text-muted-foreground">แห่ง</span></p></div></CardContent></Card>
            <Card className="shadow-sm border-emerald-100"><CardContent className="p-5 flex items-center gap-4"><div className="bg-emerald-100 p-3 rounded-full"><Building className="h-6 w-6 text-emerald-600" /></div><div><p className="text-sm text-muted-foreground font-medium">รพ.สต.</p><p className="text-2xl font-bold">{summary.subDistrictCount} <span className="text-sm font-normal text-muted-foreground">แห่ง</span></p></div></CardContent></Card>
            <Card className="shadow-sm border-orange-100"><CardContent className="p-5 flex items-center gap-4"><div className="bg-orange-100 p-3 rounded-full"><MapPin className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm text-muted-foreground font-medium">อนามัย</p><p className="text-2xl font-bold">{summary.healthCenterCount} <span className="text-sm font-normal text-muted-foreground">แห่ง</span></p></div></CardContent></Card>
            <Card className="shadow-sm"><CardContent className="p-5 flex items-center gap-4"><div className="bg-purple-100 p-3 rounded-full"><FileSignature className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm text-muted-foreground font-medium">ทำ MOU แล้ว</p><p className="text-2xl font-bold">{summary.mouCount} <span className="text-sm font-normal text-muted-foreground">แห่ง</span></p></div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <Card className="shadow-sm col-span-1 sticky top-6">
              <CardHeader className="bg-muted/30 border-b pb-4"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> สรุปรายวิชา</CardTitle></CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {Object.entries(summary.subjects).length === 0 ? <li className="p-4 text-center text-sm text-muted-foreground">ไม่มีข้อมูล</li> : 
                    Object.entries(summary.subjects).map(([subject, count]) => (
                      <li key={subject} className="p-3.5 flex justify-between items-center hover:bg-muted/20"><span className="text-sm font-medium">{subject}</span><Badge variant="secondary" className="rounded-full">{count}</Badge></li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="col-span-1 lg:col-span-3 space-y-6">
              {renderLocationTable("โรงพยาบาล", hospitals, "hospital_name", "hospital", <Building2 className="h-5 w-5" />, "border-blue-500", "text-blue-700")}
              {renderLocationTable("รพ.สต.", subDistricts, "sub_district_hospital", "sub_district", <Building className="h-5 w-5" />, "border-emerald-500", "text-emerald-700")}
              {renderLocationTable("อนามัย", healthCenters, "health_center", "health_center", <MapPin className="h-5 w-5" />, "border-orange-500", "text-orange-700")}
            </div>
          </div>
        </>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden border">
            <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/30">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> 
                เพิ่มข้อมูล{addType === 'hospital' ? 'โรงพยาบาล' : addType === 'sub_district' ? 'รพ.สต.' : 'อนามัย'}
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setAddModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">ชื่อสถานที่ <span className="text-destructive">*</span></label>
                <input 
                  type="text" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="เช่น โรงพยาบาลศิริราช"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">สถานะ MOU</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newLocation.mou}
                  onChange={(e) => setNewLocation({...newLocation, mou: e.target.value})}
                >
                  <option value="">-- ไม่ระบุ --</option>
                  <option value="มี">มี</option>
                  <option value="ไม่มี">ไม่มี</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">วิชาที่ฝึก</label>
                <input 
                  type="text" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="เช่น การพยาบาลอนามัยชุมชน"
                  value={newLocation.subject}
                  onChange={(e) => setNewLocation({...newLocation, subject: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-5 py-4 bg-muted/10">
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>ยกเลิก</Button>
              <Button onClick={submitManualAdd} disabled={isSavingManual || !newLocation.name.trim()}>
                {isSavingManual ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                บันทึกข้อมูล
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันลบแหล่งฝึก?</AlertDialogTitle>
            <AlertDialogDescription>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? ข้อมูลจะถูกลบออกจากฐานข้อมูลทันที</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive">ยืนยันการลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}