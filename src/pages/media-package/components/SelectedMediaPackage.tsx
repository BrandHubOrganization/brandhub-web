import { CheckCircle2, CircleDashed, FileCheck2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  applyEffectiveTerms,
  formatPackageType,
  formatPackageValue,
} from "@/pages/media-package/lib/formatMediaPackage";
import type { WorkspaceMediaPackage } from "@/pages/media-package/types/mediaPackage";

interface SelectedMediaPackageProps {
  selection: WorkspaceMediaPackage | null;
}

interface ApprovalStateProps {
  approvedAt: string | null;
  label: string;
}

function ApprovalState({ approvedAt, label }: ApprovalStateProps) {
  const { t, i18n } = useTranslation();
  const Icon = approvedAt ? CheckCircle2 : CircleDashed;
  return (
    <div className="border-border bg-background flex items-center gap-3 rounded-xl border p-3">
      <Icon
        className={
          approvedAt
            ? "size-5 text-emerald-500"
            : "text-muted-foreground size-5"
        }
      />
      <div>
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">
          {approvedAt
            ? new Intl.DateTimeFormat(i18n.language, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(approvedAt))
            : t("mediaPackage.selected.notApproved")}
        </p>
      </div>
    </div>
  );
}

export function SelectedMediaPackage({ selection }: SelectedMediaPackageProps) {
  const { t, i18n } = useTranslation();

  if (!selection) {
    return (
      <section className="border-border bg-card rounded-xl border border-dashed p-6 text-center">
        <FileCheck2 className="text-muted-foreground mx-auto size-9" />
        <h2 className="text-foreground mt-3 text-base font-semibold">
          {t("mediaPackage.selected.emptyTitle")}
        </h2>
        <p className="text-muted-foreground mx-auto mt-1 max-w-xl text-sm">
          {t("mediaPackage.selected.emptyDescription")}
        </p>
      </section>
    );
  }

  const mediaPackage = applyEffectiveTerms(
    selection.mediaPackage,
    selection.finalTerms,
  );
  return (
    <section className="border-border bg-card rounded-xl border p-5 shadow-xs md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="outline">
              {mediaPackage.isTemplate
                ? t("mediaPackage.badges.template")
                : t("mediaPackage.badges.custom")}
            </Badge>
            <Badge variant="secondary">
              {t(`mediaPackage.status.${selection.negotiationStatus}`)}
            </Badge>
          </div>
          <h2 className="text-foreground text-xl font-semibold">
            {mediaPackage.name}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {formatPackageType(mediaPackage.type, t)}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-brand-orange text-xl font-bold">
            {formatPackageValue(mediaPackage, i18n.language, t)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {t("mediaPackage.selected.termsVersion", {
              version: selection.termsVersion,
            })}
          </p>
        </div>
      </div>

      <div className="border-border mt-5 border-t pt-5">
        <h3 className="text-foreground text-sm font-semibold">
          {t("mediaPackage.selected.scopeTitle")}
        </h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6 whitespace-pre-line">
          {mediaPackage.scopeDescription ||
            t("mediaPackage.catalog.noDescription")}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ApprovalState
          label={t("mediaPackage.selected.agencyApproval")}
          approvedAt={selection.approvedByAgencyAt}
        />
        <ApprovalState
          label={t("mediaPackage.selected.clientApproval")}
          approvedAt={selection.approvedByClientAt}
        />
      </div>
    </section>
  );
}
