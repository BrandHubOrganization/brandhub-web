import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { MAIL_LOCALES } from "@/pages/mail-templates/blocks";
import type { MailLocale } from "@/pages/mail-templates/blocks";
import type { MailTemplateScope } from "@/pages/mail-templates/types";

export interface MailTemplateMetaFieldsProps {
  name: string;
  setName: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  scope: MailTemplateScope;
  setScope: (val: MailTemplateScope) => void;
  scopes: MailTemplateScope[];
  locale: MailLocale;
  setLocale: (val: MailLocale) => void;
  mode: "create" | "edit";
  isLegacy: boolean;
}

export function MailTemplateMetaFields({
  name,
  setName,
  subject,
  setSubject,
  scope,
  setScope,
  scopes,
  locale,
  setLocale,
  mode,
  isLegacy,
}: MailTemplateMetaFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <label className="block space-y-1.5 text-sm font-medium">
        <span>{t("mailTemplate.form.name")} *</span>
        <Input
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block space-y-1.5 text-sm font-medium">
        <span>{t("mailTemplate.form.subject")} *</span>
        <Input
          value={subject}
          maxLength={200}
          onChange={(e) => setSubject(e.target.value)}
        />
      </label>

      {mode === "create" && scopes.length > 1 && (
        <div className="space-y-1.5 text-sm font-medium">
          <span>{t("mailTemplate.form.scope")}</span>
          <SelectMenu
            className="w-full"
            ariaLabel={t("mailTemplate.form.scope")}
            value={scope}
            onChange={(next) => setScope(next as MailTemplateScope)}
            options={scopes.map((s) => ({
              value: s,
              label: t(`mailTemplate.scopes.${s}`),
            }))}
          />
        </div>
      )}

      <div className="space-y-1.5 text-sm font-medium">
        <span>{t("mailTemplate.form.locale")}</span>
        <SelectMenu
          className="w-full"
          ariaLabel={t("mailTemplate.form.locale")}
          value={locale}
          onChange={(next) => setLocale(next as MailLocale)}
          options={MAIL_LOCALES.map((l) => ({
            value: l,
            label: t(`mailTemplate.locales.${l}`),
          }))}
        />
        <span className="text-muted-foreground block text-xs font-normal">
          {t("mailTemplate.form.localeHint")}
        </span>
      </div>

      {isLegacy && (
        <p
          role="status"
          className="bg-muted/50 rounded border px-3 py-2 text-xs"
        >
          {t("mailTemplate.builder.legacy")}
        </p>
      )}
    </>
  );
}
