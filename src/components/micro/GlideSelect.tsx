import { useId, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface GlideSelectOption<T extends string> {
  value: T;
  label: ReactNode;
  dotClassName?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface GlideSelectProps<T extends string> {
  options: readonly GlideSelectOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
  contentClassName?: string;
}

/**
 * Popover-backed select with a gliding brand-orange highlight bar that follows
 * pointer hover and active focus smoothly across options.
 */
export function GlideSelect<T extends string>({
  options,
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  disabled = false,
  align = "end",
  triggerClassName,
  contentClassName,
}: GlideSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<T | null>(null);
  const layoutId = useId();
  const reduceMotion = useReducedMotion();

  const current = options.find((opt) => opt.value === value);
  const activeHighlight = hovered ?? value;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setHovered(null);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "border-input bg-background text-foreground hover:border-brand-orange/50 focus-visible:ring-ring/50 inline-flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-2.5 text-xs font-medium shadow-2xs transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
            triggerClassName,
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
            {current?.icon}
            {current?.dotClassName && (
              <span
                aria-hidden="true"
                className={cn("size-1.5 shrink-0 rounded-full", current.dotClassName)}
              />
            )}
            <span className="truncate">
              {current ? current.label : (placeholder ?? "—")}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "text-muted-foreground size-3.5 shrink-0 transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={4}
        className={cn("w-48 p-1", contentClassName)}
      >
        <LayoutGroup id={`glide-${layoutId}`}>
          <motion.div
            role="listbox"
            aria-label={ariaLabel}
            initial={
              reduceMotion ? false : { opacity: 0, scale: 0.97, y: -4 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            onMouseLeave={() => setHovered(null)}
            className="space-y-0.5"
          >
            {options.map((option) => {
              const selected = option.value === value;
              const highlighted = option.value === activeHighlight;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  onMouseEnter={() => setHovered(option.value)}
                  onFocus={() => setHovered(option.value)}
                  onClick={() => {
                    if (option.disabled) return;
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors outline-none disabled:pointer-events-none disabled:opacity-50",
                    selected
                      ? "text-brand-orange font-semibold"
                      : "text-foreground",
                  )}
                >
                  {highlighted && (
                    <motion.span
                      layoutId={`glide-highlight-${layoutId}`}
                      aria-hidden="true"
                      transition={
                        reduceMotion
                          ? { duration: 0.06 }
                          : {
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                              mass: 0.7,
                            }
                      }
                      className="bg-brand-orange-soft/85 absolute inset-0 rounded-md"
                    />
                  )}
                  <span className="relative z-10 inline-flex min-w-0 items-center gap-2 truncate">
                    {option.icon}
                    {option.dotClassName && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          option.dotClassName,
                        )}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {selected && (
                    <Check
                      aria-hidden="true"
                      className="text-brand-orange relative z-10 size-3.5 shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </PopoverContent>
    </Popover>
  );
}
