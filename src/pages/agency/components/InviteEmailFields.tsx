import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type InviteEmailLanguage = "vi" | "en";

interface InviteEmailFieldsProps {
  language: InviteEmailLanguage;
  note: string;
  onLanguageChange: (language: InviteEmailLanguage) => void;
  onNoteChange: (note: string) => void;
}

const PRESETS = ["Formal", "Project", "Casual"] as const;

export function InviteEmailFields({
  language,
  note,
  onLanguageChange,
  onNoteChange,
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
        <label
          htmlFor={noteId}
          className="text-foreground block text-xs font-medium"
        >
          {t("agency.members.noteLabel")}
        </label>
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {t("agency.members.presetsLabel")}:
          </span>
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onNoteChange(
                  t(`agency.members.notePreset${preset}`, { lng: language }),
                )
              }
              className="cursor-pointer rounded-full text-xs"
            >
              {t(`agency.members.preset${preset}`)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
