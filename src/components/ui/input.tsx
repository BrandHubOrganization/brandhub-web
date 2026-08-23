import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface InputProps extends Omit<
  React.ComponentProps<"input">,
  "prefix"
> {
  label?: string;
  error?: string;
  iconPrefix?: React.ReactNode;
  iconSuffix?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      iconPrefix,
      iconSuffix,
      wrapperClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              "text-xs font-semibold tracking-wide",
              error && "text-destructive",
            )}
          >
            {label}
          </Label>
        )}
        <div className="relative flex w-full items-center">
          {iconPrefix && (
            <div className="text-muted-foreground pointer-events-none absolute left-3 flex items-center [&_svg]:size-4">
              {iconPrefix}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            data-slot="input"
            aria-invalid={!!error}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input bg-input-background flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              iconPrefix && "pl-9",
              iconSuffix && "pr-9",
              error && "border-destructive",
              className,
            )}
            {...props}
          />
          {iconSuffix && (
            <div className="text-muted-foreground pointer-events-none absolute right-3 flex items-center [&_svg]:size-4">
              {iconSuffix}
            </div>
          )}
        </div>
        {error && (
          <p
            className="text-destructive mt-0.5 text-xs leading-none font-medium"
            data-slot="input-error"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
