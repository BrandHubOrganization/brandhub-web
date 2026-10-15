import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { campaignService } from "@/pages/campaign/services/campaignService";
import { workspaceService } from "@/services/workspaceService";
import { requestDeadlineWindow } from "../lib/requestDeadline";

export function useRequestDeadline(workspaceId: string) {
  const [clock, setClock] = useState(Date.now);
  useEffect(() => {
    const update = () => setClock(Date.now());
    const timer = window.setInterval(update, 60000);
    window.addEventListener("focus", update);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", update); };
  }, []);
  const query = useQuery({ queryKey: ["request-deadline", workspaceId], retry: false,
    queryFn: async () => {
      const [campaigns, workspace] = await Promise.all([
        campaignService.list(workspaceId), workspaceService.getById(workspaceId),
      ]);
      const values = campaigns.data.data;
      const timezone = workspace.data.data.settings.timezone;
      if (values.length !== 1 || !timezone) throw new Error("Missing deadline configuration");
      return { timeline: values[0].timeline, timezone };
    } });
  try {
    return { ...query, window: query.data ? requestDeadlineWindow({ ...query.data, now: clock }) : null };
  } catch {
    return { ...query, isError: true, window: null };
  }
}
