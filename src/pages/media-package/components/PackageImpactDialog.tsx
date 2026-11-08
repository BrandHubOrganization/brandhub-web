import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PackageChangeImpact } from "@/pages/media-package/services/packagePlanningService";

export function PackageImpactDialog({
  impact,
  onDecide,
}: {
  impact: PackageChangeImpact;
  onDecide: (ids: string[] | null) => void;
}) {
  const { t } = useTranslation();
  const groups = impact.removalGroups ?? [];
  const removedGroups = groups.filter(
    (group) => group.removeCount === group.candidates.length,
  );
  const reducedGroups = groups.filter(
    (group) => group.removeCount < group.candidates.length,
  );
  const requiredIds = removedGroups.flatMap((group) =>
    group.candidates.map((task) => task.taskId),
  );
  const [selected, setSelected] = useState(
    () =>
      new Set(
        impact.affectedTasks
          .filter((task) => !requiredIds.includes(task.taskId))
          .map((task) => task.taskId),
      ),
  );
  const valid =
    groups.length > 0 &&
    reducedGroups.every(
      (group) =>
        group.candidates.filter((task) => selected.has(task.taskId)).length ===
        group.removeCount,
    );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onDecide(null);
      }}
    >
      <DialogContent className="flex max-h-[85dvh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("mediaPackage.impact.title")}</DialogTitle>
          <DialogDescription>
            {t(
              removedGroups.length
                ? reducedGroups.length
                  ? "mediaPackage.impact.descriptionMixed"
                  : "mediaPackage.impact.descriptionRemove"
                : "mediaPackage.impact.descriptionReduce",
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain">
          {removedGroups.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">
                {t("mediaPackage.impact.removeItems")}
              </h3>
              <ul className="border-border bg-muted space-y-2 rounded-lg border p-3 text-sm">
                {removedGroups.map((group) => (
                  <li key={group.deliverableId} className="break-words">
                    {group.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {reducedGroups.length > 0 && (
            <h3 className="text-sm font-semibold">
              {t("mediaPackage.impact.reduceTasks")}
            </h3>
          )}
          {reducedGroups.map((group) => (
            <fieldset
              key={group.deliverableId}
              className="border-border space-y-1 rounded-lg border p-3"
            >
              <legend className="px-1 text-sm font-semibold">
                {group.name}
              </legend>
              <p className="text-muted-foreground mb-2 text-sm">
                {t("mediaPackage.impact.choose", { count: group.removeCount })}
              </p>
              {group.candidates.map((task) => (
                <label
                  key={task.taskId}
                  className="hover:bg-muted flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="accent-brand-orange size-4 shrink-0"
                    checked={selected.has(task.taskId)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSelected((previous) => {
                        const next = new Set(previous);
                        if (checked) next.add(task.taskId);
                        else next.delete(task.taskId);
                        return next;
                      });
                    }}
                  />
                  <span className="min-w-0 break-words">{task.name}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          {t("mediaPackage.impact.preserveHistory")}
        </p>
        {reducedGroups.length > 0 && (
          <p className="text-muted-foreground text-sm" role="status">
            {t("mediaPackage.impact.selected", { count: selected.size })}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => onDecide(null)}
          >
            {t("mediaPackage.impact.cancel")}
          </Button>
          <Button
            variant="orange"
            className="min-h-11"
            disabled={!valid}
            onClick={() => onDecide([...requiredIds, ...selected])}
          >
            {t("mediaPackage.impact.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
