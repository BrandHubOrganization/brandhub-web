import { useTranslation } from "react-i18next";
import { formatFileSize } from "@/lib/utils";
import type { MaterialItem } from "@/types/material";

export function MaterialDetailFacts({ material }: { material: MaterialItem }) {
  const { t, i18n } = useTranslation();
  const label = (key: string) => t(`library.repository.${key}`);
  return (
    <dl className="space-y-3 text-sm">
      <div>
        <dt className="text-muted-foreground">{label("nameLabel")}</dt>
        <dd className="text-foreground break-words">{material.name}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{label("createdByLabel")}</dt>
        <dd>{material.createdByName ?? material.createdBy}</dd>
      </div>
      {material.clientDisplayName && (
        <div>
          <dt className="text-muted-foreground">{label("clientLabel")}</dt>
          <dd>{material.clientDisplayName}</dd>
        </div>
      )}
      <div>
        <dt className="text-muted-foreground">{label("fileDetails")}</dt>
        <dd>
          {material.mimeType} · {formatFileSize(material.fileSize ?? 0)}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{label("createdAtLabel")}</dt>
        <dd>{new Date(material.createdAt).toLocaleString(i18n.language)}</dd>
      </div>
      {material.parentMaterialId && (
        <div>
          <dt className="text-muted-foreground">{label("lineageLabel")}</dt>
          <dd className="break-all">{material.parentMaterialId}</dd>
        </div>
      )}
    </dl>
  );
}
