import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // PostStatus variants
        DRAFT: "border-transparent bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
        draft: "border-transparent bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
        PENDING_REVIEW: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        pending_review: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        APPROVED: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
        approved: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
        SCHEDULED: "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
        scheduled: "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
        PUBLISHED: "border-transparent bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
        published: "border-transparent bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
        FAILED: "border-transparent bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
        failed: "border-transparent bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
        REJECTED: "border-transparent bg-red-900 text-red-50 dark:bg-red-950 dark:text-red-200",
        rejected: "border-transparent bg-red-900 text-red-50 dark:bg-red-950 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
