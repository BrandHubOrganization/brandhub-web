import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RecipientPreview } from "../types";

interface Props {
  load: () => Promise<RecipientPreview>;
}

/** "Will reach N people" + a short sample, for templates whose audience the backend resolves (agency, system). */
export function RecipientPreviewLine({ load }: Props) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<RecipientPreview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((p) => { if (!cancelled) setPreview(p); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
    // load is a fresh closure on every render; the template it targets is fixed for this component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return <p className="text-muted-foreground text-xs">{t("mailTemplate.audience.failed")}</p>;
  if (!preview) return <p className="text-muted-foreground text-xs">{t("mailTemplate.audience.loading")}</p>;
  return (
    <div className="space-y-1" data-testid="recipient-preview">
      <p className="text-sm font-medium">{t("mailTemplate.audience.total", { count: preview.total })}</p>
      {preview.sample.length > 0 && (
        <p className="text-muted-foreground text-xs break-all">
          {preview.sample.join(", ")}{preview.total > preview.sample.length ? " ..." : ""}
        </p>
      )}
    </div>
  );
}
