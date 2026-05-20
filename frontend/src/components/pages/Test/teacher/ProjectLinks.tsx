import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, Save, Link } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockProjects = [
  { id: '1', name: 'โครงการพัฒนาทักษะการพยาบาล' },
  { id: '2', name: 'โครงการวิจัยการดูแลผู้สูงอายุ' },
];

const plos = ['PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5'];
const ylos = ['YLO1', 'YLO2', 'YLO3', 'YLO4'];
const clos = ['CLO1', 'CLO2', 'CLO3', 'CLO4'];

interface LinkMatrix {
  [projectId: string]: {
    plos: string[];
    ylos: string[];
    clos: string[];
  };
}

const initialLinks: LinkMatrix = {
  '1': { plos: ['PLO1', 'PLO2'], ylos: ['YLO1', 'YLO3'], clos: ['CLO1', 'CLO2'] },
  '2': { plos: ['PLO3', 'PLO4'], ylos: ['YLO2'], clos: ['CLO3'] },
};

export default function ProjectLinks() {
  const [links, setLinks] = useState(initialLinks);
  const [selectedProject, setSelectedProject] = useState('1');

  const toggleLink = (type: 'plos' | 'ylos' | 'clos', value: string) => {
    setLinks(prev => {
      const projectLinks = prev[selectedProject] || { plos: [], ylos: [], clos: [] };
      const currentValues = projectLinks[type];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [selectedProject]: {
          ...projectLinks,
          [type]: newValues,
        },
      };
    });
  };

  const handleSave = () => {
    console.log('Saving links:', links);
  };

  const currentProject = mockProjects.find(p => p.id === selectedProject);
  const currentLinks = links[selectedProject] || { plos: [], ylos: [], clos: [] };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">เชื่อมโยง PLO/YLO/CLO</h1>
            <p className="text-muted-foreground">ระบุการเชื่อมต่อผลลัพธ์การเรียนรู้ของโครงการ</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            บันทึก
          </Button>
        </div>

        {/* Project Selection */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกโครงการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {mockProjects.map((project) => (
                <Button
                  key={project.id}
                  variant={selectedProject === project.id ? 'default' : 'outline'}
                  onClick={() => setSelectedProject(project.id)}
                >
                  {project.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Project Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              {currentProject?.name}
            </CardTitle>
            <CardDescription>เลือก PLO, YLO และ CLO ที่เกี่ยวข้องกับโครงการ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PLO Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Program Learning Outcomes (PLO)</h3>
              <div className="grid grid-cols-5 gap-4">
                {plos.map((plo) => (
                  <div key={plo} className="flex items-center space-x-2">
                    <Checkbox
                      id={plo}
                      checked={currentLinks.plos.includes(plo)}
                      onCheckedChange={() => toggleLink('plos', plo)}
                    />
                    <label htmlFor={plo} className="text-sm font-medium">
                      {plo}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* YLO Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Year Learning Outcomes (YLO)</h3>
              <div className="grid grid-cols-4 gap-4">
                {ylos.map((ylo) => (
                  <div key={ylo} className="flex items-center space-x-2">
                    <Checkbox
                      id={ylo}
                      checked={currentLinks.ylos.includes(ylo)}
                      onCheckedChange={() => toggleLink('ylos', ylo)}
                    />
                    <label htmlFor={ylo} className="text-sm font-medium">
                      {ylo}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* CLO Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Course Learning Outcomes (CLO)</h3>
              <div className="grid grid-cols-4 gap-4">
                {clos.map((clo) => (
                  <div key={clo} className="flex items-center space-x-2">
                    <Checkbox
                      id={clo}
                      checked={currentLinks.clos.includes(clo)}
                      onCheckedChange={() => toggleLink('clos', clo)}
                    />
                    <label htmlFor={clo} className="text-sm font-medium">
                      {clo}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              สรุปการเชื่อมโยง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">PLO ที่เชื่อมโยง</h4>
                <div className="flex flex-wrap gap-2">
                  {currentLinks.plos.length > 0 ? (
                    currentLinks.plos.map((plo) => (
                      <Badge key={plo} variant="outline">{plo}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">ยังไม่ได้เลือก</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">YLO ที่เชื่อมโยง</h4>
                <div className="flex flex-wrap gap-2">
                  {currentLinks.ylos.length > 0 ? (
                    currentLinks.ylos.map((ylo) => (
                      <Badge key={ylo} variant="outline">{ylo}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">ยังไม่ได้เลือก</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">CLO ที่เชื่อมโยง</h4>
                <div className="flex flex-wrap gap-2">
                  {currentLinks.clos.length > 0 ? (
                    currentLinks.clos.map((clo) => (
                      <Badge key={clo} variant="outline">{clo}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">ยังไม่ได้เลือก</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
