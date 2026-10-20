import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePackageHistory } from "../hooks/usePackageHistory";
import { PackageHistoryEntry } from "./PackageHistoryEntry";

export function PackageNegotiationHistory({ workspaceId, currentVersion, currentTerms }: {
  workspaceId: string; currentVersion: number; currentTerms: Record<string, unknown>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const state = usePackageHistory(workspaceId, currentVersion, open);
  return <section className="rounded-xl border bg-card p-4 sm:p-6">
    <Button variant="ghost" className="w-full justify-between whitespace-normal text-left" aria-expanded={open}
      aria-controls="package-negotiation-history" onClick={() => setOpen(value => !value)}>{t("mediaPackage.history.title")}</Button>
    <div id="package-negotiation-history" hidden={!open}>{open && <div className="mt-4 space-y-3">
      <p className="text-sm text-muted-foreground">{t("mediaPackage.history.readOnly")}</p>
      <Button variant="outline" size="sm" onClick={state.reload}>{t("mediaPackage.history.reload")}</Button>
      {state.loading ? <Spinner /> : state.error ? <p role="alert">{t("mediaPackage.history.error")}</p>
        : !state.data?.content.length ? <p className="text-muted-foreground">{t("mediaPackage.history.empty")}</p>
          : <ul className="divide-y">{state.data.content.map(event => <PackageHistoryEntry key={event.id} event={event}
            currentVersion={currentVersion} currentTerms={currentTerms} />)}</ul>}
      {!!state.data && state.data.totalPages > 1 && <nav aria-label={t("mediaPackage.history.title")} className="flex items-center gap-2">
        <Button variant="outline" disabled={state.loading || state.page === 0} onClick={() => state.setPage(value => value - 1)}>
          {t("mediaPackage.history.previous")}</Button><span>{state.page + 1} / {state.data.totalPages}</span>
        <Button variant="outline" disabled={state.loading || state.page + 1 >= state.data.totalPages}
          onClick={() => state.setPage(value => value + 1)}>{t("mediaPackage.history.next")}</Button></nav>}
    </div>}</div>
  </section>;
}
