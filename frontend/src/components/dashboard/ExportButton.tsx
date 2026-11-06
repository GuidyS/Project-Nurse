import React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
<<<<<<< HEAD
  data?: Record<string, unknown>[];
=======
  data?: any[];
>>>>>>> b329531cc7f1869e64fcd6d0e7b6039df236ca4c
  reportName?: string;
  className?: string;
  onExport?: () => void;
  onClick?: () => void;
}

<<<<<<< HEAD
const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

const ExportButton: React.FC<ExportButtonProps> = ({
  data = [],
  reportName = "export-data",
  className,
}) => {
  const handleExport = () => {
    if (data.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
=======
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
>>>>>>> b329531cc7f1869e64fcd6d0e7b6039df236ca4c
    }

    const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
    const rows = data.map((row) => headers.map((header) => csvCell(row[header])).join(","));
    const csv = `\uFEFF${headers.map(csvCell).join(",")}\r\n${rows.join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = reportName.replace(/[<>:"/\\|?*]/g, "-").trim();

    link.href = url;
    link.download = `${safeName || "export-data"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("ส่งออกข้อมูลเรียบร้อยแล้ว");
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
