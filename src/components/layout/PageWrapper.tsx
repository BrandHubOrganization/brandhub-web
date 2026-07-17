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
    <div className={cn("container mx-auto p-4 md:p-8 space-y-6 max-w-6xl pb-24", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 self-start md:self-center shrink-0">{actions}</div>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

export default PageWrapper;
