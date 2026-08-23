import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.security.mismatch"));
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success(t("settings.security.changeSuccess"));
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("settings.security.changeFailed")),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title={t("settings.security.submit")}
      description={t("settings.security.pageDescription")}
    >
      <form
        onSubmit={handleSubmit}
        className="border-border bg-card flex max-w-sm flex-col gap-4 rounded-xl border p-6"
      >
        <PasswordInput
          label={t("settings.security.currentPasswordLabel")}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <PasswordInput
          label={t("settings.security.newPasswordLabel")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <PasswordInput
          label={t("settings.security.confirmPasswordLabel")}
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
          {t("settings.security.submit")}
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </PageWrapper>
  );
}

export default ChangePasswordPage;
