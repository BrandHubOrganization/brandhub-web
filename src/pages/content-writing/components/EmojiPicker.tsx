/**
 * EmojiPicker — fetches the full Unicode emoji dataset from emoji.family API
 * (https://emoji.family, free, no auth key required) and renders a searchable,
 * categorized picker.
 *
 * API: GET https://www.emoji.family/api/emojis
 * Response: { emoji, hexcode, group, subgroup, annotation, tags, shortcodes }[]
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

/* ── Types ─────────────────────────────────────────────────────────────── */
interface EmojiEntry {
  emoji: string;
  annotation: string;
  hexcode?: string;
  group: string;
  subgroup: string;
  tags: string[];
  shortcodes: string[];
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const API_URL = "https://www.emoji.family/api/emojis";

/** Map API group slugs → Vietnamese display labels + representative emoji */
const GROUP_META: Record<string, { label: string; icon: string }> = {
  "smileys-emotion": { label: "Biểu cảm", icon: "😀" },
  "people-body": { label: "Con người", icon: "👋" },
  "animals-nature": { label: "Động vật & Thiên nhiên", icon: "🐶" },
  "food-drink": { label: "Đồ ăn & Uống", icon: "🍕" },
  "travel-places": { label: "Du lịch & Địa điểm", icon: "🚀" },
  activities: { label: "Hoạt động", icon: "⚽" },
  objects: { label: "Vật phẩm", icon: "💡" },
  symbols: { label: "Ký hiệu", icon: "🔣" },
  flags: { label: "Cờ quốc gia", icon: "🏳️" },
};

// Desired group order
const GROUP_ORDER = Object.keys(GROUP_META);

/* ── Cache (module-level so it survives re-renders / panel close-open) ── */
let _cachedEmojis: EmojiEntry[] | null = null;

/* ── Component ───────────────────────────────────────────────────────────*/
export interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [emojis, setEmojis] = useState<EmojiEntry[]>(_cachedEmojis ?? []);
  const [loading, setLoading] = useState(!_cachedEmojis);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState(GROUP_ORDER[0]);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Fetch ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (_cachedEmojis) return; // already loaded
    let cancelled = false;
    setLoading(true);

    fetch(API_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<EmojiEntry[]>;
      })
      .then((data) => {
        if (cancelled) return;
        // Filter out skin-tone variants (keep only base emojis) and sort by API order
        const base = data.filter((e) => !e.hexcode?.includes("-1f3f"));
        _cachedEmojis = base;
        setEmojis(base);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Không thể tải danh sách emoji",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Derived data ───────────────────────────────────────────────────── */

  // Group emojis by their `group` slug
  const grouped = useMemo(() => {
    const map: Record<string, EmojiEntry[]> = {};
    for (const e of emojis) {
      (map[e.group] ??= []).push(e);
    }
    return map;
  }, [emojis]);

  // Available groups in display order
  const availableGroups = GROUP_ORDER.filter((g) => grouped[g]?.length);

  // Search across annotation + tags + shortcodes (English only for now)
  const searchResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return null;
    return emojis
      .filter(
        (e) =>
          e.annotation.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          e.shortcodes.some((s) => s.toLowerCase().includes(q)),
      )
      .slice(0, 120);
  }, [emojis, search]);

  const displayEmojis = searchResults ?? grouped[activeGroup] ?? [];

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex w-72 flex-col" style={{ maxHeight: "360px" }}>
      {/* Search bar */}
      <div className="border-border border-b p-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1.5 left-2 size-4" />
          <Input
            ref={searchRef}
            className="h-7 pl-8 text-xs"
            placeholder="Tìm emoji (tiếng Anh)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Group tabs — only show when not searching */}
      {!search && !loading && (
        <div className="border-border flex gap-0.5 overflow-x-auto border-b p-1">
          {availableGroups.map((g) => (
            <button
              key={g}
              type="button"
              title={GROUP_META[g]?.label ?? g}
              className={`flex-shrink-0 rounded p-1 text-base transition-colors hover:bg-muted ${
                activeGroup === g ? "bg-muted ring-1 ring-border" : ""
              }`}
              onClick={() => setActiveGroup(g)}
            >
              {GROUP_META[g]?.icon ?? "•"}
            </button>
          ))}
        </div>
      )}

      {/* Category label */}
      <p className="text-muted-foreground px-2 pt-1.5 pb-0.5 text-[11px] font-semibold">
        {search
          ? `Kết quả cho "${search}" · ${displayEmojis.length} emoji`
          : (GROUP_META[activeGroup]?.label ?? activeGroup)}
      </p>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
            <p className="text-muted-foreground text-xs">
              Đang tải {Object.keys(GROUP_META).length} nhóm emoji…
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="py-4 text-center">
            <p className="text-destructive text-xs">{error}</p>
            <button
              type="button"
              className="text-primary mt-2 text-xs underline"
              onClick={() => {
                _cachedEmojis = null;
                setError(null);
                setLoading(true);
                setEmojis([]);
              }}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty search */}
        {!loading && !error && search && displayEmojis.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-xs">
            Không tìm thấy emoji
          </p>
        )}

        {/* Emoji grid */}
        {!loading && !error && displayEmojis.length > 0 && (
          <div className="flex flex-wrap gap-0.5 pt-0.5">
            {displayEmojis.map((e, i) => (
              <button
                key={`${e.emoji}-${i}`}
                type="button"
                title={`${e.annotation}${e.shortcodes[0] ? ` · ${e.shortcodes[0]}` : ""}`}
                className="rounded p-1 text-xl leading-none transition-all hover:scale-110 hover:bg-muted"
                onClick={() => onSelect(e.emoji)}
              >
                {e.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && (
        <div className="border-border text-muted-foreground border-t px-2 py-1 text-[10px]">
          {emojis.length.toLocaleString()} emoji · emoji.family API
        </div>
      )}
    </div>
  );
}
