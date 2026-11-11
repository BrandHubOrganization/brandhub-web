import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, User, Eye, Edit3, PowerOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DirectoryPartner } from "../types";
import { getAvatarPalette, getInitials, getContact } from "../contactHelpers";

interface PartnerListItemProps {
  partner: DirectoryPartner;
  busy: boolean;
  onDetail: (partner: DirectoryPartner) => void;
  onEdit: (partner: DirectoryPartner) => void;
  onAction: (partner: DirectoryPartner, action: "delete" | "deactivate") => void;
}

export function PartnerListItem({
  partner,
  busy,
  onDetail,
  onEdit,
  onAction,
}: PartnerListItemProps) {
  const { t } = useTranslation();
  const palette = getAvatarPalette(partner.partnerName);
  const initials = getInitials(partner.partnerName);
  const contact = getContact(partner.contactInfo);

  return (
    <li className="group flex flex-col gap-3 p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 hover:bg-muted/40">
      {/* Left: Avatar + Details */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onDetail(partner)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onDetail(partner);
          }
        }}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3.5 text-left focus-visible:outline-ring"
      >
        {/* Avatar Initials */}
        <div
          className={cn(
            "size-10 shrink-0 rounded-full border flex items-center justify-center font-bold text-xs select-none transition-transform group-hover:scale-105 shadow-2xs",
            palette.bg
          )}
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Main Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-foreground group-hover:text-brand-orange transition-colors break-words">
              {partner.partnerName}
            </span>
            <Badge variant="secondary" className="h-5 px-2 text-[11px] font-normal">
              {t(`campaign.partners.types.${partner.partnerType}`)}
            </Badge>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
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

          {/* Quick Contact Line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {contact.contactName && (
              <span className="inline-flex items-center gap-1.5 truncate max-w-[180px]" title={contact.contactName}>
                <User className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{contact.contactName}</span>
              </span>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Phone className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span>{contact.phone}</span>
              </a>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors truncate max-w-[200px]"
                title={contact.email}
              >
                <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{contact.email}</span>
              </a>
            )}
          </div>

          {partner.deleteBlockedReason && (
            <p className="text-xs text-muted-foreground/80 italic pt-0.5">
              {t(`collaborators.blocked.${partner.deleteBlockedReason}`)}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 self-end sm:self-center pl-13 sm:pl-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onDetail(partner)}
        >
          <Eye className="size-3.5 mr-1" />
          {t("collaborators.viewDetails")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          className="h-8 px-2.5 text-xs"
          onClick={() => onEdit(partner)}
        >
          <Edit3 className="size-3.5 mr-1" />
          {t("collaborators.edit")}
        </Button>
        {partner.isActive && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            className="h-8 px-2.5 text-xs hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400"
            onClick={() => onAction(partner, "deactivate")}
          >
            <PowerOff className="size-3.5 mr-1" />
            {t("collaborators.deactivate")}
          </Button>
        )}
        {partner.canDelete && (
          <Button
            variant="destructive"
            size="sm"
            disabled={busy}
            className="h-8 px-2.5 text-xs"
            onClick={() => onAction(partner, "delete")}
          >
            <Trash2 className="size-3.5 mr-1" />
            {t("collaborators.delete")}
          </Button>
        )}
      </div>
    </li>
  );
}
