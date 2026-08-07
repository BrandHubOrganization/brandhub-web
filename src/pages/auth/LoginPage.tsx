import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { authService, oauthUrl } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login({
        identifier: identifier.trim(),
        password,
      });
      const { accessToken } = res.data.data;
      // ponytail: derive role from /me endpoint when available
      const role: UserRole = "CONTENT_CREATOR";
      setAuth(
        {
          id: "pending",
          name: identifier.split("@")[0],
          email: identifier.trim(),
          role,
        },
        accessToken,
        (res.data.data as any).refreshToken || "",
      );
      toast.success(t("auth.login.successToast"));
      navigate("/");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("auth.login.errorDefault")));
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
              {t("auth.login.welcomeBack")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.login.subtitle")}
            </p>
          </div>
          <div className="border-border bg-muted mb-6 flex rounded-lg border p-0.5 select-none">
            <button className="bg-card text-foreground flex-1 cursor-default rounded-md py-1.5 text-sm font-medium shadow-sm transition-all">
              {t("auth.login.tab")}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-muted-foreground hover:text-foreground flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium transition-all"
            >
              {t("auth.register.tab")}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t("auth.common.email")}
              type="text"
              placeholder="hello@company.com / 0912 345 678"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between select-none">
                <label className="text-foreground text-sm font-medium tracking-wide">
                  {t("auth.common.password")}
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors"
                >
                  {t("auth.login.forgotPassword")}
                </button>
              </div>
              <PasswordInput
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              variant="orange"
              type="submit"
              loading={loading}
              className="mt-1 w-full gap-2 font-semibold"
            >
              {t("auth.login.submit")}
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
          <div className="grid grid-cols-4 gap-3">
            <a
              href={oauthUrl("google")}
              className="border-input hover:bg-accent inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
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
            <a
              href={oauthUrl("github")}
              className="border-input hover:bg-accent inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href={oauthUrl("linkedin")}
              className="border-input hover:bg-accent inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href={oauthUrl("microsoft")}
              className="border-input hover:bg-accent inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#00A4EF" d="M1 13h10v10H1z" />
                <path fill="#7FBA00" d="M13 1h10v10H13z" />
                <path fill="#FFB900" d="M13 13h10v10H13z" />
              </svg>
            </a>
          </div>
          <p className="text-muted-foreground mt-6 text-center text-sm select-none">
            {t("auth.login.agreeToTerms")}{" "}
            <button className="hover:text-foreground cursor-pointer underline transition-colors">
              {t("auth.login.termsOfService")}
            </button>{" "}
            {t("auth.common.and")}{" "}
            <button className="hover:text-foreground cursor-pointer underline transition-colors">
              {t("auth.login.privacyPolicy")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
