import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { BackToHomeLink } from "@/components/auth/BackToHomeLink";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { api } from "@/lib/axios";

const POLICY = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;

/** FR 3.10.7: an admin-created account verifies its email and sets its own password through this link. */
export function ActivateAccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [account, setAccount] = React.useState<{
    email: string;
    fullName: string;
  } | null>(null);
  const [invalid, setInvalid] = React.useState(!token);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    api
      .post<{ data: { email: string; fullName: string } }>(
        "/api/v1/auth/activation/verify",
        { token },
      )
      .then((res) => setAccount(res.data.data))
      .catch(() => setInvalid(true));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!POLICY.test(password)) next.password = t("auth.activation.policy");
    if (password !== confirm)
      next.confirm = t("auth.validation.passwordMismatch");
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await api.post("/api/v1/auth/activation/complete", { token, password });
      toast.success(t("auth.activation.done"));
      navigate("/login");
    } catch {
      setInvalid(true);
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
            <div className="bg-brand-orange-soft mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <MailCheck className="text-brand-orange size-5" />
            </div>
            <h1 className="text-foreground mb-1 text-center text-2xl font-bold tracking-tight">
              {t("auth.activation.heading")}
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              {invalid
                ? t("auth.activation.invalid")
                : account
                  ? t("auth.activation.subtitle", {
                      name: account.fullName,
                      email: account.email,
                    })
                  : t("auth.activation.checking")}
            </p>
          </div>
          {account && !invalid && (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <PasswordInput
                  label={t("auth.activation.password")}
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
                <p className="text-muted-foreground mt-1.5 text-xs">
                  {t("auth.activation.policy")}
                </p>
              </div>
              <PasswordInput
                label={t("auth.register.confirmPassword")}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErrors((p) => ({ ...p, confirm: "" }));
                }}
                error={errors.confirm}
                required
              />
              <Button
                variant="orange"
                type="submit"
                loading={loading}
                className="mt-1 w-full gap-2 font-semibold"
              >
                {t("auth.activation.submit")}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}
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
export default ActivateAccountPage;
