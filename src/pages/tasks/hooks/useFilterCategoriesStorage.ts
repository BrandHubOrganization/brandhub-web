import { useCallback, useEffect, useState } from "react";
import type { FilterCategory } from "../components/filters/TaskFilterPopoverOptions";

const STORAGE_PREFIX = "brandhub_task_filter_added_fields_";

const ALLOWED_EXTRA_CATEGORIES: FilterCategory[] = [
  "priority",
  "reporter",
  "approval",
];

function getStorageKey(workspaceId?: string): string {
  return `${STORAGE_PREFIX}${workspaceId || "default"}`;
}

function readStoredCategories(workspaceId?: string): FilterCategory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(workspaceId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is FilterCategory =>
      typeof item === "string" &&
      ALLOWED_EXTRA_CATEGORIES.includes(item as FilterCategory),
    );
  } catch {
    return [];
  }
}

function writeStoredCategories(
  workspaceId: string | undefined,
  categories: FilterCategory[],
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(workspaceId), JSON.stringify(categories));
  } catch {
    // Ignore storage write error
  }
}

export function useFilterCategoriesStorage(workspaceId?: string) {
  const [addedCategories, setAddedCategories] = useState<FilterCategory[]>(() =>
    readStoredCategories(workspaceId),
  );

  useEffect(() => {
    setAddedCategories(readStoredCategories(workspaceId));
  }, [workspaceId]);

  const addCategory = useCallback(
    (id: FilterCategory) => {
      setAddedCategories((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        writeStoredCategories(workspaceId, next);
        return next;
      });
    },
    [workspaceId],
  );

  const removeCategory = useCallback(
    (id: FilterCategory) => {
      setAddedCategories((prev) => {
        if (!prev.includes(id)) return prev;
        const next = prev.filter((item) => item !== id);
        writeStoredCategories(workspaceId, next);
        return next;
      });
    },
    [workspaceId],
  );

  return {
    addedCategories,
    addCategory,
    removeCategory,
  };
}
