import PageWrapper from "@/components/layout/PageWrapper";

export function AnalyticsPage() {
  return (
    <PageWrapper
      title="Analytics"
      description="Báo cáo hiệu quả nội dung và tương tác chiến dịch."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "LƯỢT TIẾP CẬN", value: "245,890", delta: "+12.4%", desc: "So với tháng trước" },
          { label: "TƯƠNG TÁC", value: "18,430", delta: "+8.2%", desc: "So với tháng trước" },
          { label: "BÀI ĐĂNG", value: "48", delta: "0.0%", desc: "Bằng với tháng trước" },
          { label: "TỶ LỆ PHẢN HỒI", value: "94.5%", delta: "+1.5%", desc: "Cải thiện tốt" },
        ].map((stat, idx) => (
          <div key={idx} className="border border-border bg-card p-6 rounded-lg space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase font-mono">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight">{stat.value}</span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">{stat.delta}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="border border-border bg-card p-6 rounded-lg space-y-4 mt-6">
        <h2 className="text-sm font-bold text-foreground">Hiệu quả theo Kênh xuất bản</h2>
        <div className="h-48 border border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground bg-muted/10">
          [Biểu đồ thống kê theo mạng xã hội: Facebook, Instagram, LinkedIn, Blog]
        </div>
      </div>
    </PageWrapper>
  );
}

export default AnalyticsPage;
