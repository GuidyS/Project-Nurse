import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, Save, Link } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios'; 

interface TargetOption {
  code: string;
  description: string;
}

interface LinkMatrix {
  [projectId: string]: {
    plos: string[];
    ylos: string[];
    clos: string[];
  };
}

export default function ProjectLinks() {
  const [projects, setProjects] = useState<any[]>([]);
  const [plos, setPlos] = useState<TargetOption[]>([]);
  const [ylos, setYlos] = useState<TargetOption[]>([]);
  const [clos, setClos] = useState<TargetOption[]>([]);
  const [links, setLinks] = useState<LinkMatrix>({});
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลผ่าน routing index.php หรือ path ตรง ขึ้นอยู่กับวิธีจัดตั้งค่าหน้าอื่นๆ ของคุณ
    api.get('/index.php?page=get-project-links')
      .then(res => {
        const payload = res.data !== undefined ? res.data : res;
        
        if (payload?.status === 'success') {
          const data = payload.data || {};
          setProjects(data.projects || []);
          setPlos(data.plos || []);
          setYlos(data.ylos || []);
          setClos(data.clos || []);
          setLinks(data.links || {});
          
          if (data.projects && data.projects.length > 0) {
            setSelectedProjectId(data.projects[0].id.toString());
          }
        }
      })
      .catch(err => {
        console.error("เกิดข้อผิดพลาดในการโหลดเมทริกซ์:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCheckboxChange = (type: 'plos' | 'ylos' | 'clos', code: string, checked: boolean) => {
    if (!selectedProjectId) return;

    setLinks(prev => {
      const currentProjectLinks = prev[selectedProjectId] || { plos: [], ylos: [], clos: [] };
      const currentList = Array.isArray(currentProjectLinks[type]) ? currentProjectLinks[type] : [];
      
      let updatedList = [...currentList];

      if (checked) {
        if (!updatedList.includes(code)) updatedList.push(code);
      } else {
        updatedList = updatedList.filter(item => item !== code);
      }

      return {
        ...prev,
        [selectedProjectId]: {
          ...currentProjectLinks,
          [type]: updatedList
        }
      };
    });
  };

  const handleSave = () => {
    if (!selectedProjectId) return;
    setIsSaving(true);

    const payloadData = {
      project_id: selectedProjectId,
      links: links[selectedProjectId] || { plos: [], ylos: [], clos: [] }
    };

    api.post('/index.php?page=save-project-links', payloadData)
      .then(res => {
        const payload = res.data !== undefined ? res.data : res;
        if (payload?.status === 'success') {
          alert('บันทึกข้อมูลการเชื่อมโยงเป้าหมายเรียบร้อยแล้ว!');
        } else {
          alert('เกิดข้อผิดพลาด: ' + (payload?.message || 'ไม่ทราบสาเหตุ'));
        }
      })
      .catch(err => {
        console.error("บันทึกผิดพลาด:", err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">กำลังโหลดโครงสร้างเมทริกซ์...</div>;
  }

  const currentProjectName = projects.find(p => p.id.toString() === selectedProjectId)?.name || '';
  
  const rawLinks: LinkMatrix[string] = links[selectedProjectId] || { plos: [], ylos: [], clos: [] };
  const currentLinks = {
    plos: Array.isArray(rawLinks.plos) ? rawLinks.plos : [],
    ylos: Array.isArray(rawLinks.ylos) ? rawLinks.ylos : [],
    clos: Array.isArray(rawLinks.clos) ? rawLinks.clos : []
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {/* เมนูเลือกโครงการฝั่งซ้าย */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                เลือกโครงการ
              </CardTitle>
              <CardDescription>คลิกเลือกโครงการที่ต้องการจัดพิกัดเป้าหมาย</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id.toString())}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors font-medium ${
                      selectedProjectId === project.id.toString()
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* การแสดงผลสรุปที่เชื่อมโยง */}
          {selectedProjectId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">สรุปผลลัพธ์ที่เชื่อมโยง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-3">
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground">PLO</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLinks.plos.length > 0 ? (
                      currentLinks.plos.map(code => <Badge key={code} variant="secondary">{code}</Badge>)
                    ) : (
                      <span className="text-xs text-muted-foreground">ยังไม่มีการเชื่อมโยง</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground">YLO</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLinks.ylos.length > 0 ? (
                      currentLinks.ylos.map(code => <Badge key={code} variant="secondary">{code}</Badge>)
                    ) : (
                      <span className="text-xs text-muted-foreground">ยังไม่มีการเชื่อมโยง</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground">CLO</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLinks.clos.length > 0 ? (
                      currentLinks.clos.map(code => <Badge key={code} variant="secondary">{code}</Badge>)
                    ) : (
                      <span className="text-xs text-muted-foreground">ยังไม่มีการเชื่อมโยง</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ตารางแสดง Checkbox สำหรับจัดเก็บพิกัดเป้าหมาย */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex-1 mr-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  เมทริกซ์การเชื่อมโยงเป้าหมาย
                </CardTitle>
                <CardDescription className="mt-1 font-medium text-primary">
                  {currentProjectName || 'กรุณาเลือกโครงการด้านซ้าย'}
                </CardDescription>
              </div>
              <Button onClick={handleSave} disabled={!selectedProjectId || isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกพิกัด'}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {selectedProjectId ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ประเภท</TableHead>
                      <TableHead>เป้าหมายระดับหลักสูตรและรายวิชา</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* PLO Row */}
                    <TableRow>
                      <TableCell className="font-bold align-top pt-4">PLO</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {plos.map((plo) => (
                            <div key={plo.code} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50 transition-colors">
                              <Checkbox
                                id={`plo-${plo.code}`}
                                checked={currentLinks.plos?.includes(plo.code) || false}
                                onCheckedChange={(checked) => handleCheckboxChange('plos', plo.code, !!checked)}
                                className="mt-0.5"
                              />
                              <label htmlFor={`plo-${plo.code}`} className="text-sm leading-tight cursor-pointer font-medium select-none text-foreground">
                                {plo.description}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* YLO Row */}
                    <TableRow>
                      <TableCell className="font-bold align-top pt-4">YLO</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {ylos.map((ylo) => (
                            <div key={ylo.code} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50 transition-colors">
                              <Checkbox
                                id={`ylo-${ylo.code}`}
                                checked={currentLinks.ylos?.includes(ylo.code) || false}
                                onCheckedChange={(checked) => handleCheckboxChange('ylos', ylo.code, !!checked)}
                                className="mt-0.5"
                              />
                              <label htmlFor={`ylo-${ylo.code}`} className="text-sm leading-tight cursor-pointer font-medium select-none text-foreground">
                                {ylo.description}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* CLO Row */}
                    <TableRow>
                      <TableCell className="font-bold align-top pt-4">CLO</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {clos.map((clo) => (
                            <div key={clo.code} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50 transition-colors">
                              <Checkbox
                                id={`clo-${clo.code}`}
                                checked={currentLinks.clos?.includes(clo.code) || false}
                                onCheckedChange={(checked) => handleCheckboxChange('clos', clo.code, !!checked)}
                                className="mt-0.5"
                              />
                              <label htmlFor={`clo-${clo}`} className="text-sm leading-tight cursor-pointer font-medium select-none text-foreground">
                                {clo.description}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground p-10">
                  กรุณาเลือกโครงการจากด้านซ้ายมือ
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}