import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { errorCode } from "@/services/adminRevenueService";
import type { SendPayload } from "@/pages/mail-templates/services/mailTemplateService";
import type { MailTemplateSummary, RecipientPreview, SendResult } from "@/pages/mail-templates/types";
import { RecipientPreviewLine } from "@/pages/mail-templates/components/RecipientPreviewLine";

interface Props {
  template: MailTemplateSummary;
  send: (id: string, payload: SendPayload, idempotencyKey: string) => Promise<SendResult>;
  sendTest?: (id: string) => Promise<unknown>;
  recipientPreview?: (id: string) => Promise<RecipientPreview>;
  onClose: () => void;
}

/** ADMIN_SYSTEM_BROADCAST (Addendum B5/B9): no recipient list, the backend resolves every active user. */
export function AdminBroadcastDialog({ template, send, sendTest, recipientPreview, onClose }: Props) {
  const { t } = useTranslation();
  const key = useRef(crypto.randomUUID()).current;
  const [password, setPassword] = useState("");
  const [needPassword, setNeedPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      setResult(await send(template.id, { recipients: [], variables: {}, ...(password ? { confirmPassword: password } : {}) }, key));
    } catch (e) {
      const code = errorCode(e);
      if (code === "ADMIN_BROADCAST_CONFIRMATION_REQUIRED") {
        setNeedPassword(true);
        setError(t(password ? "mailTemplate.broadcast.wrongPassword" : "mailTemplate.broadcast.passwordRequired"));
      } else {
        setError(t(`mailTemplate.errors.${code}`, { defaultValue: t("mailTemplate.errors.generic") }));
      }
    } finally {
      setBusy(false);
    }
  };

  const runTest = async () => {
    if (!sendTest) return;
    setBusy(true);
    setError(null);
    try {
      await sendTest(template.id);
      toast.success(t("mailTemplate.send.testSent"));
    } catch (e) {
      const code = errorCode(e);
      setError(t(`mailTemplate.errors.${code}`, { defaultValue: t("mailTemplate.errors.generic") }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("mailTemplate.broadcast.title", { name: template.name })}</DialogTitle>
          <DialogDescription>{t("mailTemplate.broadcast.description")}</DialogDescription>
        </DialogHeader>
        {result ? (
          <p className="text-sm font-medium" data-testid="broadcast-result">
            {t("mailTemplate.send.queuedOk", { accepted: result.accepted, total: result.total })}
          </p>
        ) : (
          <div className="space-y-3">
            {recipientPreview && <RecipientPreviewLine load={() => recipientPreview(template.id)} />}
            {needPassword && (
              <label className="block space-y-1.5 text-sm font-medium">
                <span>{t("mailTemplate.broadcast.password")}</span>
                <Input type="password" autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} />
              </label>
            )}
            {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>{t("mailTemplate.close")}</Button>
          {!result && sendTest && (
            <Button variant="outline" disabled={busy} onClick={() => void runTest()}>
              {t("mailTemplate.send.sendTest")}
            </Button>
          )}
          {!result && (
            <Button variant="orange" disabled={busy || (needPassword && !password)} onClick={() => void submit()}>
              {busy ? t("mailTemplate.send.sending") : t("mailTemplate.broadcast.send")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
