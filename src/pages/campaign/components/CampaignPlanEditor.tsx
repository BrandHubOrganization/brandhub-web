import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignInlineField } from "@/pages/campaign/components/CampaignInlineField";
import type { Campaign, CampaignPlan } from "@/pages/campaign/types";

export function CampaignPlanEditor({
  campaign,
  busy,
  disabled,
  onSave,
  onDirty,
}: {
  campaign: Campaign;
  busy: boolean;
  disabled: boolean;
  onSave: (patch: Partial<CampaignPlan>, version: number) => Promise<unknown>;
  onDirty: (key: string, dirty: boolean) => void;
}) {
  const { t } = useTranslation();
  const [strategyOpen, setStrategyOpen] = useState(false);
  const common = { busy, disabled, version: campaign.contentVersion, onDirty };
  return (
    <div className="space-y-3">
      <Button
        variant="secondary"
        size="sm"
        className="w-full justify-between text-xs"
        aria-expanded={strategyOpen}
        onClick={() => setStrategyOpen((v) => !v)}
      >
        {t("campaign.strategy")}
        <ChevronDown
          className={strategyOpen ? "size-3 rotate-180" : "size-3"}
        />
      </Button>
      <div hidden={!strategyOpen}>
        <CampaignInlineField
          {...common}
          field="strategy"
          hideLabel
          label={t("campaign.strategy")}
          type="textarea"
          value={campaign.strategyDetail || ""}
          onSave={(value, version) =>
            onSave({ strategyDetail: value }, version)
          }
        />
      </div>
    </div>
  );
}
