import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-current border-t-transparent shrink-0",
  {
    variants: {
      size: {
        sm: "size-4 border-2",
        md: "size-6 border-2",
        lg: "size-8 border-[3px]",
      },
      variant: {
        default: "text-brand-orange",
        muted: "text-muted-foreground",
        white: "text-white",
        current: "text-current",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant, className }))}
      role="status"
      aria-label="loading"
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
