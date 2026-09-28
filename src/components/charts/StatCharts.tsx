import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

// Brand orange + a few complementary tones for multi-slice charts — matches
// --brand-orange (#f05a28) in globals.css.
const PALETTE = [
  "#f05a28",
  "#2d9cdb",
  "#27ae60",
  "#9b51e0",
  "#f2c94c",
  "#eb5757",
];

function recordToChartData(record: Record<string, number>) {
  return Object.entries(record).map(([name, value]) => ({ name, value }));
}

interface ChartCardProps {
  title: string;
  empty?: boolean;
  children: React.ReactNode;
}

function ChartCard({ title, empty, children }: ChartCardProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-card rounded-xl border p-4">
      <p className="mb-3 text-xs font-semibold">{title}</p>
      {empty ? (
        <p className="text-muted-foreground py-8 text-center text-xs">
          {t("agency.detail.statsNoData")}
        </p>
      ) : (
        <div className="h-56 w-full">{children}</div>
      )}
    </div>
  );
}

export function BarStatChart({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const chartData = recordToChartData(data);
  return (
    <ChartCard title={title} empty={chartData.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Bar dataKey="value" fill="#f05a28" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PieStatChart({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const chartData = recordToChartData(data);
  return (
    <ChartCard title={title} empty={chartData.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
          >
            {chartData.map((entry, i) => (
              <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function LineStatChart({
  title,
  data,
}: {
  title: string;
  data: { month: string; count: number }[];
}) {
  return (
    <ChartCard title={title} empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#f05a28"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
