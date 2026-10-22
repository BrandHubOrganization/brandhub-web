import { CreditBalancePanel } from "@/pages/credit/components/CreditBalancePanel";
import { WorkspaceCreditPanel } from "@/pages/credit/components/WorkspaceCreditPanel";

export function OwnerCreditView({ agencyId }: { agencyId: string }) {
  return (
    <div className="space-y-5">
      <CreditBalancePanel agencyId={agencyId} />
      <WorkspaceCreditPanel agencyId={agencyId} canEdit />
    </div>
  );
}
