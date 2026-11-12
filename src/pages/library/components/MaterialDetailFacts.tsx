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

export function MaterialDetailFacts({ material }: { material: MaterialItem }) {
  const { t, i18n } = useTranslation();
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
        <div className="grid grid-cols-[135px_minmax(0,1fr)] items-start gap-3 px-4 py-2.5">
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
            <span>{label("mediaKind", "Định dạng tệp")}</span>
          </dt>
          <dd className="font-medium text-foreground">
            <span className="uppercase">
              {material.mimeType?.split("/").pop() || material.mimeType || "—"}
            </span>{" "}
            <span className="text-muted-foreground">•</span>{" "}
            <span className="tabular-nums">
              {formatFileSize(material.fileSize ?? 0)}
            </span>
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
            {new Date(material.createdAt).toLocaleString(i18n.language)}
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
