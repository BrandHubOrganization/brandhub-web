/** Format a real instant as a wall-clock minute in the Workspace timezone, not the browser timezone. */
export function taskLocalMinute(value: string | null, timezone: string) {
  if (!value) return "";
  const instant = new Date(value);
  if (!Number.isFinite(instant.getTime())) return "";
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    return "";
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const read = (name: string) =>
    parts.find((part) => part.type === name)?.value;
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
}

/** Reject DST gaps/folds instead of silently choosing or shifting a user's deadline. */
export function taskInstant(local: string, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))
    throw new Error("INVALID_LOCAL_TIME");
  const anchor = Date.parse(`${local}:00Z`);
  if (!Number.isFinite(anchor)) throw new Error("INVALID_LOCAL_TIME");
  const offsets = new Set<number>();
  for (const hours of [-36, -12, 0, 12, 36]) {
    const sample = anchor + hours * 3600000;
    const wallClock = taskLocalMinute(new Date(sample).toISOString(), timezone);
    offsets.add(Date.parse(`${wallClock}:00Z`) - sample);
  }
  const candidates = [...offsets]
    .map((offset) => anchor - offset)
    .filter(
      (candidate) =>
        taskLocalMinute(new Date(candidate).toISOString(), timezone) === local,
    );
  if (candidates.length !== 1) throw new Error("INVALID_LOCAL_TIME");
  return new Date(candidates[0]).toISOString();
}
