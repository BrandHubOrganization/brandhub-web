import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trendReplayService as service } from "@/pages/admin/services/trendReplayService";
import type {
  ReplayJob,
  ReplaySelection,
} from "@/pages/admin/types/trendReplay";

export function useTrendReplay() {
  const client = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const history = useQuery({
    queryKey: ["trend-replays"],
    queryFn: service.list,
    refetchInterval: 10000,
  });
  const detail = useQuery({
    queryKey: ["trend-replay", selected],
    enabled: Boolean(selected),
    queryFn: () => service.get(selected ?? ""),
    refetchInterval: (query) =>
      query.state.data?.status === "RUNNING" ? 3000 : false,
  });
  const accept = (job: ReplayJob) => {
    client.setQueryData(["trend-replay", job.id], job);
    setSelected(job.id);
    void client.invalidateQueries({ queryKey: ["trend-replays"] });
  };
  const preview = useMutation({
    mutationFn: (selection: ReplaySelection) => service.preview(selection),
    onSuccess: (job) => {
      accept(job);
      setPreviewId(job.id);
    },
  });
  const start = useMutation({
    mutationFn: service.start,
    onSuccess: (job) => {
      accept(job);
      setPreviewId(null);
    },
  });
  return {
    history,
    detail,
    preview,
    start,
    selected,
    setSelected: (id: string) => {
      setSelected(id);
      setPreviewId(id);
      start.reset();
    },
    previewId,
    invalidatePreview: () => {
      setPreviewId(null);
      preview.reset();
    },
  };
}
