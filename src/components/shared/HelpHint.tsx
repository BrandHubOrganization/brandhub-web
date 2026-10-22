import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Compact contextual help, accessible by click, touch and keyboard. */
export function HelpHint({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const helpLabel = t("common.helpFor", { label });
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-7 shrink-0 rounded-full"
          aria-label={helpLabel}
          title={helpLabel}
        >
          <CircleHelp aria-hidden className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        role="dialog"
        aria-label={label}
        align="start"
        sideOffset={6}
        className="max-w-[min(20rem,calc(100vw-2rem))] p-3 text-sm leading-6"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
