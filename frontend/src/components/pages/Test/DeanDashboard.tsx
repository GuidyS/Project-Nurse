import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudentKPIChart, TeacherKPIChart, RetentionChart, ExitReasonsChart } from "@/components/dashboard/KPIChart";
import { FinancialReport, ExecutiveSummary } from "@/components/dashboard/FinancialReport";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Users, GraduationCap, UserCheck, TrendingUp, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DeanDashboard() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดคณบดี</h1>
            <p className="text-muted-foreground">ภาพรวม KPI และรายงานสำหรับผู้บริหาร</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>ปีการศึกษา 2568</span>
            </div>
            <ExportButton reportName="Dashboard-KPI-Report" />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="นักศึกษาทั้งหมด"
            value="1,245"
            subtitle="เพิ่มขึ้น 45 คนจากปีก่อน"
            icon={GraduationCap}
            trend={{ value: 3.7, isPositive: true }}
          />
          <StatCard
            title="อาจารย์ทั้งหมด"
            value="85"
            subtitle="อาจารย์ประจำ 52, พิเศษ 24, เยี่ยมเยือน 9"
            icon={Users}
          />
          <StatCard
            title="อัตราคงอยู่"
            value="94.2%"
            subtitle="เป้าหมาย: 92%"
            icon={UserCheck}
            trend={{ value: 1.2, isPositive: true }}
          />
          <StatCard
            title="อัตราจบการศึกษา"
            value="89.5%"
            subtitle="เทียบกับเป้าหมาย 88%"
            icon={TrendingUp}
            trend={{ value: 2.1, isPositive: true }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="kpi" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
            <TabsTrigger value="retention">การคงอยู่</TabsTrigger>
            <TabsTrigger value="financial">รายงานการเงิน</TabsTrigger>
          </TabsList>

          {/* KPI Tab */}
          <TabsContent value="kpi" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <StudentKPIChart />
              <TeacherKPIChart />
            </div>
          </TabsContent>

          {/* Retention Tab */}
          <TabsContent value="retention" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <RetentionChart />
              <ExitReasonsChart />
            </div>
          </TabsContent>

          {/* Financial Tab - Sensitive */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FinancialReport />
              </div>
              <div>
                <ExecutiveSummary />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
