import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = t("auth.validation.fullNameRequired");
    if (!email.trim()) next.email = t("auth.validation.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = t("auth.validation.emailInvalid");
    if (!password) next.password = t("auth.validation.passwordRequired");
    else if (password.length < 8)
      next.password = t("auth.validation.passwordMinLength");
    else if (!/[0-9]/.test(password))
      next.password = t("auth.validation.passwordNeedDigit");
    if (password !== confirmPassword)
      next.confirmPassword = t("auth.validation.passwordMismatch");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      toast.success(t("auth.register.successToast"));
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("auth.register.errorDefault")));
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-foreground mb-1 text-2xl font-bold tracking-tight">
              {t("auth.register.heading")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.register.subtitle")}
            </p>
          </div>
          <div className="border-border bg-muted mb-6 flex rounded-lg border p-0.5 select-none">
            <button
              onClick={() => navigate("/login")}
              className="text-muted-foreground hover:text-foreground flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium transition-all"
            >
              {t("auth.login.tab")}
            </button>
            <button className="bg-card text-foreground flex-1 cursor-default rounded-md py-1.5 text-sm font-medium shadow-sm transition-all">
              {t("auth.register.tab")}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t("auth.register.fullName")}
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((p) => ({ ...p, fullName: "" }));
              }}
              error={errors.fullName}
              required
            />
            <Input
              label={t("auth.common.email")}
              type="email"
              placeholder="hello@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: "" }));
              }}
              error={errors.email}
              required
            />
            <div>
              <PasswordInput
                label={t("auth.common.password")}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: "" }));
                }}
                error={errors.password}
                required
              />
              <PasswordStrengthMeter password={password} className="mt-1.5" />
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
              {t("auth.register.submit")}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="text-muted-foreground mt-6 text-center text-sm select-none">
            {t("auth.register.haveAccount")}{" "}
            <button
              onClick={() => navigate("/login")}
              className="hover:text-foreground cursor-pointer font-medium underline transition-colors"
            >
              {t("auth.login.tab")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
export default RegisterPage;
