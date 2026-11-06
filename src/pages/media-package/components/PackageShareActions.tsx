import { useState } from "react";
import { Copy, Download, Image, Link2Off, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { ApiResponse } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface Share {
  shareId: string | null;
  enabled: boolean;
}
export function PackageShareActions({ basePath }: { basePath: string }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  async function run(
    action: "link" | "revoke" | "pdf" | "jpg",
    language: "vi" | "en" = "vi",
  ) {
    setBusy(true);
    try {
      if (action === "link") {
        let share = (await api.get<ApiResponse<Share>>(`${basePath}/share`))
          .data.data;
        if (!share.enabled)
          share = (await api.post<ApiResponse<Share>>(`${basePath}/share`)).data
            .data;
        const url = `${window.location.origin}/packages/share/${share.shareId}`;
        setLink(url);
        try {
          await navigator.clipboard.writeText(url);
          setLink("");
          toast.success(t("mediaPackage.share.copied"));
        } catch {
          toast.info(t("mediaPackage.share.copyManually"));
        }
      } else if (action === "revoke") {
        await api.delete(`${basePath}/share`);
        setLink("");
        toast.success(t("mediaPackage.share.revoked"));
      } else {
        const response = await api.get<Blob>(`${basePath}/export`, {
          params: {
            format: action,
            language,
          },
          responseType: "blob",
        });
        const url = URL.createObjectURL(response.data);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `media-package-${language}-${new Date().toISOString().slice(0, 10)}.${action === "pdf" ? "pdf" : "jpg"}`;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      toast.error(t("mediaPackage.share.error"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            disabled={busy}
            className="bg-border text-foreground hover:bg-border/80 size-11 shrink-0"
            aria-label={t("mediaPackage.share.menu")}
            title={t("mediaPackage.share.menu")}
          >
            <Share2 className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            disabled={busy}
            className="min-h-11 cursor-pointer"
            onSelect={() => void run("link")}
          >
            <Copy aria-hidden="true" />
            {t("mediaPackage.share.copyLink")}
          </DropdownMenuItem>
          {(["pdf", "jpg"] as const).map((format) => (
            <DropdownMenuSub key={format}>
              <DropdownMenuSubTrigger
                disabled={busy}
                className="min-h-11 cursor-pointer gap-2"
              >
                {format === "pdf" ? (
                  <Download className="size-4" aria-hidden="true" />
                ) : (
                  <Image className="size-4" aria-hidden="true" />
                )}
                {t(`mediaPackage.share.${format === "pdf" ? "pdf" : "images"}`)}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {(["vi", "en"] as const).map((language) => (
                  <DropdownMenuItem
                    key={language}
                    disabled={busy}
                    className="min-h-11 cursor-pointer"
                    onSelect={() => void run(format, language)}
                  >
                    {t(`mediaPackage.share.languages.${language}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={busy}
            className="min-h-11 cursor-pointer"
            onSelect={() => void run("revoke")}
          >
            <Link2Off aria-hidden="true" />
            {t("mediaPackage.share.revoke")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {link && (
        <Input
          readOnly
          value={link}
          aria-label={t("mediaPackage.share.copyLink")}
          onFocus={(e) => e.target.select()}
        />
      )}
    </div>
  );
}
