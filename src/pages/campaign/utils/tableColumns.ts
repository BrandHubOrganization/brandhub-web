export type TableColumnId =
  | "name"
  | "status"
  | "assignee"
  | "startDate"
  | "dueDate"
  | "description"
  | "acceptanceCriteria"
  | "actions";

export interface TableColumnDef {
  id: TableColumnId;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  required?: boolean;
}

export const TABLE_COLUMN_DEFS: Record<TableColumnId, TableColumnDef> = {
  name: {
    id: "name",
    defaultWidth: 250,
    minWidth: 150,
    maxWidth: 520,
    required: true,
  },
  status: {
    id: "status",
    defaultWidth: 112,
    minWidth: 92,
    maxWidth: 220,
  },
  assignee: {
    id: "assignee",
    defaultWidth: 152,
    minWidth: 108,
    maxWidth: 280,
  },
  startDate: {
    id: "startDate",
    defaultWidth: 132,
    minWidth: 108,
    maxWidth: 200,
  },
  dueDate: {
    id: "dueDate",
    defaultWidth: 132,
    minWidth: 108,
    maxWidth: 200,
  },
  description: {
    id: "description",
    defaultWidth: 220,
    minWidth: 130,
    maxWidth: 560,
  },
  acceptanceCriteria: {
    id: "acceptanceCriteria",
    defaultWidth: 210,
    minWidth: 130,
    maxWidth: 560,
  },
  actions: {
    id: "actions",
    defaultWidth: 68,
    minWidth: 54,
    maxWidth: 120,
    required: true,
  },
};

export const DEFAULT_COLUMN_ORDER: TableColumnId[] = [
  "name",
  "status",
  "assignee",
  "startDate",
  "dueDate",
  "description",
  "acceptanceCriteria",
  "actions",
];

export interface TableColumnsState {
  order: TableColumnId[];
  widths: Record<TableColumnId, number>;
  hidden: TableColumnId[];
}

const STORAGE_KEY = "brandhub:campaign-table-columns:v1";

export function defaultWidths(): Record<TableColumnId, number> {
  return {
    name: TABLE_COLUMN_DEFS.name.defaultWidth,
    status: TABLE_COLUMN_DEFS.status.defaultWidth,
    assignee: TABLE_COLUMN_DEFS.assignee.defaultWidth,
    startDate: TABLE_COLUMN_DEFS.startDate.defaultWidth,
    dueDate: TABLE_COLUMN_DEFS.dueDate.defaultWidth,
    description: TABLE_COLUMN_DEFS.description.defaultWidth,
    acceptanceCriteria: TABLE_COLUMN_DEFS.acceptanceCriteria.defaultWidth,
    actions: TABLE_COLUMN_DEFS.actions.defaultWidth,
  };
}

export function defaultTableColumnsState(): TableColumnsState {
  return {
    order: [...DEFAULT_COLUMN_ORDER],
    widths: defaultWidths(),
    hidden: [],
  };
}

export function clampColumnWidth(id: TableColumnId, width: number): number {
  const def = TABLE_COLUMN_DEFS[id];
  return Math.max(def.minWidth, Math.min(def.maxWidth, Math.round(width)));
}

export function loadTableColumnsState(): TableColumnsState {
  const fallback = defaultTableColumnsState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<TableColumnsState>;
    const validIds = new Set<TableColumnId>(DEFAULT_COLUMN_ORDER);
    const savedOrder = Array.isArray(parsed.order)
      ? parsed.order.filter((id): id is TableColumnId => validIds.has(id))
      : [];
    const missing = DEFAULT_COLUMN_ORDER.filter((id) => !savedOrder.includes(id));
    const order = [...savedOrder, ...missing];

    const widths = defaultWidths();
    if (parsed.widths && typeof parsed.widths === "object") {
      for (const id of DEFAULT_COLUMN_ORDER) {
        const w = parsed.widths[id];
        if (typeof w === "number" && Number.isFinite(w)) {
          widths[id] = clampColumnWidth(id, w);
        }
      }
    }

    const hidden = Array.isArray(parsed.hidden)
      ? parsed.hidden.filter(
          (id): id is TableColumnId =>
            validIds.has(id) && !TABLE_COLUMN_DEFS[id].required,
        )
      : [];

    return { order, widths, hidden };
  } catch {
    return fallback;
  }
}

export function saveTableColumnsState(state: TableColumnsState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Ignore storage access errors. */
  }
}

export function reorderColumns(
  order: TableColumnId[],
  sourceId: TableColumnId,
  targetId: TableColumnId,
): TableColumnId[] {
  if (sourceId === targetId) return order;
  const sourceIndex = order.indexOf(sourceId);
  const targetIndex = order.indexOf(targetId);
  if (sourceIndex < 0 || targetIndex < 0) return order;
  const next = [...order];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function moveColumnBy(
  order: TableColumnId[],
  id: TableColumnId,
  delta: -1 | 1,
): TableColumnId[] {
  const index = order.indexOf(id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= order.length) return order;
  const next = [...order];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

export function fitColumnsToWidth(
  visibleIds: TableColumnId[],
  widths: Record<TableColumnId, number>,
  containerWidth: number,
): Record<TableColumnId, number> {
  if (visibleIds.length === 0 || containerWidth <= 0) return widths;
  const targetWidth = Math.max(containerWidth - 2, 320);
  const currentTotal = visibleIds.reduce((sum, id) => sum + widths[id], 0);
  if (currentTotal <= 0) return widths;

  const ratio = targetWidth / currentTotal;
  const next = { ...widths };
  for (const id of visibleIds) {
    next[id] = clampColumnWidth(id, widths[id] * ratio);
  }
  return next;
}
