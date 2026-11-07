import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, ShieldOff, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MemberRole, WorkspaceMember } from "@/types/workspace";

interface Props {
  members: WorkspaceMember[];
  canManage: boolean;
  onRemove: (member: WorkspaceMember) => void;
  onUpdateRole?: (memberId: string, role: MemberRole) => void;
  updatingRole?: boolean;
  currentRole?: MemberRole;
  currentUserId?: string | null;
}

function renderConfirmBody(template: string, name: string) {
  const boldMarker = `**${name}**`;
  if (template.includes(boldMarker)) {
    const parts = template.split(boldMarker);
    return (
      <p>
        {parts[0]}
        <strong className="font-semibold text-foreground">{name}</strong>
        {parts[1]}
      </p>
    );
  }
  if (template.includes(name)) {
    const parts = template.split(name);
    return (
      <p>
        {parts[0]}
        <strong className="font-semibold text-foreground">{name}</strong>
        {parts[1]}
      </p>
    );
  }
  return <p>{template}</p>;
}

export function MembersTable({
  members,
  canManage,
  onRemove,
  onUpdateRole,
  updatingRole,
  currentUserId,
}: Props) {
  const { t } = useTranslation();
  const [promoteTarget, setPromoteTarget] = useState<{
    member: WorkspaceMember;
    newRole: MemberRole;
  } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<WorkspaceMember | null>(null);

  const selectableRoles: MemberRole[] = ["MANAGER", "CREATOR"];

  const handleRoleChange = (member: WorkspaceMember, newRole: MemberRole) => {
    if (newRole === member.role || !onUpdateRole) return;
    if (newRole === "MANAGER") {
      setPromoteTarget({ member, newRole });
      return;
    }
    onUpdateRole(member.id, newRole);
  };

  const handleConfirmPromote = () => {
    if (!promoteTarget || !onUpdateRole) return;
    const { member, newRole } = promoteTarget;
    setPromoteTarget(null);
    onUpdateRole(member.id, newRole);
  };

  const handleConfirmRevoke = () => {
    if (!revokeTarget) return;
    const member = revokeTarget;
    setRevokeTarget(null);

    if (member.role === "MANAGER" && onUpdateRole) {
      onUpdateRole(member.id, "CREATOR");
    } else {
      onRemove(member);
    }
  };

  return (
    <div className="border-border bg-card rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("workspace.members.emailLabel")}</TableHead>
            <TableHead>{t("workspace.members.roleLabel")}</TableHead>
            <TableHead>{t("workspace.members.joinedAtLabel")}</TableHead>
            <TableHead>{t("workspace.members.statusLabel")}</TableHead>
            {canManage && (
              <TableHead className="text-right pr-4">
                {t("workspace.members.actionsLabel", "Thao tác")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isTargetOwner = member.role === "OWNER";
            const isSelf = member.userId === currentUserId;
            const canAct = canManage && !isTargetOwner && !isSelf;

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="font-medium">{member.fullName}</div>
                  <div className="text-muted-foreground text-xs">
                    {member.email}
                  </div>
                </TableCell>
                <TableCell>
                  {!canManage ? (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {t(`workspace.roles.${member.role}`)}
                    </Badge>
                  ) : isTargetOwner ? (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {t("workspace.roles.OWNER")}
                    </Badge>
                  ) : isSelf ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-normal opacity-60 cursor-not-allowed border-border"
                      aria-label={t("workspace.members.roleLabel")}
                    >
                      <span>{t(`workspace.roles.${member.role}`)}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </Button>
                  ) : onUpdateRole ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={updatingRole}>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingRole}
                          className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-normal border-border cursor-pointer"
                          aria-label={t("workspace.members.roleLabel")}
                          data-selectable-roles={selectableRoles.join(",")}
                        >
                          <span>{t(`workspace.roles.${member.role}`)}</span>
                          <ChevronDown className="size-3.5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="min-w-[140px] rounded-lg p-1 shadow-md"
                      >
                        {selectableRoles.map((role) => (
                          <DropdownMenuItem
                            key={role}
                            data-role={role}
                            className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs cursor-pointer hover:bg-accent focus:bg-accent"
                            onClick={() => handleRoleChange(member, role)}
                          >
                            <span>{t(`workspace.roles.${role}`)}</span>
                            {member.role === role && (
                              <Check className="text-brand-orange size-3.5 shrink-0" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    t(`workspace.roles.${member.role}`)
                  )}
                </TableCell>
                <TableCell>
                  {member.joinedAt
                    ? new Date(member.joinedAt).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell>
                  {member.isActive && (
                    <Badge variant="secondary">
                      {t("workspace.members.active")}
                    </Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {canAct && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-7 px-2.5 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900/60 dark:text-amber-400 dark:hover:bg-amber-950/40 cursor-pointer"
                            title={
                              member.role === "MANAGER"
                                ? t(
                                    "workspace.members.revokeManagerTooltip",
                                    "Thu hồi quyền quản lý về Người tạo nội dung",
                                  )
                                : t(
                                    "workspace.members.revokeTooltip",
                                    "Thu hồi quyền hạn của thành viên này",
                                  )
                            }
                            onClick={() => setRevokeTarget(member)}
                          >
                            <ShieldOff className="size-3.5" />
                            {t("workspace.permissions.revokeButton", "Thu hồi")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-7 px-2.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                            title={t(
                              "workspace.members.removeTooltip",
                              "Xóa người dùng khỏi không gian làm việc",
                            )}
                            onClick={() => onRemove(member)}
                          >
                            <Trash2 className="size-3.5" />
                            {t("workspace.members.removeButton", "Xóa")}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Promote confirmation dialog */}
      <Dialog
        open={Boolean(promoteTarget)}
        onOpenChange={(open) => !open && setPromoteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-amber-500" />
              {promoteTarget?.newRole === "OWNER"
                ? t("workspace.permissions.promoteOwnerConfirmTitle")
                : t("workspace.permissions.promoteManagerConfirmTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground text-sm">
            {promoteTarget &&
              renderConfirmBody(
                promoteTarget.newRole === "OWNER"
                  ? t("workspace.permissions.promoteOwnerConfirmBody", {
                      name:
                        promoteTarget.member.fullName ||
                        promoteTarget.member.email ||
                        "",
                    })
                  : t("workspace.permissions.promoteManagerConfirmBody", {
                      name:
                        promoteTarget.member.fullName ||
                        promoteTarget.member.email ||
                        "",
                    }),
                promoteTarget.member.fullName ||
                  promoteTarget.member.email ||
                  "",
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={updatingRole}
              onClick={() => setPromoteTarget(null)}
            >
              {t("workspace.permissions.promoteManagerCancel")}
            </Button>
            <Button
              variant="orange"
              size="sm"
              loading={updatingRole}
              onClick={handleConfirmPromote}
            >
              {promoteTarget?.newRole === "OWNER"
                ? t("workspace.permissions.promoteOwnerConfirmButton")
                : t("workspace.permissions.promoteManagerConfirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation dialog */}
      <Dialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-amber-500" />
              {t(
                "workspace.members.revokeConfirmTitle",
                "Xác nhận thu hồi quyền",
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground text-sm">
            {revokeTarget &&
              renderConfirmBody(
                t("workspace.members.revokeConfirmBody", {
                  name:
                    revokeTarget.fullName ||
                    revokeTarget.email ||
                    "",
                  defaultValue:
                    "Bạn có chắc chắn muốn thu hồi quyền của **{{name}}** không?",
                }),
                revokeTarget.fullName ||
                  revokeTarget.email ||
                  "",
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={updatingRole}
              onClick={() => setRevokeTarget(null)}
            >
              {t("workspace.permissions.promoteManagerCancel", "Hủy")}
            </Button>
            <Button
              variant="orange"
              size="sm"
              loading={updatingRole}
              onClick={handleConfirmRevoke}
            >
              {t(
                "workspace.members.revokeConfirmButton",
                "Xác nhận thu hồi",
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}