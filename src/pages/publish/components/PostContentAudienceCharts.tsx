import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ContentTypeStat, AudienceStat } from "../types/dashboard";

interface PostContentAudienceChartsProps {
  contentTypeBreakdown?: ContentTypeStat[];
  audienceBreakdown?: AudienceStat;
}

const DEFAULT_CONTENT_TYPES: ContentTypeStat[] = [
  { type: "PHOTO", label: "Ảnh", views: 6810, percentage: 68.1, followerPercentage: 7.1, nonFollowerPercentage: 92.9 },
  { type: "CAROUSEL", label: "Nhiều ảnh", views: 1920, percentage: 19.2, followerPercentage: 7.1, nonFollowerPercentage: 92.9 },
  { type: "OTHER", label: "Khác", views: 530, percentage: 5.3, followerPercentage: 7.1, nonFollowerPercentage: 92.9 },
  { type: "VIDEO", label: "Thước phim", views: 430, percentage: 4.3, followerPercentage: 7.1, nonFollowerPercentage: 92.9 },
  { type: "TEXT", label: "Văn bản", views: 320, percentage: 3.2, followerPercentage: 7.1, nonFollowerPercentage: 92.9 },
];

const DEFAULT_AUDIENCE: AudienceStat = {
  followerViews: 710,
  followerPercentage: 7.1,
  nonFollowerViews: 9290,
  nonFollowerPercentage: 92.9,
};

interface TooltipPayloadItem {
  name: string;
  value: number;
}

function AudienceDonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-card border-border rounded-lg border p-2 shadow-md text-xs">
      <span className="font-semibold text-foreground">{item.name}: </span>
      <span className="font-mono text-[#0084ff] font-bold">{item.value}%</span>
    </div>
  );
}

export function PostContentAudienceCharts({
  contentTypeBreakdown,
  audienceBreakdown,
}: PostContentAudienceChartsProps) {
  const { t } = useTranslation();

  const contentItems =
    contentTypeBreakdown && contentTypeBreakdown.length > 0
      ? contentTypeBreakdown
      : DEFAULT_CONTENT_TYPES;

  const audience = audienceBreakdown ?? DEFAULT_AUDIENCE;

  const donutData = [
    {
      name: t("publish.dashboard.insights.nonFollowers", "Người chưa theo dõi"),
      value: audience.nonFollowerPercentage,
      color: "#0084ff",
    },
    {
      name: t("publish.dashboard.insights.followers", "Người theo dõi"),
      value: audience.followerPercentage,
      color: "#002c5e",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ── Card 1: Lượt xem theo loại nội dung ── */}
      <div className="bg-card border-border flex flex-col justify-between rounded-xl border p-5">
        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-foreground text-sm font-bold">
              {t("publish.dashboard.insights.contentTypeTitle", "Lượt xem theo loại nội dung")}
            </h2>
            <div className="flex items-center gap-3 text-2xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#0084ff]" />
                <span className="text-muted-foreground">
                  {t("publish.dashboard.insights.followers", "Người theo dõi")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#002c5e] dark:bg-[#3b82f6]" />
                <span className="text-muted-foreground">
                  {t("publish.dashboard.insights.nonFollowers", "Người chưa theo dõi")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 my-auto py-2">
            {contentItems.map((item) => (
              <div key={item.type} className="flex items-center gap-3 text-xs">
                <span className="w-20 sm:w-24 shrink-0 font-medium text-foreground truncate">
                  {t(`publish.dashboard.contentTypes.${item.type}`, item.label)}
                </span>
                <div className="flex-1 h-2.5 bg-muted/40 rounded-full overflow-hidden flex">
                  <div
                    className="h-full flex overflow-hidden rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(Math.max(item.percentage, 0), 100)}%` }}
                  >
                    <div
                      className="h-full bg-[#0084ff]"
                      style={{ width: `${item.followerPercentage}%` }}
                    />
                    <div
                      className="h-full flex-1 bg-[#002c5e] dark:bg-[#3b82f6]"
                    />
                  </div>
                </div>
                <span className="w-12 shrink-0 text-right font-mono font-semibold text-foreground">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card 2: Lượt xem theo người theo dõi so với người chưa theo dõi ── */}
      <div className="bg-card border-border flex flex-col justify-between rounded-xl border p-5">
        <div>
          <div className="mb-2">
            <h2 className="text-foreground text-sm font-bold">
              {t(
                "publish.dashboard.insights.audienceTitle",
                "Lượt xem theo người theo dõi so với người chưa theo dõi",
              )}
            </h2>
          </div>

          {/* Donut Chart */}
          <div className="h-44 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<AudienceDonutTooltip />} />
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#0084ff" />
                  <Cell fill="#002c5e" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Percentage Indicators Footer */}
          <div className="flex items-center justify-center gap-12 mt-3 pt-3 border-t border-border">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-foreground">
                {audience.nonFollowerPercentage}%
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="size-2 rounded-full bg-[#0084ff]" />
                <span className="text-2xs text-muted-foreground font-medium">
                  {t("publish.dashboard.insights.nonFollowers", "Người chưa theo dõi")}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-foreground">
                {audience.followerPercentage}%
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="size-2 rounded-full bg-[#002c5e] dark:bg-[#3b82f6]" />
                <span className="text-2xs text-muted-foreground font-medium">
                  {t("publish.dashboard.insights.followers", "Người theo dõi")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
