/**
 * Searchable Unicode emoji picker; versioned data is served from our own origin.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadEmojiData, type EmojiEntry } from "@/pages/content-writing/emojiData";

/* ── Constants ──────────────────────────────────────────────────────────── */

/** Representative data previews; group labels come from i18n. */
const GROUP_META: Record<string, { icon: string }> = {
  "smileys-emotion": { icon: "😀" },
  "people-body": { icon: "👋" },
  "animals-nature": { icon: "🐶" },
  "food-drink": { icon: "🍕" },
  "travel-places": { icon: "🚀" },
  activities: { icon: "⚽" }, objects: { icon: "💡" },
  symbols: { icon: "🔣" }, flags: { icon: "🏳️" },
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
  const { t } = useTranslation();
  const [emojis, setEmojis] = useState<EmojiEntry[]>(_cachedEmojis ?? []);
  const [loading, setLoading] = useState(!_cachedEmojis);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState(GROUP_ORDER[0]);
  const [attempt, setAttempt] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Fetch ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (_cachedEmojis) return; // already loaded
    let cancelled = false;

    loadEmojiData()
      .then((data) => {
        if (cancelled) return;
        // Filter out skin-tone variants (keep only base emojis) and sort by API order
        const base = data;
        _cachedEmojis = base;
        setEmojis(base);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("loadFailed");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

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
      <div className="border-border shrink-0 border-b p-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1.5 left-2 size-4" />
          <Input
            ref={searchRef}
            className="h-7 pl-8 text-xs"
            placeholder={t("editor.emojiPicker.search")}
            aria-label={t("editor.emojiPicker.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Group tabs — only show when not searching */}
      {!search && !loading && (
        <div className="border-border flex shrink-0 gap-0.5 overflow-x-auto border-b p-1">
          {availableGroups.map((g) => (
            <button
              key={g}
              type="button"
              title={t(`editor.emojiPicker.groups.${g}`)}
              aria-label={t(`editor.emojiPicker.groups.${g}`)}
              aria-pressed={activeGroup === g}
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
      <p className="text-muted-foreground shrink-0 px-2 pt-1.5 pb-0.5 text-xs font-semibold">
        {search
          ? t("editor.emojiPicker.results", { search, count: displayEmojis.length })
          : t(`editor.emojiPicker.groups.${activeGroup}`)}
      </p>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
            <p className="text-muted-foreground text-xs">
              {t("editor.emojiPicker.loading")}
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div role="alert" className="py-4 text-center">
            <p className="text-destructive text-xs">{t("editor.emojiPicker.loadFailed")}</p>
            <Button
              variant="link"
              type="button"
              className="text-primary mt-2 text-xs underline"
              onClick={() => {
                _cachedEmojis = null;
                setError(null);
                setLoading(true);
                setEmojis([]);
                setAttempt(value => value + 1);
              }}
            >
              {t("editor.emojiPicker.retry")}
            </Button>
          </div>
        )}

        {/* Empty search */}
        {!loading && !error && search && displayEmojis.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-xs">
            {t("editor.emojiPicker.empty")}
          </p>
        )}

        {/* Emoji grid */}
        {!loading && !error && displayEmojis.length > 0 && (
          <div className="flex flex-wrap gap-0.5 pt-0.5">
            {displayEmojis.map((e, i) => (
              <button
                key={`${e.emoji}-${i}`}
                type="button"
                aria-label={e.annotation}
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
        <div className="border-border text-muted-foreground shrink-0 border-t px-2 py-1 text-xs">
          {t("editor.emojiPicker.total", { count: emojis.length })} · Unicode 17.0
        </div>
      )}
    </div>
  );
}
