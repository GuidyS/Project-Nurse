import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building, FileSignature, MapPin, Building2, BookOpen } from "lucide-react";
import api from "@/lib/axios";

interface LocationItem {
  id?: number;
  hospital_name: string;
  sub_district_hospital: string;
  health_center: string;
  mou_status: string;
  subject_name: string;
}

export default function PracticeLocationsView() {
  const { toast } = useToast();
  const [data, setData] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/index.php?page=practice-locations");
        if (res.data?.status === "success") setData(res.data.data);
      } catch (error) {
        toast({ title: "ข้อผิดพลาด", description: "โหลดข้อมูลแหล่งฝึกไม่สำเร็จ", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hospitals = data.filter(d => d.hospital_name?.trim() !== "");
  const subDistricts = data.filter(d => d.sub_district_hospital?.trim() !== "");
  const healthCenters = data.filter(d => d.health_center?.trim() !== "");

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

  const renderLocationTable = (title: string, items: LocationItem[], nameKey: "hospital_name" | "sub_district_hospital" | "health_center", icon: React.ReactNode, borderColorClass: string, titleColorClass: string) => {
    if (items.length === 0) return null; 
    return (
      <Card className={`shadow-sm border-t-4 ${borderColorClass}`}>
        <CardHeader className="bg-muted/20 border-b pb-3 pt-4 px-5">
          <CardTitle className={`text-base flex items-center gap-2 ${titleColorClass}`}>
            {icon} {title}
            <Badge variant="secondary" className="ml-auto bg-background shadow-sm border">{items.length} แห่ง</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-auto">
            <Table className="relative">
              <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[80px] text-center">ลำดับ</TableHead>
                  <TableHead className="w-[40%]">ชื่อ{title}</TableHead>
                  <TableHead className="w-[120px] text-center">MOU</TableHead>
                  <TableHead className="w-[40%]">วิชาที่ฝึก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30">
                    <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-foreground">{row[nameKey]}</TableCell>
                    <TableCell className="text-center">
                      {row.mou_status ? (
                        String(row.mou_status).trim() === "มี" ? <Badge className="bg-green-100 text-green-700">มี</Badge>
                        : String(row.mou_status).trim() === "ไม่มี" ? <Badge className="bg-red-100 text-red-700">ไม่มี</Badge>
                        : <Badge variant="outline">{row.mou_status}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{row.subject_name ? <Badge variant="secondary" className="font-normal">{row.subject_name}</Badge> : "-"}</TableCell>
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
          <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">แหล่งฝึกภาคปฏิบัติ</h1></div>
          <p className="text-sm text-muted-foreground mt-1">ข้อมูลสรุปภาพรวมแหล่งฝึกภาคปฏิบัติทั้งหมด</p>
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
              {data.length === 0 && (
                <Card className="shadow-sm border-dashed border-2"><CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3"><div className="bg-muted p-4 rounded-full"><MapPin className="h-10 w-10 text-muted-foreground/50" /></div><p className="font-medium text-lg">ยังไม่มีข้อมูล</p><p className="text-sm text-center">ยังไม่มีการเพิ่มข้อมูลแหล่งฝึกภาคปฏิบัติลงในระบบ</p></CardContent></Card>
              )}
              {renderLocationTable("โรงพยาบาล", hospitals, "hospital_name", <Building2 className="h-5 w-5" />, "border-blue-500", "text-blue-700")}
              {renderLocationTable("รพ.สต.", subDistricts, "sub_district_hospital", <Building className="h-5 w-5" />, "border-emerald-500", "text-emerald-700")}
              {renderLocationTable("อนามัย", healthCenters, "health_center", <MapPin className="h-5 w-5" />, "border-orange-500", "text-orange-700")}
            </div>
          </div>
        </>
      )}
    </div>
  );
}