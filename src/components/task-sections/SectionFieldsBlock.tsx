import { useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import {
  SectionListField,
  type ListColumn,
} from "@/components/task-sections/SectionListField";
import {
  formatVndInput,
  parseVndInput,
} from "@/pages/media-package/lib/formatMediaPackage";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";
import { cn } from "@/lib/utils";

type FieldKind =
  | "richtext"
  | "text"
  | "url"
  | "date"
  | "datetime"
  | "number"
  | "currency"
  | "select"
  | "kolSelect"
  | "chips"
  | "table";

interface FieldDef {
  kind: FieldKind;
  columns?: ListColumn[];
  options?: string[];
  presets?: string[];
  placeholder?: string;
  hashtag?: boolean;
}

const field = (
  kind: FieldKind,
  extra?: Omit<FieldDef, "kind">,
): FieldDef => ({
  kind,
  ...extra,
});

const CHANNEL_OPTIONS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Threads",
  "YouTube",
  "Báo điện tử",
  "Email",
];

const INVITE_STATUS_OPTIONS = [
  "Chưa mời",
  "Đã mời",
  "Đã xác nhận",
  "Từ chối",
];

const CURRENCY_PRESETS = [
  { label: "5 triệu", value: "5000000" },
  { label: "10 triệu", value: "10000000" },
  { label: "20 triệu", value: "20000000" },
  { label: "50 triệu", value: "50000000" },
];

/** Mirrors backend `TaskCatalog.fields` with structured pickers, presets, and RichTextInput. */
const FIELDS: Record<string, Record<string, FieldDef>> = {
  "POST.BRIEF": {
    notes: field("richtext", {
      placeholder: "Nhập ghi chú, định hướng nội dung cho bài viết...",
    }),
    sources: field("chips", {
      presets: [
        "Brand Guidelines",
        "Trang chủ / Landing page",
        "Tài liệu sản phẩm",
        "Báo cáo thị trường",
      ],
      placeholder: "Thêm nguồn tham khảo rồi nhấn Enter...",
    }),
    materials: field("chips", {
      presets: [
        "Hình ảnh sản phẩm",
        "Video demo",
        "Logo & Bộ nhận diện",
        "Feedback khách hàng",
      ],
      placeholder: "Thêm tư liệu đính kèm rồi nhấn Enter...",
    }),
  },
  "VIDEO.SCRIPT": {
    idea: field("richtext", {
      placeholder: "Mô tả ý tưởng chủ đạo, thông điệp và góc tiếp cận video...",
    }),
    scenes: field("chips", {
      presets: [
        "Cảnh 1: Hook (3s đầu gây chú ý)",
        "Cảnh 2: Nêu vấn đề / Insight",
        "Cảnh 3: Giới thiệu & Demo sản phẩm",
        "Cảnh 4: Social Proof / Kết quả",
        "Cảnh 5: Call to Action (CTA)",
      ],
      placeholder: "Thêm phân cảnh rồi nhấn Enter...",
    }),
  },
  "EVENT.AGENDA": {
    concept: field("richtext", {
      placeholder: "Mô tả concept chủ đạo và trải nghiệm sự kiện...",
    }),
    goal: field("richtext", {
      presets: [
        "Ra mắt sản phẩm mới",
        "Tăng nhận diện thương hiệu",
        "Kết nối khách hàng & đối tác",
        "Thu thập leads tiềm năng",
      ],
      placeholder: "Mục tiêu cần đạt của sự kiện...",
    }),
    datetimeVenue: field("text", {
      placeholder: "VD: 09:00 - 12:00, 20/11/2026 tại Gem Center, Q1, TP.HCM",
    }),
    agenda: field("table", {
      columns: [{ key: "time" }, { key: "item" }, { key: "owner" }],
    }),
  },
  "EVENT.LOGISTICS": {
    venue: field("text", { placeholder: "Tên địa điểm / địa chỉ tổ chức..." }),
    vendors: field("table", {
      columns: [
        { key: "name" },
        { key: "category" },
        { key: "costVnd", type: "currency" },
        { key: "contact" },
      ],
    }),
    totalBudget: field("currency"),
    checklist: field("chips", {
      presets: [
        "Backdrop & Standee",
        "Âm thanh & Ánh sáng",
        "Bàn Check-in & QR",
        "Quà tặng / Goodie bag",
        "Đội ngũ quay chụp sự kiện",
        "Teabreak / Catering",
      ],
      placeholder: "Thêm hạng mục chuẩn bị rồi nhấn Enter...",
    }),
  },
  "EVENT.PROMOTION": {
    plan: field("richtext", {
      presets: [
        "Truyền thông trước sự kiện (Teaser + Countdown)",
        "Livestream / Cập nhật trực tiếp tại sự kiện",
        "Bài tổng kết & hình ảnh sau sự kiện",
      ],
      placeholder: "Kế hoạch truyền thông trước, trong và sau sự kiện...",
    }),
    guests: field("table", {
      columns: [
        { key: "name" },
        { key: "org" },
        {
          key: "inviteStatus",
          type: "select",
          options: INVITE_STATUS_OPTIONS,
        },
      ],
    }),
  },
  "EVENT.RUNSHEET": {
    runsheet: field("table", {
      columns: [{ key: "time" }, { key: "task" }, { key: "owner" }],
    }),
    staffing: field("richtext", {
      presets: [
        "MC / Điều phối sân khấu",
        "Nhân sự đón khách & Check-in",
        "Kỹ thuật âm thanh / ánh sáng",
        "Team Media quay chụp",
      ],
      placeholder: "Phân công nhân sự vận hành sự kiện...",
    }),
  },
  "EVENT.REPORT": {
    result: field("richtext", {
      placeholder: "Tổng kết kết quả đạt được so với mục tiêu đề ra...",
    }),
    attendeeCount: field("number", { placeholder: "VD: 120" }),
    lessons: field("richtext", {
      placeholder: "Bài học kinh nghiệm & đề xuất cải thiện cho lần sau...",
    }),
  },
  "PRESS.MEDIA_LIST": {
    outlets: field("table", {
      columns: [
        { key: "outlet" },
        { key: "section" },
        { key: "journalist" },
        { key: "contact" },
        { key: "note" },
      ],
    }),
  },
  "PRESS.RELEASE": {
    title: field("text", { placeholder: "Nhập tiêu đề thông cáo báo chí..." }),
    sapo: field("richtext", {
      placeholder: "Đoạn mở đầu tóm tắt thông tin quan trọng nhất (Sapo)...",
    }),
    content: field("richtext", {
      placeholder: "Nội dung chi tiết thông cáo báo chí...",
    }),
  },
  "PRESS.CONTACT_LOG": {
    log: field("table", {
      columns: [
        { key: "date", type: "date" },
        { key: "outlet" },
        { key: "contact" },
        {
          key: "channel",
          type: "select",
          options: ["Email", "Điện thoại", "Zalo", "Gặp trực tiếp"],
        },
        {
          key: "result",
          type: "select",
          options: [
            "Đã gửi",
            "Đang trao đổi",
            "Đồng ý đăng",
            "Đã lên bài",
            "Từ chối",
          ],
        },
      ],
    }),
  },
  "PRESS.COVERAGE": {
    coverage: field("table", {
      columns: [
        { key: "outlet" },
        { key: "link" },
        { key: "publishedAt", type: "date" },
      ],
    }),
  },
  "KOL.SHORTLIST": {
    shortlist: field("table", {
      columns: [
        { key: "name" },
        { key: "channel", type: "select", options: CHANNEL_OPTIONS },
        { key: "link" },
        { key: "followers", type: "number" },
        { key: "engagementRate" },
        { key: "reason" },
      ],
    }),
  },
  "KOL.DEAL": {
    kol: field("kolSelect"),
    priceVnd: field("currency"),
    deliverables: field("chips", {
      presets: [
        "1 Video TikTok (30–60s)",
        "1 Bài Facebook + 3 ảnh",
        "1 Instagram Reel",
        "1 Bộ Story (3 frames)",
        "Gắn link bio / giỏ hàng 7 ngày",
      ],
      placeholder: "Thêm hạng mục bàn giao rồi nhấn Enter...",
    }),
    terms: field("richtext", {
      presets: [
        "Thanh toán 50% trước khi sản xuất, 50% sau nghiệm thu.",
        "Không hợp tác với đối thủ cạnh tranh trong vòng 30 ngày.",
        "Cho phép Agency/Brand chạy quảng cáo (Whitelisting) trong 30 ngày.",
        "Bàn giao file gốc và giữ bài tối thiểu 6 tháng.",
      ],
      placeholder: "Nhập hoặc chọn các điều khoản thỏa thuận...",
    }),
  },
  "KOL.BRIEF": {
    keyMessage: field("richtext", {
      placeholder: "Thông điệp cốt lõi KOL cần truyền tải trong nội dung...",
    }),
    dos: field("chips", {
      presets: [
        "Nhấn mạnh USP chính của sản phẩm",
        "Quay ở nơi đủ sáng, thấy rõ bao bì sản phẩm",
        "Gắn đúng hashtag và tag fanpage thương hiệu",
        "Gửi bản nháp duyệt trước khi đăng",
      ],
      placeholder: "Thêm điều nên làm rồi nhấn Enter...",
    }),
    donts: field("chips", {
      presets: [
        "Không nhắc tên đối thủ cạnh tranh",
        "Không cam kết công dụng vượt quá sự thật",
        "Không sử dụng nhạc dính bản quyền thương mại",
        "Không tự ý chỉnh sửa thông điệp chính",
      ],
      placeholder: "Thêm điều cần tránh rồi nhấn Enter...",
    }),
    requiredHashtags: field("chips", {
      hashtag: true,
      placeholder: "Nhập hashtag (VD: BrandHub) rồi nhấn Enter...",
    }),
    postDeadline: field("date"),
  },
  "KOL.DRAFT": {
    draftCaption: field("richtext", {
      placeholder: "Nội dung caption bản nháp của KOL...",
    }),
    draftMedia: field("chips", {
      placeholder: "Dán link ảnh / video bản nháp rồi nhấn Enter...",
    }),
    reviewNote: field("richtext", {
      presets: [
        "Đạt yêu cầu, có thể tiến hành đăng bài.",
        "Cần chỉnh sửa lại caption theo đúng Key Message.",
        "Cần bổ sung cảnh quay rõ sản phẩm hơn.",
      ],
      placeholder: "Nhận xét chi tiết cho bản nháp của KOL...",
    }),
  },
  "KOL.REPORT": {
    postLink: field("url", { placeholder: "https://..." }),
    postedAt: field("datetime"),
    views: field("number", { placeholder: "0" }),
    likes: field("number", { placeholder: "0" }),
    comments: field("number", { placeholder: "0" }),
    shares: field("number", { placeholder: "0" }),
  },
  "WORKSHOP.PROGRAM": {
    topic: field("richtext", {
      placeholder: "Chủ đề chính và giá trị mang lại cho người tham dự...",
    }),
    agenda: field("chips", {
      presets: [
        "08:30 - Đón khách & Check-in",
        "09:00 - Khai mạc & Giới thiệu",
        "09:15 - Chia sẻ chuyên đề chính",
        "10:15 - Q&A & Thảo luận",
        "10:45 - Networking & Bế mạc",
      ],
      placeholder: "Thêm khung giờ chương trình rồi nhấn Enter...",
    }),
    materials: field("chips", {
      presets: [
        "Slide thuyết trình",
        "Tài liệu handout / Checklist",
        "Form khảo sát sau workshop",
        "Quà tặng / Voucher cho người tham dự",
      ],
      placeholder: "Thêm tài liệu chuẩn bị rồi nhấn Enter...",
    }),
  },
  "WORKSHOP.SPEAKERS": {
    speakers: field("table", {
      columns: [
        { key: "name" },
        { key: "title" },
        { key: "topic" },
        {
          key: "inviteStatus",
          type: "select",
          options: INVITE_STATUS_OPTIONS,
        },
      ],
    }),
  },
  "WORKSHOP.LOGISTICS": {
    format: field("select", {
      options: [
        "Offline (Tại địa điểm)",
        "Online (Zoom / Google Meet)",
        "Hybrid (Kết hợp)",
      ],
    }),
    venueOrMeetingUrl: field("text", {
      placeholder: "Nhập địa chỉ tổ chức hoặc đường dẫn phòng họp online...",
    }),
    cost: field("currency"),
  },
  "WORKSHOP.REPORT": {
    registeredCount: field("number", { placeholder: "0" }),
    attendedCount: field("number", { placeholder: "0" }),
    feedback: field("richtext", {
      placeholder: "Tổng hợp đánh giá & phản hồi nổi bật từ người tham dự...",
    }),
    photos: field("chips", {
      placeholder: "Dán link ảnh / album sự kiện rồi nhấn Enter...",
    }),
    lessons: field("richtext", {
      placeholder: "Bài học rút ra và đề xuất cho workshop tiếp theo...",
    }),
  },
  "EMAIL.REPORT": {
    sentCount: field("number", { placeholder: "0" }),
    successCount: field("number", { placeholder: "0" }),
    bounceCount: field("number", { placeholder: "0" }),
    unsubscribeCount: field("number", { placeholder: "0" }),
    note: field("richtext", {
      placeholder: "Ghi chú thêm về hiệu quả chiến dịch email...",
    }),
  },
};

const asList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map((item) => String(item ?? "").trim()).filter(Boolean)
    : [];
const asText = (value: unknown) =>
  typeof value === "string"
    ? value
    : typeof value === "number"
      ? String(value)
      : "";
const isTableEmpty = (value: unknown) =>
  !Array.isArray(value) || value.length === 0;

function ChipsField({
  items,
  presets,
  placeholder,
  hashtag,
  disabled,
  onChange,
}: {
  items: string[];
  presets?: string[];
  placeholder?: string;
  hashtag?: boolean;
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const normalize = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    return hashtag && !trimmed.startsWith("#") ? `#${trimmed}` : trimmed;
  };

  const addItems = (rawValues: string[]) => {
    const next = [...items];
    for (const raw of rawValues) {
      const normalized = normalize(raw);
      if (normalized && !next.includes(normalized)) {
        next.push(normalized);
      }
    }
    if (next.length !== items.length) onChange(next);
  };

  const togglePreset = (preset: string) => {
    if (disabled) return;
    const normalized = normalize(preset);
    if (items.includes(normalized)) {
      onChange(items.filter((i) => i !== normalized));
    } else {
      onChange([...items, normalized]);
    }
  };

  const commitDraft = () => {
    if (!draft.trim() || disabled) return;
    addItems(draft.split(/\n|,/));
    setDraft("");
  };

  return (
    <div className="space-y-2">
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const active = items.includes(normalize(preset));
            return (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => togglePreset(preset)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/60",
                )}
              >
                {active ? `✓ ${preset}` : `+ ${preset}`}
              </button>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className="border-border bg-muted/50 text-foreground inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Xóa ${item}`}
                  onClick={() => onChange(items.filter((i) => i !== item))}
                  className="text-muted-foreground hover:text-destructive rounded-full p-0.5 transition-colors"
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="flex gap-1.5">
          <Input
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitDraft();
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              if (text.includes("\n")) {
                e.preventDefault();
                addItems(text.split(/\r?\n/));
              }
            }}
            className="h-9 text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={commitDraft}
            disabled={!draft.trim()}
            className="h-9 shrink-0 gap-1 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            Thêm
          </Button>
        </div>
      )}
    </div>
  );
}

/** Section with its own stored fields, saved through `useTaskSections`. */
export function SectionFieldsBlock({
  section,
  api,
}: {
  section: TaskSection;
  api: TaskSectionsApi;
}) {
  const { t } = useTranslation();
  const fields = FIELDS[section.key] ?? {};
  const content = api.contentOf(section);
  const disabled = !section.canEdit;

  const isEmpty = Object.entries(fields).every(([name, def]) =>
    def.kind === "table"
      ? isTableEmpty(content[name])
      : def.kind === "chips"
        ? asList(content[name]).length === 0
        : !asText(content[name]).trim(),
  );

  // Pull shortlist rows from KOL.SHORTLIST when editing KOL.DEAL so user can click-select instead of re-typing.
  const shortlistSection = api.sections?.find((s) => s.key === "KOL.SHORTLIST");
  const shortlistRows = shortlistSection
    ? ((api.contentOf(shortlistSection).shortlist as
        | Array<Record<string, unknown>>
        | undefined) ?? [])
    : [];

  return (
    <SectionFrame section={section} api={api} isEmpty={isEmpty}>
      <div className="space-y-4">
        {Object.entries(fields).map(([name, def]) => {
          const id = `${section.key}-${name}`;
          const label =
            def.kind === "table"
              ? t(`tasks.sections.${section.key}.fields.${name}Label`, {
                  defaultValue: t(`tasks.sections.${section.key}.title`, {
                    defaultValue: name,
                  }),
                })
              : t(`tasks.sections.${section.key}.fields.${name}`, {
                  defaultValue: name,
                });

          if (def.kind === "table") {
            return (
              <div key={name} className="space-y-1.5">
                <label className="text-sm font-semibold">{label}</label>
                <SectionListField
                  sectionKey={section.key}
                  name={name}
                  columns={def.columns ?? []}
                  value={content[name]}
                  disabled={disabled}
                  onChange={(rows) => api.edit(section, { [name]: rows })}
                />
              </div>
            );
          }

          if (def.kind === "richtext") {
            const currentHtml = asText(content[name]);
            return (
              <div key={name} className="space-y-1.5">
                <label htmlFor={id} className="block text-sm font-semibold">
                  {label}
                </label>
                {def.presets && def.presets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {def.presets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          const appended = currentHtml.trim()
                            ? `${currentHtml}<p>${preset}</p>`
                            : `<p>${preset}</p>`;
                          api.edit(section, { [name]: appended });
                        }}
                        className="border-border bg-background text-muted-foreground hover:border-brand-orange/50 hover:text-brand-orange rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                )}
                <RichTextInput
                  id={id}
                  value={currentHtml}
                  placeholder={def.placeholder}
                  disabled={disabled}
                  onChange={(html) => api.edit(section, { [name]: html })}
                />
              </div>
            );
          }

          if (def.kind === "chips") {
            return (
              <div key={name} className="space-y-1.5">
                <label className="block text-sm font-semibold">{label}</label>
                <ChipsField
                  items={asList(content[name])}
                  presets={def.presets}
                  placeholder={def.placeholder}
                  hashtag={def.hashtag}
                  disabled={disabled}
                  onChange={(next) => api.edit(section, { [name]: next })}
                />
              </div>
            );
          }

          if (def.kind === "kolSelect") {
            const currentKol = asText(content[name]);
            const kolOptions = shortlistRows
              .map((row) => ({
                name: String(row.name ?? "").trim(),
                channel: String(row.channel ?? "").trim(),
              }))
              .filter((row) => row.name.length > 0);
            return (
              <div key={name} className="space-y-1.5">
                <label htmlFor={id} className="block text-sm font-semibold">
                  {label}
                </label>
                {kolOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {kolOptions.map((opt) => {
                      const labelText = opt.channel
                        ? `${opt.name} (${opt.channel})`
                        : opt.name;
                      const active =
                        currentKol === opt.name || currentKol === labelText;
                      return (
                        <button
                          key={labelText}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            api.edit(section, { [name]: labelText })
                          }
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                            active
                              ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                              : "border-border bg-background text-foreground hover:bg-muted/60",
                          )}
                        >
                          {active ? `✓ ${labelText}` : labelText}
                        </button>
                      );
                    })}
                  </div>
                )}
                <Input
                  id={id}
                  disabled={disabled}
                  value={currentKol}
                  placeholder={
                    kolOptions.length > 0
                      ? "Hoặc nhập tên KOL khác..."
                      : "Nhập tên KOL / Influencer đã chọn..."
                  }
                  onChange={(e) => api.edit(section, { [name]: e.target.value })}
                />
              </div>
            );
          }

          if (def.kind === "select" && def.options) {
            const currentVal = asText(content[name]);
            return (
              <div key={name} className="space-y-1.5">
                <label className="block text-sm font-semibold">{label}</label>
                <div className="flex flex-wrap gap-1.5">
                  {def.options.map((opt) => {
                    const active = currentVal === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={disabled}
                        onClick={() => api.edit(section, { [name]: opt })}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                          active
                            ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                            : "border-border bg-background text-muted-foreground hover:bg-muted/60",
                        )}
                      >
                        {active ? `✓ ${opt}` : opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (def.kind === "currency") {
            const currentVal = asText(content[name]);
            return (
              <div key={name} className="space-y-1.5">
                <label htmlFor={id} className="block text-sm font-semibold">
                  {label}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CURRENCY_PRESETS.map((preset) => {
                    const active = parseVndInput(currentVal) === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          api.edit(section, { [name]: preset.value })
                        }
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                          active
                            ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                            : "border-border bg-background text-muted-foreground hover:bg-muted/60",
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <div className="relative max-w-sm">
                  <Input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    disabled={disabled}
                    value={formatVndInput(currentVal)}
                    placeholder="0"
                    onChange={(e) =>
                      api.edit(section, {
                        [name]: parseVndInput(e.target.value),
                      })
                    }
                    className="pr-12"
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium">
                    VND
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div key={name} className="space-y-1.5">
              <label htmlFor={id} className="block text-sm font-semibold">
                {label}
              </label>
              <Input
                id={id}
                type={
                  def.kind === "date"
                    ? "date"
                    : def.kind === "datetime"
                      ? "datetime-local"
                      : def.kind === "number"
                        ? "number"
                        : def.kind === "url"
                          ? "url"
                          : "text"
                }
                min={def.kind === "number" ? 0 : undefined}
                disabled={disabled}
                value={asText(content[name])}
                placeholder={def.placeholder}
                onChange={(e) => api.edit(section, { [name]: e.target.value })}
                className={
                  def.kind === "date" ||
                  def.kind === "datetime" ||
                  def.kind === "number"
                    ? "max-w-xs"
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </SectionFrame>
  );
}

/** Reserved slot without a schema yet (VIDEO.SHOOT): header, status and actions only. */
export function SectionSlot({
  section,
  api,
  children,
}: {
  section: TaskSection;
  api: TaskSectionsApi;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <SectionFrame section={section} api={api} showVersions={false}>
      {children ?? (
        <p className="text-muted-foreground text-sm">
          {t("editor.sections.comingSoon")}
        </p>
      )}
    </SectionFrame>
  );
}
