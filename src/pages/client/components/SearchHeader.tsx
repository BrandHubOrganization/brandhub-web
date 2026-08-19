import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  totalElements?: number;
  totalLabel?: string;
  icon?: React.ReactNode;
  extraActions?: React.ReactNode;
}

export function SearchHeader({
  searchTerm,
  onSearchChange,
  placeholder = "Tìm kiếm...",
  totalElements,
  totalLabel = "mục",
  icon,
  extraActions,
}: SearchHeaderProps) {
  return (
    <div className="bg-card border-border flex flex-col justify-between gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center">
      <div className="relative max-w-sm flex-1">
        <Search className="text-muted-foreground absolute top-2.5 left-3 size-3.5" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        {totalElements !== undefined && (
          <span className="bg-muted flex items-center gap-1 rounded-md px-2.5 py-1 font-medium">
            {icon}
            Tổng số:{" "}
            <strong className="text-foreground font-semibold">
              {totalElements}
            </strong>{" "}
            {totalLabel}
          </span>
        )}
        {extraActions}
      </div>
    </div>
  );
}

export default SearchHeader;
