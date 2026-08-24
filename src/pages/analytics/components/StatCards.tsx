import { useTranslation } from "react-i18next";
import type { StatSummaryCard } from "@/types/analytics";

interface StatCardsProps {
  cards: StatSummaryCard[];
}

function formatDelta(deltaPercent: number): string {
  if (deltaPercent === 0) return "0.0%";
  const sign = deltaPercent > 0 ? "+" : "";
  return `${sign}${deltaPercent.toFixed(1)}%`;
}

export function StatCards({ cards }: StatCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="border-border bg-card space-y-2 rounded-xl border p-6"
        >
          <p className="text-muted-foreground text-3xs font-mono font-semibold tracking-wider uppercase">
            {t(`analytics.stats.${card.key}.label`)}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight">
              {card.value}
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                card.deltaPercent > 0
                  ? "text-emerald-500"
                  : card.deltaPercent < 0
                    ? "text-rose-500"
                    : "text-muted-foreground"
              }`}
            >
              {formatDelta(card.deltaPercent)}
            </span>
          </div>
          <p className="text-muted-foreground text-3xs">
            {t(`analytics.stats.${card.key}.desc`)}
          </p>
        </div>
      ))}
    </div>
  );
}
