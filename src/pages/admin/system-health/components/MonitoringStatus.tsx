import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface Props {
  status: string;
}

/** Status always has a text label as well as semantic color. */
export function MonitoringStatus({ status }: Props) {
  const { t } = useTranslation();
  const variant = ["DOWN", "OFFLINE"].includes(status)
    ? "destructive"
    : ["UP", "ONLINE"].includes(status)
      ? "default"
      : "secondary";
  return <Badge variant={variant}>{t("monitoring.status." + status)}</Badge>;
}
