import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  "Cô lập Multi-Workspace cho từng thương hiệu & phân quyền 6 vai trò chuẩn (Guest, Owner, Manager, Creator, Client, Admin)",
  "Quy trình kiểm duyệt an toàn nội dung & phê duyệt 3 cấp giảm tới 70% thời gian chỉnh sửa qua tin nhắn rời rạc",
  "AI Studio tích hợp đồ thị tri thức Neo4j GraphRAG giúp giữ đúng Brand Guidelines & bắt trend thời gian thực",
  "Xuất bản đồng loạt Facebook, Instagram, TikTok, Threads & nạp gói cước minh bạch qua SePay / PayOS VietQR",
];

export function BlogConversionBanner() {
  return (
    <section
      aria-label="Khởi tạo không gian làm việc BrandHub"
      className="bh-spotlight-card relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs sm:p-8 lg:p-10 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Rocket className="size-3.5 text-brand-orange" />
            Biến kiến thức thành quy trình vận hành thật
          </span>

          <h2 className="text-balance text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Đưa toàn bộ đội ngũ Agency lên một Workspace duy nhất trong 30 giây
          </h2>

          <p className="text-pretty text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
            Ngừng cảnh copy-paste rời rạc giữa Jira, Notion, Zalo và trình hẹn
            giờ thủ công. Mời Manager, Creator và Client vào cùng một luồng
            nghiệp vụ minh bạch trên BrandHub.
          </p>

          <ul className="space-y-2 pt-1">
            {BENEFITS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-700 sm:text-[13px] dark:text-zinc-300"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/75 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950/75">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <ShieldCheck className="size-4 shrink-0 text-brand-orange" />
              <span>Không cần thẻ tín dụng · Thanh toán VietQR khi nâng cấp</span>
            </div>

            <div className="space-y-3">
              <Link to="/register" className="block">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 h-11 w-full cursor-pointer rounded-xl text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5">
                  Tạo Workspace Miễn phí ngay
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link to="/#pricing" className="block">
                <Button
                  variant="outline"
                  className="h-10 w-full cursor-pointer rounded-xl border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-800 transition-colors hover:border-brand-orange/40 hover:bg-orange-50/50 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
                >
                  Xem bảng giá Agency &amp; AI Credits
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogConversionBanner;
