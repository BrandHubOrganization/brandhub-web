import { isAxiosError } from "axios";

export const scheduleTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export function schedulePreset(kind: "tomorrow" | "monday", now = new Date()) {
  const value = new Date(now);
  const days = kind === "tomorrow" ? 1 : (8 - value.getDay()) % 7 || 7;
  value.setDate(value.getDate() + days);
  value.setHours(9, 0, 0, 0);
  return value;
}

export function scheduleLocalInput(value: Date) {
  const part = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${part(value.getMonth() + 1)}-${part(value.getDate())}T${part(value.getHours())}:${part(value.getMinutes())}`;
}

export function validScheduleTime(value: string, now = Date.now()) {
  const date = new Date(value);
  const at = date.getTime();
  return (
    Number.isFinite(at) &&
    scheduleLocalInput(date) === value &&
    at >= now + 60_000 &&
    at <= now + 120 * 86_400_000
  );
}

export function formatScheduleTime(
  value: string,
  timeZone: string,
  language: string,
) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(date);
  } catch {
    return date.toLocaleString(language === "vi" ? "vi-VN" : "en-GB");
  }
}

export function scheduleErrorKey(error: unknown) {
  if (error instanceof Error && error.message === "CHAT_SCHEDULE_CLOSED")
    return "chat.schedule.closedRequest";
  const code = isAxiosError<{ error?: { code?: unknown } }>(error)
    ? error.response?.data?.error?.code
    : null;
  if (code === "CHAT_SCHEDULE_SCHEMA_NOT_READY")
    return "chat.schedule.unavailable";
  if (code === "CHAT_SCHEDULE_CONFLICT") return "chat.schedule.conflict";
  if (code === "CHAT_SCHEDULE_INVALID") return "chat.schedule.invalidTime";
  if (code === "CHAT_MESSAGE_NOT_FOUND")
    return "chat.schedule.failure.missingRoot";
  if (code === "CHAT_CONTEXT_INVALID")
    return "chat.schedule.failure.invalidContext";
  if (code === "CHAT_RATE_LIMIT_EXCEEDED") return "chat.schedule.rateLimited";
  if (
    isAxiosError(error) &&
    [401, 403, 404].includes(error.response?.status ?? 0)
  )
    return "chat.schedule.denied";
  return "chat.schedule.error";
}
