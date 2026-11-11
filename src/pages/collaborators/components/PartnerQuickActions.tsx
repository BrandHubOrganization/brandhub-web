import { useTranslation } from "react-i18next";
import { Phone, Mail, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartnerQuickActionsProps {
  phone?: string;
  email?: string;
  website?: string;
}

export function PartnerQuickActions({ phone, email, website }: PartnerQuickActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-2.5 my-4">
      {/* Call button */}
      <a
        href={phone ? `tel:${phone}` : undefined}
        tabIndex={phone ? 0 : -1}
        aria-disabled={!phone}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all text-center",
          phone
            ? "bg-muted/40 hover:bg-muted border-border/60 text-foreground active:scale-95 cursor-pointer shadow-2xs"
            : "bg-muted/15 border-border/30 text-muted-foreground/40 cursor-not-allowed pointer-events-none"
        )}
      >
        <div
          className={cn(
            "size-9 rounded-full flex items-center justify-center transition-colors",
            phone
              ? "bg-brand-orange/15 text-brand-orange"
              : "bg-muted/50 text-muted-foreground/30"
          )}
        >
          <Phone className="size-4" />
        </div>
        <span className="text-[11px] font-medium leading-none">
          {t("collaborators.call")}
        </span>
      </a>

      {/* Email button */}
      <a
        href={email ? `mailto:${email}` : undefined}
        tabIndex={email ? 0 : -1}
        aria-disabled={!email}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all text-center",
          email
            ? "bg-muted/40 hover:bg-muted border-border/60 text-foreground active:scale-95 cursor-pointer shadow-2xs"
            : "bg-muted/15 border-border/30 text-muted-foreground/40 cursor-not-allowed pointer-events-none"
        )}
      >
        <div
          className={cn(
            "size-9 rounded-full flex items-center justify-center transition-colors",
            email
              ? "bg-brand-orange/15 text-brand-orange"
              : "bg-muted/50 text-muted-foreground/30"
          )}
        >
          <Mail className="size-4" />
        </div>
        <span className="text-[11px] font-medium leading-none">
          {t("collaborators.sendEmail")}
        </span>
      </a>

      {/* Website button */}
      <a
        href={website || undefined}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={website ? 0 : -1}
        aria-disabled={!website}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all text-center",
          website
            ? "bg-muted/40 hover:bg-muted border-border/60 text-foreground active:scale-95 cursor-pointer shadow-2xs"
            : "bg-muted/15 border-border/30 text-muted-foreground/40 cursor-not-allowed pointer-events-none"
        )}
      >
        <div
          className={cn(
            "size-9 rounded-full flex items-center justify-center transition-colors",
            website
              ? "bg-brand-orange/15 text-brand-orange"
              : "bg-muted/50 text-muted-foreground/30"
          )}
        >
          <Globe className="size-4" />
        </div>
        <span className="text-[11px] font-medium leading-none">
          {t("collaborators.openWebsite")}
        </span>
      </a>
    </div>
  );
}
