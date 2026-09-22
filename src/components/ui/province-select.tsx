import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Province {
  name: string;
  code: number;
}

// Module-level cache — fetch 1 lần cho cả app, list tỉnh/thành không đổi
// trong phiên làm việc.
let provincesCache: Province[] | null = null;
let provincesPromise: Promise<Province[]> | null = null;

function fetchProvinces(): Promise<Province[]> {
  if (provincesCache) return Promise.resolve(provincesCache);
  if (!provincesPromise) {
    provincesPromise = fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Province[]) => {
        provincesCache = data;
        return data;
      })
      .catch(() => []);
  }
  return provincesPromise;
}

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

// Custom dropdown (Radix, không phải native <select>) — option list tự vẽ
// theo theme app thay vì để browser/OS render (native <select> luôn xanh dương
// mặc định, không style được từ CSS).
export function ProvinceSelect({ label, value, onChange }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchProvinces().then(setProvinces);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return provinces;
    const q = search.trim().toLowerCase();
    return provinces.filter((p) => p.name.toLowerCase().includes(q));
  }, [provinces, search]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label className="text-xs font-semibold tracking-wide">{label}</Label>
      )}
      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch("");
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-[3px]"
          >
            <span className={cn(!value && "text-muted-foreground")}>
              {value || "—"}
            </span>
            <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-(--radix-dropdown-menu-trigger-width) p-0"
        >
          <div className="border-border border-b p-1.5">
            <Input
              autoFocus
              placeholder="Tìm tỉnh/thành..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
            >
              <Check className={cn("size-3.5", value !== "" && "invisible")} />—
            </button>
            {filtered.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => {
                  onChange(p.name);
                  setOpen(false);
                }}
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
              >
                <Check
                  className={cn("size-3.5", value !== p.name && "invisible")}
                />
                {p.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-muted-foreground px-2 py-1.5 text-sm">
                Không tìm thấy
              </p>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
