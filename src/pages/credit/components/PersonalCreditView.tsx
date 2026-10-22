import { WorkspaceCreditPanel } from "@/pages/credit/components/WorkspaceCreditPanel";

export function PersonalCreditView({ agencyId }: { agencyId: string }) {
  return <WorkspaceCreditPanel agencyId={agencyId} canEdit={false} />;
}
