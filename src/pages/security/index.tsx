import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Copy, ShieldCheck } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";

function QrMockup() {
  // Deterministic pseudo-QR grid so the 2FA setup screen has a visual anchor.
  const cells = 21;
  const filled = new Set([
    0, 6, 7, 8, 12, 15, 19, 26, 32, 45, 51, 60, 66, 79, 90, 98, 113, 127, 140,
    155, 168, 182, 199, 214, 230, 247, 264, 281, 300, 318, 335, 351, 366, 380,
    392, 403, 412, 420, 426, 431, 434, 436,
  ]);
  return (
    <div className="border-border bg-card grid aspect-square w-44 grid-cols-[repeat(21,1fr)] gap-0 rounded-lg border p-1.5">
      {Array.from({ length: cells * cells }, (_, i) => (
        <span
          key={i}
          className={filled.has(i) ? "bg-foreground" : "bg-card"}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function SecurityPage() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  const secret = "JBSW Y3DP EHPK 3PXP";
  const backupCodes = [
    "8JQ2-6KR9",
    "P3MW-4TQX",
    "K7N1-Z8VA",
    "C4RD-9UYB",
    "T6FL-2WNH",
    "H9GX-5MSE",
  ];

  const handleCopy = () => {
    navigator.clipboard?.writeText(secret.replace(/\s/g, ""));
    setCopied(true);
    toast.success(t("security.2fa.copySuccess"));
    setTimeout(() => setCopied(false), 1500);
  };

  const handleToggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      toast.success(
        next
          ? t("security.2fa.enableSuccess")
          : t("security.2fa.disableSuccess"),
      );
      return next;
    });
  };

  return (
    <PageWrapper
      title={t("security.title")}
      description={t("security.description")}
    >
      <div className="border-border bg-card max-w-2xl rounded-xl border p-6">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
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
          <button
            type="button"
            onClick={handleToggle}
            className="bg-muted relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors"
            role="switch"
            aria-checked={enabled}
          >
            <span
              className={`bg-card size-5 translate-x-0.5 rounded-full shadow-xs transition-transform ${
                enabled ? "bg-brand-orange translate-x-[22px]" : ""
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-[auto_1fr]">
          <QrMockup />
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs">
              {t("security.2fa.stepHint")}
            </p>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("security.2fa.secretLabel")}
              </label>
              <div className="flex items-center gap-2">
                <code className="bg-muted text-foreground rounded-lg px-3 py-2 font-mono text-xs tracking-widest">
                  {secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? t("security.2fa.copied") : t("security.2fa.copy")}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                {t("security.2fa.verifyCodeLabel")}
              </label>
              <input
                type="text"
                placeholder="000 000"
                className="border-border bg-card text-foreground w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="border-border rounded-lg border p-3">
              <p className="text-muted-foreground mb-2 text-xs font-semibold">
                {t("security.2fa.backupCodes")}
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {backupCodes.map((code) => (
                  <code
                    key={code}
                    className="bg-muted text-muted-foreground text-2xs rounded px-2 py-1 text-center font-mono"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
            <Button variant="orange" className="gap-2" onClick={handleToggle}>
              <ShieldCheck className="size-4" />
              {enabled
                ? t("security.2fa.enabled")
                : t("security.2fa.enableButton")}
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default SecurityPage;
