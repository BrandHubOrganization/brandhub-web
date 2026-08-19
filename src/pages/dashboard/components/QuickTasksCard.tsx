import { Sparkles } from "lucide-react";

const PRIORITY_TASKS = [
  "Phê duyệt bài viết Chiến dịch Heineken (AM)",
  "Lên lịch bài đăng Nike Air Max (Creator)",
  "Xem báo cáo hiệu năng nội dung tháng 8",
];

interface Props {
  userName: string;
  userRole?: string;
}

export function QuickTasksCard({ userName, userRole }: Props) {
  return (
    <div className="space-y-6">
      <div className="border-border from-card via-card to-muted/30 relative overflow-hidden rounded-xl border bg-gradient-to-r p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-foreground text-lg font-bold">
                Xin chào trở lại, {userName || "User"}!
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-2xs font-semibold text-brand-orange">
                <Sparkles className="size-3" /> {userRole}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Hệ thống đang hoạt động ổn định. Dưới đây là báo cáo tổng quan
              chiến dịch của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="border-border bg-card space-y-3 rounded-xl border p-5">
        <h3 className="text-foreground text-sm font-bold">
          Nhiệm vụ ưu tiên hôm nay
        </h3>
        <div className="space-y-2.5">
          {PRIORITY_TASKS.map((taskText, idx) => (
            <label
              key={idx}
              className="text-foreground/90 hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs transition-colors"
            >
              <input
                type="checkbox"
                className="border-border size-3.5 rounded text-brand-orange focus:ring-brand-orange"
              />
              <span>{taskText}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
