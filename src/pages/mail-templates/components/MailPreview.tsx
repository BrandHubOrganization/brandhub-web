import { useDeferredValue, useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { renderPreviewHtml } from "@/pages/mail-templates/utils";

interface Props {
  subject: string;
  bodyHtml: string;
  fullHeight?: boolean;
}

/** Live, sandboxed preview of the email while it is being written. */
export function MailPreview({ subject, bodyHtml, fullHeight = false }: Props) {
  const { t } = useTranslation();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const deferred = useDeferredValue(bodyHtml);
  const html = useMemo(() => renderPreviewHtml(deferred), [deferred]);
  const buttonClass = (active: boolean) =>
    `h-7 gap-1 px-2 text-xs ${active ? "bg-muted font-medium" : "text-muted-foreground"}`;

  return (
    <section
      aria-label={t("mailTemplate.preview.title")}
      className={fullHeight ? "flex h-full flex-1 flex-col space-y-2" : "space-y-2"}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("mailTemplate.preview.title")}</h3>
        <div className="flex gap-1" role="group" aria-label={t("mailTemplate.preview.device")}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={buttonClass(device === "desktop")}
            aria-pressed={device === "desktop"}
            onClick={() => setDevice("desktop")}
          >
            <Monitor className="size-3.5" />
            <span>{t("mailTemplate.preview.desktop")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={buttonClass(device === "mobile")}
            aria-pressed={device === "mobile"}
            onClick={() => setDevice("mobile")}
          >
            <Smartphone className="size-3.5" />
            <span>{t("mailTemplate.preview.mobile")}</span>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground truncate text-xs" data-testid="preview-subject">
        {subject || t("mailTemplate.preview.noSubject")}
      </p>
      <div
        className={
          fullHeight
            ? "bg-muted/40 flex flex-1 flex-col items-center justify-center rounded-lg border p-3"
            : "bg-muted/40 flex justify-center rounded-lg border p-2"
        }
      >
        <iframe
          title={t("mailTemplate.preview.frame")}
          sandbox=""
          srcDoc={html}
          data-testid="mail-preview-frame"
          className={
            fullHeight
              ? "min-h-[560px] h-full w-full flex-1 rounded border bg-white"
              : "h-72 w-full rounded border bg-white"
          }
          style={{ width: device === "mobile" ? 375 : "100%", maxWidth: "100%" }}
        />
      </div>
      <p className="text-muted-foreground text-xs">{t("mailTemplate.preview.sample")}</p>
    </section>
  );
}
