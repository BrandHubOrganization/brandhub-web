/**
 * Helper định dạng thời gian tương đối & ngày giờ song ngữ Việt - Anh (i18n)
 * Áp dụng chuẩn UX Cách 1:
 * - Trong ngày: Hôm nay lúc HH:mm / Today at HH:mm
 * - Ngày mai / Hôm qua: Ngày mai lúc HH:mm / Yesterday at HH:mm / Tomorrow at HH:mm
 * - 2 đến 7 ngày: Sau X ngày nữa (HH:mm) / In X days (HH:mm) hoặc X ngày trước (HH:mm) / X days ago (HH:mm)
 * - 8 đến 30 ngày (> 1 tuần): DD/MM/YYYY lúc HH:mm (Sau X tuần nữa) / (In X weeks)
 * - > 30 ngày (> 1 tháng): DD/MM/YYYY lúc HH:mm (Sau X tháng nữa) / (In X months)
 */
export function formatRelativeScheduleTime(
  targetDate: Date | string,
  options?: {
    showWeekday?: boolean;
    showTime?: boolean;
    locale?: string;
  },
): string {
  if (!targetDate) return "";
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return String(targetDate);

  const isEn = options?.locale?.startsWith("en") ?? false;
  const now = new Date();

  // So sánh nguyên ngày (bỏ qua giờ/phút để tính khoảng cách ngày chuẩn xác)
  const targetDay = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const diffDays = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));

  const timeStr = target.toLocaleTimeString(isEn ? "en-US" : "vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const weekdayStr = target.toLocaleDateString(isEn ? "en-US" : "vi-VN", {
    weekday: "short",
  });
  const dateStr = target.toLocaleDateString(isEn ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const prefix = options?.showWeekday ? `${weekdayStr}, ${dateStr}` : dateStr;
  const includeTime = options?.showTime !== false;
  const atWord = isEn ? "at" : "lúc";
  const timeSuffix = includeTime ? ` ${atWord} ${timeStr}` : "";

  // 1. Hôm nay / Today
  if (diffDays === 0) {
    if (isEn) {
      return includeTime ? `Today at ${timeStr}` : "Today";
    }
    return includeTime ? `Hôm nay lúc ${timeStr}` : "Hôm nay";
  }

  // 2. Ngày mai / Tomorrow & Hôm qua / Yesterday
  if (diffDays === 1) {
    if (isEn) {
      return includeTime ? `Tomorrow at ${timeStr}` : "Tomorrow";
    }
    return includeTime ? `Ngày mai lúc ${timeStr}` : "Ngày mai";
  }
  if (diffDays === -1) {
    if (isEn) {
      return includeTime ? `Yesterday at ${timeStr}` : "Yesterday";
    }
    return includeTime ? `Hôm qua lúc ${timeStr}` : "Hôm qua";
  }

  // 3. Trong vòng 7 ngày (2 đến 7 ngày)
  if (diffDays > 1 && diffDays <= 7) {
    if (isEn) {
      const daysText = diffDays === 1 ? "day" : "days";
      return includeTime
        ? `In ${diffDays} ${daysText} (${timeStr})`
        : `In ${diffDays} ${daysText}`;
    }
    return includeTime
      ? `Sau ${diffDays} ngày nữa (${timeStr})`
      : `Sau ${diffDays} ngày nữa`;
  }
  if (diffDays < -1 && diffDays >= -7) {
    const daysAgo = Math.abs(diffDays);
    if (isEn) {
      const daysText = daysAgo === 1 ? "day" : "days";
      return includeTime
        ? `${daysAgo} ${daysText} ago (${timeStr})`
        : `${daysAgo} ${daysText} ago`;
    }
    return includeTime
      ? `${daysAgo} ngày trước (${timeStr})`
      : `${daysAgo} ngày trước`;
  }

  // 4. Từ 8 đến 30 ngày (hơn 1 tuần đến 1 tháng) -> Quy ra tuần kèm ngày tháng cụ thể
  const absDays = Math.abs(diffDays);
  if (absDays <= 30) {
    const weeks = Math.round(absDays / 7);
    if (isEn) {
      const weekLabel = weeks <= 1 ? "1 week" : `${weeks} weeks`;
      if (diffDays > 0) {
        return `${prefix}${timeSuffix} (In ${weekLabel})`;
      }
      return `${prefix}${timeSuffix} (${weekLabel} ago)`;
    }

    const weekLabel = weeks <= 1 ? "1 tuần" : `${weeks} tuần`;
    if (diffDays > 0) {
      return `${prefix}${timeSuffix} (Sau ${weekLabel} nữa)`;
    }
    return `${prefix}${timeSuffix} (${weekLabel} trước)`;
  }

  // 5. Hơn 30 ngày (hơn 1 tháng) -> Quy ra tháng kèm ngày tháng cụ thể
  const months = Math.round(absDays / 30);
  if (isEn) {
    const monthLabel = months <= 1 ? "1 month" : `${months} months`;
    if (diffDays > 0) {
      return `${prefix}${timeSuffix} (In ${monthLabel})`;
    }
    return `${prefix}${timeSuffix} (${monthLabel} ago)`;
  }

  const monthLabel = months <= 1 ? "1 tháng" : `${months} tháng`;
  if (diffDays > 0) {
    return `${prefix}${timeSuffix} (Sau ${monthLabel} nữa)`;
  }
  return `${prefix}${timeSuffix} (${monthLabel} trước)`;
}
