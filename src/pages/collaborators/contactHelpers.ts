export const AVATAR_PALETTES = [
  { bg: "bg-orange-500/15 text-brand-orange dark:bg-orange-500/25 dark:text-orange-400 border-orange-500/30" },
  { bg: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400 border-blue-500/30" },
  { bg: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 border-emerald-500/30" },
  { bg: "bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400 border-purple-500/30" },
  { bg: "bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400 border-rose-500/30" },
  { bg: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400 border-amber-500/30" },
  { bg: "bg-teal-500/15 text-teal-600 dark:bg-teal-500/25 dark:text-teal-400 border-teal-500/30" },
  { bg: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400 border-indigo-500/30" },
  { bg: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/25 dark:text-cyan-400 border-cyan-500/30" },
  { bg: "bg-pink-500/15 text-pink-600 dark:bg-pink-500/25 dark:text-pink-400 border-pink-500/30" },
];

export function getAvatarPalette(name: string): { bg: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return "??";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function getGroupLetter(name: string): string {
  if (!name || !name.trim()) return "#";
  const first = name.trim()[0];
  if (first.toUpperCase() === "Đ") return "D";
  const normalized = first.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return /^[A-Z]$/.test(normalized) ? normalized : "#";
}

export function getContactString(val: unknown): string {
  return typeof val === "string" ? val.trim() : "";
}

export function getContact(info: Record<string, unknown> | undefined) {
  if (!info) return { contactName: "", phone: "", email: "", website: "" };
  return {
    contactName: getContactString(info.contactName),
    phone: getContactString(info.phone),
    email: getContactString(info.email),
    website: getContactString(info.website),
  };
}
