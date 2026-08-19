import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { BackToHomeLink } from "@/components/auth/BackToHomeLink";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function VerifyOtpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
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
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) if (i < 6) next[i] = pasted[i];
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpCode = otp.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error(t("auth.verifyOtp.incompleteOtp"));
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp({ email, otpCode });
      toast.success(t("auth.verifyOtp.successToast"));
      navigate("/login");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("auth.verifyOtp.errorDefault")));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp({ email });
      toast.success(t("auth.verifyOtp.resendSuccess"));
    } catch {
      toast.error(t("auth.verifyOtp.resendError"));
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

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
              <Mail
                className="size-5"
                style={{ color: "var(--brand-orange, #f05a28)" }}
              />
            </div>
            <h1 className="text-foreground mb-1 text-center text-2xl font-bold tracking-tight">
              {t("auth.verifyOtp.heading")}
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              {t("auth.verifyOtp.subtitle")}{" "}
              <span className="text-foreground font-medium">{email}</span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
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
                  className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-14 w-12 rounded-md border text-center text-xl font-bold outline-none focus-visible:ring-[3px]"
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
              {t("auth.verifyOtp.submit")}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <div className="mt-5 text-center">
            <p className="text-muted-foreground text-sm">
              {t("auth.verifyOtp.noCode")}{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors disabled:opacity-50"
                style={{ color: "var(--brand-orange, #f05a28)" }}
              >
                {resending ? (
                  <RefreshCw className="size-3 animate-spin" />
                ) : (
                  t("auth.verifyOtp.resend")
                )}
              </button>
            </p>
          </div>
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
export default VerifyOtpPage;
