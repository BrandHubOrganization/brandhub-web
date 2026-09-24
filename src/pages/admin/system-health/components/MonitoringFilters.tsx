import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/select";

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
  const options = {
    environment: environments.map((name) => ({ value: name, label: name })),
    serverId: servers.map((server) => ({
      value: server.serverId,
      label: server.name,
    })),
    kind: ["SERVICE", "CONTAINER", "DATABASE", "ENDPOINT"].map((kind) => ({
      value: kind,
      label: t("monitoring.kind." + kind),
    })),
    status: ["UP", "DOWN", "UNKNOWN"].map((status) => ({
      value: status,
      label: t("monitoring.status." + status),
    })),
  };
  const fields: (keyof Filters)[] = health
    ? ["environment", "serverId", "kind", "status"]
    : ["environment", "serverId"];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map((field) => (
        <div key={field} className="space-y-1 text-sm">
          <label htmlFor={"monitoring-" + field}>
            {t("monitoring.filters." + field)}
          </label>
          <Select
            id={"monitoring-" + field}
            value={value[field]}
            onChange={(event) =>
              onChange({ ...value, [field]: event.target.value })
            }
          >
            <option value="">{t("monitoring.all")}</option>
            {options[field].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  );
}
