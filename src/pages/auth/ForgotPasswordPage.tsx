import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { BackToHomeLink } from "@/components/auth/BackToHomeLink";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t("auth.validation.emailRequired"));
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
      toast.success(t("auth.forgotPassword.successToast"));
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("auth.forgotPassword.errorDefault")),
      );
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
          {sent ? (
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <CheckCircle2 className="size-6 text-emerald-500" />
              </div>
              <h1 className="text-foreground mb-2 text-2xl font-bold tracking-tight">
                {t("auth.forgotPassword.successHeading")}
              </h1>
              <p className="text-muted-foreground mb-8 text-sm">
                {t("auth.forgotPassword.successMessage", { email })}
              </p>
              <Button
                variant="orange"
                onClick={() => navigate("/login")}
                className="w-full gap-2 font-semibold"
              >
                {t("auth.common.backToLogin")}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 select-none">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "rgba(240,90,40,0.1)" }}
                >
                  <Mail
                    className="size-5"
                    style={{ color: "hsl(var(--brand-orange, 15 88% 55%))" }}
                  />
                </div>
                <h1 className="text-foreground mb-1 text-center text-2xl font-bold tracking-tight">
                  {t("auth.forgotPassword.heading")}
                </h1>
                <p className="text-muted-foreground text-center text-sm">
                  {t("auth.forgotPassword.subtitle")}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label={t("auth.common.email")}
                  type="email"
                  placeholder="hello@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  variant="orange"
                  type="submit"
                  loading={loading}
                  className="mt-1 w-full gap-2 font-semibold"
                >
                  {t("auth.forgotPassword.submit")}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </>
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
export default ForgotPasswordPage;
