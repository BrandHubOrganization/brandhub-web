import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectProps extends React.ComponentProps<"select"> {
  wrapperClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => (
    <div className={cn("relative flex w-full items-center", wrapperClassName)}>
      <select
        ref={ref}
        data-slot="select"
        className={cn(
          "border-input bg-input-background text-foreground flex h-9 w-full min-w-0 appearance-none rounded-md border px-3 py-1 pr-8 text-base transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute right-3 size-3.5 shrink-0" />
    </div>
  ),
);
Select.displayName = "Select";

export { Select };
