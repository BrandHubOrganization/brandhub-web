import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Radix reserves "" for "no selection", so an "all" option travels as this sentinel.
const EMPTY = "__all__";

export interface SelectMenuOption {
  value: string;
  label: string;
  hint?: string;
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
  return (
    <SelectPrimitive.Root
      value={value === "" ? EMPTY : value}
      onValueChange={(next) => onChange(next === EMPTY ? "" : next)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          "border-input bg-card text-foreground hover:border-foreground/30 focus-visible:outline-ring data-[state=open]:border-brand-orange flex h-9 min-w-36 items-center justify-between gap-2 rounded-lg border px-3 text-xs transition-colors focus-visible:outline-2 disabled:opacity-50",
          className,
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="bg-card text-foreground border-border data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border p-1 shadow-lg"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value || EMPTY}
                value={option.value === "" ? EMPTY : option.value}
                className="data-[highlighted]:bg-muted data-[state=checked]:text-brand-orange relative flex cursor-pointer items-start gap-2 rounded-lg py-2 pr-3 pl-8 text-xs outline-none select-none data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemIndicator className="absolute top-2 left-2.5">
                  <Check className="size-3.5" />
                </SelectPrimitive.ItemIndicator>
                <span>
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
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
