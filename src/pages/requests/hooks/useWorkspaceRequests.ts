import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceRequestService as service } from "@/pages/requests/services/workspaceRequestService";
import type { RequestFields, ReviewAction, WorkspaceRequest } from "@/pages/requests/types/workspaceRequest";

export function useWorkspaceRequests(workspaceId: string) {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<WorkspaceRequest | "new" | null>(null);
  const [cancelling, setCancelling] = useState<WorkspaceRequest | null>(null);
  const [reviewing, setReviewing] = useState<{ request: WorkspaceRequest; action: ReviewAction } | null>(null);
  const requestedPage = Number(params.get("page"));
  const page = Number.isInteger(requestedPage) && requestedPage >= 0 && requestedPage <= 2147483647
    ? requestedPage : 0;
  const status = params.get("status") || "";
  const type = params.get("type") || "";
  const sort = params.get("sort") || "newest";
  const search = params.get("q") || "";
  const selectedId = params.get("request") || "";
  const key = ["workspace-requests", workspaceId];
  const list = useQuery({ queryKey: [...key, "list", page, status, search],
    queryFn: () => service.list(workspaceId, { page, status, search }), retry: false });
  const detail = useQuery({ queryKey: [...key, "detail", selectedId],
    queryFn: () => service.detail(workspaceId, selectedId), enabled: Boolean(selectedId), retry: false });

  function changeParam(name: string, value: string) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set(name, value); else next.delete(name);
      if (name === "status" || name === "q" || name === "type" || name === "sort") next.delete("page");
      return next;
    });
  }
  function resetFilters() {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.delete("q");
      next.delete("status");
      next.delete("type");
      next.delete("sort");
      next.delete("page");
      return next;
    });
  }
  async function refresh() { await queryClient.invalidateQueries({ queryKey: key }); }
  async function save(fields: RequestFields) {
    if (!editing) return;
    if (editing === "new") await service.create(workspaceId, fields);
    else await service.update(workspaceId, editing, fields);
    setEditing(null);
    await refresh();
  }
  async function cancel() {
    if (!cancelling) return;
    await service.cancel(workspaceId, cancelling);
    setCancelling(null);
    await refresh();
  }
  async function review(note: string) {
    if (!reviewing) return;
    await service.review(workspaceId, { ...reviewing, note });
    setReviewing(null);
    await refresh();
  }
  return {
    list,
    detail,
    page,
    status,
    type,
    sort,
    search,
    selectedId,
    editing,
    cancelling,
    setEditing,
    setCancelling,
    changeParam,
    resetFilters,
    refresh,
    save,
    cancel,
    reviewing,
    setReviewing,
    review,
  };
}
