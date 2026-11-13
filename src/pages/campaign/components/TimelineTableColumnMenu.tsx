import { ArrowDown, ArrowUp, Columns3, Maximize2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  TABLE_COLUMN_DEFS,
  type TableColumnId,
  type TableColumnsState,
} from "@/pages/campaign/utils/tableColumns";

export function TimelineTableColumnMenu({
  state,
  columnLabels,
  onMove,
  onToggleHidden,
  onFit,
  onReset,
}: {
  state: TableColumnsState;
  columnLabels: Record<TableColumnId, string>;
  onMove: (id: TableColumnId, delta: -1 | 1) => void;
  onToggleHidden: (id: TableColumnId) => void;
  onFit: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const hiddenCount = state.hidden.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={hiddenCount > 0 ? "orange" : "outline"}
          className={cn(
            "h-7 gap-1.5 px-2.5 text-xs",
            hiddenCount > 0 &&
              "bg-brand-orange text-white font-semibold hover:bg-brand-orange/90",
          )}
        >
          <Columns3 className="size-3.5" />
          <span>
            {t("campaign.timeline.tableColumnsButton", {
              defaultValue: "Cột & Sắp xếp",
            })}
          </span>
          {hiddenCount > 0 && (
            <span className="rounded bg-white/20 px-1 text-[10px] tabular-nums">
              {state.order.length - hiddenCount}/{state.order.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={12} className="w-72 space-y-2.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">
            {t("campaign.timeline.tableColumnsTitle", {
              defaultValue: "Thứ tự & hiển thị cột",
            })}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 gap-1 px-1.5 text-[11px]"
              onClick={onFit}
              title={t("campaign.timeline.tableFitHint", {
                defaultValue: "Thu gọn các cột vừa chiều rộng màn hình",
              })}
            >
              <Maximize2 className="size-3" />
              {t("campaign.timeline.fit", { defaultValue: "Vừa khung" })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 gap-1 px-1.5 text-[11px]"
              onClick={onReset}
            >
              <RotateCcw className="size-3" />
              {t("common.reset", { defaultValue: "Đặt lại" })}
            </Button>
          </div>
        </div>

        <ul className="divide-border max-h-72 divide-y overflow-y-auto rounded-md border">
          {state.order.map((id, index) => {
            const def = TABLE_COLUMN_DEFS[id];
            const visible = !state.hidden.includes(id);
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs"
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visible}
                    disabled={def.required}
                    onChange={() => onToggleHidden(id)}
                    className="accent-brand-orange size-3.5 shrink-0 cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="truncate font-medium">
                    {columnLabels[id]}
                  </span>
                </label>
                <div className="flex shrink-0 items-center gap-0.5">
                  <span className="text-muted-foreground mr-1 text-[10px] tabular-nums">
                    {state.widths[id]}px
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-6"
                    disabled={index === 0}
                    aria-label={`${columnLabels[id]} — ${t("common.moveUp", { defaultValue: "Lên trước" })}`}
                    onClick={() => onMove(id, -1)}
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-6"
                    disabled={index === state.order.length - 1}
                    aria-label={`${columnLabels[id]} — ${t("common.moveDown", { defaultValue: "Ra sau" })}`}
                    onClick={() => onMove(id, 1)}
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
