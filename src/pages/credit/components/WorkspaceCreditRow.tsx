import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { WorkspaceCreditForm } from "@/pages/credit/components/WorkspaceCreditForm";
import {
  formatCredits,
  validCreditAmounts,
} from "@/pages/credit/utils/creditFormat";
import type { WorkspaceCredit } from "@/pages/credit/types/credit";

interface Props {
  workspace: WorkspaceCredit;
  canEdit: boolean;
  onSave: (workspace: WorkspaceCredit, cap: number | null) => Promise<void>;
  onReload: () => Promise<void>;
}

export function WorkspaceCreditRow({
  workspace,
  canEdit,
  onSave,
  onReload,
}: Props) {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const amounts = [workspace.revision, workspace.used, workspace.held];
  if (workspace.cap !== null) amounts.push(workspace.cap);
  const isSafe =
    validCreditAmounts(amounts) &&
    Number.isSafeInteger(workspace.used + workspace.held);
  const remaining =
    workspace.cap === null
      ? null
      : Math.max(0, workspace.cap - workspace.used - workspace.held);
  const format = (value: number | null) =>
    value === null
      ? t("credit.workspace.unlimited")
      : formatCredits(value, i18n.language);
  return (
    <article className="space-y-3 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="min-w-0 font-semibold break-words">
          {workspace.workspaceName}
        </h3>
        {canEdit && !isEditing ? (
          <Button
            variant="outline"
            disabled={!isSafe}
            onClick={() => setIsEditing(true)}
          >
            {t("credit.workspace.edit")}
          </Button>
        ) : null}
      </div>
      {!isSafe ? (
        <p role="alert">{t("credit.errors.unsafe")}</p>
      ) : (
        <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
          {[
            ["cap", workspace.cap],
            ["used", workspace.used],
            ["held", workspace.held],
            ["remaining", remaining],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dt className="text-muted-foreground">
                {t(`credit.workspace.${label}`)}
              </dt>
              <dd className="mt-1 font-medium tabular-nums">
                {format(value as number | null)}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-muted-foreground text-xs">
        {t("credit.usage.period", {
          start: new Date(workspace.periodStart).toLocaleString(i18n.language),
          end: new Date(workspace.periodEnd).toLocaleString(i18n.language),
        })}
      </p>
      {isEditing ? (
        <WorkspaceCreditForm
          workspace={workspace}
          onSave={onSave}
          onReload={onReload}
          onClose={() => setIsEditing(false)}
        />
      ) : null}
    </article>
  );
}
