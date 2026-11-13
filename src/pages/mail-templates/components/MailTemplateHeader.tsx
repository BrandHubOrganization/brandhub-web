import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface MailTemplateHeaderProps {
  mode: "create" | "edit";
  templateName?: string;
  showRestored: boolean;
  onRequestClose: () => void;
  onDiscardDraft: () => void;
}

export function MailTemplateHeader({
  mode,
  templateName,
  showRestored,
  onRequestClose,
  onDiscardDraft,
}: MailTemplateHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="border-border border-b pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-foreground text-lg sm:text-xl font-bold tracking-tight">
              {mode === "edit"
                ? t("mailTemplate.form.editTitleWithName", {
                    name: templateName,
                    defaultValue: `Chỉnh sửa mẫu: ${templateName}`,
                  })
                : t("mailTemplate.form.createTitleInline", {
                    defaultValue: "Tạo mẫu email mới",
                  })}
            </h2>
            {mode === "edit" ? (
              <Badge
                variant="outline"
                className="border-brand-orange/40 bg-brand-orange/10 text-brand-orange text-xs font-medium"
              >
                {t("mailTemplate.form.editingBadge", {
                  defaultValue: "Đang chỉnh sửa",
                })}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-normal">
                {t("mailTemplate.form.creatingBadge", {
                  defaultValue: "Mẫu mới",
                })}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {t("mailTemplate.form.variablesHint")}
          </p>
        </div>
        {mode === "edit" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRequestClose}
            className="shrink-0 gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            {t("mailTemplate.form.cancelEdit", {
              defaultValue: "Hủy sửa / Tạo mẫu mới",
            })}
          </Button>
        )}
      </div>

      {showRestored && (
        <div
          role="status"
          className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-xs"
        >
          <span>{t("mailTemplate.draft.restored")}</span>
          <Button
            type="button"
            variant="ghost"
            size="default"
            className="text-brand-orange font-medium"
            onClick={onDiscardDraft}
          >
            {t("mailTemplate.draft.discard")}
          </Button>
        </div>
      )}
    </div>
  );
}
