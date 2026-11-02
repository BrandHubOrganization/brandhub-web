import React from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type DownloadFormat,
  IMAGE_DOWNLOAD_FORMATS,
  VIDEO_DOWNLOAD_FORMATS,
} from "@/utils/mediaDownloadHelper";

export interface DownloadFormatDropdownProps {
  mediaKind: "IMAGE" | "VIDEO" | "FILE";
  onSelectFormat: (format: DownloadFormat) => void;
  disabled?: boolean;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  align?: "start" | "center" | "end";
}

export const DownloadFormatDropdown: React.FC<DownloadFormatDropdownProps> = ({
  mediaKind,
  onSelectFormat,
  disabled = false,
  label = "Tải xuống",
  size = "sm",
  variant = "outline",
  className,
  align = "end",
}) => {
  const options =
    mediaKind === "VIDEO"
      ? VIDEO_DOWNLOAD_FORMATS
      : mediaKind === "IMAGE"
        ? IMAGE_DOWNLOAD_FORMATS
        : [];

  if (options.length === 0) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => onSelectFormat("png")}
        className={className}
      >
        <Download className="size-4" />
        {size !== "icon" && <span>{label}</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={disabled}
          className={className}
          data-testid="download-format-trigger"
        >
          <Download className="size-4" />
          {size !== "icon" && <span>{label}</span>}
          {size !== "icon" && <ChevronDown className="size-3.5 opacity-70" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Chọn định dạng tải về
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.format}
            data-testid={`download-format-${opt.format}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectFormat(opt.format);
            }}
            className="flex flex-col items-start gap-0.5 cursor-pointer py-2"
          >
            <span className="font-medium text-xs">{opt.label}</span>
            <span className="text-[11px] text-muted-foreground">{opt.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
