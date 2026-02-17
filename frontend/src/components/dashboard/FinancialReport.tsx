import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FinancialReport = () => (
  <Card>
    <CardHeader><CardTitle>สรุปงบประมาณคณะ</CardTitle></CardHeader>
    <CardContent>แสดงข้อมูลรายรับ-รายจ่าย...</CardContent>
  </Card>
);

export const ExecutiveSummary = () => (
  <Card className="bg-primary text-primary-foreground">
    <CardContent className="pt-6">
      <h3 className="font-bold text-lg">บทสรุปผู้บริหาร</h3>
      <p className="text-sm opacity-90">ภาพรวมการดำเนินงานของคณะพยาบาลศาสตร์เดือนนี้...</p>
    </CardContent>
  </Card>
);