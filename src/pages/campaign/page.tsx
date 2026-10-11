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
  const { selectedPackage, loading, error, load } = useWorkspaceMediaPackages(id);
  const role = useWorkspaceStore(state => state.currentWorkspace?.id === id
    ? state.currentMemberRole ?? state.currentWorkspace?.myRole
    : state.workspaceList.find(workspace => workspace.id === id)?.myRole);
  return <PageWrapper title={t("campaign.title")}>
    {loading && <Spinner />}
    <Link className="text-primary text-sm underline" to={`/workspaces/${id}/campaign-partners`}>
      {t("campaign.partners.title")}
    </Link>
    {!loading && error && <div role="alert">{t("campaign.error")}
      <Button onClick={() => void load()}>{t("campaign.reload")}</Button></div>}
    {!loading && !error && selectedPackage?.negotiationStatus === "APPROVED" &&
      <CampaignPanel key={id} selection={selectedPackage} canManage={role === "MANAGER" || role === "OWNER"} />}
    {!loading && !error && selectedPackage?.negotiationStatus !== "APPROVED" && <p>{t("campaign.packageRequired")}</p>}
  </PageWrapper>;
}
