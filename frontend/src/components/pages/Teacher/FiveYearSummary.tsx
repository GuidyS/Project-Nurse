import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, TrendingDown, Minus, BarChart3, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import api from '@/lib/axios';

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function FiveYearSummary() {
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFiveYearSummary = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/index.php?page=get-five-year-summary');
        if (response.data && response.data.status === 'success') {
          setYearlyData(response.data.data.yearlyData || []);
          setCourseData(response.data.data.courseData || []);
        }
      } catch (error) {
        console.error('Failed to fetch five year summary data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiveYearSummary();
  }, []);

  const handleExport = (format: string) => {
    console.log('Exporting as:', format);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ploChartData = yearlyData.map(y => ({
    year: y.year,
    'PLO1: ความรู้': Number(y.plo1 || 0),
    'PLO2: ทักษะ': Number(y.plo2 || 0),
    'PLO3: จริยธรรม': Number(y.plo3 || 0),
    'PLO4: สื่อสาร': Number(y.plo4 || 0),
    'PLO5: เทคโนโลยี': Number(y.plo5 || 0),
  }));

  const totalGraduates = yearlyData.reduce((acc, y) => acc + Number(y.graduates || 0), 0);
  
  const avgEmploymentRate = yearlyData.length > 0
    ? (yearlyData.reduce((acc, y) => acc + Number(y.employmentRate || 0), 0) / yearlyData.length).toFixed(1)
    : '0.0';

  const avgGPAVal = yearlyData.length > 0
    ? (yearlyData.reduce((acc, y) => acc + Number(y.avgGPA || 0), 0) / yearlyData.length).toFixed(2)
    : '0.00';

  const years = yearlyData.map(d => d.year);

  // คำนวณแนวโน้ม PLO เฉลี่ยรวม
  const getPloTrend = () => {
    if (yearlyData.length < 2) {
      return { 
        text: 'คงที่', 
        icon: <Minus className="h-6 w-6 text-muted-foreground" />, 
        color: 'text-muted-foreground', 
        subtitle: 'ยังไม่มีข้อมูลเพียงพอ' 
      };
    }

    // หาเฉลี่ย PLO รวมของแต่ละปี
    const avgPlos = yearlyData.map(y => {
      const sum = Number(y.plo1 || 0) + Number(y.plo2 || 0) + Number(y.plo3 || 0) + Number(y.plo4 || 0) + Number(y.plo5 || 0);
      return sum / 5;
    });

    const latest = avgPlos[avgPlos.length - 1];
    const previous = avgPlos[avgPlos.length - 2];

    if (latest === 0 && previous === 0) {
      return { 
        text: 'ไม่มีข้อมูล', 
        icon: <Minus className="h-6 w-6 text-muted-foreground" />, 
        color: 'text-muted-foreground', 
        subtitle: 'ยังไม่มีประวัติการประเมิน PLO' 
      };
    }

    if (latest > previous) {
      return { 
        text: 'ดีขึ้น', 
        icon: <TrendingUp className="h-6 w-6 text-green-500" />, 
        color: 'text-green-600', 
        subtitle: 'ผลลัพธ์การเรียนรู้เฉลี่ยดีขึ้น' 
      };
    } else if (latest < previous) {
      return { 
        text: 'ลดลง', 
        icon: <TrendingDown className="h-6 w-6 text-destructive" />, 
        color: 'text-destructive', 
        subtitle: 'ผลลัพธ์การเรียนรู้เฉลี่ยลดลง' 
      };
    } else {
      return { 
        text: 'คงที่', 
        icon: <Minus className="h-6 w-6 text-muted-foreground" />, 
        color: 'text-muted-foreground', 
        subtitle: 'ผลลัพธ์การเรียนรู้ทรงตัว' 
      };
    }
  };

  const ploTrend = getPloTrend();

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ผลสรุป 5 ปี</h1>
            <p className="text-muted-foreground">สรุปผลการดำเนินงานหลักสูตร 5 ปีย้อนหลัง</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เลือกหลักสูตร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหลักสูตร</SelectItem>
                <SelectItem value="nursing">พยาบาลศาสตร์</SelectItem>
                <SelectItem value="public_health">สาธารณสุขศาสตร์</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">บัณฑิตรวม 5 ปี</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalGraduates.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราการมีงานทำเฉลี่ย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {avgEmploymentRate}%
              </div>
              <p className="text-xs text-muted-foreground">เฉลี่ย 5 ปี</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPA เฉลี่ย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgGPAVal}
              </div>
              <p className="text-xs text-muted-foreground">เฉลี่ย 5 ปี</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แนวโน้ม PLO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {ploTrend.icon}
                <span className={`text-2xl font-bold ${ploTrend.color}`}>{ploTrend.text}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ploTrend.subtitle}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                จำนวนบัณฑิตและอัตราการมีงานทำ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="graduates" name="บัณฑิต (คน)" fill="hsl(var(--primary))" />
                  <Line yAxisId="right" type="monotone" dataKey="employmentRate" name="มีงานทำ (%)" stroke="#22c55e" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                แนวโน้มผลลัพธ์การเรียนรู้ (PLO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ploChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="PLO1: ความรู้" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="PLO2: ทักษะ" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="PLO3: จริยธรรม" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="PLO4: สื่อสาร" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="PLO5: เทคโนโลยี" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Course Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>สรุปผลรายวิชา 5 ปี</CardTitle>
            <CardDescription>เกรดเฉลี่ยรายวิชาย้อนหลัง 5 ปี</CardDescription>
          </CardHeader>
          <CardContent>
            {courseData.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">ไม่พบรายวิชาที่สอนในฐานข้อมูลหลักสูตรที่เลือก</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสวิชา</TableHead>
                    <TableHead>ชื่อวิชา</TableHead>
                    {years.map((y) => (
                      <TableHead key={y} className="text-center">{y}</TableHead>
                    ))}
                    <TableHead className="text-center">แนวโน้ม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseData.map((course) => (
                    <TableRow key={course.code}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      {years.map((y) => (
                        <TableCell key={y} className="text-center">
                          {Number(course['y' + y] || 0).toFixed(2)}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(course.trend)}
                          <Badge
                            variant={
                              course.trend === 'up'
                                ? 'default'
                                : course.trend === 'down'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {course.trend === 'up' ? 'ดีขึ้น' : course.trend === 'down' ? 'ลดลง' : 'คงที่'}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Yearly Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>ตารางสรุปรายปี</CardTitle>
            <CardDescription>ข้อมูลสรุปรายปีการศึกษา</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ปีการศึกษา</TableHead>
                  <TableHead className="text-center">บัณฑิต</TableHead>
                  <TableHead className="text-center">มีงานทำ (%)</TableHead>
                  <TableHead className="text-center">GPA เฉลี่ย</TableHead>
                  <TableHead className="text-center">PLO1</TableHead>
                  <TableHead className="text-center">PLO2</TableHead>
                  <TableHead className="text-center">PLO3</TableHead>
                  <TableHead className="text-center">PLO4</TableHead>
                  <TableHead className="text-center">PLO5</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyData.map((year) => (
                  <TableRow key={year.year}>
                    <TableCell className="font-medium">{year.year}</TableCell>
                    <TableCell className="text-center">{year.graduates}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={year.employmentRate >= 90 ? 'bg-green-500' : 'bg-yellow-500'}>
                        {year.employmentRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{year.avgGPA.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{year.plo1}%</TableCell>
                    <TableCell className="text-center">{year.plo2}%</TableCell>
                    <TableCell className="text-center">{year.plo3}%</TableCell>
                    <TableCell className="text-center">{year.plo4}%</TableCell>
                    <TableCell className="text-center">{year.plo5}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
