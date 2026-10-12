import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ComponentPropsWithoutRef } from "react";

import { Button } from "@/components/ui/button";
import { navigateToPage } from "@/lib/projectNavigation";

interface BackButtonProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "onClick"> {
  label?: string;
  toPage?: string;
  onClick?: () => void;
}

export function BackButton({
  label = "ย้อนกลับ",
  toPage,
  onClick,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (toPage) {
      navigateToPage(toPage);
      return;
    }

    navigate(-1);
  };

  return (
    <Button variant={variant} size={size} className={className ?? "gap-2"} onClick={handleClick} {...props}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
