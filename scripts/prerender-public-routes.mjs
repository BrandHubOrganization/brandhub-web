import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve(import.meta.dirname, "../dist");
const baseHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(baseHtmlPath)) {
  console.error("[prerender-public-routes] dist/index.html not found.");
  process.exit(1);
}

const baseHtml = fs.readFileSync(baseHtmlPath, "utf8");

const PUBLIC_ROUTES = [
  {
    routePath: "help/faq",
    canonicalUrl: "https://brandhub.id.vn/help/faq",
    title: "Trung Tâm Trợ Giúp & Câu Hỏi Thường Gặp (FAQ) | BrandHub",
    description:
      "Giải đáp chi tiết về quản trị Agency & Workspace, Gói truyền thông Media Package, AI Studio GraphRAG, phê duyệt nội dung và xuất bản đa kênh trên BrandHub.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "BrandHub",
              item: "https://brandhub.id.vn/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Trung Tâm Trợ Giúp & Câu Hỏi Thường Gặp",
              item: "https://brandhub.id.vn/help/faq",
            },
          ],
        },
        {
          "@type": "FAQPage",
          "@id": "https://brandhub.id.vn/help/faq#faqpage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Khách hàng không muốn tạo tài khoản BrandHub thì có xem và duyệt bài được không?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Khách hàng không cần tạo tài khoản để xem trước Gói truyền thông & Báo giá Proposal qua liên kết chia sẻ hoặc xuất PDF. Để phê duyệt bài viết chính thức với đầy đủ lịch sử kiểm tra (audit trail), Khách hàng tham gia Workspace với vai trò Client để xem bản xem trước chuẩn mạng xã hội và bấm Duyệt hoặc Từ chối nhanh chóng.",
              },
            },
            {
              "@type": "Question",
              name: "Tại sao bài viết đang ở trạng thái Chờ duyệt lại bị khóa không cho chỉnh sửa?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Đây là cơ chế bảo vệ tính toàn vẹn của BrandHub nhằm đảm bảo người duyệt đánh giá đúng bản nội dung cố định. Nếu cần chỉnh sửa, Creator có thể nhấn nút Thu hồi lượt gửi hoặc nhờ Manager/Client nhấn Từ chối để mở khóa trình soạn thảo.",
              },
            },
            {
              "@type": "Question",
              name: "Cấu hình múi giờ của Không gian làm việc nằm ở đâu và ảnh hưởng thế nào đến lịch đăng?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Múi giờ quyết định chính xác thời điểm bài viết hẹn giờ được xuất bản tự động lên Facebook, Instagram, TikTok, Threads. Bạn có thể cấu hình tại mục Cài đặt chung của từng Workspace (mặc định tại Việt Nam là Asia/Ho_Chi_Minh GMT+7).",
              },
            },
            {
              "@type": "Question",
              name: "Chu kỳ làm mới AI Credits hàng tháng và gói mua thêm hoạt động như thế nào?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Credits định kỳ theo gói đăng ký được tự động làm mới vào ngày đầu tiên của mỗi chu kỳ thanh toán. Khi mua thêm gói AI Credits qua VietQR (SePay / PayOS), số điểm cộng thêm này không giới hạn thời hạn sử dụng và chỉ bị trừ sau khi hạn mức định kỳ trong tháng đã dùng hết.",
              },
            },
          ],
        },
      ],
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Trung Tâm Trợ Giúp &amp; Câu Hỏi Thường Gặp (FAQ) — BrandHub</h1>
        <p>Tra cứu nhanh hướng dẫn vận hành Agency, thiết lập Workspace, chia sẻ Gói truyền thông (Media Package), sử dụng AI Studio GraphRAG, quy trình phê duyệt nội dung (Owner, Manager, Creator, Client) và xuất bản đa kênh (Facebook, Instagram, TikTok, Threads).</p>
        <ul>
          <li><strong>Quản trị Tài khoản &amp; Bảo mật 2FA:</strong> Hướng dẫn kích hoạt OTP, Google OAuth và khôi phục xác thực hai lớp.</li>
          <li><strong>Gói truyền thông &amp; Chiến dịch:</strong> Chia sẻ liên kết báo giá cho khách hàng không cần tạo tài khoản và xuất PDF proposal.</li>
          <li><strong>Quy trình Phê duyệt &amp; Thu hồi bài viết:</strong> Cơ chế khóa bản nháp khi chờ duyệt và luồng phản hồi giữa Creator, Manager, Client.</li>
          <li><strong>AI Studio &amp; Xuất bản Đa kênh:</strong> Tạo nội dung chuẩn Brand Knowledge GraphRAG, kiểm duyệt an toàn nội dung và đặt lịch đăng tự động.</li>
        </ul>
        <p><a href="https://brandhub.id.vn/">Quay lại Trang chủ BrandHub</a></p>
      </main>`,
  },
  {
    routePath: "privacy",
    canonicalUrl: "https://brandhub.id.vn/privacy",
    title: "Chính Sách Quyền Riêng Tư (Privacy Policy) | BrandHub",
    description:
      "Chính sách quyền riêng tư giải thích cách BrandHub thu thập, mã hóa và bảo vệ dữ liệu cá nhân, tài nguyên Workspace trên https://brandhub.id.vn.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "BrandHub",
          item: "https://brandhub.id.vn/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Chính Sách Quyền Riêng Tư (Privacy Policy)",
          item: "https://brandhub.id.vn/privacy",
        },
      ],
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Chính Sách Quyền Riêng Tư (Privacy Policy) — BrandHub</h1>
        <p>Chính sách quyền riêng tư này giải thích cách BrandHub (https://brandhub.id.vn) thu thập, sử dụng, mã hóa và bảo vệ dữ liệu cá nhân, tài nguyên số trong Workspace và dữ liệu người dùng Google OAuth.</p>
        <p>Liên hệ bộ phận bảo vệ dữ liệu &amp; hỗ trợ: <a href="mailto:brandhub404@gmail.com">brandhub404@gmail.com</a>.</p>
        <p><a href="https://brandhub.id.vn/">Quay lại Trang chủ BrandHub</a></p>
      </main>`,
  },
  {
    routePath: "terms",
    canonicalUrl: "https://brandhub.id.vn/terms",
    title: "Điều Khoản Dịch Vụ (Terms of Service) | BrandHub",
    description:
      "Điều khoản dịch vụ quy định quyền truy cập, phân quyền (Owner, Manager, Creator, Client), AI Credits và xuất bản đa kênh trên https://brandhub.id.vn.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "BrandHub",
          item: "https://brandhub.id.vn/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Điều Khoản Dịch Vụ (Terms of Service)",
          item: "https://brandhub.id.vn/terms",
        },
      ],
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Điều Khoản Dịch Vụ (Terms of Service) — BrandHub</h1>
        <p>Điều khoản dịch vụ quy định quyền và trách nhiệm khi sử dụng nền tảng BrandHub (https://brandhub.id.vn), bao gồm quản trị Agency &amp; Workspace, phân quyền 6 vai trò (Guest, Owner, Manager, Creator, Client, Admin), thanh toán VietQR (SePay / PayOS) và xuất bản mạng xã hội.</p>
        <p><a href="https://brandhub.id.vn/">Quay lại Trang chủ BrandHub</a></p>
      </main>`,
  },
];

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

for (const route of PUBLIC_ROUTES) {
  const escapedTitle = escapeHtml(route.title);
  const escapedDesc = escapeHtml(route.description);

  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapedDesc}" />`,
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${route.canonicalUrl}" />`,
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="vi"\s+href="[^"]*"\s*\/>/,
      `<link rel="alternate" hreflang="vi" href="${route.canonicalUrl}" />`,
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/>/,
      `<link rel="alternate" hreflang="en" href="${route.canonicalUrl}" />`,
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/>/,
      `<link rel="alternate" hreflang="x-default" href="${route.canonicalUrl}" />`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${route.canonicalUrl}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escapedTitle}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escapedDesc}" />`,
    )
    .replace(
      /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:url" content="${route.canonicalUrl}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${escapedTitle}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${escapedDesc}" />`,
    )
    .replace(
      /<noscript>[\s\S]*?<\/noscript>/,
      `<noscript>${route.noscriptHtml}\n    </noscript>`,
    );

  if (route.pageJsonLd) {
    const pageJsonScript = `<script type="application/ld+json" id="brandhub-page-jsonld">${JSON.stringify(route.pageJsonLd)}</script>`;
    if (
      /<script\s+type="application\/ld\+json"\s+id="brandhub-page-jsonld">[\s\S]*?<\/script>/.test(
        html,
      )
    ) {
      html = html.replace(
        /<script\s+type="application\/ld\+json"\s+id="brandhub-page-jsonld">[\s\S]*?<\/script>/,
        pageJsonScript,
      );
    } else {
      html = html.replace(/<\/head>/, `    ${pageJsonScript}\n  </head>`);
    }
  }

  const targetDir = path.join(distDir, route.routePath);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
}

console.log(
  `[prerender-public-routes] Generated static SEO HTML for ${PUBLIC_ROUTES.map((r) => `/${r.routePath}`).join(", ")}`,
);
