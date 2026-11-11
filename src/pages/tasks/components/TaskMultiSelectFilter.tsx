import { useState, useCallback, useMemo, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  dot?: string;
  icon?: ReactNode;
}

export interface TaskMultiSelectFilterProps {
  title: string;
  allLabel: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  ariaLabel?: string;
  className?: string;
}

export function TaskMultiSelectFilter({
  title,
  allLabel,
  selectedValues,
  onChange,
  options,
  ariaLabel,
  className,
}: TaskMultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const isAll = selectedValues.length === 0 || selectedValues.includes("ALL");

  const handleSelectAll = useCallback(() => {
    onChange(["ALL"]);
  }, [onChange]);

  const handleToggleOption = useCallback(
    (value: string) => {
      if (isAll) {
        onChange([value]);
        return;
      }
      let next: string[];
      if (selectedValues.includes(value)) {
        next = selectedValues.filter((v) => v !== value);
      } else {
        next = [...selectedValues.filter((v) => v !== "ALL"), value];
      }
      if (next.length === 0) {
        onChange(["ALL"]);
      } else {
        onChange(next);
      }
    },
    [isAll, selectedValues, onChange],
  );

  const selectedOption = useMemo(() => {
    if (isAll || selectedValues.length !== 1) return null;
    return options.find((o) => o.value === selectedValues[0]);
  }, [isAll, selectedValues, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel || title}
          className={cn(
            "border-border bg-card text-foreground shadow-2xs hover:bg-muted/50 focus-visible:ring-brand-orange/30 focus-visible:border-brand-orange relative inline-flex h-9 min-w-36 items-center justify-between gap-2 rounded-xl border px-3 text-xs font-normal transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:outline-hidden",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left">
            {isAll ? (
              <span className="text-muted-foreground truncate">{allLabel}</span>
            ) : selectedValues.length === 1 && selectedOption ? (
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                {selectedOption.dot && (
                  <span
                    className={cn("size-2 rounded-full shrink-0", selectedOption.dot)}
                  />
                )}
                {selectedOption.icon && (
                  <span className="text-muted-foreground shrink-0 size-3.5">
                    {selectedOption.icon}
                  </span>
                )}
                <span className="truncate">{selectedOption.label}</span>
              </span>
            ) : (
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                <span className="truncate">{title}</span>
                <span className="bg-brand-orange/15 text-brand-orange inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-2xs font-semibold leading-none">
                  {selectedValues.length}
                </span>
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "text-muted-foreground size-3.5 shrink-0 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="border-border bg-card text-foreground z-50 max-h-80 w-56 overflow-y-auto rounded-xl border p-1.5 shadow-xl focus:outline-hidden"
      >
        {/* "Tất cả" option */}
        <button
          type="button"
          onClick={handleSelectAll}
          className={cn(
            "hover:bg-muted/70 active:scale-[0.98] group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-normal transition-all duration-150",
            isAll && "bg-muted/40 font-medium",
          )}
        >
          <div
            className={cn(
              "size-4 rounded border flex items-center justify-center shrink-0 transition-colors",
              isAll
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-border bg-background group-hover:border-muted-foreground/50",
            )}
          >
            {isAll && <Check className="size-3 stroke-[3]" />}
          </div>
          <span className="truncate flex-1">{allLabel}</span>
        </button>

        <div className="border-border my-1 border-t" />

        {/* Options list */}
        <div className="flex flex-col gap-0.5">
          {options.map((opt) => {
            const isChecked = !isAll && selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleToggleOption(opt.value)}
                className={cn(
                  "hover:bg-muted/70 active:scale-[0.98] group flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-normal transition-all duration-150",
                  isChecked && "bg-muted/40 font-medium",
                )}
              >
                <div
                  className={cn(
                    "size-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                    isChecked
                      ? "border-brand-orange bg-brand-orange text-white"
                      : "border-border bg-background group-hover:border-muted-foreground/50",
                  )}
                >
                  {isChecked && <Check className="size-3 stroke-[3]" />}
                </div>
                {opt.dot && (
                  <span className={cn("size-2 rounded-full shrink-0", opt.dot)} />
                )}
                {opt.icon && (
                  <span className="text-muted-foreground size-3.5 shrink-0">
                    {opt.icon}
                  </span>
                )}
                <span className="truncate flex-1">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
