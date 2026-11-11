import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, Globe } from "lucide-react";
import { contactError } from "../contactValidation";

export const CONTACT_FIELD_CONFIG = [
  {
    field: "contactName",
    icon: <User className="size-4 shrink-0" />,
    type: "text",
    max: 255,
  },
  {
    field: "email",
    icon: <Mail className="size-4 shrink-0" />,
    type: "email",
    max: 255,
  },
  {
    field: "phone",
    icon: <Phone className="size-4 shrink-0" />,
    type: "tel",
    max: 40,
  },
  {
    field: "website",
    icon: <Globe className="size-4 shrink-0" />,
    type: "text",
    max: 2048,
  },
] as const;

interface Props {
  contact: Record<string, unknown>;
  touched: string[];
  busy: boolean;
  onBlur: (field: string) => void;
  onChange: (field: string, value: string) => void;
}

export function PartnerContactFields({
  contact,
  touched,
  busy,
  onBlur,
  onChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {CONTACT_FIELD_CONFIG.map(({ field, icon, type: inputType, max }) => {
        const errKey = touched.includes(field)
          ? contactError(field, contact[field])
          : null;
        return (
          <div key={field}>
            <Input
              label={t(`collaborators.${field}`)}
              iconPrefix={icon}
              disabled={busy}
              maxLength={max}
              placeholder={t(`collaborators.${field}`)}
              onBlur={() => onBlur(field)}
              error={errKey ? t(errKey) : undefined}
              aria-describedby={errKey ? `partner-${field}-error` : undefined}
              type={inputType}
              value={
                typeof contact[field] === "string"
                  ? (contact[field] as string)
                  : ""
              }
              onChange={(e) => onChange(field, e.target.value)}
            />
            {errKey && (
              <span id={`partner-${field}-error`} className="sr-only">
                {t(errKey)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

