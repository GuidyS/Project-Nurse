import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Eye, Plus, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react'; 
import api from '@/lib/axios';

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'proposal':
      return <Badge className="bg-blue-500">ข้อเสนอ</Badge>;
    case 'progress':
      return <Badge className="bg-green-500">รายงานความก้าวหน้า</Badge>;
    case 'financial':
      return <Badge className="bg-yellow-500">การเงิน</Badge>;
    case 'summary':
      return <Badge className="bg-purple-500">สรุปโครงการ</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">อนุมัติ</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">รอตรวจสอบ</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function ProjectDocs() {
  // --- States ---
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State สำหรับควบคุมการเปิด-ปิด Modal สร้างเอกสาร
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  
  // State สำหรับเก็บข้อมูลจากฟอร์ม
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    type: 'proposal',
    date: ''
  });
  
  // State สำหรับแสดงสถานะการกดบันทึกข้อมูล (ป้องกันการกดเบิ้ล)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- States และ Refs สำหรับจัดการอัปโหลดไฟล์จากปุ่มด้านบน ---
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Functions ---
  const fetchDocuments = () => {
    setLoading(true);
    api.get('/index.php?page=get-project-docs')
      .then((res) => {
        if (res.data.status === 'success') {
          setDocs(res.data.data);
        } else {
          console.error(res.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.project || !formData.date) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องครับ");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/index.php?page=create-project-doc', formData);
      if (res.data.status === 'success') {
        alert(res.data.message);
        setFormData({ name: '', project: '', type: 'proposal', date: '' });
        setIsCreateOpen(false);
        fetchDocuments();
      } else {
        alert("เกิดข้อผิดพลาด: " + res.data.message);
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการส่งข้อมูล:", err);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ฟังก์ชันเมื่อกดปุ่ม "อัปโหลด" ด้านบนสุด ---
  const handleTopUploadClick = () => {
    if (selectedDocId === null) {
      alert("กรุณาคลิกเลือกเอกสารในตารางที่ต้องการอัปโหลดไฟล์ให้ก่อนครับ");
      return;
    }
    fileInputRef.current?.click(); // เปิดหน้าต่างเลือกไฟล์
  };

  // ฟังก์ชันจัดการเมื่อไฟล์ถูกเลือก
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocId) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('document_id', selectedDocId.toString());

    try {
      const response = await api.post('/upload_project_file.php', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === 'success') {
        alert('อัปโหลดไฟล์แนบสำเร็จแล้วครับ!');
        fetchDocuments(); // โโหลดตารางใหม่
        setSelectedDocId(null); // เคลียร์ตัวเลือก
      } else {
        alert('เกิดข้อผิดพลาด: ' + response.data.message);
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('ระบบไม่สามารถอัปโหลดไฟล์ได้');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const API_BASE_URL = 'http://localhost'; 

  if (loading && docs.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">กำลังโหลดข้อมูลเอกสารจากฐานข้อมูล...</div>;
  }

  return (
    <>
      {/* Input สำหรับเลือกไฟล์ (ซ่อนไว้) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" 
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">สร้างเอกสารโครงการ</h1>
            <p className="text-muted-foreground">จัดการเอกสารโครงการทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            {/* ปุ่มอัปโหลด กลับมาอยู่ที่เดิมด้านบนสุดตามที่คุณต้องการแล้วครับ */}
            <Button 
              variant="outline" 
              onClick={handleTopUploadClick}
              className={selectedDocId ? "border-primary text-primary animate-pulse" : ""}
            >
              <Upload className="mr-2 h-4 w-4" />
              อัปโหลด {selectedDocId ? "(เลือกอยู่)" : ""}
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              สร้างเอกสาร
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เอกสารทั้งหมด</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{docs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {docs.filter(d => d.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอตรวจสอบ</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {docs.filter(d => d.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ข้อเสนอโครงการ</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {docs.filter(d => d.type === 'proposal').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการเอกสาร</CardTitle>
            <CardDescription>คลิกเลือกแถวเอกสารที่ต้องการ แล้วกดปุ่ม "อัปโหลด" ด้านบนเพื่อแนบไฟล์</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead> {/* ช่องสำหรับวิทยุ/เลือก */}
                  <TableHead>ชื่อเอกสาร</TableHead>
                  <TableHead>โครงการ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      ยังไม่มีข้อมูลเอกสารโครงการถูกบันทึกอยู่ในระบบขณะนี้
                    </TableCell>
                  </TableRow>
                ) : (
                  docs.map((doc) => (
                    <TableRow 
                      key={doc.id}
                      className={`cursor-pointer transition-colors ${selectedDocId === doc.id ? "bg-muted font-medium" : ""}`}
                      onClick={() => setSelectedDocId(doc.id === selectedDocId ? null : doc.id)} // คลิกเพื่อเลือก/ยกเลิกเลือก
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="radio" 
                          name="selectedDoc" 
                          checked={selectedDocId === doc.id}
                          onChange={() => setSelectedDocId(doc.id)}
                          className="h-4 w-4 accent-primary cursor-pointer"
                        />
                      </TableCell>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{doc.project}</TableCell>
                      <TableCell>{getTypeBadge(doc.type)}</TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {/* ปุ่มดูเอกสาร (รูปตา) - จะกดได้เมื่อมี file_path */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="ดูเอกสาร"
                            disabled={!doc.file_path}
                            onClick={() => window.open(`${API_BASE_URL}/${doc.file_path}`, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          
                          {/* ปุ่มดาวน์โหลด - จะกดได้เมื่อมี file_path */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="ดาวน์โหลด"
                            disabled={!doc.file_path}
                            onClick={() => {
                              if (doc.file_path) {
                                const link = document.createElement('a');
                                link.href = `${API_BASE_URL}/${doc.file_path}`;
                                link.download = doc.name; 
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* --- ส่วนป๊อปอัป (Modal/Dialog) สำหรับสร้างเอกสารใหม่ --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">สร้างเอกสารโครงการใหม่</h3>
                <p className="text-sm text-muted-foreground mt-1">กรอกข้อมูลเอกสารเพื่อบันทึกเข้าสู่ระบบ</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)} className="h-8 w-8 rounded-md">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">ชื่อเอกสาร</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="เช่น ข้อเสนอโครงการวิจัย AI v1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">โครงการที่เกี่ยวข้อง</label>
                  <input
                    type="text"
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    placeholder="เช่น โครงการพัฒนาระบบ AI สำหรับการศึกษา"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">ประเภทเอกสาร</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="proposal">ข้อเสนอ</option>
                    <option value="progress">รายงานความก้าวหน้า</option>
                    <option value="financial">การเงิน</option>
                    <option value="summary">สรุปโครงการ</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">วันที่เอกสาร</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    onClick={(e) => {
                      const target = e.target as HTMLInputElement;
                        if ('showPicker' in target) {
                          target.showPicker();
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      required
                     />
                  </div>

              </div>

              <div className="p-6 border-t bg-muted/50 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกเอกสาร"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}