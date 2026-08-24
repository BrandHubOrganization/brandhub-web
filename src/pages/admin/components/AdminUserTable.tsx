import { useTranslation } from "react-i18next";
import { ShieldCheck, Ban, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUser } from "../types/admin";

const STATUS_VARIANT: Record<
  AdminUser["status"],
  "PUBLISHED" | "PENDING_REVIEW" | "FAILED"
> = {
  ACTIVE: "PUBLISHED",
  PENDING_VERIFICATION: "PENDING_REVIEW",
  DISABLED: "FAILED",
};

export interface AdminUserTableProps {
  users: AdminUser[];
  onVerify: (id: string) => void;
  onToggleDisable: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AdminUserTable({
  users,
  onVerify,
  onToggleDisable,
  onDelete,
}: AdminUserTableProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("dashboard.admin.users.name")}</TableHead>
            <TableHead>{t("dashboard.admin.users.role")}</TableHead>
            <TableHead>{t("dashboard.admin.users.status")}</TableHead>
            <TableHead>{t("dashboard.admin.users.workspaceCount")}</TableHead>
            <TableHead>{t("dashboard.admin.users.createdAt")}</TableHead>
            <TableHead className="text-right">
              {t("dashboard.admin.users.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">
                    {user.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {user.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[user.status]}>
                  {t(`dashboard.admin.users.statuses.${user.status}`)}
                </Badge>
              </TableCell>
              <TableCell>{user.workspaceCount}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  {user.status === "PENDING_VERIFICATION" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => onVerify(user.id)}
                    >
                      <ShieldCheck className="size-3.5" />
                      {t("dashboard.admin.users.verify")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => onToggleDisable(user.id)}
                  >
                    <Ban className="size-3.5" />
                    {user.status === "DISABLED"
                      ? t("dashboard.admin.users.enable")
                      : t("dashboard.admin.users.disable")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive gap-1.5 text-xs"
                    onClick={() => onDelete(user.id)}
                  >
                    <Trash2 className="size-3.5" />
                    {t("dashboard.admin.users.delete")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default AdminUserTable;
