import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campaign } from "@/pages/campaign/types";

interface Props {
  workspaceId?: string;
  campaigns: Campaign[];
  loading: boolean;
  failed: boolean;
  canPlan: boolean;
  onRetry: () => void;
}

export function WorkspaceCampaignSummary({
  workspaceId,
  campaigns,
  loading,
  failed,
  canPlan,
  onRetry,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const key = "workspace.dashboard.workspaceCampaign";
  const campaign = campaigns.length === 1 ? campaigns[0] : null;
  const open = () =>
    workspaceId && navigate(`/workspaces/${workspaceId}/campaigns`);

  return (
    <section className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-xs">
      <h3 className="text-foreground flex items-center gap-2 font-semibold">
        <Layers className="text-brand-orange size-5" aria-hidden="true" />
        {t(`${key}.title`)}
      </h3>
      {loading ? (
        <div
          role="status"
          aria-label={t(`${key}.loading`)}
          className="space-y-3"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ) : failed ? (
        <div role="alert" className="space-y-3">
          <p className="text-muted-foreground text-sm">{t(`${key}.error`)}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t(`${key}.retry`)}
          </Button>
        </div>
      ) : campaigns.length > 1 ? (
        <div role="alert" className="space-y-3">
          <p className="text-destructive text-sm">{t(`${key}.conflict`)}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={open}
            disabled={!workspaceId}
          >
            {t(`${key}.open`)}
          </Button>
        </div>
      ) : campaign ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-foreground min-w-0 text-lg font-medium break-words">
              {campaign.name}
            </p>
            <Badge variant="outline">
              {t(`campaign.status.${campaign.status}`)}
            </Badge>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <span>
              {t(`${key}.version`, { version: campaign.contentVersion })}
            </span>
            <span>
              {t(`${key}.plannedWork`, {
                count: campaign.workItems?.length ?? 0,
              })}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={open}
            disabled={!workspaceId}
          >
            {t(`${key}.open`)}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-foreground text-sm font-medium">
            {t(`${key}.empty`)}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(`${key}.emptyHelp`)}
          </p>
          {canPlan && workspaceId && (
            <Button variant="outline" size="sm" onClick={open}>
              {t(`${key}.create`)}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
