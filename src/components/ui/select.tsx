import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

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
              "border-input bg-input-background dark:bg-input/30 text-foreground flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
              <ChevronDown className="text-muted-foreground size-4 shrink-0 opacity-60" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              className="bg-popover text-popover-foreground border-border data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-[110] max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border p-1.5 shadow-xl"
            >
              <SelectPrimitive.Viewport className="max-h-72 overflow-y-auto">
                {options.map((option, index) => {
                  const mappedValue = toRadixValue(option.value);
                  return (
                    <SelectPrimitive.Item
                      key={`${index}-${mappedValue}`}
                      value={mappedValue}
                      disabled={option.disabled}
                      className="relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=checked]:bg-brand-orange/10 data-[state=checked]:text-brand-orange data-[state=checked]:font-medium data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <SelectPrimitive.ItemText>
                        {option.label}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator>
                        <Check className="size-3.5 shrink-0" />
                      </SelectPrimitive.ItemIndicator>
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
