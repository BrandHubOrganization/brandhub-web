/**
 * Centralized Form Validation & Normalization Utilities
 */

export const CURRENT_YEAR = new Date().getFullYear();

/**
 * Normalizes a URL: trims whitespace and prepends 'https://' if missing protocol.
 */
export function normalizeUrl(value: string): string {
  const s = value.trim();
  if (!s) return "";
  if (s.startsWith("icon:") || s.startsWith("seed:")) return s;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

/**
 * Validates whether a string is a valid web URL.
 * Empty values are considered valid (caller checks required).
 */
export function isValidUrl(value: string): boolean {
  const s = value.trim();
  if (!s) return true;
  if (s.startsWith("icon:") || s.startsWith("seed:")) return true;
  try {
    const normalized = normalizeUrl(s);
    const parsed = new URL(normalized);
    return Boolean(parsed.hostname && parsed.hostname.includes("."));
  } catch {
    return false;
  }
}

/**
 * Formats a phone number into readable groups: 0901 234 567
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
}

/**
 * Validates phone format (Vietnamese mobile 10 digits or standard format).
 * Empty values are considered valid.
 */
export function isValidPhone(value: string): boolean {
  const s = value.trim().replace(/[\s.-]/g, "");
  if (!s) return true;
  return /^(0|\+84)[0-9]{9,10}$/.test(s);
}

/**
 * Validates tax code (Mã số thuế VN: 10 chữ số hoặc 13 chữ số dạng xxxxxxxxxx-xxx).
 * Empty values are considered valid.
 */
export function isValidTaxCode(value: string): boolean {
  const s = value.trim();
  if (!s) return true;
  return /^[0-9]{10}(-[0-9]{3})?$/.test(s);
}

/**
 * Validates founded year (1800 <= year <= CURRENT_YEAR).
 * Empty values are considered valid.
 */
export function isValidFoundedYear(
  yearStr: string,
  minYear = 1800,
  maxYear = CURRENT_YEAR,
): boolean {
  const s = yearStr.trim();
  if (!s) return true;
  const num = parseInt(s, 10);
  return !isNaN(num) && Number.isInteger(num) && num >= minYear && num <= maxYear;
}
