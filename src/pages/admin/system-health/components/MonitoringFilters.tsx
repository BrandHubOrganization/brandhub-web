import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Check,
  Database,
  Filter,
  Globe,
  Layers,
  Radio,
  RotateCcw,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Filters {
  environment: string;
  serverId: string;
  kind: string;
  status: string;
}

interface FilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface Props {
  value: Filters;
  onChange: (value: Filters) => void;
  environments: string[];
  servers: { serverId: string; name: string }[];
  health: boolean;
}

const CATEGORY_ICONS: Record<keyof Filters, ReactNode> = {
  environment: <Globe className="size-3.5 shrink-0" />,
  serverId: <Server className="size-3.5 shrink-0" />,
  kind: <Layers className="size-3.5 shrink-0" />,
  status: <Radio className="size-3.5 shrink-0" />,
};

export function MonitoringFilters({
  value,
  onChange,
  environments,
  servers,
  health,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<keyof Filters>("environment");

  const fields: (keyof Filters)[] = health
    ? ["environment", "serverId", "kind", "status"]
    : ["environment", "serverId"];

  const currentCategory: keyof Filters = fields.includes(activeCategory)
    ? activeCategory
    : "environment";

  const filterOptions: Record<keyof Filters, FilterOption[]> = useMemo(() => {
    const allOption: FilterOption = { value: "", label: t("monitoring.all") };
    return {
      environment: [
        allOption,
        ...environments.map((name) => ({
          value: name,
          label: name,
          icon: <Globe className="text-muted-foreground size-3.5 shrink-0" />,
        })),
      ],
      serverId: [
        allOption,
        ...servers.map((server) => ({
          value: server.serverId,
          label: server.name,
          icon: <Server className="text-muted-foreground size-3.5 shrink-0" />,
        })),
      ],
      kind: [
        allOption,
        { value: "SERVICE", label: t("monitoring.kind.SERVICE"), icon: <Layers className="size-3.5 shrink-0 text-blue-500" /> },
        { value: "CONTAINER", label: t("monitoring.kind.CONTAINER"), icon: <Box className="size-3.5 shrink-0 text-cyan-500" /> },
        { value: "DATABASE", label: t("monitoring.kind.DATABASE"), icon: <Database className="size-3.5 shrink-0 text-amber-500" /> },
        { value: "ENDPOINT", label: t("monitoring.kind.ENDPOINT"), icon: <Radio className="size-3.5 shrink-0 text-emerald-500" /> },
      ],
      status: [
        allOption,
        { value: "UP", label: t("monitoring.status.UP"), icon: <span className="size-2 shrink-0 rounded-full bg-emerald-500" /> },
        { value: "DOWN", label: t("monitoring.status.DOWN"), icon: <span className="size-2 shrink-0 rounded-full bg-rose-500" /> },
        { value: "UNKNOWN", label: t("monitoring.status.UNKNOWN"), icon: <span className="bg-muted-foreground/60 size-2 shrink-0 rounded-full" /> },
      ],
    };
  }, [environments, servers, t]);

  const activeCount = fields.filter((f) => Boolean(value[f])).length;

  const resetAll = () =>
    onChange({ environment: "", serverId: "", kind: "", status: "" });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 text-xs transition-transform duration-150 active:scale-[0.97]"
        >
          <Filter className="size-3.5" />
          <span>{t("monitoring.filters.button", { defaultValue: "Bộ lọc" })}</span>
          {activeCount > 0 && (
            <span className="bg-brand-orange text-primary-foreground inline-flex size-4 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        avoidCollisions
        collisionPadding={16}
        className="w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
      >
        <div className="flex min-h-[210px]">
          <div className="border-border bg-muted/30 w-[148px] shrink-0 space-y-0.5 border-r p-1.5">
            {fields.map((field) => {
              const isSelected = currentCategory === field;
              const hasValue = Boolean(value[field]);
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => setActiveCategory(field)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors duration-150",
                    isSelected
                      ? "border-l-brand-orange bg-background text-foreground rounded-l-none border-y-0 border-r-0 border-l-2 font-medium shadow-xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {CATEGORY_ICONS[field]}
                    <span className="truncate">{t("monitoring.filters." + field)}</span>
                  </span>
                  {hasValue && (
                    <span className="bg-brand-orange size-1.5 shrink-0 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between p-2">
            <div className="max-h-[220px] space-y-0.5 overflow-y-auto">
              {filterOptions[currentCategory].map((opt) => {
                const selected = value[currentCategory] === opt.value;
                return (
                  <button
                    key={opt.value || "__all__"}
                    type="button"
                    onClick={() =>
                      onChange({ ...value, [currentCategory]: opt.value })
                    }
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors duration-150",
                      selected
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-foreground hover:bg-accent/50",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {opt.icon}
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {selected && (
                      <Check className="text-brand-orange size-3.5 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {activeCount > 0 && (
              <div className="border-border mt-2 flex justify-end border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAll}
                  className="text-muted-foreground hover:text-foreground h-7 gap-1.5 px-2 text-xs"
                >
                  <RotateCcw className="size-3" />
                  <span>{t("common.reset", { defaultValue: "Đặt lại" })}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
