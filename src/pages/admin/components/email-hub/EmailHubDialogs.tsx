import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { useAdminEmailHub } from "@/pages/admin/hooks/useAdminEmailHub";

export interface EmailHubDialogsProps {
  hub: ReturnType<typeof useAdminEmailHub>;
}

export function EmailHubDialogs({ hub }: EmailHubDialogsProps) {
  const { t } = useTranslation();
  const templates = hub.systemTemplates?.content ?? [];

  return (
    <>
      <Dialog open={hub.pickerOpen} onOpenChange={hub.setPickerOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-brand-orange size-5" />
              <span>{t("admin.emailHub.pickerTitle")}</span>
            </DialogTitle>
            <DialogDescription>{t("admin.emailHub.pickerDesc")}</DialogDescription>
          </DialogHeader>

          {hub.isTemplatesLoading && (
            <div className="flex h-48 items-center justify-center">
              <Spinner />
            </div>
          )}

          {!hub.isTemplatesLoading && templates.length > 0 && (
            <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-card hover:border-brand-orange flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-semibold">{template.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{template.subject}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="orange"
                    className="h-8 text-xs"
                    onClick={() => void hub.handleApplyTemplate(template)}
                  >
                    <span>{t("admin.emailHub.useThisTemplate")}</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!hub.isTemplatesLoading && templates.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {t("admin.emailHub.noTemplates")}
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={hub.saveAsTemplateOpen} onOpenChange={hub.setSaveAsTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.emailHub.saveTemplateTitle")}</DialogTitle>
            <DialogDescription>{t("admin.emailHub.saveTemplateDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label htmlFor="email-hub-template-name" className="text-xs font-medium">
                {t("admin.emailHub.templateNameLabel")}
              </label>
              <Input
                id="email-hub-template-name"
                placeholder={t("admin.emailHub.templateNamePlaceholder")}
                value={hub.templateName}
                onChange={(event) => hub.setTemplateName(event.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => hub.setSaveAsTemplateOpen(false)}
            >
              {t("common.confirmDialog.cancel")}
            </Button>
            <Button
              variant="orange"
              size="sm"
              disabled={hub.savingTemplate}
              onClick={() => void hub.handleSaveAsTemplate()}
            >
              {hub.savingTemplate && <Spinner className="mr-1.5 size-3.5" />}
              <span>{t("common.confirmDialog.confirm")}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={hub.resetConfirmOpen} onOpenChange={hub.setResetConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("common.confirmDialog.title")}</DialogTitle>
            <DialogDescription>{t("admin.emailHub.confirmReset")}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => hub.setResetConfirmOpen(false)}
            >
              {t("common.confirmDialog.cancel")}
            </Button>
            <Button
              variant="orange"
              size="sm"
              onClick={hub.confirmResetComposer}
            >
              <span>{t("common.confirmDialog.confirm")}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
