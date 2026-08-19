import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, type SystemRole, type User } from "@/store/authStore";
import { authService } from "@/services/authService";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  React.useEffect(() => {
    const handleOAuth = async () => {
      const token = searchParams.get("token");
      if (!token) {
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
        navigate("/login", { replace: true });
        return;
      }

      // 1. Lưu tạm accessToken để gọi API
      localStorage.setItem("accessToken", token);

      try {
        // 2. Lấy dữ liệu User Profile và Role THẬT 100% từ Database
        const res = await authService.getProfile();
        const profile = res.data.data;

        if (!profile) {
          throw new Error("Không thể tải thông tin User từ Database.");
        }

        const userObj: User = {
          id: profile.userId,
          name: profile.fullName || "User",
          email: profile.email,
          role: profile.role as SystemRole, // Role lấy trực tiếp từ DB
          workspaceId: profile.workspaceId,
          avatar: profile.avatarUrl,
        };

        setAuth(userObj, token);
        toast.success("Đăng nhập thành công!");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Lỗi khi tải thông tin User từ Database:", error);
        toast.error("Không thể lấy thông tin người dùng từ Database.");
        navigate("/login", { replace: true });
      }
    };

    handleOAuth();
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Loader2 className="text-brand-orange size-8 animate-spin" />
    </div>
  );
}

export default OAuthCallbackPage;
