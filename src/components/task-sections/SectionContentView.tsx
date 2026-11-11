import { useTranslation } from "react-i18next";
import type { TaskSection } from "@/types/task";

export interface SectionMedia {
  url: string | null;
  mediaType: string | null;
}

/** Stored-only fields the reader never needs. */
const HIDDEN_FIELDS = new Set(["batchId"]);

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as object).length === 0);

function rawMedia(value: unknown): SectionMedia[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      url: (item.url ?? item.external_url ?? item.externalUrl ?? null) as
        | string
        | null,
      mediaType: (item.mediaType ?? item.media_type ?? null) as string | null,
    }));
}

function plain(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (value && typeof value === "object")
    return Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => !isEmpty(item))
      .map(([name, item]) => `${name}: ${plain(item)}`)
      .join(" · ");
  return "";
}

/**
 * Read-only rendering of one section's content for reviewers (Client portal, approval page).
 * `media` carries resolved URLs when the content is post media (stored rows only hold storage keys).
 */
export function SectionContentView({
  section,
  media,
}: {
  section: TaskSection;
  media?: SectionMedia[];
}) {
  const { t, i18n } = useTranslation();
  const fields = Object.entries(section.content).filter(
    ([name]) => !HIDDEN_FIELDS.has(name),
  );
  if (fields.every(([, value]) => isEmpty(value)))
    return (
      <p className="text-muted-foreground text-sm">
        {t("editor.sections.empty")}
      </p>
    );
  const label = (name: string) =>
    t(`tasks.sections.${section.key}.fields.${name}`, { defaultValue: name });
  const date = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleString(i18n.language);
  };

  return (
    <dl className="space-y-3">
      {fields.map(([name, value]) => {
        if (isEmpty(value)) return null;
        const files = name === "media" ? (media ?? rawMedia(value)) : null;
        return (
          <div key={name} className="min-w-0">
            <dt className="text-muted-foreground text-xs font-medium">
              {label(name)}
            </dt>
            <dd className="mt-1 text-sm break-words">
              {files ? (
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) =>
                    !file.url ? (
                      <span
                        key={index}
                        className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs"
                      >
                        {file.mediaType ?? "FILE"}
                      </span>
                    ) : file.mediaType === "VIDEO" ? (
                      <video
                        key={index}
                        src={file.url}
                        controls
                        className="max-h-56 rounded-lg border"
                      />
                    ) : (
                      <img
                        key={index}
                        src={file.url}
                        alt={label(name)}
                        className="max-h-56 rounded-lg border object-contain"
                      />
                    ),
                  )}
                </div>
              ) : Array.isArray(value) ? (
                <ul className="list-disc space-y-0.5 pl-5">
                  {value.map((item, index) => (
                    <li key={index}>{plain(item)}</li>
                  ))}
                </ul>
              ) : typeof value === "string" && /At$/.test(name) ? (
                date(value)
              ) : (
                <p className="whitespace-pre-wrap">{plain(value)}</p>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
