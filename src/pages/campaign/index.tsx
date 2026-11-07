import { CampaignWorkspace } from "@/pages/campaign/components/CampaignWorkspace";
import type { WorkspaceMediaPackage } from "@/pages/media-package/types/mediaPackage";
export default function CampaignPanel(props: {
  selection: WorkspaceMediaPackage;
  canManage: boolean;
  isManager: boolean;
}) {
  return <CampaignWorkspace {...props} />;
}
