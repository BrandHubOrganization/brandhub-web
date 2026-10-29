import { SuppressionsPanel } from "@/pages/mail-templates/suppressions";
import { adminMailSuppressionService } from "@/pages/mail-templates/services/mailTemplateService";

/** Admin console: the system-wide unsubscribe list (broadcast mail). Re-subscribing is audited by the server. */
export function AdminMailSuppressionsPanel() {
  return <SuppressionsPanel api={adminMailSuppressionService} />;
}
