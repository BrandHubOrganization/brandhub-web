import { useTranslation } from "react-i18next";
import { Eye, Trash2 } from "lucide-react";
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
  clients: WorkspaceMember[];
  canManage: boolean;
  onViewProfile: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
}

export function ClientsTable({
  clients,
  canManage,
  onViewProfile,
  onRemove,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("workspace.members.clientLabel")}</TableHead>
            <TableHead>{t("workspace.members.joinedAtLabel")}</TableHead>
            <TableHead>{t("workspace.members.statusLabel")}</TableHead>
            <TableHead className="text-right">
              {t("workspace.members.actionsLabel")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground text-sm"
              >
                {t(
                  "workspace.members.noClients",
                  "Chưa có khách hàng nào trong workspace.",
                )}
              </TableCell>
            </TableRow>
          ) : (
            clients.map((member) => (
              <TableRow
                key={member.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onViewProfile(member)}
              >
                <TableCell>
                  <div className="font-medium text-foreground hover:text-brand-orange transition-colors">
                    {member.fullName || member.email || "—"}
                  </div>
                  {member.fullName && member.email && (
                    <div className="text-xs text-muted-foreground">
                      {member.email}
                    </div>
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
                <TableCell className="text-right">
                  <div
                    className="inline-flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewProfile(member)}
                      title={t(
                        "workspace.members.viewProfileTooltip",
                        "Xem hồ sơ khách hàng",
                      )}
                      aria-label={t(
                        "workspace.members.viewProfileTooltip",
                        "Xem hồ sơ khách hàng",
                      )}
                      className="text-muted-foreground hover:text-brand-orange hover:bg-brand-orange/10 transition-colors cursor-pointer"
                    >
                      <Eye className="size-4" />
                    </Button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(member)}
                        title={t(
                          "workspace.members.removeClientTooltip",
                          "Xóa khách hàng khỏi workspace",
                        )}
                        aria-label={t(
                          "workspace.members.removeClientTooltip",
                          "Xóa khách hàng khỏi workspace",
                        )}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
