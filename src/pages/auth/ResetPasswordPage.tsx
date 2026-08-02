import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!token) navigate("/forgot-password", { replace: true });
  }, [token, navigate]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!newPassword)
      next.newPassword = t("auth.validation.newPasswordRequired");
    else if (newPassword.length < 8)
      next.newPassword = t("auth.validation.passwordMinLength");
    else if (!/[0-9]/.test(newPassword))
      next.newPassword = t("auth.validation.passwordNeedDigit");
    if (newPassword !== confirmPassword)
      next.confirmPassword = t("auth.validation.passwordMismatch");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword });
      toast.success(t("auth.resetPassword.successToast"));
      navigate("/login");
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("auth.resetPassword.errorDefault")),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div
      className="bg-background flex min-h-screen"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <AuthBrandPanel />
      <div className="flex flex-1 items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-[400px]">
          <AuthMobileHeader />
          <div className="mb-8 select-none">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(240,90,40,0.1)" }}
            >
              <LockKeyhole
                className="size-5"
                style={{ color: "var(--brand-orange, #f05a28)" }}
              />
            </div>
            <h1 className="text-foreground mb-1 text-center text-2xl font-bold tracking-tight">
              {t("auth.resetPassword.heading")}
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              {t("auth.resetPassword.subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <PasswordInput
                label={t("auth.resetPassword.newPassword")}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((p) => ({ ...p, newPassword: "" }));
                }}
                error={errors.newPassword}
                required
              />
              <PasswordStrengthMeter
                password={newPassword}
                className="mt-1.5"
              />
            </div>
            <PasswordInput
              label={t("auth.register.confirmPassword")}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              error={errors.confirmPassword}
              required
            />
            <Button
              variant="orange"
              type="submit"
              loading={loading}
              className="mt-1 w-full gap-2 font-semibold"
            >
              {t("auth.resetPassword.submit")}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="text-muted-foreground mt-6 text-center text-sm select-none">
            <button
              onClick={() => navigate("/login")}
              className="hover:text-foreground cursor-pointer underline transition-colors"
            >
              {t("auth.common.backToLogin")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
export default ResetPasswordPage;
