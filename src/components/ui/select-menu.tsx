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
  disabled?: boolean;
}

export interface SelectMenuProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectMenuOption[];
  ariaLabel: string;
  placeholder?: string;
  prefix?: ReactNode;
  variant?: "default" | "pill" | "subtle";
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
}

/** Standard unified dropdown (single-select listbox) matching BrandHub Design System */
export function SelectMenu({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder,
  prefix,
  variant = "default",
  className,
  contentClassName,
  disabled,
  align = "start",
}: SelectMenuProps) {
  const selectedOption = options.find((o) => o.value === value);
  const isSelectedActive = value !== "" && value !== EMPTY;

  const triggerVariantClass =
    variant === "pill"
      ? "rounded-full h-8 px-3 text-xs"
      : variant === "subtle"
        ? "rounded-xl h-8.5 px-2.5 text-xs border-transparent bg-transparent hover:bg-muted/60"
        : "rounded-xl h-9 px-3 text-xs";

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
          "border-input/80 bg-card text-foreground hover:border-foreground/30 focus-visible:outline-ring data-[state=open]:border-brand-orange inline-flex min-w-36 cursor-pointer items-center justify-between gap-2 border transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50",
          isSelectedActive &&
            "border-brand-orange/40 bg-brand-orange/5 text-foreground font-medium",
          triggerVariantClass,
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left">
          {prefix && (
            <span className="text-muted-foreground shrink-0 text-xs font-normal">
              {prefix}
            </span>
          )}
          {selectedOption?.icon && (
            <span className="text-brand-orange size-3.5 shrink-0 [&>svg]:size-3.5">
              {selectedOption.icon}
            </span>
          )}
          <span className="block min-w-0 flex-1 truncate">
            <SelectPrimitive.Value placeholder={placeholder} />
          </span>
        </span>
        <SelectPrimitive.Icon className="ml-1 shrink-0">
          <ChevronDown className="text-muted-foreground size-3.5 opacity-70 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          align={align}
          className={cn(
            "bg-popover text-popover-foreground border-border/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-[120] max-h-80 min-w-[var(--radix-select-trigger-width,180px)] overflow-hidden rounded-2xl border p-1.5 shadow-2xl",
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="p-0.5">
            {options.map((option) => {
              const isSelected =
                (option.value === "" && (value === "" || value === EMPTY)) ||
                option.value === value;

              return (
                <Fragment key={option.value || EMPTY}>
                  {option.dividerBefore && (
                    <SelectPrimitive.Separator className="bg-border/60 -mx-1 my-1 h-px" />
                  )}
                  <SelectPrimitive.Item
                    value={option.value === "" ? EMPTY : option.value}
                    disabled={option.disabled}
                    className={cn(
                      "group relative flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors outline-none select-none",
                      "data-[highlighted]:bg-muted/80 data-[highlighted]:text-foreground",
                      "data-[state=checked]:bg-[#fff0eb] data-[state=checked]:text-[#ca3d0e] dark:data-[state=checked]:bg-brand-orange/20 dark:data-[state=checked]:text-brand-orange data-[state=checked]:font-semibold",
                      option.disabled && "pointer-events-none opacity-40",
                    )}
                  >
                    {option.icon && (
                      <span
                        className={cn(
                          "size-4 shrink-0 transition-colors [&>svg]:size-4",
                          isSelected
                            ? "text-brand-orange"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {option.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                      {option.hint && (
                        <span className="text-muted-foreground mt-0.5 block text-[11px] font-normal">
                          {option.hint}
                        </span>
                      )}
                    </span>
                  </SelectPrimitive.Item>
                </Fragment>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
