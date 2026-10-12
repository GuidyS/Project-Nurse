import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TableStateRowProps {
  colSpan: number;
  children: ReactNode;
  loading?: boolean;
  className?: string;
}

export function TableStateRow({ colSpan, children, loading = false, className }: TableStateRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={cn("h-24 text-center text-muted-foreground", className)}>
        {loading && <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />}
        {children}
      </TableCell>
    </TableRow>
  );
}
