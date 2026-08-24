import { Navigate } from "react-router-dom";

// ponytail: /clients already has a full working create flow (CreateEditClientModal
// wired through ClientModals). A separate wizard page would duplicate that form.
// This route just opens the list with the create modal pre-opened via ?create=1.
export function ClientCreatePage() {
  return <Navigate to="/clients?create=1" replace />;
}

export default ClientCreatePage;
