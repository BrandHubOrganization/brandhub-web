import { useDeferredValue, useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { renderPreviewHtml } from "../utils";

interface Props {
  subject: string;
  bodyHtml: string;
}

/** Live, sandboxed preview of the email while it is being written. */
export function MailPreview({ subject, bodyHtml }: Props) {
  const { t } = useTranslation();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const deferred = useDeferredValue(bodyHtml);
  const html = useMemo(() => renderPreviewHtml(deferred), [deferred]);
  const button = (active: boolean) =>
    `inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${active ? "bg-muted font-medium" : "text-muted-foreground"}`;

  return (
    <section aria-label={t("mailTemplate.preview.title")} className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("mailTemplate.preview.title")}</h3>
        <div className="flex gap-1" role="group" aria-label={t("mailTemplate.preview.device")}>
          <button type="button" className={button(device === "desktop")} aria-pressed={device === "desktop"}
            onClick={() => setDevice("desktop")}>
            <Monitor className="size-3.5" />{t("mailTemplate.preview.desktop")}
          </button>
          <button type="button" className={button(device === "mobile")} aria-pressed={device === "mobile"}
            onClick={() => setDevice("mobile")}>
            <Smartphone className="size-3.5" />{t("mailTemplate.preview.mobile")}
          </button>
        </div>
      </div>
      <p className="text-muted-foreground truncate text-xs" data-testid="preview-subject">
        {subject || t("mailTemplate.preview.noSubject")}
      </p>
      <div className="bg-muted/40 flex justify-center rounded-lg border p-2">
        <iframe
          title={t("mailTemplate.preview.frame")}
          sandbox=""
          srcDoc={html}
          data-testid="mail-preview-frame"
          className="h-72 rounded border bg-white"
          style={{ width: device === "mobile" ? 375 : "100%", maxWidth: "100%" }}
        />
      </div>
      <p className="text-muted-foreground text-xs">{t("mailTemplate.preview.sample")}</p>
    </section>
  );
}
