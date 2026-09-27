/**
 * Chuẩn hoá dữ liệu đầu vào hồ sơ: chức danh là 1 giá trị chọn từ danh sách
 * (dropdown), ngôn ngữ làm việc là nhiều giá trị (chips) lưu dạng chuỗi
 * comma-joined vào `users.working_language` (VARCHAR(50)) — giữ nguyên kiểu
 * String xuyên suốt BE nên không cần đổi entity/DTO.
 *
 * Label lấy qua i18n key `profile.jobTitle.<value>` / `profile.language.<code>`.
 * Giá trị lưu DB giữ nguyên tiếng Anh (job title) hoặc mã ISO (language) để
 * thuật toán gợi ý / dashboard thống kê không phụ thuộc ngôn ngữ UI.
 */
export const JOB_TITLES = [
  "Marketing Manager",
  "Brand Manager",
  "Content Manager",
  "Social Media Manager",
  "Content Creator",
  "Copywriter",
  "Graphic Designer",
  "Art Director",
  "Photographer",
  "Videographer",
  "Account Manager",
  "Project Manager",
  "Product Manager",
  "Business Owner",
  "Agency Owner",
  "Consultant",
  "Freelancer",
  "Student",
  "OTHER",
] as const;

export type JobTitle = (typeof JOB_TITLES)[number];

/** Sentinel của option "Khác" — chọn xong thì cho nhập tự do. */
export const JOB_TITLE_OTHER = "OTHER";

/** true nếu value là 1 chức danh curated (không phải OTHER / tự do). */
export function isCuratedJobTitle(value: string): boolean {
  return (
    (JOB_TITLES as readonly string[]).includes(value) &&
    value !== JOB_TITLE_OTHER
  );
}

/**
 * Ngôn ngữ gợi ý. Value = mã ISO 639-1 (2 chữ, đủ ngắn để ghép nhiều mã trong
 * VARCHAR(50) — tối đa ~16 ngôn ngữ).
 */
export const LANGUAGES = [
  "vi",
  "en",
  "ja",
  "ko",
  "zh",
  "fr",
  "de",
  "es",
  "pt",
  "it",
  "ru",
  "th",
  "id",
  "hi",
  "ar",
] as const;

export type LanguageCode = (typeof LANGUAGES)[number];

/** true nếu code là 1 mã ISO trong danh sách gợi ý. */
export function isLanguage(code: string): boolean {
  return (LANGUAGES as readonly string[]).includes(code);
}

/** "vi,en,fr" → ["vi","en","fr"]; bỏ khoảng trắng + phần tử rỗng. */
export function parseLanguages(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** ["en","vi"] → "vi,en" — xếp theo thứ tự LANGUAGES cho ổn định. */
export function joinLanguages(codes: string[]): string {
  const known = LANGUAGES.filter((c) => codes.includes(c));
  const unknown = codes.filter(
    (c) => !(LANGUAGES as readonly string[]).includes(c),
  );
  return [...known, ...unknown].join(",");
}

/**
 * Chuyên môn gợi ý (chip multi-select). Value lưu thẳng vào mảng JSONB
 * `users.skills` — không mã hoá, không join chuỗi. Label qua i18n key
 * `profile.skill.<slug>`.
 */
export const SKILLS = [
  "content-strategy",
  "copywriting",
  "social-media",
  "seo",
  "branding",
  "graphic-design",
  "video-editing",
  "photography",
  "motion-graphics",
  "ui-ux",
  "community-management",
  "paid-ads",
  "email-marketing",
  "analytics",
  "campaign-management",
  "project-management",
  "account-management",
  "influencer-marketing",
  "pr-communications",
  "event-marketing",
  "ecommerce",
  "market-research",
  "ai-tools",
  "storytelling",
] as const;

export type Skill = (typeof SKILLS)[number];

/** true nếu value là 1 chuyên môn trong danh sách gợi ý. */
export function isSkill(value: string): boolean {
  return (SKILLS as readonly string[]).includes(value);
}
