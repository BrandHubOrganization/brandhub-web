import { useEffect, useId, useRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function InlineWorkArea({
  title,
  className,
  compactHeader = false,
  headerActions,
  description,
  backLabel,
  onBack,
  disabled = false,
  returnFocusTo,
  children,
  id: sectionId,
}: {
  title: string;
  className?: string;
  compactHeader?: boolean;
  headerActions?: ReactNode;
  description?: string;
  backLabel: string;
  onBack: () => void;
  disabled?: boolean;
  returnFocusTo?: string;
  children: ReactNode;
  id?: string;
}) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const restoreFrame = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (restoreFrame.current !== undefined)
      cancelAnimationFrame(restoreFrame.current);
    const frame = requestAnimationFrame(() => heading.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      if (returnFocusTo)
        restoreFrame.current = requestAnimationFrame(() =>
          document.querySelector<HTMLElement>(returnFocusTo)?.focus(),
        );
    };
  }, [returnFocusTo]);
  return (
    <section
      id={sectionId}
      role="region"
      aria-labelledby={id}
      className={cn(
        "border-border bg-card w-full min-w-0 space-y-6 rounded-xl border p-4 sm:p-6",
        className,
      )}
    >
      <header
        className={
          headerActions
            ? "border-border flex shrink-0 items-center gap-2 border-b pb-1"
            : compactHeader
              ? "flex shrink-0 flex-wrap items-center justify-between gap-3"
              : "border-border space-y-4 border-b pb-5"
        }
      >
        <Button
          variant="outline"
          className={
            headerActions
              ? "size-11 shrink-0 p-0 sm:size-9"
              : compactHeader
                ? "order-2 ml-auto min-h-11"
                : "min-h-11"
          }
          aria-label={headerActions ? backLabel : undefined}
          title={headerActions ? backLabel : undefined}
          onClick={onBack}
          disabled={disabled}
        >
          <ArrowLeft aria-hidden className="size-4" />
          {!headerActions && backLabel}
        </Button>
        <div className={headerActions ? "min-w-0 flex-1" : "space-y-2"}>
          <h2
            id={id}
            ref={heading}
            tabIndex={-1}
            className={cn(
              "focus-visible:ring-ring/50 rounded-sm font-semibold break-words outline-none focus-visible:ring-2",
              headerActions ? "line-clamp-2 text-sm leading-5" : "text-xl",
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground max-w-3xl text-sm leading-6">
              {description}
            </p>
          )}
        </div>
        {headerActions && (
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
          </div>
        )}
      </header>
      {children}
    </section>
  );
}
