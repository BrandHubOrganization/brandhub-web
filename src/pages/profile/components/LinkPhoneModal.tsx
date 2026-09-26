import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

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
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const reset = () => {
    setStep("phone");
    setPhone("");
    setOtpCode("");
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setSending(true);
    try {
      await authService.linkPhone({ phone: phone.trim() });
      toast.success(t("profile.linkPhone.otpSent"));
      setStep("otp");
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
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("profile.edit.phonePlaceholder")}
          />
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">
              {t("profile.linkPhone.otpHint")}
            </p>
            <Input
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder={t("profile.linkPhone.otpPlaceholder")}
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t("profile.danger.cancel")}
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
              disabled={!otpCode.trim() || verifying}
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
