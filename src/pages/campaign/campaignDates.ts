import { addDays, format, isValid, parseISO } from "date-fns";

/** Date-only calendar arithmetic: independent of UTC/DST hour offsets. */
export function suggestedCampaignEnd(
  start: string | undefined,
  weeks: number | null | undefined,
): string | undefined {
  if (
    !start ||
    !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
    !Number.isSafeInteger(weeks) ||
    !weeks ||
    weeks < 1
  )
    return undefined;
  const parsed = parseISO(start);
  if (!isValid(parsed) || format(parsed, "yyyy-MM-dd") !== start)
    return undefined;
  const end = addDays(parsed, weeks * 7);
  return isValid(end) ? format(end, "yyyy-MM-dd") : undefined;
}

export function startDateChange(
  timeline: { startDate?: string; endDate?: string },
  start: string,
  weeks?: number | null,
) {
  const previousSuggestion = suggestedCampaignEnd(timeline.startDate, weeks);
  const suggestion = suggestedCampaignEnd(start, weeks);
  const canSuggest =
    !timeline.endDate || timeline.endDate === previousSuggestion;
  return {
    ...timeline,
    startDate: start || undefined,
    ...(canSuggest && suggestion ? { endDate: suggestion } : {}),
  };
}
