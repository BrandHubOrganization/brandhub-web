import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import CampaignPanel from "@/pages/campaign";
import { useWorkspaceMediaPackages } from "@/pages/media-package/hooks/useMediaPackages";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { selectedPackage, loading, error, load } =
    useWorkspaceMediaPackages(id);
  const role = useWorkspaceStore((state) => {
    const scopedRole = state.workspaceList.find(
      (workspace) => workspace.id === id,
    )?.myRole;
    if (scopedRole) return scopedRole;
    const currentWorkspace = state.currentWorkspace;
    if (!currentWorkspace || currentWorkspace.id !== id) return null;
    return state.currentMemberRole ?? currentWorkspace.myRole ?? null;
  });
  return (
    <PageWrapper hideBanner title={t("campaign.title")}>
      <Link
        className="text-primary text-sm underline"
        to={`/workspaces/${id}/campaign-partners`}
      >
        {t("campaign.partners.title")}
      </Link>
      {loading && <Spinner />}
      {!loading && error && (
        <div role="alert">
          {t("campaign.error")}
          <Button onClick={() => void load()}>{t("campaign.reload")}</Button>
        </div>
      )}
      {!loading &&
        !error &&
        selectedPackage?.negotiationStatus === "APPROVED" && (
          <CampaignPanel
            key={id}
            selection={selectedPackage}
            canManage={role === "MANAGER" || role === "OWNER"}
          />
        )}
      {!loading &&
        !error &&
        selectedPackage?.negotiationStatus !== "APPROVED" && (
          <section className="border-border bg-card space-y-3 rounded-xl border p-5 sm:p-6">
            <h2 className="font-semibold">{t("campaign.packageRequired")}</h2>
            <p className="text-muted-foreground max-w-2xl text-sm leading-6">
              {t("campaign.ux.packageHint")}
            </p>
            <Button variant="orange" asChild>
              <Link to={`/workspaces/${id}/media-package`}>
                {t("campaign.ux.openPackage")}
              </Link>
            </Button>
          </section>
        )}
    </PageWrapper>
  );
}
