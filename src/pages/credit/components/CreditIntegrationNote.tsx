import { useTranslation } from "react-i18next";
import { HelpHint } from "@/components/shared/HelpHint";

export function CreditIntegrationNote() {
  const { t } = useTranslation();
  return (
    <div
      role="note"
      className="text-muted-foreground flex items-center gap-1 text-sm"
    >
      <span>{t("credit.integration.summary")}</span>
      <HelpHint label={t("credit.integration.title")}>
        {t("credit.pendingIntegration")}
      </HelpHint>
    </div>
  );
}
