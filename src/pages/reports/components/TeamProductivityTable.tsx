import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeamProductivityRow } from "../types/report";

export interface TeamProductivityTableProps {
  rows: TeamProductivityRow[];
}

export function TeamProductivityTable({ rows }: TeamProductivityTableProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("reports.team.member")}</TableHead>
            <TableHead>{t("reports.team.postsCreated")}</TableHead>
            <TableHead>{t("reports.team.postsApproved")}</TableHead>
            <TableHead>{t("reports.team.avgApprovalTime")}</TableHead>
            <TableHead>{t("reports.team.aiGenerationsUsed")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.memberId}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  {row.memberAvatar ? (
                    <img
                      src={row.memberAvatar}
                      alt={row.memberName}
                      className="size-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-brand-orange-soft text-brand-orange flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                      {row.memberName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-foreground font-medium">
                    {row.memberName}
                  </span>
                </div>
              </TableCell>
              <TableCell>{row.postsCreated}</TableCell>
              <TableCell>{row.postsApproved}</TableCell>
              <TableCell>
                {t("reports.team.hoursValue", {
                  value: row.avgApprovalTimeHours,
                })}
              </TableCell>
              <TableCell>{row.aiGenerationsUsed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TeamProductivityTable;
