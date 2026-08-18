import React, { useState } from "react";
import { Hash, X, Plus } from "lucide-react";

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
];

export const HashtagInputWithSuggestions: React.FC<
  HashtagInputWithSuggestionsProps
> = ({ hashtags, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(hashtags.filter((t) => t !== tagToRemove));
  };

  const filteredSuggestions = TRENDING_HASHTAGS.filter(
    (t) =>
      !hashtags.includes(t) &&
      t.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        <Hash className="h-3.5 w-3.5 text-indigo-500" />
        Hashtags
      </label>

      {/* Input box */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập hashtag và nhấn Enter..."
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />

        {/* Suggestions Popup */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <span className="mb-1 block px-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Gợi ý hashtag thịnh hành:
            </span>
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left font-mono text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              >
                <span>{tag}</span>
                <Plus className="h-3.5 w-3.5" />
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
            className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-mono text-xs font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="rounded-full text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
