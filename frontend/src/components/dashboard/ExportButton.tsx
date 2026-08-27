import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ปรับ Interface ให้ตรงกับที่ AuditLog.tsx เรียกใช้
interface ExportButtonProps {
  data?: any[];
  reportName?: string; // เปลี่ยนจาก filename เป็น reportName
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data = [], 
  reportName = "export-data", 
  className 
}) => {
  
  const handleExport = () => {
    if (data.length === 0 && reportName === "Audit-Log") {
       // ถ้าเป็นหน้า Audit Log เราอาจจะอยากแจ้งเตือนผู้ใช้
       console.log("Preparing export for:", reportName);
    }
    alert(`ระบบกำลังเตรียมส่งออกรายงาน: ${reportName}`);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download size={16} />
      <span>ส่งออกข้อมูล</span>
    </Button>
  );
};

export default ExportButton;