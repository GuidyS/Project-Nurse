import type { ReactNode } from "react";

import { BackButton } from "@/components/shared/BackButton";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  backButton?: boolean | {
    label?: string;
    toPage?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function PageHeader({ title, description, actions, backButton, className }: PageHeaderProps) {
  const backButtonProps = typeof backButton === "object" ? backButton : {};

  return (
    <div className={cn("app-page-header", className)}>
      <div className="min-w-0 space-y-2">
        {backButton && <BackButton {...backButtonProps} />}
        <div>
          <h1 className="app-page-title">{title}</h1>
          {description && <p className="app-page-description">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
