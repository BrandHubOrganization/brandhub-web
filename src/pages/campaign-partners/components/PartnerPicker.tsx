import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { campaignPartnerService } from "../services/campaignPartnerService";
import type { CollaboratorOption, PartnerPage } from "../types";

interface Props {
  workspaceId: string;
  busy: boolean;
  onAssign: (id: string) => void;
}

export function PartnerPicker({ workspaceId, busy, onAssign }: Props) {
  const { t } = useTranslation();
  const [result, setResult] = useState<{
    key: string;
    data: PartnerPage<CollaboratorOption> | null;
    error: boolean;
  }>();
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState("");
  const key = `${workspaceId}:${page}:${revision}`;
  const loading = result?.key !== key;
  const data = loading ? null : result?.data ?? null;
  const error = !loading && !!result?.error;

  useEffect(() => {
    let active = true;
    campaignPartnerService
      .options(workspaceId, page)
      .then((result) => {
        if (active) setResult({ key, data: result.data.data, error: false });
      })
      .catch(() => {
        if (active) setResult({ key, data: null, error: true });
      });
    return () => {
      active = false;
    };
  }, [workspaceId, page, key]);

  if (loading) {
    return (
      <div role="status" className="flex justify-center p-6">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/30 bg-destructive/5 space-y-2 rounded-xl border p-4 text-sm"
      >
        <p className="text-destructive font-medium">{t("campaign.partners.error")}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRevision((value) => value + 1)}
        >
          {t("campaign.reload")}
        </Button>
      </div>
    );
  }

  return (
    <section
      aria-label={t("campaign.partners.add")}
      className="border-border bg-card space-y-3.5 rounded-xl border p-4 sm:p-5 shadow-2xs"
    >
      <div className="flex items-center gap-2">
        <div className="bg-brand-orange-soft text-brand-orange flex size-7 items-center justify-center rounded-lg">
          <UserPlus className="size-4" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {t("campaign.partners.add")}
        </h3>
      </div>

      {data?.totalElements === 0 ? (
        <p className="text-muted-foreground text-xs italic">
          {t("campaign.partners.noDirectory")}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <label htmlFor="campaign-partner-choice" className="sr-only">
              {t("campaign.partners.choose")}
            </label>
            <Select
              id="campaign-partner-choice"
              disabled={busy}
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="">{t("campaign.partners.choose")}</option>
              {data?.content.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.partnerName} ·{" "}
                  {t(`campaign.partners.types.${partner.partnerType}`, {
                    defaultValue: partner.partnerType,
                  })}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="orange"
            size="sm"
            className="gap-1.5 shadow-2xs shrink-0"
            disabled={busy || !selected}
            loading={busy}
            onClick={() => onAssign(selected)}
          >
            <Plus className="size-4" />
            <span>{t("campaign.partners.assign")}</span>
          </Button>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-border/50 border-t pt-2.5">
          <span className="text-muted-foreground text-xs">
            {t("campaign.partners.directoryPage", {
              page: page + 1,
              total: data.totalPages,
            })}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={busy || page === 0}
              onClick={() => {
                setSelected("");
                setPage((value) => value - 1);
              }}
              className="gap-1"
            >
              <ChevronLeft className="size-3.5" />
              <span>{t("campaign.partners.previous")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || page + 1 >= data.totalPages}
              onClick={() => {
                setSelected("");
                setPage((value) => value + 1);
              }}
              className="gap-1"
            >
              <span>{t("campaign.partners.next")}</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
