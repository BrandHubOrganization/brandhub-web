import { Fragment, type ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Radix reserves "" for "no selection", so an "all" option travels as this sentinel.
const EMPTY = "__all__";

export interface SelectMenuOption {
  value: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  dividerBefore?: boolean;
}

/** Styled single-select (listbox) for filters; the native <select> list cannot be themed. */
export function SelectMenu({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectMenuOption[];
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <SelectPrimitive.Root
      value={value === "" ? EMPTY : value}
      onValueChange={(next) => onChange(next === EMPTY ? "" : next)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "border-input bg-card text-foreground hover:border-foreground/30 focus-visible:outline-ring data-[state=open]:border-brand-orange flex h-9 min-w-36 items-center justify-between gap-2 rounded-lg border px-3 text-xs transition-colors focus-visible:outline-2 disabled:opacity-50",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="text-brand-orange shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <SelectPrimitive.Value />
        </span>
        <SelectPrimitive.Icon className="shrink-0">
          <ChevronDown className="text-muted-foreground size-3.5" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="bg-card text-foreground border-border data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border p-1.5 shadow-xl"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <Fragment key={option.value || EMPTY}>
                {option.dividerBefore && (
                  <SelectPrimitive.Separator className="bg-border/70 -mx-1 my-1 h-px" />
                )}
                <SelectPrimitive.Item
                  value={option.value === "" ? EMPTY : option.value}
                  className="data-[highlighted]:bg-muted/80 data-[state=checked]:bg-brand-orange/10 data-[state=checked]:text-brand-orange relative flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors outline-none select-none data-[state=checked]:font-semibold"
                >
                  {option.icon && <span className="shrink-0">{option.icon}</span>}
                  <span className="min-w-0 truncate">
                    <SelectPrimitive.ItemText>
                      {option.label}
                    </SelectPrimitive.ItemText>
                    {option.hint && (
                      <span className="text-muted-foreground mt-0.5 block font-normal">
                        {option.hint}
                      </span>
                    )}
                  </span>
                </SelectPrimitive.Item>
              </Fragment>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
