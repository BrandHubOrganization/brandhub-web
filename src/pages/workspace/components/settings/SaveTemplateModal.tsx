import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IndustrySpecificFields } from "../IndustrySpecificFields";
import type { WorkspaceIndustry } from "@/types/workspace";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  onTemplateNameChange: (val: string) => void;
  industry?: WorkspaceIndustry | "";
  templateIndustryFields: Record<string, unknown>;
  onIndustryFieldsChange: (fields: Record<string, unknown>) => void;
  saving: boolean;
  onSave: () => Promise<void>;
}

export function SaveTemplateModal({
  isOpen,
  onClose,
  templateName,
  onTemplateNameChange,
  industry,
  templateIndustryFields,
  onIndustryFieldsChange,
  saving,
  onSave,
}: SaveTemplateModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="border-border bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
        <h3 className="text-foreground text-sm font-semibold">
          {t("workspace.settings.template.dialogTitle")}
        </h3>
        <Input
          label={t("workspace.settings.template.nameLabel")}
          value={templateName}
          onChange={(e) => onTemplateNameChange(e.target.value)}
          placeholder={t("workspace.settings.template.namePlaceholder")}
        />
        <IndustrySpecificFields
          industry={industry}
          value={templateIndustryFields}
          onChange={onIndustryFieldsChange}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("workspace.settings.danger.cancel")}
          </Button>
          <Button
            variant="orange"
            size="sm"
            loading={saving}
            disabled={!templateName.trim() || saving}
            onClick={onSave}
          >
            {t("workspace.settings.template.saveButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
