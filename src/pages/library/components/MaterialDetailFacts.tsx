import { useTranslation } from "react-i18next";
import {
  Building2,
  Calendar,
  FileText,
  GitBranch,
  HardDrive,
  User,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import type { MaterialItem } from "@/types/material";

export function formatUploadedTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return "—";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "—";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
}

export function MaterialDetailFacts({
  material,
  onStartRename,
}: {
  material: MaterialItem;
  onStartRename?: () => void;
}) {
  const { t } = useTranslation();
  const label = (key: string, fallback?: string) =>
    t(`library.repository.${key}`, fallback ?? key);
  const versionNum = material.currentVersionNumber ?? material.version ?? 1;

  return (
    <section
      data-slot="material-facts-card"
      className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs"
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/25 px-4 py-2.5">
        <span className="text-xs font-semibold text-foreground">
          {label("fileDetails", "Thông tin tệp")}
        </span>
        <span className="inline-flex items-center rounded-md border border-brand-orange/25 bg-brand-orange/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-brand-orange">
          v{versionNum}
        </span>
      </div>

      <dl className="divide-y divide-border/60 text-xs">
        <div
          onDoubleClick={onStartRename}
          className={`grid grid-cols-[135px_minmax(0,1fr)] items-start gap-3 px-4 py-2.5 transition-colors ${
            onStartRename ? "cursor-pointer select-none hover:bg-muted/30" : ""
          }`}
          title={onStartRename ? "Nhấp đúp (click 2 lần) để đổi tên file" : undefined}
        >
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            <span>{label("nameLabel", "Tên hiển thị")}</span>
          </dt>
          <dd className="break-words font-medium text-foreground">
            {material.name}
          </dd>
        </div>

        <div className="grid grid-cols-[135px_minmax(0,1fr)] items-start gap-3 px-4 py-2.5">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            <span>{label("sizeLabel", "Dung lượng")}</span>
          </dt>
          <dd className="tabular-nums font-medium text-foreground">
            {formatFileSize(material.fileSize ?? 0)}
          </dd>
        </div>

        <div className="grid grid-cols-[135px_minmax(0,1fr)] items-start gap-3 px-4 py-2.5">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            <span>{label("createdByLabel", "Người tải lên")}</span>
          </dt>
          <dd className="truncate font-medium text-foreground">
            {material.createdByName ?? material.createdBy ?? "—"}
          </dd>
        </div>

        {material.clientDisplayName && (
          <div className="grid grid-cols-[135px_minmax(0,1fr)] items-start gap-3 px-4 py-2.5">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
              <span>{label("clientLabel", "Khách hàng")}</span>
            </dt>
            <dd className="break-words font-medium text-foreground">
              {material.clientDisplayName}
            </dd>
          </div>
        )}

        <div className="grid grid-cols-[135px_minmax(0,1fr)] items-start gap-3 px-4 py-2.5">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
            <span>{label("createdAtLabel", "Thời gian tải lên")}</span>
          </dt>
          <dd className="tabular-nums font-medium text-foreground">
            {formatUploadedTime(material.createdAt)}
          </dd>
        </div>

        {material.parentMaterialId && (
          <div className="grid grid-cols-[135px_minmax(0,1fr)] items-start gap-3 px-4 py-2.5">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
              <span>{label("lineageLabel", "Tư liệu gốc")}</span>
            </dt>
            <dd className="break-all font-mono text-[11px] text-muted-foreground">
              {material.parentMaterialId}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
