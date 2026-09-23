import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore, type SystemRole, type User } from "@/store/authStore";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { BackToHomeLink } from "@/components/auth/BackToHomeLink";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";
import { consumeAuthRedirect } from "@/utils/authRedirect";

const TOKEN_KEY = "brandhub-2fa-token";

export function TwoFactorVerifyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const twoFactorToken =
    new URLSearchParams(window.location.search).get("twoFactorToken") ??
    sessionStorage.getItem(TOKEN_KEY);

  React.useEffect(() => {
    if (!twoFactorToken) navigate("/login", { replace: true });
  }, [twoFactorToken, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...code];
    for (let i = 0; i < pasted.length; i++) if (i < 6) next[i] = pasted[i];
    setCode(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpCode = code.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error(t("auth.twoFactor.incompleteCode"));
      return;
    }
    if (!twoFactorToken) return;
    setLoading(true);
    try {
      const res = await authService.verifyTwoFactor(twoFactorToken, otpCode);
      const { accessToken } = res.data.data;

      useAuthStore.getState().setTokens(accessToken, null);

      const profileRes = await authService.getProfile();
      const profileData = profileRes.data.data;
      if (!profileData) {
        throw new Error(t("auth.login.profileLoadFailed"));
      }

      const realUser: User = {
        id: profileData.userId,
        name: profileData.fullName || "",
        email: profileData.email,
        role: profileData.role as SystemRole,
        workspaceId: profileData.workspaceId,
        avatar: profileData.avatarUrl,
      };

      setAuth(realUser, accessToken);
      sessionStorage.removeItem(TOKEN_KEY);
      toast.success(t("auth.twoFactor.successToast"));
      navigate(consumeAuthRedirect(), { replace: true });
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("auth.twoFactor.errorDefault")));
    } finally {
      setLoading(false);
    }
  };

  if (!twoFactorToken) return null;

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
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(240,90,40,0.1)" }}
            >
              <ShieldCheck
                className="size-5"
                style={{ color: "hsl(var(--brand-orange, 15 88% 55%))" }}
              />
            </div>
            <h1 className="text-foreground mb-1 text-center text-2xl font-bold tracking-tight">
              {t("auth.twoFactor.heading")}
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              {t("auth.twoFactor.subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-14 w-12 text-center text-xl font-bold"
                  wrapperClassName="w-12"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <Button
              variant="orange"
              type="submit"
              loading={loading}
              disabled={otpCode.length !== 6}
              className="w-full gap-2 font-semibold"
            >
              {t("auth.twoFactor.submit")}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="text-muted-foreground mt-6 text-center text-sm select-none">
            <button
              onClick={() => {
                sessionStorage.removeItem(TOKEN_KEY);
                navigate("/login");
              }}
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
export default TwoFactorVerifyPage;
