import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function BriefChipGroup({
  label,
  options,
  selected,
  editable,
  onToggle,
  getLabel,
  highlightBrand = false,
  labelClassName,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  editable: boolean;
  onToggle: (value: string) => void;
  getLabel: (value: string) => string;
  highlightBrand?: boolean;
  labelClassName?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-2">
      <Label className={cn("text-brand-orange block text-xs font-semibold", labelClassName)}>
        {label}
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option);
          if (!editable && !active) return null;
          return editable ? (
            <motion.button
              key={option}
              type="button"
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              onClick={() => onToggle(option)}
              aria-pressed={active}
              className={cn(
                "focus-visible:ring-ring/50 inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
                active
                  ? highlightBrand
                    ? "border-brand-orange bg-brand-orange font-semibold text-white shadow-2xs hover:bg-brand-orange/90"
                    : "border-brand-orange/60 bg-brand-orange-soft text-brand-orange font-semibold shadow-2xs"
                  : "border-border/75 bg-muted/30 text-foreground/75 hover:border-border hover:bg-muted/65 hover:text-foreground",
              )}
            >
              {active && <Check className="size-3 shrink-0 stroke-[2.5]" />}
              <span>{getLabel(option)}</span>
            </motion.button>
          ) : (
            <Badge
              key={option}
              variant="secondary"
              className="border-brand-orange/30 bg-brand-orange/12 text-brand-orange border text-[11px] font-semibold"
            >
              {getLabel(option)}
            </Badge>
          );
        })}
        {!editable && selected.length === 0 && (
          <span className="text-muted-foreground text-xs italic">—</span>
        )}
      </div>
    </div>
  );
}

export function BriefSingleChipGroup({
  label,
  options,
  value,
  editable,
  onChange,
  getLabel,
  labelClassName,
}: {
  label: string;
  options: readonly string[];
  value: string;
  editable: boolean;
  onChange: (nextValue: string) => void;
  getLabel: (value: string) => string;
  labelClassName?: string;
}) {
  return (
    <BriefChipGroup
      label={label}
      options={options}
      selected={value ? [value] : []}
      editable={editable}
      onToggle={(option) => onChange(value === option ? "" : option)}
      getLabel={getLabel}
      labelClassName={labelClassName}
    />
  );
}
