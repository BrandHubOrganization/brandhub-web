import {
  taskInstant,
  taskLocalMinute,
} from "@/pages/tasks/utils/taskWorkflowDates";
export const DAY_MS = 86400000;
export const dayNumber = (day: string) =>
  Math.floor(Date.parse(`${day}T00:00:00Z`) / DAY_MS);
export const dayString = (number: number) =>
  new Date(number * DAY_MS).toISOString().slice(0, 10);
export const addDays = (day: string, count: number) =>
  dayString(dayNumber(day) + count);
export const localDay = (iso: string | null, zone: string) =>
  iso ? taskLocalMinute(iso, zone).slice(0, 10) : "";
export const dayInstant = (day: string, zone: string) =>
  taskInstant(`${day}T00:00`, zone);
export const todayIn = (zone: string) =>
  localDay(new Date().toISOString(), zone);
export function parseTimeline(value: string): {
  startDate?: string;
  endDate?: string;
  milestones?: { name: string; date: string }[];
} {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const source = parsed as Record<string, unknown>;
    const validDay = (day: unknown): day is string =>
      typeof day === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(day) &&
      Number.isFinite(dayNumber(day));
    return {
      ...(validDay(source.startDate) ? { startDate: source.startDate } : {}),
      ...(validDay(source.endDate) ? { endDate: source.endDate } : {}),
      milestones: Array.isArray(source.milestones)
        ? source.milestones.filter(
            (entry): entry is { name: string; date: string } =>
              !!entry &&
              typeof entry === "object" &&
              typeof entry.name === "string" &&
              validDay(entry.date),
          )
        : [],
    };
  } catch {
    return {};
  }
}

/** Preserve additional timeline metadata when changing one presentation field. */
export function patchTimeline(
  value: string,
  patch: Partial<ReturnType<typeof parseTimeline>>,
) {
  let original: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      original = parsed as Record<string, unknown>;
  } catch {
    /* Legacy empty timeline is treated as an empty object. */
  }
  return JSON.stringify({ ...original, ...patch });
}
