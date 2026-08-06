import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

/**
 * Đích redirect sau OAuth callback backend — backend đã issue JWT và gắn
 * accessToken vào query string. Trang này chỉ đọc token, lưu vào authStore,
 * rồi điều hướng vào app. Không gọi API nào — role thật sẽ đến từ /me sau.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  React.useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
      navigate("/login", { replace: true });
      return;
    }
    // ponytail: role tạm CONTENT_CREATOR như LoginPage, derive từ /me khi có endpoint
    setAuth(
      { id: "pending", name: "User", email: "", role: "CONTENT_CREATOR" },
      token,
    );
    toast.success("Đăng nhập thành công!");
    navigate("/", { replace: true });
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Loader2 className="text-brand-orange size-8 animate-spin" />
    </div>
  );
}

export default OAuthCallbackPage;
