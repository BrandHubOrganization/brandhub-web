import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useInvitations } from "./hooks/useInvitations";
import { InvitationList } from "./components/InvitationList";

export function InvitationsPage() {
  const { t } = useTranslation();
  const { invitations, loading, busyToken, handleAccept, handleDecline } =
    useInvitations();

  if (loading) return null;

  return (
    <PageWrapper
      title={t("invitations.title")}
      description={t("invitations.description")}
    >
      <InvitationList
        invitations={invitations}
        busyToken={busyToken}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </PageWrapper>
  );
}

export default InvitationsPage;
