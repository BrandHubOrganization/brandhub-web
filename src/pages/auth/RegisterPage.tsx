import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { BackToHomeLink } from "@/components/auth/BackToHomeLink";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { authService, oauthUrl } from "@/services/authService";
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

  type FieldName = "fullName" | "email" | "password" | "confirmPassword";

  // Validate one field against its current value (passwordValue used for the
  // confirm-password match). Returns "" when valid, so callers can store the
  // result directly in the errors map.
  const getFieldError = (
    name: FieldName,
    value: string,
    passwordValue: string,
  ): string => {
    switch (name) {
      case "fullName":
        return value.trim() ? "" : t("auth.validation.fullNameRequired");
      case "email":
        if (!value.trim()) return t("auth.validation.emailRequired");
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : t("auth.validation.emailInvalid");
      case "password":
        if (!value) return t("auth.validation.passwordRequired");
        if (value.length < 8) return t("auth.validation.passwordMinLength");
        if (!/[0-9]/.test(value)) return t("auth.validation.passwordNeedDigit");
        return "";
      case "confirmPassword":
        return value && value !== passwordValue
          ? t("auth.validation.passwordMismatch")
          : "";
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {
      fullName: getFieldError("fullName", fullName, password),
      email: getFieldError("email", email, password),
      password: getFieldError("password", password, password),
      confirmPassword: getFieldError(
        "confirmPassword",
        confirmPassword,
        password,
      ),
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
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
          <BackToHomeLink />
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
              className="text-muted-foreground hover:text-foreground flex-1 cursor-pointer rounded-xl py-1.5 text-sm font-medium transition-all"
            >
              {t("auth.login.tab")}
            </button>
            <button className="bg-card text-foreground flex-1 cursor-default rounded-xl py-1.5 text-sm font-medium shadow-xs transition-all">
              {t("auth.register.tab")}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t("auth.register.fullName")}
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => {
                const v = e.target.value;
                setFullName(v);
                setErrors((p) => ({
                  ...p,
                  fullName: getFieldError("fullName", v, password),
                }));
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
                const v = e.target.value;
                setEmail(v);
                setErrors((p) => ({
                  ...p,
                  email: getFieldError("email", v, password),
                }));
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
                  const v = e.target.value;
                  setPassword(v);
                  setErrors((p) => ({
                    ...p,
                    password: getFieldError("password", v, v),
                    confirmPassword: confirmPassword
                      ? getFieldError("confirmPassword", confirmPassword, v)
                      : "",
                  }));
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
                const v = e.target.value;
                setConfirmPassword(v);
                setErrors((p) => ({
                  ...p,
                  confirmPassword: getFieldError(
                    "confirmPassword",
                    v,
                    password,
                  ),
                }));
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
          <div className="my-5 flex items-center gap-3 select-none">
            <div className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-sm">
              {t("auth.login.orContinue")}
            </span>
            <div className="bg-border h-px flex-1" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <a
              href={oauthUrl("google")}
              className="border-input hover:bg-accent inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </a>
          </div>
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
