import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve(import.meta.dirname, "../dist");
const baseHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(baseHtmlPath)) {
  console.error("[prerender-public-routes] dist/index.html not found.");
  process.exit(1);
}

const baseHtml = fs.readFileSync(baseHtmlPath, "utf8");

const SR_ONLY_STYLE =
  "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";

const HOME_SEMANTIC_HTML = `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>BrandHub — Nền tảng Quản trị Thương hiệu &amp; Xuất bản Nội dung Đa kênh AI</h1>
        <p>
          BrandHub (<a href="https://brandhub.id.vn">https://brandhub.id.vn</a>) là nền tảng SaaS B2B2C giúp các Agency truyền thông và Thương hiệu tại Việt Nam quản lý trọn vẹn vòng đời chiến dịch nội dung số: từ xây dựng Gói truyền thông (Media Package), lập kế hoạch Chiến dịch (Media Campaign), sáng tạo nội dung bằng AI GraphRAG (Neo4j + ChromaDB), kiểm duyệt an toàn nội dung, phê duyệt đa cấp (Owner, Manager, Creator, Client) đến xuất bản tự động lên 4 nền tảng mạng xã hội (Facebook, Instagram, TikTok, Threads).
        </p>
        <h2>Các nhóm tính năng cốt lõi</h2>
        <ul>
          <li><strong>Quản trị Agency &amp; đa Workspace:</strong> Cô lập dữ liệu thương hiệu khách hàng, quản lý thành viên và phân quyền RBAC theo 6 vai trò chuẩn (Guest, Owner, Manager, Creator, Client, Admin).</li>
          <li><strong>Gói truyền thông &amp; Chiến dịch (Media Package &amp; Media Campaign):</strong> Chia sẻ liên kết báo giá cho khách hàng không cần đăng nhập, đàm phán 2 chiều và chuyển đổi thành backlog công việc tự động.</li>
          <li><strong>AI Studio &amp; GraphRAG Brand Knowledge:</strong> Sinh bài viết chuẩn giọng văn thương hiệu, tạo ảnh/video sản phẩm với đại sứ ảo AI, kiểm duyệt tuân thủ cộng đồng và bắt xu hướng TikTok Creative Center &amp; Google Trends.</li>
          <li><strong>Xuất bản Đa kênh &amp; Phân tích:</strong> Đặt lịch đăng tự động và theo dõi chỉ số tăng trưởng thời gian thực trên Facebook, Instagram, TikTok và Threads.</li>
        </ul>
        <h2>Bảng so sánh BrandHub với công cụ truyền thống</h2>
        <table>
          <caption>So sánh tính năng giữa BrandHub, các công cụ lên lịch mạng xã hội truyền thống và quy trình thủ công</caption>
          <thead>
            <tr>
              <th scope="col">Tiêu chí vận hành &amp; công nghệ</th>
              <th scope="col">BrandHub Platform</th>
              <th scope="col">Tool đăng bài truyền thống (Buffer / Planable / Hootsuite)</th>
              <th scope="col">Quy trình thủ công (Sheets + Drive + Chat)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Kiến trúc Đa Agency &amp; Cô lập Workspace (6 vai trò RBAC)</th>
              <td>Hỗ trợ nguyên bản (Guest, Owner, Manager, Creator, Client, Admin)</td>
              <td>Giới hạn / Phụ phí cao</td>
              <td>Rời rạc, dễ lộ dữ liệu</td>
            </tr>
            <tr>
              <th scope="row">Đàm phán Gói dịch vụ (Media Package) &amp; Tự động tạo Campaign</th>
              <td>Tự động hóa khép kín 1-click</td>
              <td>Không hỗ trợ</td>
              <td>Làm hợp đồng &amp; nhập tay</td>
            </tr>
            <tr>
              <th scope="row">AI GraphRAG Brand Guidelines &amp; Virtual Ambassador</th>
              <td>Neo4j + ChromaDB + LoRA Studio</td>
              <td>Chỉ gợi ý caption cơ bản</td>
              <td>Không có kiểm chứng tự động</td>
            </tr>
            <tr>
              <th scope="row">AI Social Trend Crawler thời gian thực</th>
              <td>Cập nhật liên tục mỗi ngày (TikTok &amp; Google Trends)</td>
              <td>Không tích hợp sẵn</td>
              <td>Tìm kiếm thủ công tốn giờ</td>
            </tr>
            <tr>
              <th scope="row">Luồng Phê duyệt Đa cấp (Creator → Manager → Client)</th>
              <td>Luồng duyệt 3 cấp chuẩn Agency</td>
              <td>Duyệt phẳng, thiếu vai trò</td>
              <td>Trôi tin nhắn qua chat</td>
            </tr>
            <tr>
              <th scope="row">Xuất bản Đa kênh &amp; Quản lý Đối tác Báo đài</th>
              <td>Facebook, Instagram, TikTok, Threads + Báo chí/TV</td>
              <td>Chỉ đăng mạng xã hội</td>
              <td>Đăng tay từng kênh</td>
            </tr>
            <tr>
              <th scope="row">Thanh toán Nội địa &amp; Hỗ trợ Thị trường Việt Nam</th>
              <td>VietQR tự động (SePay / PayOS) + AI tiếng Việt</td>
              <td>Chỉ thẻ quốc tế (USD)</td>
              <td>Đối soát sao kê thủ công</td>
            </tr>
          </tbody>
        </table>
        <nav aria-label="Liên kết công khai">
          <a href="https://brandhub.id.vn/blog">Blog &amp; Cẩm nang Quản trị Truyền thông (100 Chủ đề SEO)</a> |
          <a href="https://brandhub.id.vn/help/faq">Trung tâm Trợ giúp &amp; Câu hỏi thường gặp (FAQ)</a> |
          <a href="https://brandhub.id.vn/privacy">Chính sách Quyền riêng tư (Privacy Policy)</a> |
          <a href="https://brandhub.id.vn/terms">Điều khoản Dịch vụ (Terms of Service)</a> |
          <a href="https://brandhub.id.vn/login">Đăng nhập</a> |
          <a href="https://brandhub.id.vn/register">Đăng ký miễn phí</a>
        </nav>
      </main>`;

// Inject semantic HTML into dist/index.html #root so Wave 1 crawlers see full content immediately
const enrichedHomeHtml = baseHtml.replace(
  /<div id="root"><\/div>/,
  `<div id="root"><div style="${SR_ONLY_STYLE}">${HOME_SEMANTIC_HTML}</div></div>`,
);
fs.writeFileSync(baseHtmlPath, enrichedHomeHtml, "utf8");

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
  {
    routePath: "blog",
    canonicalUrl: "https://brandhub.id.vn/blog",
    title: "Blog Quản trị Truyền thông, Quy trình Agency & AI Marketing | BrandHub",
    description:
      "Cẩm nang vận hành Agency như Jira & Notion, quy trình phê duyệt nội dung 3 cấp, báo giá Gói truyền thông (Media Package), AI GraphRAG và lịch đăng tự động Facebook, Instagram, TikTok, Threads.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": "https://brandhub.id.vn/blog#blog",
      name: "BrandHub Knowledge & Media Operations Blog",
      url: "https://brandhub.id.vn/blog",
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Blog Quản trị Truyền thông, Quy trình Agency &amp; AI Marketing — BrandHub</h1>
        <p>Thư viện 100 chủ đề truyền thông chuẩn SEO giúp Owner, Manager, Creator và Client làm chủ mô hình quản lý công việc chuẩn Jira / Notion, thiết kế Gói truyền thông (Media Package), ứng dụng AI GraphRAG và tự động hóa xuất bản trên Facebook, Instagram, TikTok, Threads.</p>
        <ul>
          <li><a href="https://brandhub.id.vn/blog/quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub">Quản lý dự án truyền thông như Jira và Notion với BrandHub</a></li>
          <li><a href="https://brandhub.id.vn/blog/quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client">Quy trình phê duyệt nội dung 3 cấp (Creator -&gt; Manager -&gt; Client)</a></li>
          <li><a href="https://brandhub.id.vn/blog/goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia">Gói truyền thông (Media Package) gồm những gì? Cách đóng gói báo giá</a></li>
          <li><a href="https://brandhub.id.vn/blog/ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb">AI GraphRAG là gì? Ứng dụng Neo4j và ChromaDB giữ chuẩn giọng thương hiệu</a></li>
          <li><a href="https://brandhub.id.vn/blog/lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads">Hướng dẫn đặt lịch đăng bài tự động lên Facebook, Instagram, TikTok và Threads</a></li>
          <li><a href="https://brandhub.id.vn/blog/so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion">So sánh BrandHub với Buffer, Hootsuite, Planable và combo Jira + Notion</a></li>
        </ul>
      </main>`,
  },
  {
    routePath: "blog/quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
    canonicalUrl:
      "https://brandhub.id.vn/blog/quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
    title: "Quản lý dự án truyền thông như Jira & Notion cho Agency | BrandHub",
    description:
      "Hướng dẫn chuẩn hóa quy trình quản lý dự án truyền thông như Jira và Notion trên BrandHub: cô lập đa Workspace, phân quyền 6 vai trò và theo dõi tiến độ.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline:
        "Quản lý dự án truyền thông như Jira và Notion: Cách BrandHub chuẩn hóa đa Workspace cho Agency",
      url: "https://brandhub.id.vn/blog/quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
      datePublished: "2026-11-10",
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Quản lý dự án truyền thông như Jira và Notion: Cách BrandHub chuẩn hóa đa Workspace cho Agency</h1>
        <p>BrandHub kết hợp kỷ luật quản lý tác vụ của Jira và không gian tri thức của Notion vào kiến trúc đa Workspace phân quyền 6 vai trò (Guest, Owner, Manager, Creator, Client, Admin).</p>
        <p><a href="https://brandhub.id.vn/register">Đăng ký tạo Workspace miễn phí</a> | <a href="https://brandhub.id.vn/blog">Quay lại Blog</a></p>
      </main>`,
  },
  {
    routePath: "blog/quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
    canonicalUrl:
      "https://brandhub.id.vn/blog/quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
    title: "Quy trình phê duyệt nội dung 3 cấp chuẩn Agency (Creator - Manager - Client) | BrandHub",
    description:
      "Xây dựng luồng duyệt bài 3 cấp minh bạch giữa Creator, Manager và Client. Tự động khóa bản nháp khi chờ duyệt, lưu lịch sử phiên bản và xem trước đa kênh.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline:
        "Quy trình phê duyệt nội dung 3 cấp (Creator -> Manager -> Client): Chấm dứt ác mộng duyệt bài qua chat",
      url: "https://brandhub.id.vn/blog/quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      datePublished: "2026-11-10",
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Quy trình phê duyệt nội dung 3 cấp (Creator -&gt; Manager -&gt; Client)</h1>
        <p>Chuẩn hóa quy trình kiểm duyệt nội bộ và phê duyệt khách hàng với cơ chế khóa bản nháp tự động và xem trước trực tiếp trên Facebook, Instagram, TikTok, Threads.</p>
        <p><a href="https://brandhub.id.vn/register">Trải nghiệm luồng duyệt 3 cấp</a> | <a href="https://brandhub.id.vn/blog">Quay lại Blog</a></p>
      </main>`,
  },
  {
    routePath: "blog/goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
    canonicalUrl:
      "https://brandhub.id.vn/blog/goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
    title: "Gói truyền thông (Media Package) gồm những gì? Mẫu báo giá & Chiến dịch | BrandHub",
    description:
      "Giải mã chi tiết Gói truyền thông (Media Package) gồm những hạng mục nào, cách lập báo giá tích hợp mạng xã hội, báo chí, truyền hình và chuyển đổi thành chiến dịch.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline:
        "Gói truyền thông (Media Package) gồm những gì? Cách đóng gói báo giá và quản lý chiến dịch khép kín",
      url: "https://brandhub.id.vn/blog/goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
      datePublished: "2026-11-10",
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Gói truyền thông (Media Package) gồm những gì? Cách đóng gói báo giá và quản lý chiến dịch khép kín</h1>
        <p>Hướng dẫn thiết kế danh mục Gói truyền thông tích hợp 4 mạng xã hội cùng đối tác Báo điện tử, Đài truyền hình và tự động sinh Media Campaign khi chốt báo giá.</p>
        <p><a href="https://brandhub.id.vn/#media-package">Khám phá Gói Truyền thông</a> | <a href="https://brandhub.id.vn/blog">Quay lại Blog</a></p>
      </main>`,
  },
  {
    routePath: "blog/ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
    canonicalUrl:
      "https://brandhub.id.vn/blog/ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
    title: "AI GraphRAG là gì? Viết Content chuẩn Brand Guidelines với Neo4j & ChromaDB | BrandHub",
    description:
      "Khám phá kiến trúc AI GraphRAG kết hợp đồ thị tri thức Neo4j và vector ChromaDB trên BrandHub giúp sáng tạo nội dung, hình ảnh, đại sứ ảo đúng 100% Brand Voice.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline:
        "AI GraphRAG là gì? Cách BrandHub kết hợp Neo4j và ChromaDB để AI không bao giờ viết lệch giọng thương hiệu",
      url: "https://brandhub.id.vn/blog/ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
      datePublished: "2026-11-10",
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>AI GraphRAG là gì? Cách BrandHub kết hợp Neo4j và ChromaDB để AI không bao giờ viết lệch giọng thương hiệu</h1>
        <p>Ứng dụng đồ thị tri thức Neo4j, ChromaDB, đại sứ ảo LoRA và hệ thống cào xu hướng thời gian thực trong sáng tạo nội dung số.</p>
        <p><a href="https://brandhub.id.vn/#ai-features">Trải nghiệm AI Studio</a> | <a href="https://brandhub.id.vn/blog">Quay lại Blog</a></p>
      </main>`,
  },
  {
    routePath: "blog/lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
    canonicalUrl:
      "https://brandhub.id.vn/blog/lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
    title: "Đăng bài tự động Facebook, Instagram, TikTok, Threads | BrandHub",
    description:
      "Cách quản lý lịch xuất bản đa kênh (Content Calendar) và đăng bài tự động lên Facebook, Instagram, TikTok, Threads qua API chính thức bảo mật AES-256.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline:
        "Hướng dẫn thiết lập lịch đăng bài tự động lên Facebook, Instagram, TikTok và Threads an toàn tuyệt đối",
      url: "https://brandhub.id.vn/blog/lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
      datePublished: "2026-11-10",
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>Hướng dẫn thiết lập lịch đăng bài tự động lên Facebook, Instagram, TikTok và Threads an toàn tuyệt đối</h1>
        <p>Quản lý Content Calendar, kết nối OAuth 2.0 mã hóa AES-256 và theo dõi chỉ số tương tác thực tế sau xuất bản trên 4 nền tảng mạng xã hội.</p>
        <p><a href="https://brandhub.id.vn/register">Đặt lịch đăng bài miễn phí</a> | <a href="https://brandhub.id.vn/blog">Quay lại Blog</a></p>
      </main>`,
  },
  {
    routePath: "blog/so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    canonicalUrl:
      "https://brandhub.id.vn/blog/so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    title: "So sánh BrandHub vs Buffer, Planable, Hootsuite & Jira Notion | BrandHub",
    description:
      "Bảng đối chiếu chi tiết giữa BrandHub với các công cụ ngoại (Buffer, Hootsuite, Planable) và bộ công cụ Jira + Notion về tính năng, AI tiếng Việt và chi phí.",
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline:
        "So sánh BrandHub với Buffer, Hootsuite, Planable và combo Jira + Notion cho Agency Việt Nam",
      url: "https://brandhub.id.vn/blog/so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
      datePublished: "2026-11-10",
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>So sánh BrandHub với Buffer, Hootsuite, Planable và combo Jira + Notion cho Agency Việt Nam</h1>
        <p>Tiết kiệm tới 80% chi phí phần mềm hàng tháng khi hợp nhất quản lý công việc, báo giá Media Package, AI GraphRAG, duyệt 3 cấp và đăng tự động 4 kênh thanh toán qua VietQR.</p>
        <p><a href="https://brandhub.id.vn/#pricing">Xem bảng giá Starter &amp; Pro</a> | <a href="https://brandhub.id.vn/blog">Quay lại Blog</a></p>
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

// Tự động trích xuất toàn bộ 27 bài viết đã xuất bản từ blogData.ts, blogBatch1Part1.ts, blogBatch1Part2.ts
const blogSourceFiles = [
  "../src/data/blogData.ts",
  "../src/data/blogBatch1Part1.ts",
  "../src/data/blogBatch1Part2.ts",
];
const combinedBlogSource = blogSourceFiles
  .map((rel) => fs.readFileSync(path.resolve(import.meta.dirname, rel), "utf8"))
  .join("\n");

const rawPostBlocks = combinedBlogSource.split(/\{\s*\n\s*id:\s*"post-/).slice(1);
const existingRoutes = new Set(PUBLIC_ROUTES.map((r) => r.routePath));

for (const block of rawPostBlocks) {
  const slugMatch = block.match(/slug:\s*"([^"]+)"/);
  const titleMatch = block.match(/title:\s*\n?\s*"([^"]+)"/);
  const metaTitleMatch = block.match(/metaTitle:\s*\n?\s*"([^"]+)"/);
  const metaDescMatch = block.match(/metaDescription:\s*\n?\s*"([^"]+)"/);
  const geoMatch = block.match(/geoSummary:\s*\n?\s*"([^"]+)"/);
  const dateMatch = block.match(/publishedAt:\s*"([^"]+)"/);

  if (!slugMatch || !titleMatch) continue;
  const slug = slugMatch[1];
  const routePath = `blog/${slug}`;
  if (existingRoutes.has(routePath)) continue;

  const title = titleMatch[1];
  const metaTitle = metaTitleMatch ? metaTitleMatch[1] : `${title} | BrandHub`;
  const metaDescription = metaDescMatch ? metaDescMatch[1] : title;
  const geoSummary = geoMatch ? geoMatch[1] : metaDescription;
  const publishedAt = dateMatch ? dateMatch[1] : "2026-11-10";
  const canonicalUrl = `https://brandhub.id.vn/blog/${slug}`;

  PUBLIC_ROUTES.push({
    routePath,
    canonicalUrl,
    title: metaTitle,
    description: metaDescription,
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: metaDescription,
      url: canonicalUrl,
      datePublished: publishedAt,
    },
    noscriptHtml: `
      <main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; line-height: 1.6;">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(geoSummary)}</p>
        <p><a href="https://brandhub.id.vn/register">Đăng ký tài khoản miễn phí</a> | <a href="https://brandhub.id.vn/blog">Quay lại Blog BrandHub</a></p>
      </main>`,
  });
  existingRoutes.add(routePath);
}

// Đồng bộ sitemap.xml cho toàn bộ bài viết đã xuất bản
const blogRoutesForSitemap = PUBLIC_ROUTES.filter((r) =>
  r.routePath.startsWith("blog/"),
);
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://brandhub.id.vn/</loc>
    <lastmod>2026-11-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="https://brandhub.id.vn/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://brandhub.id.vn/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://brandhub.id.vn/" />
  </url>
  <url>
    <loc>https://brandhub.id.vn/blog</loc>
    <lastmod>2026-11-10</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="https://brandhub.id.vn/blog" />
    <xhtml:link rel="alternate" hreflang="en" href="https://brandhub.id.vn/blog?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://brandhub.id.vn/blog" />
  </url>
${blogRoutesForSitemap
  .map(
    (r) => `  <url>
    <loc>${r.canonicalUrl}</loc>
    <lastmod>2026-11-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="${r.canonicalUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${r.canonicalUrl}" />
  </url>`,
  )
  .join("\n")}
  <url>
    <loc>https://brandhub.id.vn/help/faq</loc>
    <lastmod>2026-11-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="https://brandhub.id.vn/help/faq" />
    <xhtml:link rel="alternate" hreflang="en" href="https://brandhub.id.vn/help/faq?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://brandhub.id.vn/help/faq" />
  </url>
  <url>
    <loc>https://brandhub.id.vn/privacy</loc>
    <lastmod>2026-11-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="https://brandhub.id.vn/privacy" />
    <xhtml:link rel="alternate" hreflang="en" href="https://brandhub.id.vn/privacy?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://brandhub.id.vn/privacy" />
  </url>
  <url>
    <loc>https://brandhub.id.vn/terms</loc>
    <lastmod>2026-11-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="vi" href="https://brandhub.id.vn/terms" />
    <xhtml:link rel="alternate" hreflang="en" href="https://brandhub.id.vn/terms?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://brandhub.id.vn/terms" />
  </url>
</urlset>
`;

fs.writeFileSync(
  path.resolve(import.meta.dirname, "../public/sitemap.xml"),
  sitemapXml,
  "utf8",
);
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf8");

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
      `<link rel="alternate" hreflang="en" href="${route.canonicalUrl}?lang=en" />`,
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
      /<div id="root"><\/div>/,
      `<div id="root"><div style="${SR_ONLY_STYLE}">${route.noscriptHtml}</div></div>`,
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
  `[prerender-public-routes] Generated static SEO HTML for /, ${PUBLIC_ROUTES.map((r) => `/${r.routePath}`).join(", ")}`,
);
