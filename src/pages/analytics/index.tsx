import PageWrapper from "@/components/layout/PageWrapper";

export function AnalyticsPage() {
  return (
    <PageWrapper
      title="Analytics"
      description="Báo cáo hiệu quả nội dung và tương tác chiến dịch."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          {
            label: "LƯỢT TIẾP CẬN",
            value: "245,890",
            delta: "+12.4%",
            desc: "So với tháng trước",
          },
          {
            label: "TƯƠNG TÁC",
            value: "18,430",
            delta: "+8.2%",
            desc: "So với tháng trước",
          },
          {
            label: "BÀI ĐĂNG",
            value: "48",
            delta: "0.0%",
            desc: "Bằng với tháng trước",
          },
          {
            label: "TỶ LỆ PHẢN HỒI",
            value: "94.5%",
            delta: "+1.5%",
            desc: "Cải thiện tốt",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="border-border bg-card space-y-2 rounded-xl border p-6"
          >
            <p className="text-muted-foreground font-mono text-3xs font-semibold tracking-wider uppercase">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight">
                {stat.value}
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-600">
                {stat.delta}
              </span>
            </div>
            <p className="text-muted-foreground text-3xs">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="border-border bg-card mt-6 space-y-4 rounded-xl border p-6">
        <h2 className="text-foreground text-sm font-bold">
          Hiệu quả theo Kênh xuất bản
        </h2>
        <div className="border-border text-muted-foreground bg-muted/10 flex h-48 items-center justify-center rounded border border-dashed text-xs">
          [Biểu đồ thống kê theo mạng xã hội: Facebook, Instagram, LinkedIn,
          Blog]
        </div>
      </div>
    </PageWrapper>
  );
}

export default AnalyticsPage;
