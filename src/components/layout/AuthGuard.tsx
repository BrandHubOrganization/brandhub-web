import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user?.role;

  // Role-based redirects when hitting the root path "/"
  if (location.pathname === "/") {
    if (role === "AGENCY_OWNER") {
      return <Navigate to="/workspace" replace />;
    }
    if (role === "BRAND_CLIENT") {
      return <Navigate to="/portal" replace />;
    }
    if (role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
}

export default AuthGuard;
