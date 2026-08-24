import { useTranslation } from "react-i18next";
import { CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "../types/subscription";

const METHODS: { value: PaymentMethod; icon: typeof CreditCard }[] = [
  { value: "VNPAY", icon: CreditCard },
  { value: "MOMO", icon: Wallet },
];

export interface PaymentMethodSelectorProps {
  value: PaymentMethod | undefined;
  onChange: (value: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {METHODS.map(({ value: method, icon: Icon }) => (
        <button
          key={method}
          type="button"
          onClick={() => onChange(method)}
          className={cn(
            "border-border bg-card flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
            value === method &&
              "border-brand-orange ring-brand-orange/30 ring-1",
          )}
        >
          <Icon
            className={cn(
              "size-5",
              value === method ? "text-brand-orange" : "text-muted-foreground",
            )}
          />
          <div>
            <p className="text-foreground text-sm font-medium">
              {t(`subscription.checkout.methods.${method}`)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default PaymentMethodSelector;
