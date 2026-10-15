export function contactError(field: string, raw: unknown): string | undefined {
  if (raw == null || raw === "") return;
  if (typeof raw !== "string") return "collaborators.invalidContact";
  const value = raw.trim();
  if (!value) return;
  if (field === "phone") {
    const digits = value.replace(/[^0-9]/g, "");
    if (value.length > 40 || !/^\+?[0-9 ()-]+$/.test(value) || !/^[0-9]{7,15}$/.test(digits)
      || (value.startsWith("+") && digits.startsWith("0"))) return "collaborators.invalidPhone";
  } else if (field === "email") {
    if (value.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "collaborators.invalidEmail";
  } else if (field === "website") {
    try {
      const url = new URL(value);
      if (value.length > 2048 || !["http:", "https:"].includes(url.protocol) || !url.hostname
        || url.username || url.password) return "collaborators.invalidWebsite";
    } catch { return "collaborators.invalidWebsite"; }
  } else if (value.length > 255) return "collaborators.invalidContact";
}
