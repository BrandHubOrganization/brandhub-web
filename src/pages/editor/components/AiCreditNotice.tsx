import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";

export function AiCreditNotice() {
  const { t } = useTranslation();
  const { id: routeWorkspaceId } = useParams<{ id: string }>();
  const workspace = useWorkspaceStore((state) => state.currentWorkspace);
  const agencyId =
    !routeWorkspaceId || workspace?.id === routeWorkspaceId
      ? workspace?.agencyId
      : null;
  return (
    <div className="text-muted-foreground mb-3 space-y-1 text-xs">
      <p>{t("credit.ai.notice")}</p>
      {agencyId && (
        <Link
          className="text-foreground underline underline-offset-4"
          to={`/agency/${agencyId}/credit`}
        >
          {t("credit.ai.prices")}
        </Link>
      )}
    </div>
  );
}
