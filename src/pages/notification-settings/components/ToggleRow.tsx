import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

export function ToggleRow({ label, value, onToggle }: ToggleRowProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border/60 flex items-center justify-between border-b py-2.5 last:border-b-0">
      <span className="text-foreground text-xs font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <Badge variant={value ? "PUBLISHED" : "draft"}>
          {value
            ? t("notifications.settings.on")
            : t("notifications.settings.off")}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={onToggle}
        >
          {value
            ? t("notifications.settings.off")
            : t("notifications.settings.on")}
        </Button>
      </div>
    </div>
  );
}

export default ToggleRow;
