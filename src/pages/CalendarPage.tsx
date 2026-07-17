import PageWrapper from "@/components/layout/PageWrapper";

export function CalendarPage() {
  return (
    <PageWrapper
      title="Calendar"
      description="Lịch lên bài và quản lý lịch xuất bản nội dung."
    >
      <div className="border border-border bg-card rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4 select-none">
          <span className="text-sm font-semibold">Tháng 7, 2026</span>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border border-border text-xs rounded hover:bg-muted/50 cursor-pointer">Trước</button>
            <button className="px-2 py-1 border border-border text-xs rounded hover:bg-muted/50 cursor-pointer">Hôm nay</button>
            <button className="px-2 py-1 border border-border text-xs rounded hover:bg-muted/50 cursor-pointer">Sau</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground border-b border-border pb-2 select-none">
          <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
        </div>

        <div className="grid grid-cols-7 gap-2 h-72">
          {Array.from({ length: 31 }).map((_, idx) => {
            const dayNum = idx + 1;
            const hasEvent = dayNum === 17 || dayNum === 18 || dayNum === 25;
            return (
              <div
                key={idx}
                className={`border border-border rounded p-1 flex flex-col justify-between text-xs relative ${
                  dayNum === 17 ? "border-[#f05a28]" : ""
                }`}
              >
                <span className={dayNum === 17 ? "text-[#f05a28] font-bold" : "text-muted-foreground"}>
                  {dayNum}
                </span>
                {hasEvent && (
                  <div
                    className="h-1.5 rounded-full w-full bg-[#f05a28]"
                    title="Có bài đăng đã lên lịch"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}

export default CalendarPage;
