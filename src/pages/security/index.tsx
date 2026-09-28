import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";
import { ChangePasswordCard } from "./components/ChangePasswordCard";

export function SecurityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateOtp, setDeactivateOtp] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    authService
      .me()
      .then((res) => {
        setEnabled(Boolean(res.data.data.twoFactorEnabled));
        setHasPassword(res.data.data.hasPassword ?? true);
      })
      .catch(() => {
        /* giữ enabled=false; người dùng vẫn có thể bật 2FA */
      });
  }, []);

  const handleEnable = async () => {
    setSubmitting(true);
    try {
      const res = await authService.setupTwoFactor();
      setQrCodeUrl(res.data.data.otpAuthUrl);
      setCode("");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("security.2fa.setupError")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmEnable = async () => {
    if (code.trim().length !== 6) return;
    setSubmitting(true);
    try {
      await authService.confirmTwoFactor(code.trim());
      setEnabled(true);
      setQrCodeUrl(null);
      setCode("");
      toast.success(t("security.2fa.enableSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("security.2fa.enableError")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDisable = async () => {
    if (code.trim().length !== 6) return;
    setSubmitting(true);
    try {
      await authService.disableTwoFactor(code.trim());
      setEnabled(false);
      setDisabling(false);
      setCode("");
      toast.success(t("security.2fa.disableSuccess"));
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("security.2fa.disableError")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await authService.deactivate(
        hasPassword ? deactivatePassword : undefined,
        hasPassword ? undefined : deactivateOtp,
      );
      useAuthStore.getState().logout();
      navigate("/login");
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("security.danger.deactivateError")),
      );
      setDeactivating(false);
    }
  };

  const handleSendDeactivateOtp = async () => {
    setSendingOtp(true);
    try {
      await authService.sendDeactivateOtp();
      setOtpSent(true);
      toast.success(t("security.danger.otpSent"));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("security.danger.otpSendError")));
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <section id="security" className="scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-foreground text-lg font-semibold">
          {t("security.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("security.description")}
        </p>
      </div>
      <div className="border-border bg-card max-w-2xl rounded-xl border p-6">
        <div className="border-border flex items-center gap-3 border-b pb-4">
          <div className="bg-brand-orange-soft text-brand-orange rounded-lg p-2">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h2 className="text-foreground text-sm font-semibold">
              {t("security.2fa.title")}
            </h2>
            <p className="text-muted-foreground text-xs">
              {t("security.2fa.subtitle")}
            </p>
          </div>
        </div>

        {/* Chưa bật 2FA */}
        {!enabled && !qrCodeUrl && !disabling && (
          <div className="pt-6">
            <Button
              variant="orange"
              className="gap-2"
              onClick={handleEnable}
              loading={submitting}
            >
              <ShieldCheck className="size-4" />
              {t("security.2fa.enableButton")}
            </Button>
          </div>
        )}

        {/* Đang thiết lập (QR + secret + nhập mã) */}
        {!enabled && qrCodeUrl && (
          <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-[auto_1fr]">
            <div className="border-border bg-card flex aspect-square w-44 items-center justify-center rounded-lg border p-2">
              <QRCodeSVG value={qrCodeUrl} size={160} />
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs">
                {t("security.2fa.stepHint")}
              </p>
              <Input
                label={t("security.2fa.verifyCodeLabel")}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <div className="flex gap-2">
                <Button
                  variant="orange"
                  className="gap-2"
                  onClick={handleConfirmEnable}
                  loading={submitting}
                  disabled={code.trim().length !== 6}
                >
                  <ShieldCheck className="size-4" />
                  {t("security.2fa.confirmEnable")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQrCodeUrl(null);
                    setCode("");
                  }}
                >
                  {t("security.2fa.cancel")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Đã bật 2FA */}
        {enabled && !disabling && (
          <div className="pt-6">
            <p className="text-muted-foreground mb-4 text-sm">
              {t("security.2fa.enabledHint")}
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setDisabling(true);
                setCode("");
              }}
            >
              {t("security.2fa.disableButton")}
            </Button>
          </div>
        )}

        {/* Xác nhận tắt 2FA */}
        {enabled && disabling && (
          <div className="space-y-4 pt-6">
            <p className="text-muted-foreground text-sm">
              {t("security.2fa.disableHint")}
            </p>
            <Input
              label={t("security.2fa.verifyCodeLabel")}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
            <div className="flex gap-2">
              <Button
                variant="orange"
                className="gap-2"
                onClick={handleConfirmDisable}
                loading={submitting}
                disabled={code.trim().length !== 6}
              >
                {t("security.2fa.confirmDisable")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDisabling(false);
                  setCode("");
                }}
              >
                {t("security.2fa.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordCard hasPassword={hasPassword} />

      <div className="border-border bg-card mt-6 max-w-2xl rounded-xl border border-red-200 p-6 dark:border-red-900/50">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <TriangleAlert className="size-4 text-rose-500" />
          {t("security.danger.title")}
        </h3>
        <p className="text-muted-foreground mt-2 text-xs">
          {t("security.danger.deactivateHint")}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40"
          onClick={() => setDeactivateOpen(true)}
        >
          {t("security.danger.deactivateButton")}
        </Button>
      </div>

      {deactivateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="border-border bg-card w-full max-w-sm space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-rose-500" />
              <h3 className="text-foreground text-sm font-semibold">
                {t("security.danger.confirmTitle")}
              </h3>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("security.danger.confirmBody")}
            </p>
            {hasPassword ? (
              <Input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                placeholder={t("security.danger.passwordPlaceholder")}
              />
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  loading={sendingOtp}
                  onClick={handleSendDeactivateOtp}
                >
                  {otpSent
                    ? t("security.danger.resendOtp")
                    : t("security.danger.sendOtp")}
                </Button>
                <Input
                  value={deactivateOtp}
                  onChange={(e) => setDeactivateOtp(e.target.value)}
                  placeholder={t("security.danger.otpPlaceholder")}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeactivateOpen(false)}
              >
                {t("security.danger.cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                loading={deactivating}
                disabled={
                  (hasPassword ? !deactivatePassword : !deactivateOtp) ||
                  deactivating
                }
                onClick={handleDeactivate}
              >
                {t("security.danger.confirmDeactivate")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SecurityPage;
