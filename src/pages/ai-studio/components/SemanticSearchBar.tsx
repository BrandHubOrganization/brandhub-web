import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "../types/knowledgeBase";

export interface SemanticSearchBarProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
}

export function SemanticSearchBar({ onSearch }: SemanticSearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const data = await onSearch(query.trim());
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={t("aiStudio.knowledgeBase.searchPlaceholder")}
        />
        <Button
          variant="orange"
          size="sm"
          className="gap-1.5"
          disabled={!query.trim() || isSearching}
          onClick={handleSearch}
        >
          <Search className="size-3.5" />
          {t("aiStudio.knowledgeBase.search")}
        </Button>
      </div>

      {results && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("aiStudio.knowledgeBase.noResults")}
            </p>
          ) : (
            results.map((result, i) => (
              <div
                key={`${result.documentId}-${i}`}
                className="border-border bg-card space-y-1 rounded-xl border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-xs font-semibold">
                    {result.fileName}
                  </span>
                  <span className="text-brand-orange text-xs font-medium">
                    {Math.round(result.relevanceScore * 100)}%
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {result.excerpt}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SemanticSearchBar;
