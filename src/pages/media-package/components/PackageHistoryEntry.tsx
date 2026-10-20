import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PackageTermsDiff } from "./PackageTermsDiff";
import type { PackageNegotiationEvent } from "../types/mediaPackage";

export function PackageHistoryEntry({ event, currentVersion, currentTerms }: {
  event: PackageNegotiationEvent; currentVersion: number; currentTerms: Record<string, unknown>;
}) {
  const { t, i18n } = useTranslation();
  const [compare, setCompare] = useState(false);
  return <li className="space-y-3 py-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 space-y-1">
      <h4 className="font-medium">{t("mediaPackage.history.version", { version: event.termsVersion })} · {t(`mediaPackage.history.actions.${event.action}`)}</h4>
      <p className="text-sm text-muted-foreground">{event.actorRole ? t(`mediaPackage.history.roles.${event.actorRole}`)
        : t("mediaPackage.history.unknownActor")} · {new Date(event.createdAt).toLocaleString(i18n.language)}</p>
    </div><Button variant="outline" size="sm" aria-expanded={compare} aria-controls={`history-diff-${event.id}`}
      onClick={() => setCompare(value => !value)}>{t(compare ? "mediaPackage.history.hide" : "mediaPackage.history.compare")}</Button></div>
    {event.action === "BASELINE" && <p className="text-sm text-muted-foreground">{t("mediaPackage.history.baseline")}</p>}
    {event.note && <p className="whitespace-pre-wrap break-words text-sm">{event.note}</p>}
    <div id={`history-diff-${event.id}`} hidden={!compare}>{compare && <PackageTermsDiff
      before={event.termsSnapshot} after={currentTerms}
      beforeLabel={t("mediaPackage.history.version", { version: event.termsVersion })}
      afterLabel={t("mediaPackage.history.current", { version: currentVersion })} />}</div>
  </li>;
}
