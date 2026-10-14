import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RequestPage } from "@/pages/requests/types/workspaceRequest";

export function WorkspaceRequestList({ result, onSelect, onPage }: {
  result: RequestPage; onSelect: (id: string) => void; onPage: (page: number) => void;
}) {
  const { t, i18n } = useTranslation();
  return <section className="space-y-4" aria-label={t("requests.v2.title")}>
    {!result.items.length ? <div className="bg-card rounded-xl border p-8 text-center">
      <FileText aria-hidden="true" className="text-muted-foreground mx-auto mb-3 size-8" />
      <h2 className="font-semibold">{t("requests.v2.empty")}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{t("requests.v2.emptyHelp")}</p>
    </div> : <div className="bg-card divide-y overflow-hidden rounded-xl border">
      {result.items.map(request => <div key={request.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-2">
          <Button variant="link" className="h-auto max-w-full justify-start whitespace-normal break-words p-0 text-left"
            onClick={() => onSelect(request.id)}>{request.title}</Button>
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="outline">{t(`requests.v2.status.${request.status}`)}</Badge>
            <span>{t(`requests.v2.types.${request.type}`)}</span>
            <span>{t("requests.v2.due", { date: new Date(request.dueDate).toLocaleString(i18n.language) })}</span>
          </div>
        </div>
        <Button variant="outline" onClick={() => onSelect(request.id)}>{t("requests.v2.detail")}</Button>
      </div>)}
    </div>}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-muted-foreground text-sm">{t("requests.v2.count", { count: result.total })}</p>
      <nav className="flex items-center gap-2" aria-label={t("requests.v2.pagination")}>
        <Button variant="outline" disabled={result.page === 0} onClick={() => onPage(result.page - 1)}>
          {t("requests.v2.previous")}</Button>
        <span className="text-sm">{t("requests.v2.page", { page: result.page + 1, total: Math.max(1, result.totalPages) })}</span>
        <Button variant="outline" disabled={result.page + 1 >= result.totalPages} onClick={() => onPage(result.page + 1)}>
          {t("requests.v2.next")}</Button>
      </nav>
    </div>
  </section>;
}
