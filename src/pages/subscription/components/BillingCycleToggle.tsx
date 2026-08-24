import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BillingCycle } from "../types/subscription";

export interface BillingCycleToggleProps {
  value: BillingCycle;
  onChange: (value: BillingCycle) => void;
}

export function BillingCycleToggle({
  value,
  onChange,
}: BillingCycleToggleProps) {
  const { t } = useTranslation();

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as BillingCycle)}>
      <TabsList>
        <TabsTrigger value="MONTHLY">
          {t("subscription.plans.monthly")}
        </TabsTrigger>
        <TabsTrigger value="YEARLY">
          {t("subscription.plans.yearly")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default BillingCycleToggle;
