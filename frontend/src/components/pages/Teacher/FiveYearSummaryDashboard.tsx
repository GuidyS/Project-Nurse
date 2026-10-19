import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  AlertCircle,
  Award,
  BarChart3,
  BriefcaseBusiness,
  Download,
  FileText,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProgramOption {
  id: number;
  code: string;
  name: string;
}

interface YearlyDataItem {
  year: string;
  graduates: number;
  employmentRespondents: number;
  employedCount: number;
  employmentRate: number;
  licenseFirstAttemptPassed: number;
  licenseWithinOneYearPassed: number;
}

interface FiveYearSummaryResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    yearlyData: Array<Partial<YearlyDataItem> & { year: string }>;
    programs?: ProgramOption[];
    coverage?: SummaryCoverage;
    sourceNotes?: SummarySourceNotes;
  };
}

interface SummaryCoverage {
  unassigned: {
    graduates: number;
    employmentRespondents: number;
    employedCount: number;
    licenseFirstAttemptPassed: number;
    licenseWithinOneYearPassed: number;
  };
  recordsWithoutProgram: number;
}

interface SummarySourceNotes {
  graduateAndEmploymentYear?: string;
  licenseYear?: string;
}

const emptyCoverage: SummaryCoverage = {
  unassigned: {
    graduates: 0,
    employmentRespondents: 0,
    employedCount: 0,
    licenseFirstAttemptPassed: 0,
    licenseWithinOneYearPassed: 0,
  },
  recordsWithoutProgram: 0,
};

function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function normalizeYearlyData(
  rows: Array<Partial<YearlyDataItem> & { year: string }> = [],
): YearlyDataItem[] {
  return rows.map((row) => ({
    year: String(row.year),
    graduates: Number(row.graduates || 0),
    employmentRespondents: Number(row.employmentRespondents || 0),
    employedCount: Number(row.employedCount || 0),
    employmentRate: Number(row.employmentRate || 0),
    licenseFirstAttemptPassed: Number(row.licenseFirstAttemptPassed || 0),
    licenseWithinOneYearPassed: Number(row.licenseWithinOneYearPassed || 0),
  }));
}

export default function FiveYearSummaryDashboard() {
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyDataItem[]>([]);
  const [coverage, setCoverage] = useState<SummaryCoverage>(emptyCoverage);
  const [sourceNotes, setSourceNotes] = useState<SummarySourceNotes>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<FiveYearSummaryResponse>('/index.php?page=get-five-year-summary', {
          params: { program: selectedProgram },
        });
        if (response.data?.status !== 'success' || !response.data.data) {
          throw new Error(response.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
        }
        if (isMounted) {
          setYearlyData(normalizeYearlyData(response.data.data.yearlyData));
          setPrograms(response.data.data.programs || []);
          setCoverage(response.data.data.coverage || emptyCoverage);
          setSourceNotes(response.data.data.sourceNotes || {});
        }
      } catch (loadError: unknown) {
        if (isMounted) {
          setError(apiErrorMessage(loadError, 'ไม่สามารถโหลดข้อมูลสรุป 5 ปีได้'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedProgram]);

  const totals = useMemo(() => {
    const graduates = yearlyData.reduce((sum, row) => sum + Number(row.graduates || 0), 0);
    const employmentRespondents = yearlyData.reduce(
      (sum, row) => sum + Number(row.employmentRespondents || 0),
      0,
    );
    const employedCount = yearlyData.reduce((sum, row) => sum + Number(row.employedCount || 0), 0);
    const employmentRate = employmentRespondents > 0
      ? employedCount / employmentRespondents * 100
      : 0;
    return { graduates, employmentRespondents, employedCount, employmentRate };
  }, [yearlyData]);

  const unassignedTotal = Object.values(coverage.unassigned).reduce((sum, value) => sum + value, 0);

  const exportReport = (format: 'excel' | 'pdf') => {
    const exportRows = yearlyData.map((row) => ({
      'ปีการศึกษา': row.year,
      'บัณฑิต (คน)': row.graduates,
      'ผู้ตอบแบบสำรวจ (คน)': row.employmentRespondents,
      'ผู้มีงานทำ (คน)': row.employedCount,
      'อัตราการมีงานทำ (%)': row.employmentRate,
      'สอบผ่านใบประกอบวิชาชีพครั้งแรก (คน)': row.licenseFirstAttemptPassed,
      'สอบผ่านใบประกอบวิชาชีพภายใน 1 ปี (คน)': row.licenseWithinOneYearPassed,
    }));
    const suffix = selectedProgram === 'all' ? 'all' : `program_${selectedProgram}`;
    const selectedProgramLabel = selectedProgram === 'all'
      ? 'ทุกหลักสูตร'
      : programs.find((program) => String(program.id) === selectedProgram)?.name || 'หลักสูตรที่เลือก';

    if (format === 'excel') {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(exportRows), 'Five Year Summary');
      XLSX.writeFile(workbook, `Five_Year_Summary_${suffix}.xlsx`);
      return;
    }

    const document = new jsPDF('landscape');
    document.text(`Five Year Summary - ${selectedProgramLabel}`, 14, 15);
    autoTable(document, {
      startY: 22,
      head: [['Year', 'Graduates', 'Respondents', 'Employed', 'Employment (%)', 'First-attempt pass', 'Pass within 1 year']],
      body: yearlyData.map((row) => [
        row.year,
        row.graduates,
        row.employmentRespondents,
        row.employedCount,
        `${row.employmentRate}%`,
        row.licenseFirstAttemptPassed,
        row.licenseWithinOneYearPassed,
      ]),
    });
    document.save(`Five_Year_Summary_${suffix}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          ลองใหม่อีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="app-page-header gap-4">
        <div>
          <h1 className="app-page-title">ผลสรุป 5 ปี</h1>
          <p className="app-page-description">สรุปผลการดำเนินงานหลักสูตร 5 ปีย้อนหลัง</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="เลือกหลักสูตร" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหลักสูตร</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={String(program.id)}>{program.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {(unassignedTotal > 0 || coverage.recordsWithoutProgram > 0) && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              {unassignedTotal > 0 && (
                <p>
                  มีข้อมูลที่ยังจัดเข้าปีไม่ได้: บัณฑิต {coverage.unassigned.graduates} คน,
                  ผู้ตอบแบบสำรวจ {coverage.unassigned.employmentRespondents} คน,
                  ผู้มีงานทำ {coverage.unassigned.employedCount} คน,
                  ผ่านครั้งแรก {coverage.unassigned.licenseFirstAttemptPassed} คน และ
                  ผ่านภายใน 1 ปี {coverage.unassigned.licenseWithinOneYearPassed} คน
                </p>
              )}
              {coverage.recordsWithoutProgram > 0 && (
                <p>มีระเบียนที่เกี่ยวข้องกับรายงาน {coverage.recordsWithoutProgram} คนที่ยังไม่ได้ระบุหลักสูตร</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">บัณฑิตรวม 5 ปี</CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.graduates.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการมีงานทำเฉลี่ย</CardTitle>
            <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totals.employmentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">เฉลี่ย 5 ปี</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              จำนวนบัณฑิตและอัตราการมีงานทำ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="people" allowDecimals={false} />
                <YAxis yAxisId="percent" orientation="right" domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="people" dataKey="graduates" name="บัณฑิต (คน)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line yAxisId="percent" type="monotone" dataKey="employmentRate" name="มีงานทำ (%)" stroke="#22c55e" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              {sourceNotes.graduateAndEmploymentYear || 'จัดกลุ่มตามวันที่จบการศึกษา'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              การสอบผ่านใบขึ้นทะเบียนผู้ประกอบวิชาชีพ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="licenseFirstAttemptPassed" name="ผ่านครั้งแรก (คน)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="licenseWithinOneYearPassed" name="ผ่านภายใน 1 ปี (คน)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              {sourceNotes.licenseYear || 'จัดกลุ่มตามวันที่ระบบบันทึกสถานะผ่าน'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
