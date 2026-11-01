import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  data?: any[];
  reportName?: string;
  className?: string;
  onExport?: () => void;
  onClick?: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data = [], 
  reportName = "export-data", 
  className,
  onExport,
  onClick,
}) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    if (onClick) {
      onClick();
      return;
    }
    if (data.length === 0 && reportName === "Audit-Log") {
       console.log("Preparing export for:", reportName);
    }
    alert(`ระบบกำลังเตรียมส่งออกรายงาน: ${reportName}`);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      className={`flex items-center gap-2 ${className || ""}`}
    >
      <Download size={16} />
      <span>ส่งออกข้อมูล</span>
    </Button>
  );
};

export default ExportButton;