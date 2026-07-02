import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Users, BookOpen, FolderKanban, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const importTypes = [
  { value: "students", label: "ข้อมูลนักศึกษา", icon: Users, description: "นำเข้ารายชื่อนักศึกษาใหม่" },
  { value: "teachers", label: "ข้อมูลอาจารย์", icon: Users, description: "นำเข้ารายชื่ออาจารย์" },
  { value: "courses", label: "ข้อมูลรายวิชา", icon: BookOpen, description: "นำเข้ารายวิชาและหลักสูตร" },
  { value: "projects", label: "ข้อมูลโครงการ", icon: FolderKanban, description: "นำเข้าข้อมูลโครงการ" },
];

interface ImportHistory {
  id: string;
  type: string;
  fileName: string;
  recordCount: number;
  status: "success" | "failed" | "partial";
  date: string;
}

const mockImportHistory: ImportHistory[] = [
  { id: "1", type: "students", fileName: "students_2568.xlsx", recordCount: 150, status: "success", date: "2569-01-20" },
  { id: "2", type: "courses", fileName: "courses_semester2.csv", recordCount: 45, status: "success", date: "2569-01-18" },
  { id: "3", type: "teachers", fileName: "new_teachers.xlsx", recordCount: 12, status: "partial", date: "2569-01-15" },
  { id: "4", type: "projects", fileName: "projects_2568.xlsx", recordCount: 0, status: "failed", date: "2569-01-10" },
];

export default function ImportData() {
  const [selectedType, setSelectedType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedType || !selectedFile) {
      toast({ title: "กรุณาเลือกประเภทและไฟล์", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      toast({ title: "นำเข้าข้อมูลสำเร็จ", description: `นำเข้า ${selectedFile.name} เรียบร้อยแล้ว` });
      setSelectedFile(null);
      setSelectedType("");
    }, 2500);
  };

  const getStatusBadge = (status: ImportHistory["status"]) => {
    switch (status) {
      case "success":
        return <span className="flex items-center gap-1 text-success"><CheckCircle className="h-4 w-4" /> สำเร็จ</span>;
      case "failed":
        return <span className="flex items-center gap-1 text-destructive"><AlertCircle className="h-4 w-4" /> ล้มเหลว</span>;
      case "partial":
        return <span className="flex items-center gap-1 text-warning"><AlertCircle className="h-4 w-4" /> บางส่วน</span>;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">นำเข้าข้อมูล</h1>
          <p className="text-muted-foreground">อัปโหลดไฟล์ Excel หรือ CSV เพื่อนำเข้าข้อมูลเข้าสู่ระบบ</p>
        </div>

        {/* Import Types */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {importTypes.map((type) => (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all hover:border-primary ${selectedType === type.value ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setSelectedType(type.value)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <type.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>อัปโหลดไฟล์</CardTitle>
            <CardDescription>รองรับไฟล์ .xlsx, .xls, .csv (ขนาดไม่เกิน 10MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary font-medium">คลิกเพื่อเลือกไฟล์</span>
                <span className="text-muted-foreground"> หรือลากไฟล์มาวางที่นี่</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="mt-4 text-sm text-foreground">
                  ไฟล์ที่เลือก: <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>กำลังนำเข้า...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button onClick={handleImport} disabled={!selectedType || !selectedFile || isUploading} className="w-full gap-2">
              <Upload className="h-4 w-4" />
              นำเข้าข้อมูล
            </Button>
          </CardContent>
        </Card>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle>ประวัติการนำเข้า</CardTitle>
            <CardDescription>รายการนำเข้าข้อมูลล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockImportHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{item.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {importTypes.find((t) => t.value === item.type)?.label} • {item.recordCount} รายการ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(item.status)}
                    <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
