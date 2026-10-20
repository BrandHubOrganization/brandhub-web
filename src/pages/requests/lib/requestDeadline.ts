export interface DeadlineWindow { min: string; max: string; timezone: string }

export function localDateTime(value: string | number) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function dayInZone(formatter: Intl.DateTimeFormat, instant: number) {
  const parts = formatter.formatToParts(instant);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}

// Find the first instant of a Workspace calendar day, including timezone/DST changes.
function dayBoundary(day: string, formatter: Intl.DateTimeFormat) {
  const middle = Date.parse(`${day}T00:00:00Z`);
  let low = middle - 2 * 86400000, high = middle + 2 * 86400000;
  while (low < high) {
    const instant = Math.floor((low + high) / 2);
    if (dayInZone(formatter, instant) < day) low = instant + 1;
    else high = instant;
  }
  return low;
}

function validDay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export function requestDeadlineWindow(input: { timeline: string; timezone: string; now?: number }): DeadlineWindow | null {
  const timeline: unknown = JSON.parse(input.timeline);
  if (!timeline || typeof timeline !== "object") throw new Error("Invalid Campaign timeline");
  const { startDate, endDate } = timeline as Record<string, unknown>;
  if (!validDay(startDate) || !validDay(endDate) || startDate > endDate) throw new Error("Invalid Campaign dates");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: input.timezone, year: "numeric", month: "2-digit", day: "2-digit",
  });
  const today = dayInZone(formatter, input.now ?? Date.now());
  const firstDay = today > startDate ? today : startDate;
  if (firstDay > endDate) return null;
  const nextDay = new Date(Date.parse(`${endDate}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
  return { min: localDateTime(dayBoundary(firstDay, formatter)),
    max: localDateTime(dayBoundary(nextDay, formatter) - 1),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
}
