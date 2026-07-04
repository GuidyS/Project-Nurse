import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Users, BookOpen, FolderKanban, CheckCircle, AlertCircle, Info, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from "@/lib/axios";

const importTypes = [
  { value: "students", label: "ข้อมูลนักศึกษา", icon: Users, description: "รายชื่อนักศึกษาใหม่" },
  { value: "teachers", label: "ข้อมูลอาจารย์", icon: Users, description: "รายชื่อบุคลากร" },
  { value: "courses", label: "ข้อมูลรายวิชา", icon: BookOpen, description: "วิชาและหลักสูตร" },
  { value: "projects", label: "แผนงบประมาณ", icon: FolderKanban, description: "แผนโครงการและงบประจำปี" },
  { value: "grades", label: "ผลการเรียน/เกรด", icon: GraduationCap, description: "ผลการลงทะเบียนเรียนและเกรด" }, 
];

interface ImportHistory {
  id: string;
  type: string;
  fileName: string;
  recordCount: number;
  status: "success" | "failed" | "partial";
  date: string;
}

export default function ImportData() {
  const [selectedType, setSelectedType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const { toast } = useToast();

  const fetchHistory = async () => {
    try {
      const response = await api.get("/components/Admin/get_import_history.php"); 
      if (Array.isArray(response.data)) setImportHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { 
    fetchHistory(); 
  }, []);

  const handleImport = async () => {
    if (!selectedType || !selectedFile) {
      toast({ title: "กรุณาเลือกประเภทและไฟล์", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('importType', selectedType);
    setIsUploading(true);
    
    try {
      const response = await api.post("/components/Admin/upload_data.php", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total || 100)))
      });
      if (response.data.status === "success") {
        toast({ title: "สำเร็จ", description: response.data.message });
        setSelectedFile(null); 
        setSelectedType(""); 
        fetchHistory();
      }
    } catch (error: unknown) {
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        errorMessage = err.response?.data?.message || errorMessage;
      }
      toast({ title: "ล้มเหลว", description: errorMessage, variant: "destructive" });
    } finally {
      setIsUploading(false); 
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">นำเข้าข้อมูล</h1>
        <p className="text-muted-foreground">อัปโหลดไฟล์ CSV เพื่อนำเข้าข้อมูลเข้าสู่ระบบ</p>
      </div>

      <Alert className="bg-blue-50/50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>ข้อแนะนำในการเตรียมไฟล์ (สำคัญมาก)</AlertTitle>
        <AlertDescription className="text-xs mt-2">
          - กรุณา <b>Save As ไฟล์ Excel ให้เป็นนามสกุล .CSV (Comma delimited)</b> ก่อนอัปโหลดเสมอ<br/>
          - ระบบได้เตรียมการรองรับคำว่า "ไม่ใช้งบ" และจัดการข้อมูลช่องว่างให้แล้ว ท่านสามารถใช้ไฟล์แผนงบประมาณเดิมอัปโหลดได้ทันที
        </AlertDescription>
      </Alert>

      {/* เลือกประเภทการอัปโหลด */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {importTypes.map((type) => (
          <Card 
            key={type.value} 
            className={`cursor-pointer transition-all hover:border-primary ${selectedType === type.value ? "border-primary bg-primary/5 shadow-md" : ""}`} 
            onClick={() => setSelectedType(type.value)}
          >
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <type.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{type.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* พื้นที่อัปโหลดไฟล์ */}
      <Card>
        <CardHeader>
          <CardTitle>อัปโหลดไฟล์</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/10">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-primary font-medium">คลิกเพื่อเลือกไฟล์</span>
              <span className="text-muted-foreground"> (รองรับเฉพาะ .csv)</span>
            </Label>
            <Input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            {selectedFile && (
              <p className="mt-4 text-sm text-foreground">
                ไฟล์ที่เลือก: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
          </div>

          {/* แสดงสถานะการอัปโหลด */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>กำลังนำเข้า...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <Button 
            onClick={handleImport} 
            disabled={!selectedType || !selectedFile || isUploading} 
            className="w-full gap-2"
          >
            <Upload className="h-4 w-4" />
            นำเข้าข้อมูล
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}