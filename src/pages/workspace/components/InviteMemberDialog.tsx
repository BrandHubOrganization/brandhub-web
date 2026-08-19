import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ALL_ROLES } from "../hooks/useWorkspaceMembers";
import type { MemberRole } from "@/types/workspace";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
  role: MemberRole;
  onRoleChange: (role: MemberRole) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  email,
  onEmailChange,
  role,
  onRoleChange,
  submitting,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.members.inviteDialogTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label={t("workspace.members.emailLabel")}
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
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
          <DialogFooter>
            <Button variant="orange" type="submit" loading={submitting}>
              {t("workspace.members.inviteButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
