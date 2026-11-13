import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/ui/rich-text-input";
import { cn } from "@/lib/utils";

const LEADING_BULLET_PATTERN = /^\s*(?:[-–—•*+]|\d+[.)])\s+/;
const HAS_HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

/**
 * Splits plain deliverable descriptions or acceptance criteria into readable bullet points
 * along line breaks and semicolons, while keeping HTML rich text intact.
 */
function parsePackageBulletPoints(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const items: string[] = [];
  for (const rawLine of lines) {
    const trimmedLine = rawLine.replace(LEADING_BULLET_PATTERN, "").trim();
    if (!trimmedLine) continue;
    const segments = trimmedLine.split(/;(?=\s|$)/);
    segments.forEach((rawSegment, segmentIndex) => {
      const cleaned = rawSegment.replace(LEADING_BULLET_PATTERN, "").trim();
      if (!cleaned) return;
      const formatted =
        segmentIndex > 0 && /^[a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/.test(cleaned)
          ? cleaned.charAt(0).toLocaleUpperCase() + cleaned.slice(1)
          : cleaned;
      items.push(formatted);
    });
  }
  return items;
}

export function ExpandablePackageText({
  text,
  limitLines = 2,
  tone = "orange",
  size = "sm",
  className,
}: {
  text: string;
  limitLines?: 2 | null;
  tone?: "orange" | "emerald";
  size?: "sm" | "xs";
  className?: string;
}) {
  const { t } = useTranslation();
  const id = useId();
  const element = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const isHtml = useMemo(() => HAS_HTML_TAG_PATTERN.test(text), [text]);
  const bulletItems = useMemo(
    () => (isHtml ? [] : parsePackageBulletPoints(text)),
    [isHtml, text],
  );
  const hasHiddenBullets =
    !isHtml && limitLines !== null && bulletItems.length > limitLines;
  const visibleItems =
    limitLines !== null && !expanded
      ? bulletItems.slice(0, limitLines)
      : bulletItems;

  useEffect(() => {
    const container = element.current;
    if (!container || expanded || limitLines === null) return;
    const observer = new ResizeObserver(() => {
      setOverflows(
        hasHiddenBullets || container.scrollHeight > container.clientHeight + 1,
      );
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [text, expanded, limitLines, hasHiddenBullets]);

  const bulletDotClass =
    tone === "emerald"
      ? "bg-emerald-500/85 dark:bg-emerald-400/85"
      : "bg-brand-orange/85";

  return (
    <div className={cn("min-w-0", className)}>
      <div
        id={id}
        data-package-text
        ref={element}
        className={cn(
          "[overflow-wrap:anywhere]",
          size === "xs" ? "text-xs leading-relaxed" : "text-sm leading-6",
          isHtml && limitLines !== null && !expanded && "line-clamp-2",
        )}
      >
        {isHtml ? (
          <RichTextContent value={text} />
        ) : (
          <ul className="text-foreground/90 space-y-1.5">
            {visibleItems.map((item, idx) => (
              <li key={`${idx}-${item}`} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 rounded-full",
                    size === "xs" ? "mt-[7px] size-1.5" : "mt-[9px] size-1.5",
                    bulletDotClass,
                  )}
                />
                <span className="min-w-0 flex-1 break-words">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {limitLines !== null && (overflows || hasHiddenBullets) && (
        <Button
          data-package-text-toggle
          variant="link"
          size="sm"
          className="text-brand-orange mt-1 h-auto min-h-7 px-0 text-xs font-medium"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
        >
          {t(
            expanded
              ? "mediaPackage.proposal.collapse"
              : "mediaPackage.proposal.expand",
          )}
        </Button>
      )}
    </div>
  );
}
