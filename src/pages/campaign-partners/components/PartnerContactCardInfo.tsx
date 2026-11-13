import { Check, Copy, Globe, Mail, Phone, StickyNote, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  parsePartnerContactInfo,
  type PartnerContactInfo,
} from "@/pages/campaign-partners/types";

function safeExternalUrl(raw?: string) {
  if (!raw) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function PartnerContactCardInfo({
  contactInfo,
  notes,
  compact = false,
}: {
  contactInfo?: PartnerContactInfo | Record<string, unknown> | string | null;
  notes?: string | null;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const info = parsePartnerContactInfo(contactInfo);
  const websiteUrl = safeExternalUrl(info.website);
  const hasAny =
    Boolean(info.contactName) ||
    Boolean(info.phone) ||
    Boolean(info.email) ||
    Boolean(websiteUrl) ||
    Boolean(notes?.trim());

  if (!hasAny) {
    return (
      <p className="text-muted-foreground text-xs italic">
        {t("campaign.partners.noContactInfo")}
      </p>
    );
  }

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success(t("campaign.partners.copiedContact", { value }));
      setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1500);
    } catch {
      toast.error(t("campaign.partners.error"));
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 text-xs",
          compact ? "gap-1.5" : "gap-2.5",
        )}
      >
        {info.contactName && (
          <span className="border-border/70 bg-muted/35 text-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium">
            <User className="text-brand-orange size-3 shrink-0" />
            <span>{info.contactName}</span>
          </span>
        )}

        {info.phone && (
          <span className="border-border/70 bg-background inline-flex items-center gap-1 rounded-md border px-2 py-1">
            <Phone className="text-brand-orange size-3 shrink-0" />
            <a
              href={`tel:${info.phone.replace(/\s+/g, "")}`}
              className="text-foreground hover:text-brand-orange font-medium tabular-nums transition-colors hover:underline"
            >
              {info.phone}
            </a>
            <button
              type="button"
              onClick={() => void copyValue("phone", info.phone!)}
              title={t("campaign.partners.copyPhone")}
              aria-label={t("campaign.partners.copyPhone")}
              className="text-muted-foreground hover:text-foreground ml-0.5 rounded p-0.5 transition-colors"
            >
              {copiedKey === "phone" ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </span>
        )}

        {info.email && (
          <span className="border-border/70 bg-background inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1">
            <Mail className="text-brand-orange size-3 shrink-0" />
            <a
              href={`mailto:${info.email}`}
              className="text-foreground hover:text-brand-orange truncate font-medium transition-colors hover:underline"
            >
              {info.email}
            </a>
            <button
              type="button"
              onClick={() => void copyValue("email", info.email!)}
              title={t("campaign.partners.copyEmail")}
              aria-label={t("campaign.partners.copyEmail")}
              className="text-muted-foreground hover:text-foreground ml-0.5 shrink-0 rounded p-0.5 transition-colors"
            >
              {copiedKey === "email" ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </span>
        )}

        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border/70 bg-background text-foreground hover:border-brand-orange/40 hover:text-brand-orange inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium transition-colors"
          >
            <Globe className="text-brand-orange size-3 shrink-0" />
            <span className="max-w-44 truncate">
              {info.website?.replace(/^https?:\/\//i, "")}
            </span>
          </a>
        )}
      </div>

      {notes?.trim() && (
        <div className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
          <StickyNote className="mt-0.5 size-3 shrink-0 text-amber-500" />
          {/<[a-z][\s\S]*>/i.test(notes) ? (
            <div
              className="prose prose-xs dark:prose-invert max-w-none text-foreground/90 leading-relaxed [&_p]:my-0.5 [&_ul]:my-0.5 [&_li]:my-0 [&_a]:text-brand-orange"
              dangerouslySetInnerHTML={{ __html: notes }}
            />
          ) : (
            <span>{notes}</span>
          )}
        </div>
      )}
    </div>
  );
}
