import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MailTemplateSelector } from "@/components/shared/MailTemplateSelector";

export type InviteEmailLanguage = "vi" | "en";

interface InviteEmailFieldsProps {
  language: InviteEmailLanguage;
  note: string;
  onLanguageChange: (language: InviteEmailLanguage) => void;
  onNoteChange: (note: string) => void;
  agencyId?: string | null;
  workspaceId?: string | null;
  selectedTemplateId?: string | null;
  contextVariables?: {
    agencyName?: string | null;
    workspaceName?: string | null;
    senderName?: string | null;
    inviteeName?: string | null;
    role?: string | null;
  };
}

export function InviteEmailFields({
  language,
  note,
  onLanguageChange,
  onNoteChange,
  agencyId,
  workspaceId,
  selectedTemplateId,
  contextVariables,
}: InviteEmailFieldsProps) {
  const { t, i18n } = useTranslation();
  const noteId = useId();

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-foreground text-xs font-medium">
          {t("agency.members.emailLanguageLabel")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {(["vi", "en"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={language === value ? "orange" : "outline"}
              aria-pressed={language === value}
              onClick={async () => {
                await i18n.loadLanguages(value);
                onLanguageChange(value);
              }}
              className="cursor-pointer"
            >
              {t(
                value === "vi"
                  ? "agency.members.emailLanguageVi"
                  : "agency.members.emailLanguageEn",
              )}
            </Button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          {t("agency.members.emailLanguageHelp")}
        </p>
      </fieldset>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={noteId}
            className="text-foreground block text-xs font-medium"
          >
            {t("agency.members.noteLabel")}
          </label>
          <MailTemplateSelector
            agencyId={agencyId}
            workspaceId={workspaceId}
            scope="AGENCY_INTERNAL"
            selectedTemplateId={selectedTemplateId}
            onSelectNote={onNoteChange}
            contextVariables={contextVariables}
            showPresets={true}
          />
        </div>
        <Textarea
          id={noteId}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={t("agency.members.notePlaceholder", { lng: language })}
          aria-describedby={`${noteId}-help`}
          rows={3}
          className="text-foreground resize-y leading-relaxed font-normal"
        />
        <p id={`${noteId}-help`} className="text-muted-foreground text-xs">
          {t("agency.members.noteHelp")}
        </p>
      </div>
    </div>
  );
}
