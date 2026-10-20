import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";
import { formatPhoneNumber, isValidPhone } from "@/utils/validation";

interface LinkPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinked: (phone: string) => void;
}

export function LinkPhoneModal({
  isOpen,
  onClose,
  onLinked,
}: LinkPhoneModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const reset = () => {
    setStep("phone");
    setPhone("");
    setPhoneError("");
    setOtpCode("");
    setResendCountdown(0);
  };

  const handlePhoneBlur = () => {
    if (!phone.trim()) {
      setPhoneError("");
      return;
    }
    const formatted = formatPhoneNumber(phone);
    setPhone(formatted);
    if (!isValidPhone(formatted)) {
      setPhoneError(
        t(
          "agency.detail.errors.invalidPhone",
          "Số điện thoại không hợp lệ (10-11 số)",
        ),
      );
    } else {
      setPhoneError("");
    }
  };

  const handleSendOtp = async () => {
    const raw = phone.trim();
    if (!raw) {
      setPhoneError(t("profile.edit.phoneRequired", "Vui lòng nhập số điện thoại"));
      return;
    }
    if (!isValidPhone(raw)) {
      setPhoneError(
        t(
          "agency.detail.errors.invalidPhone",
          "Số điện thoại không hợp lệ (10-11 số)",
        ),
      );
      return;
    }
    setPhoneError("");
    setSending(true);
    try {
      await authService.linkPhone({ phone: raw });
      toast.success(t("profile.linkPhone.otpSent"));
      setStep("otp");
      setResendCountdown(60);
    } catch (err) {
      toast.error(extractErrorMessage(err, t("profile.linkPhone.sendError")));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!otpCode.trim()) return;
    setVerifying(true);
    try {
      await authService.verifyPhoneOtp({ otpCode: otpCode.trim() });
      toast.success(t("profile.linkPhone.verifySuccess"));
      onLinked(phone.trim());
      reset();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, t("profile.linkPhone.verifyError")));
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="border-border bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
        <h3 className="text-foreground text-sm font-semibold">
          {t("profile.linkPhone.title")}
        </h3>
        {step === "phone" ? (
          <div className="space-y-1">
            <Input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError("");
              }}
              onBlur={handlePhoneBlur}
              placeholder={t("profile.edit.phonePlaceholder", "VD: 0901 234 567")}
              error={phoneError}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
              {t("profile.linkPhone.otpHint", "Nhập mã OTP 6 chữ số gửi về điện thoại")}
            </p>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center font-mono tracking-widest text-lg"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Chưa nhận được mã?</span>
              <button
                type="button"
                disabled={resendCountdown > 0 || sending}
                onClick={handleSendOtp}
                className="font-medium text-brand-orange hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
              >
                {resendCountdown > 0
                  ? `Gửi lại sau ${resendCountdown}s`
                  : "Gửi lại mã"}
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t("profile.linkPhone.cancel")}
          </Button>
          {step === "phone" ? (
            <Button
              variant="orange"
              size="sm"
              loading={sending}
              disabled={!phone.trim() || sending}
              onClick={handleSendOtp}
            >
              {t("profile.linkPhone.sendOtp")}
            </Button>
          ) : (
            <Button
              variant="orange"
              size="sm"
              loading={verifying}
              disabled={otpCode.trim().length < 4 || verifying}
              onClick={handleVerify}
            >
              {t("profile.linkPhone.verify")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
