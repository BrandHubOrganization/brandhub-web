import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [newPasswordError, setNewPasswordError] = React.useState("");
  const [confirmError, setConfirmError] = React.useState("");
  // null = chưa biết (đang tải). false = tài khoản OAuth chưa có mật khẩu.
  const [hasPassword, setHasPassword] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    authService
      .me()
      .then((res) => setHasPassword(res.data.data.hasPassword !== false))
      .catch(() => setHasPassword(true));
  }, []);

  // Chỉ OAuth, chưa có mật khẩu → đặt mật khẩu mới, không hỏi mật khẩu hiện tại.
  const isSetPasswordMode = hasPassword === false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError("");
    setConfirmError("");

    if (newPassword.length < 8) {
      setNewPasswordError(t("settings.security.passwordTooShort"));
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setNewPasswordError(t("settings.security.passwordNeedDigit"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError(t("settings.security.mismatch"));
      return;
    }

    setLoading(true);
    try {
      if (isSetPasswordMode) {
        await authService.setPassword({ password: newPassword });
        toast.success(t("settings.security.setPasswordSuccess"));
        navigate("/settings/connections");
      } else {
        await authService.changePassword({ currentPassword, newPassword });
        toast.success(t("settings.security.changeSuccess"));
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(
          err,
          isSetPasswordMode
            ? t("settings.security.setPasswordFailed")
            : t("settings.security.changeFailed"),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const title = isSetPasswordMode
    ? t("settings.security.setPasswordTitle")
    : t("settings.security.submit");
  const description = isSetPasswordMode
    ? t("settings.security.setPasswordDescription")
    : t("settings.security.pageDescription");

  return (
    <section id="change-password" className="scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-foreground text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-border bg-card flex max-w-sm flex-col gap-4 rounded-xl border p-6"
      >
        {!isSetPasswordMode && (
          <PasswordInput
            label={t("settings.security.currentPasswordLabel")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        )}
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label={t("settings.security.newPasswordLabel")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={newPasswordError || undefined}
            autoComplete="new-password"
            required
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>
        <PasswordInput
          label={t("settings.security.confirmPasswordLabel")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmError || undefined}
          autoComplete="new-password"
          required
        />
        <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {t("settings.security.requirements")}
        </p>
        <Button
          variant="orange"
          type="submit"
          loading={loading}
          className="mt-1 gap-2 font-semibold"
        >
          {isSetPasswordMode
            ? t("settings.security.setPasswordSubmit")
            : t("settings.security.submit")}
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </section>
  );
}

export default ChangePasswordPage;
