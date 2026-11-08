import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CampaignStrategyField,
  type CampaignStrategyHandle,
} from "@/pages/campaign/components/CampaignStrategyField";
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
  const [open, setOpen] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const field = useRef<CampaignStrategyHandle>(null);
  const common = { busy, disabled, version: campaign.contentVersion, onDirty };
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) field.current?.save();
        if (
          !next &&
          document.activeElement instanceof HTMLElement &&
          content.current?.contains(document.activeElement)
        ) {
          document.activeElement.blur();
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 gap-2 text-xs"
        >
          {t("campaign.strategy")}
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={content}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          content.current
            ?.querySelector<HTMLElement>('[contenteditable="true"]')
            ?.focus();
        }}
        align="end"
        forceMount
        className="z-[45] w-[min(540px,calc(100vw-24px))] data-[state=closed]:hidden"
      >
        <CampaignStrategyField
          ref={field}
          {...common}
          value={campaign.strategyDetail || ""}
          onSave={(value, version) =>
            onSave({ strategyDetail: value }, version)
          }
        />
      </PopoverContent>
    </Popover>
  );
}
