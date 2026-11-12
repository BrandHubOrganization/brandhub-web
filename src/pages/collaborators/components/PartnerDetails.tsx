import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  Globe,
  User,
  FileText,
  ExternalLink,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DirectoryPartner } from "../types";
import { getAvatarPalette, getInitials, getContactString } from "../contactHelpers";
import { PartnerQuickActions } from "./PartnerQuickActions";

export function PartnerDetails({
  partner,
  onClose,
}: {
  partner: DirectoryPartner;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const info = partner.contactInfo ?? {};
  const phone = getContactString(info.phone);
  const email = getContactString(info.email);
  const website = getContactString(info.website);
  const contactName = getContactString(info.contactName);

  const palette = getAvatarPalette(partner.partnerName);
  const initials = getInitials(partner.partnerName);

  // Other extra contact keys not in standard 4 fields
  const standardKeys = new Set(["contactName", "phone", "email", "website"]);
  const extraContactEntries = Object.entries(info).filter(
    ([k, v]) => !standardKeys.has(k) && v != null && v !== ""
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-6 sm:max-w-md rounded-3xl border border-border/80 shadow-xl">
        <DialogHeader className="items-center text-center space-y-0">
          <DialogDescription className="sr-only">
            {partner.partnerName} - {t(`campaign.partners.types.${partner.partnerType}`)}
          </DialogDescription>

          {/* iOS Big Avatar */}
          <div
            className={cn(
              "size-20 rounded-full border-2 flex items-center justify-center font-bold text-2xl shadow-md transition-transform select-none mx-auto",
              palette.bg
            )}
            aria-hidden="true"
          >
            {initials}
          </div>

          {/* Partner Name */}
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground break-words mt-3 text-center">
            {partner.partnerName}
          </DialogTitle>

          {/* Type & Status Badges */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-normal">
              {t(`campaign.partners.types.${partner.partnerType}`)}
            </Badge>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                partner.isActive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground border-border/40"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  partner.isActive ? "bg-emerald-500" : "bg-muted-foreground/60"
                )}
              />
              {t(partner.isActive ? "collaborators.active" : "collaborators.inactive")}
            </span>
          </div>
        </DialogHeader>

        {/* iOS Quick Action Buttons */}
        <PartnerQuickActions phone={phone} email={email} website={website} />

        {/* Detailed Info (iOS Grouped Cells) */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-border/60 bg-muted/30 dark:bg-muted/15 divide-y divide-border/40 overflow-hidden text-xs">
            {/* Contact Person */}
            <div className="flex items-start gap-3 p-3.5">
              <User className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-muted-foreground font-medium mb-0.5">
                  {t("collaborators.contactName")}
                </span>
                <span className="font-semibold text-foreground break-words text-sm">
                  {contactName || "—"}
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3 p-3.5">
              <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-muted-foreground font-medium mb-0.5">
                  {t("collaborators.phone")}
                </span>
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="font-semibold text-brand-orange hover:underline break-words text-sm"
                  >
                    {phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-start gap-3 p-3.5">
              <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-muted-foreground font-medium mb-0.5">
                  {t("collaborators.email")}
                </span>
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="font-semibold text-brand-orange hover:underline break-all text-sm"
                  >
                    {email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </div>

            {/* Website URL */}
            <div className="flex items-start gap-3 p-3.5">
              <Globe className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-muted-foreground font-medium mb-0.5">
                  {t("collaborators.website")}
                </span>
                {website ? (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-brand-orange hover:underline break-all text-sm"
                  >
                    <span>{website}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </div>

            {/* Extra contact fields if any */}
            {extraContactEntries.map(([key, value]) => (
              <div key={key} className="flex items-start gap-3 p-3.5">
                <Building2 className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-muted-foreground font-medium mb-0.5">
                    {t(`collaborators.${key}`, { defaultValue: key })}
                  </span>
                  <span className="font-semibold text-foreground break-words text-sm">
                    {typeof value === "string" ? value : JSON.stringify(value)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <div className="rounded-2xl border border-border/60 bg-muted/30 dark:bg-muted/15 p-3.5 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground font-medium mb-1">
              <FileText className="size-4 shrink-0" />
              <span>{t("collaborators.notes")}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-foreground font-normal leading-relaxed text-xs">
              {partner.notes || (
                <span className="text-muted-foreground italic">
                  {t("collaborators.noNotes")}
                </span>
              )}
            </p>
          </div>

          {/* Delete Blocked Reason Alert */}
          {partner.deleteBlockedReason && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p className="leading-snug">
                {t(`collaborators.blocked.${partner.deleteBlockedReason}`)}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            {t("collaborators.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
