import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuthStore, type User } from "@/store/authStore";
import { authService } from "@/services/authService";

export function OAuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    const handleOAuth = async () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? searchParams.get("token");
      const oauthError = searchParams.get("error");
      window.history.replaceState(null, "", window.location.pathname);
      useAuthStore.getState().clearAuth();
      if (oauthError || !token) {
        toast.error(t("auth.login.oauthFailed"));
        navigate("/login", { replace: true });
        return;
      }

      // 1. Lưu tạm accessToken vào store để gọi API
      useAuthStore.getState().setTokens(token, null);

      try {
        // 2. Lấy dữ liệu User Profile và Role THẬT 100% từ Database
        const res = await authService.getProfile();
        const profile = res.data.data;

        if (!profile) {
          throw new Error(t("auth.login.profileLoadFailed"));
        }

        const userObj: User = {
          id: profile.userId,
          name: profile.fullName || "User",
          email: profile.email,
          role: profile.role === "ADMIN" ? "ADMIN" : "USER",
          workspaceId: profile.workspaceId,
          avatar: profile.avatarUrl,
        };

        setAuth(userObj, token);
        useAuthStore.getState().setSystemRole(userObj.role);
        toast.success(t("auth.login.successToast"));
        navigate("/", { replace: true });
      } catch {
        useAuthStore.getState().clearAuth();
        toast.error(t("auth.login.oauthProfileFailed"));
        navigate("/login", { replace: true });
      }
    };

    handleOAuth();
  }, [searchParams, setAuth, navigate, t]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Loader2 className="text-brand-orange size-8 animate-spin" />
    </div>
  );
}

export default OAuthCallbackPage;
