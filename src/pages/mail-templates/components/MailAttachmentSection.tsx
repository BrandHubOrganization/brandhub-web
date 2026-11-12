import { Paperclip, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { MailAttachment } from "@/pages/mail-templates/types";

export interface MailAttachmentSectionProps {
  attachments: MailAttachment[];
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  disabled?: boolean;
}

export function MailAttachmentSection({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  disabled = false,
}: MailAttachmentSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {t("mailTemplate.form.attachments")}
        </span>
        <label
          className={`text-brand-orange text-xs font-medium ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          <Paperclip className="mr-1 inline size-3.5" />
          {t("mailTemplate.form.addAttachment")}
          <input
            type="file"
            className="hidden"
            data-testid="mail-attachment-input"
            disabled={disabled}
            accept=".pdf,.png,.jpg,.jpeg,.gif,.docx,.xlsx,.pptx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onAddAttachment(file);
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="text-muted-foreground text-xs">
        {t("mailTemplate.form.attachmentRules")}
      </p>
      {attachments.length > 0 && (
        <ul className="space-y-1">
          {attachments.map((a) => (
            <li
              key={a.attachmentId}
              className="bg-muted/50 flex items-center justify-between rounded px-2 py-1"
            >
              <span className="truncate">
                {a.name}{" "}
                <span className="text-muted-foreground text-xs">
                  ({Math.ceil(a.size / 1024)} KB)
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="default"
                disabled={disabled}
                aria-label={t("mailTemplate.form.removeAttachment", {
                  name: a.name,
                })}
                onClick={() => onRemoveAttachment(a.attachmentId)}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
