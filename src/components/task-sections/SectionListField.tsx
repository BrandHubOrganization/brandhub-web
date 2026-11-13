import { useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatVndInput,
  parseVndInput,
} from "@/pages/media-package/lib/formatMediaPackage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ListColumn {
  key: string;
  i18nKey?: string;
  type?: "text" | "number" | "currency" | "date" | "select";
  options?: string[];
}

type Row = Record<string, unknown>;

const asRows = (value: unknown): Row[] =>
  Array.isArray(value) ? (value as Row[]) : [];

/**
 * Editable table bound to one list-type section field (spec §3 columns, e.g.
 * EVENT.AGENDA's giờ/hạng mục/phụ trách). Backend stores the field as a bare
 * `List<?>`; this component owns the row shape, not the server.
 */
export function SectionListField({
  sectionKey,
  name,
  columns,
  value,
  onChange,
  disabled,
}: {
  sectionKey: string;
  name: string;
  columns: ListColumn[];
  value: unknown;
  onChange: (rows: Row[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const rows = asRows(value);

  // Stable per-row keys, independent of array index, so deleting/editing a
  // row doesn't shift keys for the rows after it and remount their <Input>s.
  const keySeq = useRef(0);
  const keys = useRef<number[]>([]);
  while (keys.current.length < rows.length) {
    keys.current.push(keySeq.current++);
  }

  const label = (col: ListColumn) =>
    t(col.i18nKey ?? `tasks.sections.${sectionKey}.fields.${name}.${col.key}`, {
      defaultValue: col.key,
    });

  const setCell = (rowIndex: number, key: string, cell: unknown) =>
    onChange(
      rows.map((row, i) => (i === rowIndex ? { ...row, [key]: cell } : row)),
    );
  const addRow = () => onChange([...rows, {}]);
  const removeRow = (rowIndex: number) => {
    keys.current.splice(rowIndex, 1);
    onChange(rows.filter((_, i) => i !== rowIndex));
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{label(col)}</TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={keys.current[rowIndex]}>
                {columns.map((col) => (
                  <TableCell key={col.key} className="p-1.5">
                    {col.type === "select" && col.options ? (
                      <select
                        disabled={disabled}
                        value={(row[col.key] as string | undefined) ?? ""}
                        onChange={(e) =>
                          setCell(rowIndex, col.key, e.target.value)
                        }
                        className="border-input bg-background focus-visible:ring-ring h-9 w-full min-w-[120px] rounded-md border px-2 text-xs focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">-- Chọn --</option>
                        {col.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : col.type === "currency" ? (
                      <div className="relative min-w-[120px]">
                        <Input
                          type="text"
                          inputMode="numeric"
                          disabled={disabled}
                          value={formatVndInput(
                            String(row[col.key] ?? ""),
                          )}
                          onChange={(e) => {
                            const raw = parseVndInput(e.target.value);
                            setCell(
                              rowIndex,
                              col.key,
                              raw ? Number(raw) : "",
                            );
                          }}
                          className="pr-7"
                        />
                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px]">
                          đ
                        </span>
                      </div>
                    ) : (
                      <Input
                        type={
                          col.type === "number"
                            ? "number"
                            : col.type === "date"
                              ? "date"
                              : "text"
                        }
                        disabled={disabled}
                        value={
                          (row[col.key] as string | number | undefined) ?? ""
                        }
                        onChange={(e) =>
                          setCell(
                            rowIndex,
                            col.key,
                            col.type === "number"
                              ? Number.isNaN(e.target.valueAsNumber)
                                ? ""
                                : e.target.valueAsNumber
                              : e.target.value,
                          )
                        }
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell className="p-1.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    disabled={disabled}
                    aria-label={t("editor.sections.removeRow")}
                    onClick={() => removeRow(rowIndex)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={addRow}
      >
        <Plus className="size-4" />
        {t("editor.sections.addRow")}
      </Button>
    </div>
  );
}
