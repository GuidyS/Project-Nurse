import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  iconNode?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, iconNode, title, description, actions, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center text-muted-foreground", className)}>
      {Icon ? <Icon className="mb-3 h-12 w-12" /> : iconNode}
      {title && <p className="font-medium text-foreground">{title}</p>}
      {description && <p className="mt-1 text-sm">{description}</p>}
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
}
