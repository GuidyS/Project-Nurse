import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Plus, UploadCloud, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { consumePendingProjectNavigation } from '@/lib/projectNavigation';

interface ProjectOption {
  id: number;
  name: string;
}

interface ProjectDocument {
  id: number;
  project_id: number | null;
  name: string;
  project: string;
  legacy_project_name?: string;
  type: string;
  date: string;
  status: string;
  file_path?: string | null;
}

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
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  // State สำหรับควบคุมการเปิด-ปิด Modal สร้างเอกสาร
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  
  // State สำหรับเก็บข้อมูลจากฟอร์ม
  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    type: 'proposal',
    date: ''
  });
  
  // State สำหรับแสดงสถานะการกดบันทึกข้อมูล (ป้องกันการกดเบิ้ล)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // --- Functions ---
  const fetchDocuments = useCallback((projectId: string) => {
    setLoading(true);
    const params = projectId !== 'all' ? { project_id: projectId } : undefined;
    api.get('/index.php?page=get-project-docs', { params })
      .then((res) => {
        if (res.data.status === 'success') {
          const payload = res.data.data;
          if (Array.isArray(payload)) {
            setDocs(payload);
            setProjects([]);
          } else {
            setDocs(payload.docs || []);
            setProjects(payload.projects || []);
          }
        } else {
          console.error(res.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const pending = consumePendingProjectNavigation();
    if (pending?.projectId) {
      setSelectedProjectId(pending.projectId);
      setFormData((prev) => ({
        ...prev,
        project_id: pending.projectId,
        date: prev.date || new Date().toISOString().slice(0, 10),
      }));
      if (pending.action === "create-doc") {
        setIsCreateOpen(true);
      }
      fetchDocuments(pending.projectId);
      return;
    }

    fetchDocuments('all');
  }, [fetchDocuments]);

  const handleProjectFilterChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    fetchDocuments(projectId);
  };

  const handleOpenCreate = () => {
    setFormData((prev) => ({
      ...prev,
      project_id: selectedProjectId !== 'all' ? selectedProjectId : prev.project_id,
      date: prev.date || new Date().toISOString().slice(0, 10),
    }));
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setSelectedFile(null);
    setIsDraggingFile(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropFile = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    setSelectedFile(event.dataTransfer.files?.[0] ?? null);
  };

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { message?: unknown } } }).response;
      if (typeof response?.data?.message === 'string') {
        return response.data.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.project_id || !formData.date) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องครับ");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/index.php?page=create-project-doc', formData);
      if (res.data.status === 'success') {
        const docId = res.data.doc_id;
        let alertMessage = res.data.message;

        if (selectedFile && docId) {
          const uploadData = new FormData();
          uploadData.append('file', selectedFile);
          uploadData.append('document_id', docId.toString());

          try {
            const uploadRes = await api.post('/index.php?page=upload-project-file', uploadData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data.status !== 'success') {
              throw new Error(uploadRes.data.message || 'ระบบไม่สามารถอัปโหลดไฟล์ได้');
            }

            alertMessage = `${res.data.message}\nอัปโหลดไฟล์แนบสำเร็จแล้วครับ!`;
          } catch (uploadError) {
            console.error('Upload failed', uploadError);
            alertMessage = `${res.data.message}\nแต่ไม่สามารถอัปโหลดไฟล์แนบได้: ${getApiErrorMessage(uploadError, 'ระบบไม่สามารถอัปโหลดไฟล์ได้')}`;
          }
        }

        alert(alertMessage);
        setFormData({ name: '', project_id: '', type: 'proposal', date: '' });
        setSelectedFile(null);
        setIsCreateOpen(false);
        fetchDocuments(selectedProjectId);
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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const getFileUrl = (filePath: string) => `${API_BASE_URL}/${filePath.replace(/^\/+/, '')}`;

  if (loading && docs.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">กำลังโหลดข้อมูลเอกสารจากฐานข้อมูล...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight leading-snug">สร้างเอกสารโครงการ</h1>
            <p className="text-muted-foreground">จัดการเอกสารโครงการทั้งหมด</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              สร้างเอกสาร
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-medium">กรองตามโครงการ</label>
              <select
                value={selectedProjectId}
                onChange={(event) => handleProjectFilterChange(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[420px]"
              >
                <option value="all">ทุกโครงการ</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

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
            <CardDescription>ดูและดาวน์โหลดไฟล์เอกสารที่แนบไว้กับโครงการ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      ยังไม่มีข้อมูลเอกสารโครงการถูกบันทึกอยู่ในระบบขณะนี้
                    </TableCell>
                  </TableRow>
                ) : (
                  docs.map((doc) => (
                    <TableRow 
                      key={doc.id}
                      className="transition-colors"
                    >
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
                                onClick={() => window.open(getFileUrl(doc.file_path), '_blank')}
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
                                link.href = getFileUrl(doc.file_path);
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
          <div className="app-dialog-shell app-dialog-2xl bg-card text-card-foreground border rounded-lg shadow-xl">
            
            <div className="app-dialog-fixed p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">สร้างเอกสารโครงการใหม่</h3>
                <p className="text-sm text-muted-foreground mt-1">กรอกข้อมูลเอกสารเพื่อบันทึกเข้าสู่ระบบ</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseCreate} className="h-8 w-8 rounded-md">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="min-h-0 flex flex-1 flex-col">
              <div className="app-dialog-body space-y-4 p-6">
                
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
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">เลือกโครงการ</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">ไฟล์แนบ</label>
                  <label
                    htmlFor="project-doc-file"
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDropFile}
                    className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
                      isDraggingFile
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/60 hover:bg-primary/5'
                    }`}
                  >
                    <UploadCloud className="mb-3 h-8 w-8 text-primary" />
                    <span className="text-sm font-medium">Choose a file or Drag it here</span>
                    {selectedFile && (
                      <span className="mt-2 max-w-full truncate text-xs text-muted-foreground">
                        {selectedFile.name}
                      </span>
                    )}
                  </label>
                  <input
                    id="project-doc-file"
                    type="file"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <p className="text-xs text-muted-foreground">รองรับ PDF, Word, Excel และรูปภาพ ขนาดไม่เกิน 10 MB</p>
                </div>

              </div>

              <div className="app-dialog-fixed p-6 border-t bg-muted/50 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseCreate} disabled={isSubmitting}>
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
