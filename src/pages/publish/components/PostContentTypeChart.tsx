import { useTranslation } from "react-i18next";
import type { ContentTypeStat } from "../types/dashboard";

interface PostContentTypeChartProps {
  contentTypeBreakdown: ContentTypeStat[];
}

export function PostContentTypeChart({
  contentTypeBreakdown,
}: PostContentTypeChartProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border-border rounded-xl border p-5">
      <h2 className="text-foreground mb-4 text-sm font-bold">
        {t(
          "publish.dashboard.insights.contentTypeTitle",
          "Lượt xem theo loại nội dung",
        )}
      </h2>

      <div className="space-y-4 py-2">
        {contentTypeBreakdown.map((item) => (
          <div key={item.type} className="flex items-center gap-3 text-xs">
            <span className="text-foreground w-20 shrink-0 truncate font-medium sm:w-24">
              {t(`publish.dashboard.contentTypes.${item.type}`, item.label)}
            </span>
            <div className="bg-muted/40 h-2.5 flex-1 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-[#0084ff] transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(item.percentage, 0), 100)}%`,
                }}
              />
            </div>
            <span className="text-foreground w-12 shrink-0 text-right font-mono font-semibold">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
