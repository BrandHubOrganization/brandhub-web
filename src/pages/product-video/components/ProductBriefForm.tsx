import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { ImagePlus, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProductVideoController } from "@/pages/product-video/hooks/useProductVideo";
import type {
  ProductImageSlot,
  ProductRecipe,
} from "@/pages/product-video/types/productVideo";

const musicIds = [
  "music-morning-notes",
  "music-night-window",
  "music-clean-horizon",
  "music-little-launch",
  "music-after-rain",
];
export function ProductBriefForm({
  controller: c,
}: {
  controller: ProductVideoController;
}) {
  const { t } = useTranslation();
  const b = c.brief;
  const imageInputs = useRef<
    Partial<Record<ProductImageSlot, HTMLInputElement | null>>
  >({});
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void c.plan();
      }}
      className="border-border bg-card min-w-0 space-y-5 rounded-xl border p-4 md:p-6"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <ListVideo className="text-brand-orange size-5" />
        {t("productVideo.brief")}
      </h2>
      <fieldset
        disabled={c.busy || c.loading || !c.editable}
        className="min-w-0 space-y-5 disabled:opacity-70"
      >
        <Input
          label={t("productVideo.productName")}
          value={b.productName}
          maxLength={120}
          required
          onChange={(e) => c.updateBrief({ productName: e.target.value })}
        />
        <div className="space-y-1.5">
          <Label htmlFor="product-recipe">{t("productVideo.recipe")}</Label>
          <Select
            id="product-recipe"
            value={b.recipeId}
            onChange={(e) =>
              c.updateBrief({ recipeId: e.target.value as ProductRecipe })
            }
          >
            {["auto", "review", "unboxing", "product_showcase"].map((id) => (
              <option key={id} value={id}>
                {t(`productVideo.recipes.${id}`)}
              </option>
            ))}
          </Select>
          <p className="text-muted-foreground text-xs">
            {t(`productVideo.recipeHelp.${b.recipeId}`)}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-facts">{t("productVideo.facts")}</Label>
          <Textarea
            id="product-facts"
            value={b.productFacts}
            rows={3}
            maxLength={1500}
            placeholder={t("productVideo.factsPlaceholder")}
            onChange={(e) => c.updateBrief({ productFacts: e.target.value })}
          />
          <p className="text-muted-foreground text-xs">
            {t("productVideo.factsHelp")}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-requirements">
            {t("productVideo.requirements")}
          </Label>
          <Textarea
            id="product-requirements"
            value={b.requirements}
            rows={3}
            maxLength={1500}
            placeholder={t("productVideo.requirementsPlaceholder")}
            onChange={(e) => c.updateBrief({ requirements: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-review-script">
            {t("productVideo.reviewScript")}
          </Label>
          <Textarea
            id="product-review-script"
            rows={4}
            maxLength={900}
            value={b.reviewScript ?? ""}
            placeholder={t("productVideo.reviewScriptPlaceholder")}
            onChange={(event) =>
              c.updateBrief({ reviewScript: event.target.value })
            }
          />
          <p className="text-muted-foreground text-xs">
            {t("productVideo.reviewScriptHelp", {
              count: b.durationSeconds === 20 ? 3 : 2,
            })}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-duration">
              {t("productVideo.duration")}
            </Label>
            <Select
              id="product-duration"
              value={b.durationSeconds}
              onChange={(e) =>
                c.updateBrief({
                  durationSeconds: Number(e.target.value) as 15 | 20,
                })
              }
            >
              <option value={15}>{t("productVideo.duration15")}</option>
              <option value={20}>{t("productVideo.duration20")}</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-ratio">{t("productVideo.ratio")}</Label>
            <Select
              id="product-ratio"
              value={b.aspectRatio}
              onChange={(e) =>
                c.updateBrief({
                  aspectRatio: e.target.value as "9:16" | "16:9",
                })
              }
            >
              <option value="9:16">{t("productVideo.portrait")}</option>
              <option value="16:9">{t("productVideo.landscape")}</option>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <ImagePlus className="size-4" />
            {t("productVideo.assets")}
          </h3>
          {(
            [
              "productImageAssetId",
              "packagingImageAssetId",
              "logoAssetId",
            ] as ProductImageSlot[]
          ).map((slot) => (
            <div
              key={slot}
              className="border-border space-y-1.5 rounded-lg border p-3"
            >
              <Input
                type="file"
                ref={(input) => {
                  imageInputs.current[slot] = input;
                }}
                accept="image/jpeg,image/png"
                label={t(`productVideo.images.${slot}`)}
                required={
                  slot === "productImageAssetId" && !b[slot] && !c.files[slot]
                }
                onChange={(e) =>
                  c.updateFile(slot, e.target.files?.[0] ?? null)
                }
              />
              {(c.files[slot]?.name || b[slot]) && (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground min-w-0 truncate">
                    {c.files[slot]?.name ?? t("productVideo.assetSaved")}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const input = imageInputs.current[slot];
                      if (input) input.value = "";
                      c.updateFile(slot, null);
                    }}
                  >
                    {t("productVideo.remove")}
                  </Button>
                </div>
              )}
            </div>
          ))}
          <p className="text-muted-foreground text-xs">
            {t("productVideo.imageHelp")}
          </p>
          <Label className="flex items-start gap-2 text-sm font-normal">
            <Input
              type="checkbox"
              className="size-4"
              wrapperClassName="w-auto shrink-0"
              checked={b.allowGenericPackaging}
              onChange={(e) =>
                c.updateBrief({ allowGenericPackaging: e.target.checked })
              }
            />
            {t("productVideo.genericBox")}
          </Label>
        </div>
        <Input
          label={t("productVideo.cta")}
          value={b.cta}
          maxLength={100}
          placeholder={t("productVideo.ctaPlaceholder")}
          onChange={(e) => c.updateBrief({ cta: e.target.value })}
        />
        <div className="space-y-1.5">
          <Label htmlFor="product-music">{t("productVideo.music")}</Label>
          <Select
            id="product-music"
            value={b.musicId ?? ""}
            onChange={(e) => c.updateBrief({ musicId: e.target.value || null })}
          >
            <option value="">{t("productVideo.noMusic")}</option>
            {musicIds.map((id) => (
              <option key={id} value={id}>
                {t(`productVideo.musicNames.${id}`)}
              </option>
            ))}
          </Select>
          <p className="text-muted-foreground text-xs">
            {t("productVideo.musicHelp")}
          </p>
        </div>
        <Label className="flex items-center gap-2 text-sm font-normal">
          <Input
            type="checkbox"
            className="size-4"
            wrapperClassName="w-auto"
            checked={b.preserveSourceAudio}
            onChange={(e) =>
              c.updateBrief({ preserveSourceAudio: e.target.checked })
            }
          />
          {t("productVideo.sourceAudio")}
        </Label>
        <div className="space-y-1.5">
          <Label htmlFor="product-language">
            {t("productVideo.videoLanguage")}
          </Label>
          <Select
            id="product-language"
            value={b.language}
            onChange={(e) =>
              c.updateBrief({ language: e.target.value as "vi" | "en" })
            }
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </Select>
        </div>
        <Button
          type="submit"
          variant="orange"
          className="w-full"
          loading={c.busy}
        >
          {t(c.production ? "productVideo.replan" : "productVideo.plan")}
        </Button>
        <p className="text-muted-foreground text-xs">
          {t("productVideo.planHelp")}
        </p>
      </fieldset>
    </form>
  );
}
