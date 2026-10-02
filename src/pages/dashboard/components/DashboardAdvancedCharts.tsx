import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, TrendingUp, Calendar, Zap, Layers } from "lucide-react";

// Tông màu tối giản, hiện đại (muted tones + brand orange accent)
const BRAND_ORANGE_HEX = "#f05a28";
const NEUTRAL_SLATE = "#64748b";
const SOFT_PURPLE = "#8b5cf6";
const ACCENT_TEAL = "#0d9488";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  PENDING_APPROVAL: "#f59e0b",
  APPROVED: "#3b82f6",
  PUBLISHED: BRAND_ORANGE_HEX,
};

// 1. Dữ liệu hiệu suất đa kênh theo tuần
export interface WeeklyTrendPoint {
  day: string;
  reach: number;
  engagement: number;
  posts: number;
}

export const MOCK_WEEKLY_TRENDS: WeeklyTrendPoint[] = [
  { day: "Th 2", reach: 14200, engagement: 1850, posts: 4 },
  { day: "Th 3", reach: 22800, engagement: 3100, posts: 7 },
  { day: "Th 4", reach: 19500, engagement: 2450, posts: 5 },
  { day: "Th 5", reach: 28400, engagement: 4200, posts: 8 },
  { day: "Th 6", reach: 35900, engagement: 5600, posts: 11 },
  { day: "Th 7", reach: 41200, engagement: 6800, posts: 14 },
  { day: "CN", reach: 38700, engagement: 5900, posts: 9 },
];

// 2. Dữ liệu phân bổ loại nội dung
export const MOCK_CONTENT_TYPE_DATA = [
  { name: "Video / Reels", value: 42, color: BRAND_ORANGE_HEX },
  { name: "Single Image", value: 28, color: SOFT_PURPLE },
  { name: "Carousel / Album", value: 18, color: ACCENT_TEAL },
  { name: "Bài viết / Text", value: 12, color: NEUTRAL_SLATE },
];

// 3. Dữ liệu tỷ lệ hoàn thành mục tiêu tháng (KPI Gauge)
export const MOCK_GOALS_DATA = [
  { name: "Ngân sách", value: 78, fill: NEUTRAL_SLATE },
  { name: "Lượt Reach", value: 92, fill: ACCENT_TEAL },
  { name: "Tương tác", value: 85, fill: SOFT_PURPLE },
  { name: "Bài xuất bản", value: 96, fill: BRAND_ORANGE_HEX },
];

// 4. Lịch đăng nội dung trong tuần
export const MOCK_PUBLISH_SCHEDULE = [
  { hour: "09:00", facebook: 3, instagram: 4, tiktok: 1 },
  { hour: "12:00", facebook: 6, instagram: 8, tiktok: 5 },
  { hour: "15:00", facebook: 4, instagram: 5, tiktok: 2 },
  { hour: "19:00", facebook: 9, instagram: 12, tiktok: 15 },
  { hour: "21:00", facebook: 8, instagram: 10, tiktok: 11 },
];

/**
 * Custom Tooltip tối giản
 */
function MinimalTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="border-border bg-card/95 backdrop-blur-md rounded-lg border p-2.5 shadow-lg text-xs">
      <p className="text-foreground font-semibold mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={`tip-${index}`} className="flex items-center gap-2 justify-between min-w-28 text-2xs py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            {entry.name}:
          </span>
          <span className="font-mono font-medium text-foreground">
            {typeof entry.value === "number" ? entry.value.toLocaleString("vi-VN") : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * 1. BIỂU ĐỒ VÙNG TƯƠNG TÁC (Area Interactive Trend)
 */
export function AudienceGrowthAreaChart() {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<"reach" | "engagement">("reach");

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-foreground" />
            <h3 className="text-foreground text-sm font-bold">
              {t("dashboard.charts.audienceTrendTitle", "Xu hướng tăng trưởng tiếp cận")}
            </h3>
          </div>
          <p className="text-muted-foreground text-2xs mt-0.5">
            {t("dashboard.charts.audienceTrendSubtitle", "Dữ liệu độ phủ và tương tác 7 ngày gần nhất")}
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="bg-muted inline-flex rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMetric("reach")}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-2xs font-medium transition-all ${
              metric === "reach"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("dashboard.charts.reach", "Lượt tiếp cận (Reach)")}
          </button>
          <button
            type="button"
            onClick={() => setMetric("engagement")}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-2xs font-medium transition-all ${
              metric === "engagement"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("dashboard.charts.engagement", "Tương tác (Engagement)")}
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_WEEKLY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="brandOrangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BRAND_ORANGE_HEX} stopOpacity={0.25} />
                <stop offset="95%" stopColor={BRAND_ORANGE_HEX} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip content={<MinimalTooltip />} />
            <Area
              type="monotone"
              dataKey={metric}
              name={metric === "reach" ? "Reach" : "Tương tác"}
              stroke={BRAND_ORANGE_HEX}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#brandOrangeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-2xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          {t("dashboard.charts.growthStat", "+24.8% tuần này so với tuần trước")}
        </span>
        <span className="font-mono text-foreground font-semibold">
          {metric === "reach" ? "200,700 Reach" : "29,800 Interactions"}
        </span>
      </div>
    </div>
  );
}

/**
 * 2. BIỂU ĐỒ DONUT PHÂN BỔ TRẠNG THÁI & FORMAT
 */
export function ContentStatusDonutChart({
  data = { DRAFT: 6, PENDING_APPROVAL: 3, APPROVED: 2, PUBLISHED: 12 },
}: {
  data?: Record<string, number>;
}) {
  const { t } = useTranslation();
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: t(`workspace.dashboard.status.${key}`, key),
    statusKey: key,
    value,
  }));
  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-foreground" />
          <h3 className="text-foreground text-sm font-bold">
            {t("dashboard.charts.contentStatusTitle", "Trạng thái quy trình nội dung")}
          </h3>
        </div>
        <p className="text-muted-foreground text-2xs mt-0.5">
          {t("dashboard.charts.contentStatusSubtitle", "Tỷ lệ bài viết qua các giai đoạn kiểm duyệt")}
        </p>
      </div>

      <div className="relative my-2 flex h-52 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={58}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.statusKey}`}
                  fill={STATUS_COLORS[entry.statusKey] || NEUTRAL_SLATE}
                />
              ))}
            </Pie>
            <Tooltip content={<MinimalTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Total Label in Center */}
        <div className="pointer-events-none absolute flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-3xs uppercase tracking-wider">Tổng</span>
          <span className="text-foreground text-2xl font-bold font-mono">{total}</span>
          <span className="text-muted-foreground text-3xs">bài viết</span>
        </div>
      </div>

      {/* Modern Compact Legend */}
      <div className="grid grid-cols-2 gap-2 text-2xs pt-2 border-t border-border/60">
        {chartData.map((item) => (
          <div key={item.statusKey} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground truncate">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[item.statusKey] || NEUTRAL_SLATE }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-mono font-medium text-foreground ml-2">
              {item.value} ({Math.round((item.value / (total || 1)) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. BIỂU ĐỒ KHUNG GIỜ VÀNG ĐĂNG BÀI (Heatmap / Stacked Bar)
 */
export function PeakHoursBarChart() {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-foreground" />
          <h3 className="text-foreground text-sm font-bold">
            {t("dashboard.charts.peakHoursTitle", "Mật độ bài đăng theo khung giờ")}
          </h3>
        </div>
        <p className="text-muted-foreground text-2xs mt-0.5">
          {t("dashboard.charts.peakHoursSubtitle", "Khung giờ thu hút tương tác cao nhất trong ngày")}
        </p>
      </div>

      <div className="h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_PUBLISH_SCHEDULE} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip content={<MinimalTooltip />} />
            <Bar dataKey="facebook" name="Facebook" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="instagram" name="Instagram" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} />
            <Bar dataKey="tiktok" name="TikTok" stackId="a" fill={BRAND_ORANGE_HEX} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-around border-t border-border/60 pt-3 text-2xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-500" /> Facebook
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-pink-500" /> Instagram
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-orange" /> TikTok
        </span>
      </div>
    </div>
  );
}

/**
 * 4. TIẾN ĐỘ MỤC TIÊU THÁNG (Radial Target KPI)
 */
export function GoalsProgressChart() {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-foreground" />
          <h3 className="text-foreground text-sm font-bold">
            {t("dashboard.charts.goalsTitle", "Tiến độ mục tiêu chiến dịch")}
          </h3>
        </div>
        <p className="text-muted-foreground text-2xs mt-0.5">
          {t("dashboard.charts.goalsSubtitle", "Mức độ hoàn thành các chỉ tiêu marketing quý")}
        </p>
      </div>

      <div className="my-3 space-y-3">
        {MOCK_GOALS_DATA.map((goal) => (
          <div key={goal.name} className="space-y-1">
            <div className="flex items-center justify-between text-2xs">
              <span className="text-foreground font-medium">{goal.name}</span>
              <span className="font-mono text-muted-foreground font-semibold">{goal.value}%</span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${goal.value}%`,
                  backgroundColor: goal.fill,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-border/60 flex items-center justify-between border-t pt-3 text-2xs text-muted-foreground">
        <span>Đánh giá chung:</span>
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <Sparkles className="size-3" /> Đạt 87.8% kế hoạch
        </span>
      </div>
    </div>
  );
}
