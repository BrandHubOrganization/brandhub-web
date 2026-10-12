import React from "react";
import type { WatermarkPosition } from "@/types/material";
import {
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  Dot,
  ArrowRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight,
} from "lucide-react";

interface WatermarkPositionGridProps {
  value: WatermarkPosition;
  onChange: (pos: WatermarkPosition) => void;
  disabled?: boolean;
}

const POSITIONS: Array<{
  id: WatermarkPosition;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "TOP_LEFT", label: "Top Left", icon: ArrowUpLeft },
  { id: "TOP_CENTER", label: "Top Center", icon: ArrowUp },
  { id: "TOP_RIGHT", label: "Top Right", icon: ArrowUpRight },
  { id: "MIDDLE_LEFT", label: "Middle Left", icon: ArrowLeft },
  { id: "CENTER", label: "Center", icon: Dot },
  { id: "MIDDLE_RIGHT", label: "Middle Right", icon: ArrowRight },
  { id: "BOTTOM_LEFT", label: "Bottom Left", icon: ArrowDownLeft },
  { id: "BOTTOM_CENTER", label: "Bottom Center", icon: ArrowDown },
  { id: "BOTTOM_RIGHT", label: "Bottom Right", icon: ArrowDownRight },
];

export const WatermarkPositionGrid: React.FC<WatermarkPositionGridProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      className={`grid grid-cols-3 gap-2 w-full max-w-[220px] ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {POSITIONS.map((pos) => {
        const Icon = pos.icon;
        const isActive = value === pos.id;

        return (
          <button
            key={pos.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(pos.id)}
            title={pos.label}
            className={`flex items-center justify-center h-10 rounded-lg border text-xs font-medium transition-all duration-150 cursor-pointer ${
              isActive
                ? "bg-brand-orange border-brand-orange text-white shadow-xs ring-2 ring-brand-orange/30 scale-95"
                : "border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
};
