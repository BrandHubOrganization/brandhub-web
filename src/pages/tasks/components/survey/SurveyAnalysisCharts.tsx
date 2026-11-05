import type {
  OptionBreakdown,
  RatingBreakdown,
} from "@/pages/tasks/types/survey";

const PIE_PALETTE = [
  "var(--color-brand-orange)",
  "oklch(0.55 0.18 255)",
  "oklch(0.62 0.17 150)",
  "oklch(0.72 0.16 75)",
  "oklch(0.55 0.18 305)",
  "oklch(0.60 0.14 200)",
  "oklch(0.58 0.20 25)",
  "oklch(0.65 0.15 110)",
];

interface PieSliceData {
  option: string;
  count: number;
  percentage: number;
  slicePct: number;
  color: string;
  path: string;
  labelX: number;
  labelY: number;
  isFullCircle: boolean;
}

function buildPieSlicePath(
  startAngle: number,
  endAngle: number,
  r: number,
): string {
  const x1 = Math.cos(startAngle) * r;
  const y1 = Math.sin(startAngle) * r;
  const x2 = Math.cos(endAngle) * r;
  const y2 = Math.sin(endAngle) * r;
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M 0 0 L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

function buildPieSlices(options: OptionBreakdown[]): PieSliceData[] {
  const total = options.reduce((acc, o) => acc + o.count, 0);
  if (total <= 0) return [];
  const radius = 96;
  let angle = -Math.PI / 2;

  return options.flatMap((opt, idx) => {
    if (opt.count <= 0) return [];
    const color = PIE_PALETTE[idx % PIE_PALETTE.length];
    const fraction = opt.count / total;
    const sweep = fraction * Math.PI * 2;
    const start = angle;
    const end = angle + sweep;
    const mid = start + sweep / 2;
    angle = end;
    return [
      {
        option: opt.option,
        count: opt.count,
        percentage: opt.percentage,
        slicePct: Math.round(fraction * 1000) / 10,
        color,
        path: buildPieSlicePath(start, end, radius),
        labelX: Math.cos(mid) * (radius * 0.62),
        labelY: Math.sin(mid) * (radius * 0.62),
        isFullCircle: opt.count === total,
      },
    ];
  });
}

function computeHorizontalScale(maxCount: number): {
  axisMax: number;
  ticks: number[];
} {
  const target = Math.max(4, Math.ceil(maxCount * 1.25));
  const step = target <= 4 ? 1 : Math.ceil(target / 4);
  const axisMax = step * 4;
  return { axisMax, ticks: [0, step, step * 2, step * 3, axisMax] };
}

function computeVerticalScale(maxCount: number): {
  yAxisMax: number;
  ticks: number[];
} {
  if (maxCount <= 2) return { yAxisMax: 2, ticks: [0, 1, 2] };
  if (maxCount <= 4) {
    return {
      yAxisMax: maxCount,
      ticks: Array.from({ length: maxCount + 1 }, (_, i) => i),
    };
  }
  const step = Math.ceil(maxCount / 4);
  const yAxisMax = step * 4;
  return { yAxisMax, ticks: [0, step, step * 2, step * 3, yAxisMax] };
}

export function SurveyPieChart({ options }: { options: OptionBreakdown[] }) {
  const slices = buildPieSlices(options);
  const fullSlice = slices.find((s) => s.isFullCircle);

  return (
    <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
      <svg viewBox="-105 -105 210 210" className="size-48 shrink-0 sm:size-52">
        {slices.length === 0 && (
          <circle
            cx="0"
            cy="0"
            r="96"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}
        {fullSlice && (
          <g>
            <circle cx="0" cy="0" r="96" fill={fullSlice.color} />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              className="text-xs font-bold select-none"
            >
              {fullSlice.percentage}%
            </text>
          </g>
        )}
        {!fullSlice &&
          slices.map((s, idx) => (
            <g key={idx}>
              <path
                d={s.path}
                fill={s.color}
                stroke="var(--card)"
                strokeWidth="2"
              />
              {s.slicePct >= 7 && (
                <text
                  x={s.labelX}
                  y={s.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  className="text-[11px] font-bold select-none"
                >
                  {s.percentage}%
                </text>
              )}
            </g>
          ))}
      </svg>

      <div className="w-full max-w-xs space-y-2">
        {options.map((opt, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 text-xs sm:text-sm"
          >
            <span
              className="size-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: PIE_PALETTE[idx % PIE_PALETTE.length] }}
            />
            <span className="text-foreground truncate" title={opt.option}>
              {opt.option}
            </span>
            <span className="text-muted-foreground ml-auto pl-3 font-mono text-xs whitespace-nowrap">
              {opt.count} ({opt.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SurveyHorizontalBarChart({
  options,
}: {
  options: OptionBreakdown[];
}) {
  const maxCount = Math.max(0, ...options.map((o) => o.count));
  const { axisMax, ticks } = computeHorizontalScale(maxCount);

  return (
    <div className="pt-2 pb-1">
      <div className="flex items-stretch">
        <div className="w-28 shrink-0 py-2 pr-3 sm:w-44">
          {options.map((opt, idx) => (
            <div key={idx} className="flex h-10 items-center justify-end">
              <span
                className="text-foreground truncate text-right text-xs"
                title={opt.option}
              >
                {opt.option}
              </span>
            </div>
          ))}
        </div>

        <div className="border-border/60 border-l-foreground/70 relative flex-1 border-y border-r border-l py-2">
          {ticks.map((tick) => (
            <div
              key={tick}
              style={{ left: `${(tick / axisMax) * 100}%` }}
              className="border-border/50 pointer-events-none absolute inset-y-0 border-l"
            />
          ))}
          {options.map((opt, idx) => (
            <div key={idx} className="relative z-10 flex h-10 items-center">
              <div
                className="bg-brand-orange h-6 rounded-r-xs transition-all duration-500 sm:h-7"
                style={{
                  width: `${(opt.count / axisMax) * 100}%`,
                  minWidth: opt.count > 0 ? "4px" : "0px",
                }}
              />
              <div className="bg-muted-foreground/60 h-px w-2.5 shrink-0" />
              <span className="text-foreground pl-1 text-xs font-medium whitespace-nowrap">
                {opt.count} ({opt.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative ml-28 h-6 sm:ml-44">
        {ticks.map((tick) => (
          <span
            key={tick}
            style={{ left: `${(tick / axisMax) * 100}%` }}
            className="text-muted-foreground absolute top-1.5 -translate-x-1/2 font-mono text-xs"
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SurveyVerticalColumnChart({
  items,
}: {
  items: RatingBreakdown[];
}) {
  const maxCount = Math.max(0, ...items.map((i) => i.count));
  const { yAxisMax, ticks } = computeVerticalScale(maxCount);

  return (
    <div className="pt-3 pb-1">
      <div className="flex items-stretch">
        <div className="relative h-52 w-8 shrink-0 pr-2 sm:h-60">
          {ticks.map((tick) => (
            <span
              key={tick}
              style={{ bottom: `${(tick / yAxisMax) * 100}%` }}
              className="text-muted-foreground absolute right-2 translate-y-1/2 font-mono text-xs"
            >
              {tick}
            </span>
          ))}
        </div>

        <div className="border-b-foreground/70 relative h-52 flex-1 border-b sm:h-60">
          {ticks.map((tick) => (
            <div
              key={tick}
              style={{ bottom: `${(tick / yAxisMax) * 100}%` }}
              className="border-border/60 pointer-events-none absolute inset-x-0 border-t"
            />
          ))}
          <div className="relative z-10 flex h-full items-end justify-around gap-1.5 px-2 sm:gap-3 sm:px-6">
            {items.map((item) => {
              const heightPct =
                yAxisMax > 0 ? (item.count / yAxisMax) * 100 : 0;
              const isTall = heightPct >= 88;
              return (
                <div
                  key={item.rating}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  {!isTall && (
                    <>
                      <span className="text-foreground text-[11px] font-medium whitespace-nowrap">
                        {item.count} ({item.percentage}%)
                      </span>
                      <div className="bg-muted-foreground/70 h-2.5 w-px shrink-0" />
                    </>
                  )}
                  {item.count > 0 && (
                    <div
                      className="bg-brand-orange/85 hover:bg-brand-orange relative flex w-full max-w-14 flex-col items-center rounded-t-xs transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    >
                      {isTall && (
                        <>
                          <div className="bg-foreground/60 h-2.5 w-px shrink-0" />
                          <span className="bg-card/90 text-foreground rounded-xs px-1 text-[11px] font-medium whitespace-nowrap shadow-2xs">
                            {item.count} ({item.percentage}%)
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ml-8 flex justify-around gap-1.5 px-2 pt-2 sm:gap-3 sm:px-6">
        {items.map((item) => (
          <div
            key={item.rating}
            className="text-foreground flex-1 text-center font-mono text-xs font-medium"
          >
            {item.rating}
          </div>
        ))}
      </div>
    </div>
  );
}
