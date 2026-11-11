import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Server, Layers, Box, Database, Radio } from "lucide-react";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";

export interface Filters {
  environment: string;
  serverId: string;
  kind: string;
  status: string;
}

interface Props {
  value: Filters;
  onChange: (value: Filters) => void;
  environments: string[];
  servers: { serverId: string; name: string }[];
  health: boolean;
}

export function MonitoringFilters({
  value,
  onChange,
  environments,
  servers,
  health,
}: Props) {
  const { t } = useTranslation();

  const filterOptions: Record<keyof Filters, SelectMenuOption[]> = useMemo(() => {
    const allOption: SelectMenuOption = {
      value: "",
      label: t("monitoring.all"),
    };

    return {
      environment: [
        allOption,
        ...environments.map((name) => ({
          value: name,
          label: name,
          icon: <Globe className="size-3.5 text-muted-foreground" />,
        })),
      ],
      serverId: [
        allOption,
        ...servers.map((server) => ({
          value: server.serverId,
          label: server.name,
          icon: <Server className="size-3.5 text-muted-foreground" />,
        })),
      ],
      kind: [
        allOption,
        {
          value: "SERVICE",
          label: t("monitoring.kind.SERVICE"),
          icon: <Layers className="size-3.5 text-blue-500" />,
        },
        {
          value: "CONTAINER",
          label: t("monitoring.kind.CONTAINER"),
          icon: <Box className="size-3.5 text-cyan-500" />,
        },
        {
          value: "DATABASE",
          label: t("monitoring.kind.DATABASE"),
          icon: <Database className="size-3.5 text-amber-500" />,
        },
        {
          value: "ENDPOINT",
          label: t("monitoring.kind.ENDPOINT"),
          icon: <Radio className="size-3.5 text-emerald-500" />,
        },
      ],
      status: [
        allOption,
        {
          value: "UP",
          label: t("monitoring.status.UP"),
          icon: <span className="size-2 rounded-full bg-emerald-500 shrink-0" />,
        },
        {
          value: "DOWN",
          label: t("monitoring.status.DOWN"),
          icon: <span className="size-2 rounded-full bg-rose-500 shrink-0" />,
        },
        {
          value: "UNKNOWN",
          label: t("monitoring.status.UNKNOWN"),
          icon: <span className="size-2 rounded-full bg-zinc-400 shrink-0" />,
        },
      ],
    };
  }, [environments, servers, t]);

  const fields: (keyof Filters)[] = health
    ? ["environment", "serverId", "kind", "status"]
    : ["environment", "serverId"];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map((field) => (
        <div key={field} className="space-y-1.5">
          <label
            htmlFor={"monitoring-" + field}
            className="block text-xs font-medium text-muted-foreground"
          >
            {t("monitoring.filters." + field)}
          </label>
          <SelectMenu
            value={value[field]}
            onChange={(next) => onChange({ ...value, [field]: next })}
            options={filterOptions[field]}
            ariaLabel={t("monitoring.filters." + field)}
            className="w-full h-9 text-xs font-normal"
          />
        </div>
      ))}
    </div>
  );
}
