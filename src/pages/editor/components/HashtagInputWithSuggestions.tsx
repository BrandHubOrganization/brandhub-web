import React, { useState, useEffect } from "react";
import {
  Hash,
  X,
  Plus,
  FolderKanban,
  ChevronDown,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { mockHashtagGroupService } from "@/services/mockHashtagGroupService";
import type { HashtagGroup } from "@/types/hashtagGroup";
import { toast } from "sonner";
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";

interface HashtagInputWithSuggestionsProps {
  hashtags: string[];
  onChange: (tags: string[]) => void;
}

const TRENDING_HASHTAGS = [
  "#BrandHub",
  "#Fashion2026",
  "#Sneakerhead",
  "#AirMaxPulse",
  "#StreetStyle",
  "#TechNews",
  "#AIContent",
  "#Lifestyle",
  "#TrendingNow",
  "#SummerVibes",
  "#MarketingStrategy",
  "#ContentCreator",
  "#DigitalMarketing",
  "#Virals",
];

export const HashtagInputWithSuggestions: React.FC<
  HashtagInputWithSuggestionsProps
> = ({ hashtags, onChange }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mockHashtagGroupService.getGroups().then(setGroups).catch(console.error);
  }, []);

  const handleAddTag = (tagToAdd: string) => {
    let formatted = tagToAdd.trim();
    if (!formatted) return;
    if (!formatted.startsWith("#")) formatted = `#${formatted}`;

    if (!hashtags.includes(formatted)) {
      onChange([...hashtags, formatted]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleLoadFromGroup = (group: HashtagGroup) => {
    const merged = Array.from(new Set([...hashtags, ...group.hashtags]));
    onChange(merged);
    setShowGroupDropdown(false);
    toast.success(
      `Đã tải ${group.hashtags.length} hashtags từ nhóm "${group.name}"!`,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(hashtags.filter((t) => t !== tagToRemove));
  };

  const handleCopyAll = () => {
    if (hashtags.length === 0) return;
    navigator.clipboard.writeText(hashtags.join(" "));
    setCopied(true);
    toast.success(t("editor.hashtagInput.copyAllSuccess"));
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  };

  const handleClearAll = () => {
    onChange([]);
    toast.info(t("editor.hashtagInput.clearAllSuccess"));
  };

  const filteredSuggestions = TRENDING_HASHTAGS.filter(
    (t) =>
      !hashtags.includes(t) &&
      t.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          <Hash className="text-brand-orange size-3.5" />
          Bộ Hashtags bài viết ({hashtags.length})
        </label>

        <div className="flex items-center gap-2">
          {/* Copy All Hashtags */}
          {hashtags.length > 0 && (
            <button
              type="button"
              onClick={handleCopyAll}
              className="hover:text-brand-orange text-2xs flex cursor-pointer items-center gap-1 px-2 py-0.5 font-medium text-zinc-600 transition-colors dark:text-zinc-400"
            >
              {copied ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>
                {copied
                  ? t("editor.hashtagInput.copied")
                  : t("editor.hashtagInput.copyAllButton")}
              </span>
            </button>
          )}

          {/* Clear All */}
          {hashtags.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-2xs cursor-pointer font-medium text-rose-500 hover:underline"
            >
              Xoá tất cả
            </button>
          )}

          {/* Load from Group Dropdown Button */}
          {groups.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                className="text-brand-orange bg-brand-orange-soft hover:bg-brand-orange/20 text-2xs flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-colors"
              >
                <FolderKanban className="size-3.5" />
                <span>Load từ Nhóm</span>
                <ChevronDown className="size-3" />
              </button>

              {showGroupDropdown && (
                <div className="absolute top-full right-0 z-30 mt-1 w-64 space-y-1 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-3xs block px-2 font-semibold tracking-wider text-zinc-400 uppercase">
                    Chọn nhóm hashtag đã lưu:
                  </span>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => handleLoadFromGroup(group)}
                        className="hover:bg-brand-orange-soft flex w-full cursor-pointer flex-col rounded-lg px-2 py-1.5 text-left text-xs transition-colors"
                      >
                        <span className="text-foreground line-clamp-1 font-semibold">
                          {group.name}
                        </span>
                        <span className="text-brand-orange text-3xs truncate font-mono">
                          {group.hashtags.join(", ")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input box */}
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập hashtag và nhấn Enter (hoặc chọn gợi ý)..."
          className="rounded-xl border-zinc-200 bg-zinc-50 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />

        {/* Suggestions Popup */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-3xs mb-1 flex items-center justify-between px-2 font-semibold tracking-wider text-zinc-400 uppercase">
              <span>Gợi ý hashtag thịnh hành:</span>
              <Sparkles className="text-brand-orange size-3" />
            </span>
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="text-brand-orange hover:bg-brand-orange-soft flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-left font-mono text-xs transition-colors"
              >
                <span>{tag}</span>
                <Plus className="size-3.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tag Badges */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="border-brand-orange/20 bg-brand-orange-soft text-brand-orange inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-brand-orange/70 hover:text-brand-orange cursor-pointer rounded-full"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
