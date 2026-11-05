export function isSubtaskDone(status: string | null | undefined): boolean {
  return status === "FINISHED";
}

export function formatJiraSubtaskDate(
  dateStr: string | null | undefined,
): string {
  if (!dateStr || !Number.isFinite(Date.parse(dateStr))) return "-";
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    return `${day} ${month}`;
  } catch {
    return String(dateStr);
  }
}

export function isSubtaskOverdue(
  dateStr: string | null | undefined,
  isDone: boolean,
): boolean {
  if (isDone || !dateStr || !Number.isFinite(Date.parse(dateStr))) return false;
  return new Date(dateStr).getTime() < Date.now();
}
