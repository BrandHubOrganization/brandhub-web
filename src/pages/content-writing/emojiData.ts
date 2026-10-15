export interface EmojiEntry {
  emoji: string;
  annotation: string;
  group: string;
  subgroup: string;
  tags: string[];
  shortcodes: string[];
}

/** Unicode emoji-test format, fully-qualified base sequences in CLDR order. */
export function parseEmojiData(text: string): EmojiEntry[] {
  const entries: EmojiEntry[] = [];
  let group = "";
  let subgroup = "";
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("# group: ")) {
      group = line.slice(9).toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
    }
    if (line.startsWith("# subgroup: ")) subgroup = line.slice(12);
    const match = line.match(/^([0-9A-F ]+)\s*; fully-qualified\s*# (\S+) E[\d.]+ (.+)$/);
    if (!match || !group || group === "component" || /\b1F3F[B-F]\b/.test(match[1])) continue;
    entries.push({ emoji: match[2], annotation: match[3], group, subgroup,
      tags: subgroup.split("-"), shortcodes: [] });
  }
  if (entries.length === 0) throw new Error("INVALID_EMOJI_DATA");
  return entries;
}

export async function loadEmojiData(): Promise<EmojiEntry[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/emoji-test-17.0.txt`);
  if (!response.ok) throw new Error("EMOJI_DATA_UNAVAILABLE");
  return parseEmojiData(await response.text());
}
