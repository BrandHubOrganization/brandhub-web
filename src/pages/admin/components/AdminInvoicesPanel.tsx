import { useAuthStore } from "@/store/authStore";
import { InvoiceHistory } from "@/pages/subscription/components/InvoiceHistory";

export function AdminInvoicesPanel() {
  const userId = useAuthStore((state) => state.user?.id);

  if (!userId) return null;

  return (
    <div className="w-full min-w-0 space-y-6">
      <InvoiceHistory
        agencyId=""
        userId={userId}
        admin
      />
    </div>
  );
}

export default AdminInvoicesPanel;
