import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/error";

export function SecurityPage() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    authService
      .me()
      .then((res) => setEnabled(Boolean(res.data.data.twoFactorEnabled)))
      .catch(() => {
        /* giữ enabled=false; người dùng vẫn có thể bật 2FA */
      });
  }, []);

  const handleEnable = async () => {
    setSubmitting(true);
    try {
      const res = await authService.setupTwoFactor();
      setQrCodeUrl(res.data.data.qrCodeUrl);
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

  return (
    <PageWrapper
      title={t("security.title")}
      description={t("security.description")}
    >
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
    </PageWrapper>
  );
}

export default SecurityPage;
