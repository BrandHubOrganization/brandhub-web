import * as React from "react";
import { useTranslation } from "react-i18next";
import { Info, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

interface ChangePasswordCardProps {
  hasPassword: boolean;
}

/**
 * FR 3.2.5 — Đổi mật khẩu, 2 cách:
 * - "password": nhập mật khẩu hiện tại (hoặc đặt mật khẩu cho tài khoản OAuth chưa có).
 * - "otp": quên mật khẩu hiện tại → nhận mã 6 số qua email rồi đặt mật khẩu mới.
 */
export function ChangePasswordCard({ hasPassword }: ChangePasswordCardProps) {
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<"password" | "otp">("password");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [newPasswordError, setNewPasswordError] = React.useState("");
  const [confirmError, setConfirmError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);

  // Tài khoản chỉ có OAuth → đặt mật khẩu lần đầu, không hỏi mật khẩu hiện tại.
  const isSetPasswordMode = !hasPassword;

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpCode("");
    setNewPasswordError("");
    setConfirmError("");
  };

  const validate = () => {
    setNewPasswordError("");
    setConfirmError("");
    if (newPassword.length < 8) {
      setNewPasswordError(t("security.password.passwordTooShort"));
      return false;
    }
    if (!/[0-9]/.test(newPassword)) {
      setNewPasswordError(t("security.password.passwordNeedDigit"));
      return false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError(t("security.password.mismatch"));
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await authService.sendPasswordChangeOtp();
      setOtpSent(true);
      toast.success(t("security.password.otpSent"));
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("security.password.otpSendError")),
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "otp") {
        await authService.changePasswordWithOtp({
          otpCode: otpCode.trim(),
          newPassword,
        });
        toast.success(t("security.password.otpChangeSuccess"));
      } else if (isSetPasswordMode) {
        await authService.setPassword({ password: newPassword });
        toast.success(t("security.password.setPasswordSuccess"));
      } else {
        await authService.changePassword({ currentPassword, newPassword });
        toast.success(t("security.password.changeSuccess"));
      }
      resetFields();
      setOtpSent(false);
      setMode("password");
    } catch (err: unknown) {
      const fallback =
        mode === "otp"
          ? t("security.password.otpChangeFailed")
          : isSetPasswordMode
            ? t("security.password.setPasswordFailed")
            : t("security.password.changeFailed");
      toast.error(extractErrorMessage(err, fallback));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-border bg-card mt-6 max-w-2xl rounded-xl border p-6">
      <div className="border-border flex items-center gap-3 border-b pb-4">
        <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-2">
          <KeyRound className="size-5" />
        </div>
        <div>
          <h2 className="text-foreground text-sm font-semibold">
            {isSetPasswordMode
              ? t("security.password.setPasswordTitle")
              : t("security.password.title")}
          </h2>
          <p className="text-muted-foreground text-xs">
            {isSetPasswordMode
              ? t("security.password.setPasswordDescription")
              : t("security.password.subtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-6">
        {mode === "otp" && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">
              {t("security.password.otpHint")}
            </p>
            <div className="flex items-start gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={sendingOtp}
                onClick={handleSendOtp}
              >
                {otpSent
                  ? t("security.password.resendOtp")
                  : t("security.password.sendOtp")}
              </Button>
              <Input
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                maxLength={6}
                placeholder={t("security.password.otpPlaceholder")}
              />
            </div>
          </div>
        )}

        {mode === "password" && !isSetPasswordMode && (
          <PasswordInput
            label={t("security.password.currentPasswordLabel")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        )}

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label={t("security.password.newPasswordLabel")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={newPasswordError || undefined}
            autoComplete="new-password"
            required
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <PasswordInput
          label={t("security.password.confirmPasswordLabel")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmError || undefined}
          autoComplete="new-password"
          required
        />

        <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {t("security.password.requirements")}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="orange"
            type="submit"
            loading={loading}
            className="gap-2 font-semibold"
          >
            {mode === "otp"
              ? t("security.password.otpSubmit")
              : isSetPasswordMode
                ? t("security.password.setPasswordSubmit")
                : t("security.password.submit")}
          </Button>
          {!isSetPasswordMode && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetFields();
                setOtpSent(false);
                setMode(mode === "otp" ? "password" : "otp");
              }}
            >
              {mode === "otp"
                ? t("security.password.usePassword")
                : t("security.password.useOtp")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ChangePasswordCard;
