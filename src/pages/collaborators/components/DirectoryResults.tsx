import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { useDirectory } from "../hooks/useDirectory";
import { PartnerList } from "./PartnerList";
import type { DirectoryPartner } from "../types";
export function DirectoryResults({ state, onDetail, onEdit, onAction }: {
  state: ReturnType<typeof useDirectory>; onDetail: (partner: DirectoryPartner) => void;
  onEdit: (partner: DirectoryPartner) => void;
  onAction: (partner: DirectoryPartner, kind: "delete" | "deactivate") => void;
}) {
  const { t } = useTranslation();
  if (state.loading) return <Spinner />;
  if (state.error) return <div role="alert" className="space-y-3"><p>{t("collaborators.loadError")}</p>
    <Button variant="outline" onClick={state.reload}>{t("collaborators.reload")}</Button></div>;
  if (!state.data) return null;
  return <><PartnerList partners={state.data.content} busy={state.busy} onDetail={onDetail}
    onEdit={onEdit} onAction={onAction} />
    <nav aria-label={t("collaborators.pagination")} className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{t("collaborators.total", { count: state.data.totalElements })}</span>
      <div className="flex items-center gap-2"><Button variant="outline" disabled={state.busy || state.page === 0}
        onClick={() => state.setPage(value => value - 1)}>{t("collaborators.previous")}</Button>
        <span>{state.page + 1} / {Math.max(1, state.data.totalPages)}</span>
        <Button variant="outline" disabled={state.busy || state.page + 1 >= state.data.totalPages}
          onClick={() => state.setPage(value => value + 1)}>{t("collaborators.next")}</Button></div></nav></>;
}
