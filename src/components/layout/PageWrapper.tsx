import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageWrapperProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
}: PageWrapperProps) {
  React.useEffect(() => {
    document.title = `${title} | BrandHub`;
  }, [title]);

  return (
    <div
      className={cn(
        "container mx-auto max-w-6xl space-y-6 p-4 pb-24 md:p-8",
        className,
      )}
    >
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-foreground font-sans text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
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
