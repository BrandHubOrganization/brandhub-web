import { AdminTrendPipelineControl } from "@/pages/admin/components/AdminTrendPipelineControl";
import { AdminTrendSettings } from "@/pages/admin/components/AdminTrendSettings";
import { CrawlerHealthPanel } from "@/pages/admin/components/CrawlerHealthPanel";
import { CrawlerCredentialsPanel } from "@/pages/admin/components/CrawlerCredentialsPanel";
import { CrawlerRunLauncher } from "@/pages/admin/components/CrawlerRunLauncher";
import { CrawlerRunHistory } from "@/pages/admin/components/CrawlerRunHistory";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function AdminTrendPipelinePanel() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const requested = params.get("crawlerTab") ?? "overview";
  const section = ["overview", "settings", "credentials", "history"].includes(
    requested,
  )
    ? requested
    : "overview";
  const setSection = (value: string) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("crawlerTab", value);
      return next;
    });
  return (
    <div className="max-w-full min-w-0 space-y-4">
      <nav
        className="flex flex-wrap gap-2"
        aria-label={t("admin.crawler.navigation")}
      >
        {["overview", "settings", "credentials", "history"].map((key) => (
          <Button
            key={key}
            variant={section === key ? "orange" : "outline"}
            aria-pressed={section === key}
            onClick={() => setSection(key)}
          >
            {t(`admin.crawler.sections.${key}`)}
          </Button>
        ))}
      </nav>
      {section === "overview" && (
        <>
          <CrawlerHealthPanel />
          <CrawlerRunLauncher />
          <AdminTrendPipelineControl managed />
        </>
      )}
      {section === "settings" && <AdminTrendSettings />}
      {section === "credentials" && <CrawlerCredentialsPanel />}
      {section === "history" && <CrawlerRunHistory />}
    </div>
  );
}
