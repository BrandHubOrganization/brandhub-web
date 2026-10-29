import { BatchesPanel } from "@/pages/mail-templates/batches";
import { adminMailBatchService } from "@/pages/mail-templates/services/mailTemplateService";

/** Admin console: progress, cancel and resend for mail that belongs to no Workspace. */
export function AdminMailBatchesPanel() {
  return <BatchesPanel api={adminMailBatchService} />;
}
