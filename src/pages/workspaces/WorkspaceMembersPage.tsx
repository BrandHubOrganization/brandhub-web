import * as React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

const MANAGE_ROLES: MemberRole[] = ["OWNER", "ACCOUNT"];
const ALL_ROLES: MemberRole[] = ["OWNER", "CREATOR", "VIEWER", "CLIENT", "ACCOUNT"];

export function WorkspaceMembersPage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [members, setMembers] = React.useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<MemberRole>("CREATOR");
  const [inviting, setInviting] = React.useState(false);
  const [removeTarget, setRemoveTarget] = React.useState<WorkspaceMember | null>(null);
  const [removing, setRemoving] = React.useState(false);

  const [reloadCount, setReloadCount] = React.useState(0);
  const loadMembers = () => setReloadCount((c) => c + 1);

  React.useEffect(() => {
    if (!workspaceId) return;
    workspaceService
      .listMembers(workspaceId)
      .then(({ data }) => setMembers(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("common.loadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [workspaceId, reloadCount, t]);

  const currentMember = members.find((m) => m.userId === currentUserId);
  const canManage = currentMember ? MANAGE_ROLES.includes(currentMember.role) : false;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setInviting(true);
    try {
      await workspaceService.inviteMember(workspaceId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success(t("workspace.members.inviteSuccess"));
      setInviteOpen(false);
      setInviteEmail("");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!workspaceId || !removeTarget) return;
    setRemoving(true);
    try {
      await workspaceService.removeMember(workspaceId, removeTarget.id);
      toast.success(t("workspace.members.removeSuccess"));
      setRemoveTarget(null);
      loadMembers();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.members.title")}
      description={t("workspace.members.description")}
      actions={
        canManage && (
          <Button variant="orange" onClick={() => setInviteOpen(true)}>
            {t("workspace.members.inviteButton")}
          </Button>
        )
      }
    >
      <div className="border-border bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("workspace.members.emailLabel")}</TableHead>
              <TableHead>{t("workspace.members.roleLabel")}</TableHead>
              <TableHead>{t("workspace.members.joinedAtLabel")}</TableHead>
              <TableHead>{t("workspace.members.statusLabel")}</TableHead>
              {canManage && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="font-medium">{member.fullName}</div>
                  <div className="text-muted-foreground text-xs">{member.email}</div>
                </TableCell>
                <TableCell>{t(`workspace.roles.${member.role}`)}</TableCell>
                <TableCell>
                  {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  {member.isActive && <Badge variant="secondary">{t("workspace.members.active")}</Badge>}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemoveTarget(member)}
                      aria-label={t("workspace.members.removeButton")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("workspace.members.inviteDialogTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <Input
              label={t("workspace.members.emailLabel")}
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold tracking-wide">
                {t("workspace.members.roleLabel")}
              </Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                className="border-input bg-input-background flex h-9 w-full rounded-md border px-3 text-sm"
              >
                {ALL_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`workspace.roles.${role}`)}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button variant="orange" type="submit" loading={inviting}>
                {t("workspace.members.inviteButton")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("workspace.members.removeConfirmTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            {t("workspace.members.removeConfirmDescription")}
          </p>
          <DialogFooter>
            <Button variant="destructive" onClick={handleRemove} loading={removing}>
              {t("workspace.members.removeButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

export default WorkspaceMembersPage;
