import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { CampaignPartnersPanel } from "./components/CampaignPartnersPanel";

export default function CampaignPartnersPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  return (
    <PageWrapper
      title={t("campaign.partners.title")}
      description={t("campaign.partners.description")}
    >
      {id && <CampaignPartnersPanel key={id} workspaceId={id} />}
    </PageWrapper>
  );
}
