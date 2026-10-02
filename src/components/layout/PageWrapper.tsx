import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageWrapperProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
  compact = false,
}: PageWrapperProps) {
  React.useEffect(() => {
    document.title = `${title} | BrandHub`;
  }, [title]);

  return (
    <div
      className={cn(
        "container mx-auto max-w-6xl space-y-6 p-4 pb-24 md:p-8",
        compact &&
          "space-y-3 p-3 pb-24 md:px-5 md:py-4 md:pb-24",
        className,
      )}
    >
      <div
        className={cn(
          "border-border flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center",
          compact && "gap-3 pb-3",
        )}
      >
        <div className="space-y-1">
          <h1
            className={cn(
              "text-foreground font-sans text-3xl font-bold tracking-tight",
              compact && "text-2xl",
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "text-muted-foreground text-sm",
                compact && "text-xs",
              )}
            >
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
            {actions}
          </div>
        )}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

export default PageWrapper;
