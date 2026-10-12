import { Search } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends ComponentPropsWithoutRef<typeof Input> {
  wrapperClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, ...props }, ref) => (
    <div className={cn("relative", wrapperClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input ref={ref} className={cn("pl-9", className)} {...props} />
    </div>
  ),
);

SearchInput.displayName = "SearchInput";
