import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { publicMailService } from "./services/mailTemplateService";

type State = "loading" | "ready" | "invalid" | "done" | "error";

/** Public page (no login) opened from the unsubscribe link in a mail footer. */
export default function UnsubscribePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>(token ? "loading" : "invalid");
  const [info, setInfo] = useState<{ workspaceName: string; maskedEmail: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    publicMailService
      .describe(token)
      .then((d) => { if (!cancelled) { setInfo(d); setState("ready"); } })
      .catch(() => { if (!cancelled) setState("invalid"); });
    return () => { cancelled = true; };
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    try {
      await publicMailService.unsubscribe(token);
      setState("done");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center p-6">
      <section className="bg-card w-full max-w-md space-y-4 rounded-xl border p-6 text-center">
        <h1 className="text-lg font-semibold">{t("mailTemplate.unsubscribe.title")}</h1>
        {state === "loading" && <Spinner />}
        {state === "invalid" && <p role="alert">{t("mailTemplate.unsubscribe.invalid")}</p>}
        {state === "error" && <p role="alert">{t("mailTemplate.errors.generic")}</p>}
        {state === "ready" && info && (
          <>
            <p className="text-sm">{t("mailTemplate.unsubscribe.confirm", { workspace: info.workspaceName, email: info.maskedEmail })}</p>
            <Button disabled={busy} onClick={() => void confirm()} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
              {t("mailTemplate.unsubscribe.button")}
            </Button>
          </>
        )}
        {state === "done" && <p>{t("mailTemplate.unsubscribe.done")}</p>}
      </section>
    </main>
  );
}
