import { Navigate } from "react-router-dom";

export default function AdminInvoicesPage() {
  return <Navigate to="/admin?view=revenue" replace />;
}
