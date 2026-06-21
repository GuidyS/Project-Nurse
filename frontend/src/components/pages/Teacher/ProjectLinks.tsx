import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, Save, Link } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LinkMatrix {
  [projectId: string]: {
    plos: string[];
    ylos: string[];
    clos: string[];
  };
}

export default function ProjectLinks() {
  const [projects, setProjects] = useState<any[]>([]);
  const [plos, setPlos] = useState<string[]>([]);
  const [ylos, setYlos] = useState<string[]>([]);
  const [clos, setClos] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkMatrix>({});
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. โหลดข้อมูลเมทริกซ์การเชื่อมโยงจากหลังบ้าน
  useEffect(() => {
    fetch('/api/get_project_links.php')
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setProjects(res.data.projects);
          setPlos(res.data.plos);
          setYlos(res.data.ylos);
          setClos(res.data.clos);
          setLinks(res.data.links);
          if (res.data.projects.length > 0) {
            setSelectedProjectId(res.data.projects[0].id.toString());
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("เกิดข้อผิดพลาดในการโหลดเมทริกซ์:", err);
        setLoading(false);
      });
  }, []);

  // 2. จัดการเมื่อมีการติ๊กเลือก Checkbox ในตาราง
  const handleCheckboxChange = (type: 'plos' | 'ylos' | 'clos', code: string, checked: boolean) => {
    if (!selectedProjectId) return;

    setLinks(prev => {
      const currentProjectLinks = prev[selectedProjectId] || { plos: [], ylos: [], clos: [] };
      let updatedList = [...currentProjectLinks[type]];

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

  // 3. ฟังก์ชันส่งข้อมูลความเชื่อมโยงกลับไปบันทึกลงฐานข้อมูล
  const handleSave = () => {
    if (!selectedProjectId) return;
    setIsSaving(true);

    fetch('/api/save_project_links.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: selectedProjectId,
        links: links[selectedProjectId] || { plos: [], ylos: [], clos: [] }
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          alert('บันทึกข้อมูลการเชื่อมโยงเป้าหมายเรียบร้อยแล้ว!');
        } else {
          alert('เกิดข้อผิดพลาด: ' + res.message);
        }
        setIsSaving(false);
      })
      .catch(err => {
        console.error("บันทึกผิดพลาด:", err);
        setIsSaving(false);
      });
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">กำลังโหลดโครงสร้างเมทริกซ์...</div>;
  }

  const currentProjectName = projects.find(p => p.id.toString() === selectedProjectId)?.name || '';
  const currentLinks = links[selectedProjectId] || { plos: [], ylos: [], clos: [] };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {/* คอลัมน์ซ้าย: รายชื่อโครงการ */}
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

          {/* สรุปเป้าหมายที่เชื่อมโยงอยู่ปัจจุบัน */}
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
        </div>

        {/* คอลัมน์ขวา: ตารางจับคู่ความเชื่อมโยง Matrix */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">ประเภทผลลัพธ์</TableHead>
                    <TableHead>เป้าหมายระดับหลักสูตรและรายวิชา</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* ตารางส่วน PLO */}
                  <TableRow>
                    <TableCell className="font-bold align-top pt-4">PLO</TableCell>
                    <TableCell>
                      <div className="grid grid-cols-2 gap-4">
                        {plos.map((plo) => (
                          <div key={plo} className="flex items-start space-x-2 p-1.5 rounded hover:bg-muted/50">
                            <Checkbox
                              id={`plo-${plo}`}
                              checked={currentLinks.plos.includes(plo)}
                              onCheckedChange={(checked) => handleCheckboxChange('plos', plo, !!checked)}
                            />
                            <label id={`label-plo-${plo}`} htmlFor={`plo-${plo}`} className="text-sm leading-none cursor-pointer font-medium select-none">
                              {plo}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* ตารางส่วน YLO */}
                  <TableRow>
                    <TableCell className="font-bold align-top pt-4">YLO</TableCell>
                    <TableCell>
                      <div className="grid grid-cols-2 gap-4">
                        {ylos.map((ylo) => (
                          <div key={ylo} className="flex items-start space-x-2 p-1.5 rounded hover:bg-muted/50">
                            <Checkbox
                              id={`ylo-${ylo}`}
                              checked={currentLinks.ylos.includes(ylo)}
                              onCheckedChange={(checked) => handleCheckboxChange('ylos', ylo, !!checked)}
                            />
                            <label id={`label-ylo-${ylo}`} htmlFor={`ylo-${ylo}`} className="text-sm leading-none cursor-pointer font-medium select-none">
                              {ylo}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* ตารางส่วน CLO */}
                  <TableRow>
                    <TableCell className="font-bold align-top pt-4">CLO</TableCell>
                    <TableCell>
                      <div className="grid grid-cols-2 gap-4">
                        {clos.map((clo) => (
                          <div key={clo} className="flex items-start space-x-2 p-1.5 rounded hover:bg-muted/50">
                            <Checkbox
                              id={`clo-${clo}`}
                              checked={currentLinks.clos.includes(clo)}
                              onCheckedChange={(checked) => handleCheckboxChange('clos', clo, !!checked)}
                            />
                            <label id={`label-clo-${clo}`} htmlFor={`clo-${clo}`} className="text-sm leading-none cursor-pointer font-medium select-none">
                              {clo}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}