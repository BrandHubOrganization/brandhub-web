import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function ExpandablePackageText({
  text,
  limitLines = 2,
}: {
  text: string;
  limitLines?: 2 | null;
}) {
  const { t } = useTranslation();
  const id = useId();
  const element = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const paragraph = element.current;
    if (!paragraph || expanded || limitLines === null) return;
    const observer = new ResizeObserver(() => {
      setOverflows(paragraph.scrollHeight > paragraph.clientHeight + 1);
    });
    observer.observe(paragraph);
    return () => observer.disconnect();
  }, [text, expanded, limitLines]);
  return (
    <div className="min-w-0">
      <p
        id={id}
        data-package-text
        ref={element}
        className={`text-sm leading-6 [overflow-wrap:anywhere] whitespace-pre-line ${expanded || limitLines === null ? "" : "line-clamp-2"}`}
      >
        {text}
      </p>
      {limitLines !== null && overflows && (
        <Button
          data-package-text-toggle
          variant="link"
          size="sm"
          className="h-auto min-h-8 px-0 text-xs"
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
