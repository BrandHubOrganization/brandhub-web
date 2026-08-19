import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success("Đổi mật khẩu thành công");
      navigate("/");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "Đổi mật khẩu thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Đổi mật khẩu"
      description="Trang test tạm — giao diện chính thức làm sau."
    >
      <form
        onSubmit={handleSubmit}
        className="border-border bg-card flex max-w-sm flex-col gap-4 rounded-xl border p-6"
      >
        <PasswordInput
          label="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <PasswordInput
          label="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <PasswordInput
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button
          variant="orange"
          type="submit"
          loading={loading}
          className="mt-1 gap-2 font-semibold"
        >
          Đổi mật khẩu
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </PageWrapper>
  );
}

export default ChangePasswordPage;
