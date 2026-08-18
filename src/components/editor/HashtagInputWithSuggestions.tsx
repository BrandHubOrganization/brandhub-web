import React, { useState } from 'react';
import { Hash, X, Plus } from 'lucide-react';

interface HashtagInputWithSuggestionsProps {
  hashtags: string[];
  onChange: (tags: string[]) => void;
}

const TRENDING_HASHTAGS = [
  '#BrandHub',
  '#Fashion2026',
  '#Sneakerhead',
  '#AirMaxPulse',
  '#StreetStyle',
  '#TechNews',
  '#AIContent',
  '#Lifestyle',
  '#TrendingNow',
  '#SummerVibes',
];

export const HashtagInputWithSuggestions: React.FC<HashtagInputWithSuggestionsProps> = ({
  hashtags,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tagToAdd: string) => {
    let formatted = tagToAdd.trim();
    if (!formatted) return;
    if (!formatted.startsWith('#')) formatted = `#${formatted}`;

    if (!hashtags.includes(formatted)) {
      onChange([...hashtags, formatted]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
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
      t.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
        <Hash className="w-3.5 h-3.5 text-indigo-500" />
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
          className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
        />

        {/* Suggestions Popup */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 max-h-40 overflow-y-auto space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block px-2 mb-1">
              Gợi ý hashtag thịnh hành:
            </span>
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="w-full text-left px-2 py-1 text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg flex items-center justify-between"
              >
                <span>{tag}</span>
                <Plus className="w-3.5 h-3.5" />
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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
