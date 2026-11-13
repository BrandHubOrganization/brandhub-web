import { useState } from "react";
import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TaskMemberOption } from "@/pages/tasks/types/taskWorkflow";
import { cn } from "@/lib/utils";
export function TimelineAssigneePicker({
  value,
  name,
  options,
  disabled,
  allowEmpty = false,
  labelled = false,
  onChange,
}: {
  value: string | null;
  name?: string;
  options: TaskMemberOption[];
  disabled?: boolean;
  allowEmpty?: boolean;
  labelled?: boolean;
  onChange: (id: string | null) => void | Promise<unknown>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const initials =
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((s) => s[0])
      .join("") || "";
  async function choose(id: string | null) {
    try {
      await onChange(id);
      setOpen(false);
    } catch {
      /* Caller retains errors and current value. */
    }
  }
  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          title={name || t("campaign.timeline.unassigned")}
          aria-label={t("campaign.timeline.assignee")}
          className={cn(
            "h-8 max-w-full min-w-8 gap-2 overflow-hidden px-1",
            labelled && "border-border w-full justify-start border px-2",
          )}
        >
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
              value
                ? "bg-brand-orange-soft text-brand-orange"
                : "border-border text-muted-foreground border border-dashed",
            )}
          >
            {value ? initials : <UserRound className="size-3.5" />}
          </span>
          {labelled && (
            <span className="min-w-0 flex-1 truncate text-left text-xs">
              {name || t("campaign.timeline.assignee")}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <Input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t("campaign.timeline.findMember")}
          placeholder={t("campaign.timeline.findMember")}
          className="mb-2 h-8 text-xs"
        />
        <div
          role="listbox"
          aria-label={t("campaign.timeline.assignee")}
          className="max-h-56 overflow-y-auto"
        >
          {allowEmpty && (
            <Button
              variant="ghost"
              className={cn(
                "h-9 w-full justify-start text-xs",
                !value && "bg-brand-orange-soft text-brand-orange",
              )}
              role="option"
              aria-selected={!value}
              onClick={() => void choose(null)}
            >
              {t("campaign.timeline.unassigned")}
            </Button>
          )}
          {options
            .filter((o) =>
              o.displayName
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase()),
            )
            .map((o) => (
              <Button
                key={o.userId}
                role="option"
                aria-selected={o.userId === value}
                variant="ghost"
                disabled={disabled}
                className={cn(
                  "h-10 w-full justify-start gap-2 text-xs",
                  o.userId === value &&
                    "bg-brand-orange-soft text-brand-orange",
                )}
                onClick={() => void choose(o.userId)}
              >
                <span className="bg-muted flex size-6 items-center justify-center rounded-full text-[10px]">
                  {o.displayName
                    .split(/\s+/)
                    .slice(-2)
                    .map((s) => s[0])
                    .join("")}
                </span>
                <span className="truncate">{o.displayName}</span>
              </Button>
            ))}
          {!options.some((o) =>
            o.displayName
              .toLocaleLowerCase()
              .includes(search.toLocaleLowerCase()),
          ) && (
            <p className="text-muted-foreground p-2 text-xs">
              {t("campaign.timeline.noMembers")}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
