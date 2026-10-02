import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Suggestion {
  displayName: string;
}

interface NominatimResult {
  display_name: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Gợi ý city/quốc gia toàn cầu qua Nominatim (OpenStreetMap) — free, không
// cần API key. Không ép chọn từ list: value vẫn là free text, user gõ tay
// bình thường nếu muốn hoặc offline/API rate-limit thì field vẫn hoạt động.
export function LocationAutocomplete({ value, onChange, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const search = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query,
          )}&format=json&addressdetails=0&limit=8&accept-language=vi`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Nominatim request failed");
        const data = (await res.json()) as NominatimResult[];
        setSuggestions(data.map((d) => ({ displayName: d.display_name })));
        setOpen(true);
      } catch {
        // Lỗi mạng/rate-limit — im lặng bỏ qua, field vẫn dùng được như input thường.
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          search(e.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onBlur={() => {
          // Delay nhỏ để click vào item bên dưới kịp fire trước khi list đóng.
          blurTimeoutRef.current = setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
      />
      {loading && (
        <Loader2 className="text-muted-foreground absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 animate-spin" />
      )}
      {open && suggestions.length > 0 && (
        <div className="border-border bg-popover absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border p-1 shadow-md">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-sm",
              )}
              onMouseDown={(e) => {
                // preventDefault để tránh input blur trước khi onClick chạy.
                e.preventDefault();
                onChange(s.displayName);
                setOpen(false);
              }}
            >
              {s.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;
