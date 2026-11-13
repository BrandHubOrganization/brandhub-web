import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ALL_ROLES } from "../hooks/useWorkspaceMembers";
import type { MemberRole } from "@/types/workspace";
import { InviteMessagePresets } from "@/components/shared/InviteMessagePresets";
import { InvitationMailPreview } from "@/components/shared/InvitationMailPreview";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAgencyStore } from "@/store/agencyStore";
import { useUserLookup } from "@/hooks/useUserLookup";
import { Mail, UserPlus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
  role: MemberRole;
  onRoleChange: (role: MemberRole) => void;
  note: string;
  onNoteChange: (note: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  workspaceName?: string | null;
  agencyName?: string | null;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  email,
  onEmailChange,
  role,
  onRoleChange,
  note,
  onNoteChange,
  submitting,
  onSubmit,
  workspaceName,
  agencyName,
}: Props) {
  const { t } = useTranslation();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentAgency = useAgencyStore((s) =>
    s.agencyList.find((a) => a.id === s.currentAgencyId),
  );
  const userMatch = useUserLookup(email);

  const effectiveWorkspaceName = workspaceName || currentWorkspace?.name;
  const effectiveAgencyName = agencyName || currentAgency?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-5 text-brand-orange" />
            <span>{t("workspace.members.inviteDialogTitle")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start py-2">
          <form onSubmit={onSubmit} className="space-y-4 lg:col-span-6">
            <div className="space-y-1.5">
              <Input
                label={t("workspace.members.emailLabel")}
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                autoFocus
              />
            </div>

            {userMatch && (
              <div className="flex items-center gap-2 rounded-lg border border-brand-orange/30 bg-brand-orange/5 p-2 text-xs">
                {userMatch.avatarUrl ? (
                  <img
                    src={userMatch.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-5 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="bg-brand-orange-soft text-brand-orange text-3xs flex size-5 shrink-0 items-center justify-center rounded-full font-bold">
                    {userMatch.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">
                    {userMatch.fullName}
                  </p>
                  <p className="text-3xs text-muted-foreground truncate">
                    {userMatch.email}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide">
                {t("workspace.members.roleLabel")}
              </Label>
              <Select
                value={role}
                onChange={(e) => onRoleChange(e.target.value as MemberRole)}
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(`workspace.roles.${r}`)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide">
                {t("workspace.members.noteLabel")}
              </Label>
              <InviteMessagePresets onPick={onNoteChange} />
              <Textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <Button
                variant="orange"
                type="submit"
                loading={submitting}
                className="w-full gap-2 cursor-pointer shadow-xs"
              >
                <Mail className="size-4" />
                {t("workspace.members.inviteButton")}
              </Button>
            </div>
          </form>

          <div className="lg:col-span-6">
            <InvitationMailPreview
              role={role}
              workspaceName={effectiveWorkspaceName}
              agencyName={effectiveAgencyName}
              agencyLogoUrl={currentAgency?.logoUrl}
              agencyTagline={currentAgency?.tagline}
              agencyPhone={currentAgency?.phone}
              agencyWebsite={currentAgency?.website}
              agencyLocation={currentAgency?.location}
              recipientEmail={email}
              inviteeName={userMatch?.fullName}
              note={note}
              fullHeight
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
