import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { VariableAnalysis } from "../utils";

/** Lists the variables found in the template and warns about likely typos or broken braces. */
export function VariableHints({ analysis }: { analysis: VariableAnalysis }) {
  const { t } = useTranslation();
  if (analysis.used.length === 0 && !analysis.malformed) return null;
  return (
    <div className="space-y-1.5 text-xs" data-testid="variable-hints">
      {analysis.used.length > 0 && (
        <p className="text-muted-foreground">
          {t("mailTemplate.variables.used")}{" "}
          {analysis.used.map((v) => (
            <code key={v} className="bg-muted mr-1 rounded px-1 py-0.5">{`{{${v}}}`}</code>
          ))}
        </p>
      )}
      {analysis.suggestions.map((s) => (
        <p key={s.name} role="status" className="flex items-start gap-1 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("mailTemplate.variables.didYouMean", { name: `{{${s.name}}}`, suggestion: `{{${s.suggestion}}}` })}
        </p>
      ))}
      {analysis.malformed && (
        <p role="status" className="flex items-start gap-1 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("mailTemplate.variables.malformed")}
        </p>
      )}
    </div>
  );
}
