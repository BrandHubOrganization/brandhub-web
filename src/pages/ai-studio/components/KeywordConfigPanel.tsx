import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CrawlFrequency, TrendKeyword } from "../types/trends";

const FREQUENCIES: CrawlFrequency[] = ["HOURLY", "DAILY", "WEEKLY"];

export interface KeywordConfigPanelProps {
  keywords: TrendKeyword[];
  onAdd: (keyword: string, frequency: CrawlFrequency) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function KeywordConfigPanel({
  keywords,
  onAdd,
  onToggle,
  onDelete,
}: KeywordConfigPanelProps) {
  const { t } = useTranslation();
  const [newKeyword, setNewKeyword] = useState("");
  const [frequency, setFrequency] = useState<CrawlFrequency>("DAILY");

  function handleAdd() {
    if (!newKeyword.trim()) return;
    onAdd(newKeyword.trim(), frequency);
    setNewKeyword("");
  }

  return (
    <div className="border-border bg-card space-y-4 rounded-xl border p-4">
      <h2 className="text-foreground text-sm font-semibold">
        {t("aiStudio.trends.keywordsTitle")}
      </h2>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={t("aiStudio.trends.keywordPlaceholder")}
          className="flex-1"
        />
        <Select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as CrawlFrequency)}
          className="sm:w-40"
        >
          {FREQUENCIES.map((freq) => (
            <option key={freq} value={freq}>
              {t(`aiStudio.trends.frequency.${freq}`)}
            </option>
          ))}
        </Select>
        <Button
          variant="orange"
          size="sm"
          className="gap-1.5"
          disabled={!newKeyword.trim()}
          onClick={handleAdd}
        >
          <Plus className="size-3.5" />
          {t("aiStudio.trends.addKeyword")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <div
            key={kw.id}
            className="border-border bg-background flex items-center gap-2 rounded-full border py-1 pr-1 pl-3 text-xs"
          >
            <span className="text-foreground">{kw.keyword}</span>
            <Badge variant={kw.isActive ? "PUBLISHED" : "draft"}>
              {t(`aiStudio.trends.frequency.${kw.crawlFrequency}`)}
            </Badge>
            <button
              type="button"
              onClick={() => onToggle(kw.id)}
              className="text-muted-foreground hover:text-foreground px-1"
            >
              {kw.isActive
                ? t("aiStudio.trends.deactivate")
                : t("aiStudio.trends.activate")}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onDelete(kw.id)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KeywordConfigPanel;
