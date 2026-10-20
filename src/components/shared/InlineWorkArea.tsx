import { useEffect, useId, useRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InlineWorkArea({
  title,
  description,
  backLabel,
  onBack,
  disabled = false,
  returnFocusTo,
  children,
  id: sectionId,
}: {
  title: string;
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
      className="border-border bg-card w-full min-w-0 space-y-6 rounded-xl border p-4 sm:p-6"
    >
      <header className="border-border space-y-4 border-b pb-5">
        <Button
          variant="outline"
          className="min-h-11"
          onClick={onBack}
          disabled={disabled}
        >
          <ArrowLeft aria-hidden className="size-4" />
          {backLabel}
        </Button>
        <div className="space-y-2">
          <h2
            id={id}
            ref={heading}
            tabIndex={-1}
            className="focus-visible:ring-ring/50 rounded-sm text-xl font-semibold break-words outline-none focus-visible:ring-2"
          >
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground max-w-3xl text-sm leading-6">
              {description}
            </p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
