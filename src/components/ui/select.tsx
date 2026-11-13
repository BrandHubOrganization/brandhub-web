import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Radix reserves "" for "no selection", so empty <option value=""> maps to this sentinel.
const EMPTY_VALUE = "__select_empty__";

interface ParsedOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

function toRadixValue(value: string): string {
  return value === "" ? EMPTY_VALUE : value;
}

function fromRadixValue(value: string): string {
  return value === EMPTY_VALUE ? "" : value;
}

function parseOptionsFromChildren(children: React.ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];

  for (const child of React.Children.toArray(children)) {
    if (!React.isValidElement(child)) continue;

    if (child.type === React.Fragment || child.type === "optgroup") {
      const fragmentProps = child.props as { children?: React.ReactNode };
      options.push(...parseOptionsFromChildren(fragmentProps.children));
      continue;
    }

    if (child.type === "option") {
      const optionProps = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
      const rawValue =
        optionProps.value !== undefined
          ? String(optionProps.value)
          : typeof optionProps.children === "string" ||
              typeof optionProps.children === "number"
            ? String(optionProps.children)
            : "";

      options.push({
        value: rawValue,
        label: optionProps.children,
        disabled: optionProps.disabled,
      });
    }
  }

  return options;
}

export interface SelectProps
  extends Omit<
    React.ComponentPropsWithoutRef<"select">,
    "value" | "defaultValue" | "onChange"
  > {
  wrapperClassName?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      wrapperClassName,
      children,
      value,
      defaultValue,
      onChange,
      onValueChange,
      disabled,
      id,
      name,
      required,
      "aria-label": ariaLabel,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      title,
      ...restProps
    },
    ref,
  ) => {
    const options = React.useMemo(
      () => parseOptionsFromChildren(children),
      [children],
    );

    const radixValue =
      value !== undefined ? toRadixValue(String(value)) : undefined;
    const radixDefaultValue =
      defaultValue !== undefined
        ? toRadixValue(String(defaultValue))
        : undefined;

    const handleValueChange = React.useCallback(
      (nextRadixValue: string) => {
        const nextValue = fromRadixValue(nextRadixValue);
        onValueChange?.(nextValue);

        if (onChange) {
          const syntheticEvent = {
            target: { value: nextValue, name: name ?? "" },
            currentTarget: { value: nextValue, name: name ?? "" },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        }
      },
      [name, onChange, onValueChange],
    );

    return (
      <div className={cn("relative flex w-full items-center", wrapperClassName)}>
        <SelectPrimitive.Root
          value={radixValue}
          defaultValue={radixDefaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          name={name}
          required={required}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={id}
            data-slot="select"
            aria-label={ariaLabel}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            title={title}
            className={cn(
              "border-input bg-input-background dark:bg-input/30 text-foreground flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-1 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm cursor-pointer",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "data-[state=open]:border-brand-orange",
              className,
            )}
            {...(restProps as React.ComponentPropsWithoutRef<
              typeof SelectPrimitive.Trigger
            >)}
          >
            <span className="truncate">
              <SelectPrimitive.Value />
            </span>
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="text-muted-foreground size-4 shrink-0 opacity-60 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              className="bg-popover text-popover-foreground border-border/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-[120] max-h-80 min-w-[var(--radix-select-trigger-width,180px)] overflow-hidden rounded-2xl border p-1.5 shadow-2xl"
            >
              <SelectPrimitive.Viewport className="max-h-72 overflow-y-auto p-0.5">
                {options.map((option, index) => {
                  const mappedValue = toRadixValue(option.value);
                  return (
                    <SelectPrimitive.Item
                      key={`${index}-${mappedValue}`}
                      value={mappedValue}
                      disabled={option.disabled}
                      className="group relative flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs md:text-sm outline-none select-none transition-colors data-[highlighted]:bg-muted/80 data-[highlighted]:text-foreground data-[state=checked]:bg-[#fff0eb] data-[state=checked]:text-[#ca3d0e] dark:data-[state=checked]:bg-brand-orange/20 dark:data-[state=checked]:text-brand-orange data-[state=checked]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  );
                })}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
