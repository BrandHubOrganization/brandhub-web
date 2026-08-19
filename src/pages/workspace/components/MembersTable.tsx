import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkspaceMember } from "@/types/workspace";

interface Props {
  members: WorkspaceMember[];
  canManage: boolean;
  onRemove: (member: WorkspaceMember) => void;
}

export function MembersTable({ members, canManage, onRemove }: Props) {
  const { t } = useTranslation();

  return (
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
                <div className="text-muted-foreground text-xs">
                  {member.email}
                </div>
              </TableCell>
              <TableCell>{t(`workspace.roles.${member.role}`)}</TableCell>
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(member)}
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
  );
}
