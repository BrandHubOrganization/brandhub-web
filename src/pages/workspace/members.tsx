import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useWorkspaceMembers } from "./hooks/useWorkspaceMembers";
import { useClients } from "@/pages/client/hooks/useClients";
import {
  MembersSectionTabs,
  type MembersSection,
} from "./components/MembersSectionTabs";
import { InternalMembersSection } from "./components/InternalMembersSection";
import { ClientsSection } from "./components/ClientsSection";
import { WorkspacePermissionsPanel } from "./components/WorkspacePermissionsPanel";

export function WorkspaceMembersPage() {
  const { t } = useTranslation();
  const [section, setSection] = useState<MembersSection>("internal");
  const membersState = useWorkspaceMembers();
  const { totalElements: clientCount } = useClients();

  if (membersState.loading) return null;

  const internalMembers = membersState.members.filter(
    (m) => m.role !== "CLIENT",
  );

  return (
    <PageWrapper
      title={t("workspace.members.title")}
      description={t("workspace.members.description")}
    >
      <div className="space-y-4">
        <MembersSectionTabs
          active={section}
          internalCount={internalMembers.length}
          clientCount={clientCount}
          onChange={setSection}
        />

        {section === "internal" ? (
          <InternalMembersSection
            {...membersState}
            internalMembers={internalMembers}
          />
        ) : (
          <ClientsSection />
        )}

        <WorkspacePermissionsPanel members={internalMembers} />
      </div>
    </PageWrapper>
  );
}

export default WorkspaceMembersPage;
