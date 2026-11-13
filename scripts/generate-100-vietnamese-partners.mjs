// scripts/generate-100-vietnamese-partners.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const VIETNAMESE_PARTNERS_RAW = [
  // ==========================================
  // 1. BÁO CHÍ & TẠP CHÍ (NEWSPAPER) - 30 đối tác
  // ==========================================
  {
    name: "Báo Tuổi Trẻ",
    type: "NEWSPAPER",
    contactName: "Trần Minh Trí",
    phone: "0903123456",
    email: "quangcao@tuoitre.com.vn",
    website: "https://tuoitre.vn",
    notes: "<p>Báo chính luận hàng đầu khu vực phía Nam. <strong>Thế mạnh:</strong> Chuyên mục Kinh doanh, Nhịp sống trẻ và Đời sống văn hóa với lượng độc giả trung thành cao.</p>"
  },
  {
    name: "Báo Thanh Niên",
    type: "NEWSPAPER",
    contactName: "Nguyễn Hải Đăng",
    phone: "0908765432",
    email: "toasoan@thanhnien.vn",
    website: "https://thanhnien.vn",
    notes: "<p>Kênh tin tức uy tín dành cho giới trẻ và gia đình Việt Nam. <strong>Ưu tiên:</strong> Các tuyến bài phóng sự, chuyên đề văn hóa và sự kiện giáo dục.</p>"
  },
  {
    name: "VnExpress",
    type: "NEWSPAPER",
    contactName: "Phạm Quốc Tuấn",
    phone: "0912345678",
    email: "sales@vnexpress.net",
    website: "https://vnexpress.net",
    notes: "<p>Báo điện tử nhiều người đọc nhất Việt Nam. <strong>Điểm mạnh:</strong> Tỷ lệ click bài PR cao, chuyên mục Kinh doanh, Số hóa và Xe cộ tiếp cận nhóm độc giả thu nhập cao.</p>"
  },
  {
    name: "Báo Dân Trí",
    type: "NEWSPAPER",
    contactName: "Lê Thu Hà",
    phone: "0988776655",
    email: "adv@dantri.com.vn",
    website: "https://dantri.com.vn",
    notes: "<p>Trang tin uy tín trực thuộc Bộ Nội Vụ. <strong>Thế mạnh:</strong> Độ phủ rộng khắp toàn quốc, phù hợp chiến dịch lan tỏa cộng đồng và bảo trợ truyền thông.</p>"
  },
  {
    name: "VietnamNet",
    type: "NEWSPAPER",
    contactName: "Hoàng Đức Minh",
    phone: "0977889900",
    email: "contact@vietnamnet.vn",
    website: "https://vietnamnet.vn",
    notes: "<p>Cơ quan ngôn luận thuộc Bộ Thông tin và Truyền thông. <strong>Định vị:</strong> Độc giả công chức, doanh nhân và lãnh đạo doanh nghiệp.</p>"
  },
  {
    name: "Báo Lao Động",
    type: "NEWSPAPER",
    contactName: "Vũ Đình Trọng",
    phone: "0909112233",
    email: "quangcao@laodong.com.vn",
    website: "https://laodong.vn",
    notes: "<p>Tiếng nói của người lao động Việt Nam. <strong>Thế mạnh:</strong> Các tuyến bài chính sách việc làm, an sinh xã hội và tiêu dùng thường nhật.</p>"
  },
  {
    name: "Báo Tiền Phong",
    type: "NEWSPAPER",
    contactName: "Đỗ Anh Tuấn",
    phone: "0934567890",
    email: "banbientap@tienphong.vn",
    website: "https://tienphong.vn",
    notes: "<p>Đơn vị bảo trợ nhiều sự kiện thể thao, hoa hậu và học đường lớn trên toàn quốc. <strong>Phù hợp:</strong> Chiến dịch thương hiệu thanh thiếu niên.</p>"
  },
  {
    name: "Báo Người Lao Động",
    type: "NEWSPAPER",
    contactName: "Bùi Thị Lan",
    phone: "0902233445",
    email: "marketing@nld.com.vn",
    website: "https://nld.com.vn",
    notes: "<p>Báo nhật báo phát hành rộng rãi tại TP.HCM. <strong>Đặc trưng:</strong> Chuyên mục Bạn đọc làm báo, Thị trường tiêu dùng và Pháp luật đời sống.</p>"
  },
  {
    name: "Tạp chí Forbes Việt Nam",
    type: "NEWSPAPER",
    contactName: "Ngô Quang Huy",
    phone: "0918889900",
    email: "editorial@forbesvietnam.com",
    website: "https://forbes.vn",
    notes: "<p>Ấn phẩm kinh tế tài chính chuẩn quốc tế. <strong>Tệp độc giả:</strong> C-level, Founder, Nhà đầu tư và Giới thượng lưu tại Việt Nam.</p>"
  },
  {
    name: "Tạp chí Kinh Tế Sài Gòn",
    type: "NEWSPAPER",
    contactName: "Đặng Văn Nam",
    phone: "0903334455",
    email: "phattrien@thesaigontimes.vn",
    website: "https://thesaigontimes.vn",
    notes: "<p>Nhóm thời báo kinh tế lâu đời nhất miền Nam. <strong>Nổi bật:</strong> Báo cáo phân tích chuyên sâu kinh tế vĩ mô, bất động sản và logistics.</p>"
  },
  {
    name: "Báo Đầu Tư",
    type: "NEWSPAPER",
    contactName: "Dương Minh Trí",
    phone: "0915667788",
    email: "baodautu@baodautu.vn",
    website: "https://baodautu.vn",
    notes: "<p>Cơ quan của Bộ Kế hoạch và Đầu tư. <strong>Đặc điểm:</strong> Kênh thông tin hàng đầu về xúc tiến đầu tư FDI, chứng khoán và dự án hạ tầng.</p>"
  },
  {
    name: "Tạp chí Doanh Nhân Sài Gòn",
    type: "NEWSPAPER",
    contactName: "Võ Thị Bích",
    phone: "0904556677",
    email: "toasoan@doanhnhansaigon.vn",
    website: "https://doanhnhansaigon.vn",
    notes: "<p>Cộng đồng kết nối hơn 10.000 doanh nghiệp vừa và nhỏ tại khu vực phía Nam. <strong>Dịch vụ:</strong> Phỏng vấn doanh nhân, tài trợ diễn đàn xúc tiến thương mại.</p>"
  },
  {
    name: "Tri Thức Trực Tuyến (Zing News)",
    type: "NEWSPAPER",
    contactName: "Phan Trung Kiên",
    phone: "0913445566",
    email: "pr@znews.vn",
    website: "https://znews.vn",
    notes: "<p>Trang tin thịnh hành thế hệ mới với phong cách thiết kế hiện đại, hình ảnh trực quan (infographic & emagazine) thu hút hàng triệu độc giả Gen Z.</p>"
  },
  {
    name: "Kênh 14 Media",
    type: "NEWSPAPER",
    contactName: "Nguyễn Thùy Linh",
    phone: "0982334455",
    email: "booking@kenh14.vn",
    website: "https://kenh14.vn",
    notes: "<p>Trang giải trí số 1 dành cho giới trẻ. <strong>Thế mạnh:</strong> Tin tức sao, xu hướng ẩm thực, làm đẹp, học đường và viral social post.</p>"
  },
  {
    name: "CafeF Kinh Tế Tài Chính",
    type: "NEWSPAPER",
    contactName: "Trần Bảo Long",
    phone: "0906778899",
    email: "info@cafef.vn",
    website: "https://cafef.vn",
    notes: "<p>Chuyên trang dữ liệu tài chính, chứng khoán và thông tin bất động sản lớn nhất Việt Nam. Tỉ lệ chuyển đổi cao cho các sản phẩm B2B và tài chính.</p>"
  },
  {
    name: "CafeBiz Khởi Nghiệp",
    type: "NEWSPAPER",
    contactName: "Lý Gia Hưng",
    phone: "0919223344",
    email: "bientap@cafebiz.vn",
    website: "https://cafebiz.vn",
    notes: "<p>Trang thông tin kinh doanh truyền cảm hứng cho giới khởi nghiệp trẻ, cập nhật liên tục câu chuyện thương trường và chiến lược bán lẻ hiện đại.</p>"
  },
  {
    name: "Báo Pháp Luật TP.HCM",
    type: "NEWSPAPER",
    contactName: "Huỳnh Thanh Phong",
    phone: "0907123123",
    email: "kinhdoanh@plo.vn",
    website: "https://plo.vn",
    notes: "<p>Nhật báo uy tín trong tư vấn pháp luật, chính sách kinh tế và bảo vệ quyền lợi người tiêu dùng Việt Nam.</p>"
  },
  {
    name: "Báo Sài Gòn Giải Phóng",
    type: "NEWSPAPER",
    contactName: "Tô Văn Dũng",
    phone: "0908234234",
    email: "phathanh@sggp.org.vn",
    website: "https://sggp.org.vn",
    notes: "<p>Tiếng nói của Đảng bộ, chính quyền và nhân dân TP.HCM. Phù hợp các chiến dịch công bố chính sách và tuyên truyền sự kiện văn hóa trọng đại.</p>"
  },
  {
    name: "Báo Quân Đội Nhân Dân",
    type: "NEWSPAPER",
    contactName: "Nguyễn Hữu Chiến",
    phone: "0914567567",
    email: "dientu@qdnd.vn",
    website: "https://qdnd.vn",
    notes: "<p>Cơ quan ngôn luận uy tín cấp nhà nước, bảo đảm tính xác thực cao nhất cho các thông cáo báo chí mang tầm cỡ quốc gia.</p>"
  },
  {
    name: "Tạp chí Brands Vietnam",
    type: "NEWSPAPER",
    contactName: "Mai Quốc Bảo",
    phone: "0909567890",
    email: "lienhe@brandsvietnam.com",
    website: "https://brandsvietnam.com",
    notes: "<p>Cổng thông tin chuyên biệt hàng đầu về Brand Marketing và Strategy tại Việt Nam. Cộng đồng chuyên gia, Marketer và Agency chuyên nghiệp.</p>"
  },
  {
    name: "Advertising Vietnam",
    type: "NEWSPAPER",
    contactName: "Lê Nhật Ánh",
    phone: "0903889911",
    email: "hello@advertisingvietnam.com",
    website: "https://advertisingvietnam.com",
    notes: "<p>Kênh tin tức sáng tạo và quảng cáo số 1 cho ngành truyền thông tiếp thị Việt Nam. Chuyên phân tích chiến dịch và xu hướng sáng tạo.</p>"
  },
  {
    name: "Tinh Tế Công Nghệ",
    type: "NEWSPAPER",
    contactName: "Trần Hiệp",
    phone: "0912112233",
    email: "quangcao@tinhte.vn",
    website: "https://tinhte.vn",
    notes: "<p>Diễn đàn công nghệ và đánh giá thiết bị số lớn nhất Việt Nam. Nhóm người dùng am hiểu công nghệ, đam mê trải nghiệm điện thoại, xe điện và đồ gia dụng.</p>"
  },
  {
    name: "GenK Công Nghệ",
    type: "NEWSPAPER",
    contactName: "Ngô Minh Sang",
    phone: "0905443322",
    email: "genk@vccorp.vn",
    website: "https://genk.vn",
    notes: "<p>Trang tin công nghệ, game và đời sống số. Tiếp cận mạnh mẽ nhóm bạn trẻ thích khám phá AI, phần mềm và tiện ích thông minh.</p>"
  },
  {
    name: "Báo Nông Nghiệp Việt Nam",
    type: "NEWSPAPER",
    contactName: "Phùng Tiến Đạt",
    phone: "0981223344",
    email: "toasoannongnghiep@gmail.com",
    website: "https://nongnghiep.vn",
    notes: "<p>Kênh tin tức nông nghiệp, chuỗi cung ứng nông sản và thực phẩm an toàn tại 63 tỉnh thành Việt Nam.</p>"
  },
  {
    name: "Báo Giao Thông",
    type: "NEWSPAPER",
    contactName: "Trương Văn Long",
    phone: "0916778899",
    email: "bandoisong@baogiaothong.vn",
    website: "https://baogiaothong.vn",
    notes: "<p>Trang tin thời sự giao thông, phát triển hạ tầng và công nghiệp ô tô xe máy tại Việt Nam.</p>"
  },
  {
    name: "Báo Điện Tử VTC News",
    type: "NEWSPAPER",
    contactName: "Chu Đình Toàn",
    phone: "0904998877",
    email: "toasoan@vtcnews.vn",
    website: "https://vtcnews.vn",
    notes: "<p>Báo điện tử đa phương tiện với kho video tin tức phong phú, trực tiếp sự kiện xã hội và giải trí 24/7.</p>"
  },
  {
    name: "Báo Công Thương",
    type: "NEWSPAPER",
    contactName: "Đinh Xuân Thắng",
    phone: "0912993322",
    email: "dientu@congthuong.vn",
    website: "https://congthuong.vn",
    notes: "<p>Cơ quan thuộc Bộ Công Thương Việt Nam. Chuyên sâu về xúc tiến xuất nhập khẩu, thị trường năng lượng và công nghiệp chế biến.</p>"
  },
  {
    name: "Tạp chí Diễn Đàn Doanh Nghiệp",
    type: "NEWSPAPER",
    contactName: "Bùi Ngọc Tuấn",
    phone: "0908445566",
    email: "marketing@dddn.com.vn",
    website: "https://diendandoanhnghiep.vn",
    notes: "<p>Tiếng nói của Liên đoàn Thương mại và Công nghiệp Việt Nam (VCCI). Cầu nối chính sách giữa nhà nước và khối doanh nghiệp tư nhân.</p>"
  },
  {
    name: "Báo Xây Dựng",
    type: "NEWSPAPER",
    contactName: "Lâm Quang Khải",
    phone: "0976112233",
    email: "dientubxd@gmail.com",
    website: "https://baoxaydung.com.vn",
    notes: "<p>Báo chuyên ngành kiến trúc, quy hoạch đô thị, vật liệu xây dựng và bất động sản công nghiệp.</p>"
  },
  {
    name: "Eva Đời Sống Phụ Nữ",
    type: "NEWSPAPER",
    contactName: "Nguyễn Mai Phương",
    phone: "0903221100",
    email: "kinhdoanh@eva.vn",
    website: "https://eva.vn",
    notes: "<p>Trang tin tức đời sống, làm đẹp, nuôi dạy con và thời trang lớn nhất dành cho phụ nữ Việt Nam từ 22 đến 45 tuổi.</p>"
  },

  // ==========================================
  // 2. TRUYỀN HÌNH & PHÁT THANH (TV) - 20 đối tác
  // ==========================================
  {
    name: "Đài Truyền Hình Việt Nam (VTV)",
    type: "TV",
    contactName: "Nguyễn Hải Quân",
    phone: "02438355931",
    email: "quangcao@vtv.gov.vn",
    website: "https://vtv.vn",
    notes: "<p>Đài truyền hình quốc gia phủ sóng 100% lãnh thổ. <strong>Kênh nổi bật:</strong> VTV1 (Thời sự chính luận), VTV3 (Giải trí thể thao), VTV2 (Khoa giáo), VTV4 (Đối ngoại).</p>"
  },
  {
    name: "Đài Truyền Hình TP.HCM (HTV)",
    type: "TV",
    contactName: "Lê Hoàng Yến",
    phone: "02838292797",
    email: "dichvu@htv.com.vn",
    website: "https://htv.com.vn",
    notes: "<p>Đài truyền hình đô thị lớn nhất miền Nam. Kênh HTV7 và HTV9 dẫn đầu tỷ suất người xem gameshow và phim truyền hình gia đình.</p>"
  },
  {
    name: "Truyền hình Vĩnh Long (THVL)",
    type: "TV",
    contactName: "Võ Tấn Phát",
    phone: "02703822362",
    email: "thvl@thvl.vn",
    website: "https://thvl.vn",
    notes: "<p>Thương hiệu truyền hình quen thuộc của hàng triệu hộ gia đình miền Tây và Nam Bộ. Tỷ suất rating phim Việt luôn thuộc top 1 toàn quốc.</p>"
  },
  {
    name: "Trung Tâm Tin Tức VTV24",
    type: "TV",
    contactName: "Dương Minh Sơn",
    phone: "0981992424",
    email: "vtv24@vtv.vn",
    website: "https://vtv24.vtv.vn",
    notes: "<p>Đơn vị sản xuất Bản tin Tài chính Kinh doanh, Chuyển động 24h và hệ thống fanpage VTV24 với hơn 10 triệu người theo dõi.</p>"
  },
  {
    name: "Kênh Truyền hình K+",
    type: "TV",
    contactName: "Phạm Gia Khánh",
    phone: "0909456789",
    email: "hotro@kplus.vn",
    website: "https://kplus.vn",
    notes: "<p>Đơn vị sở hữu độc quyền phát sóng giải Ngoại hạng Anh (EPL) và các giải thể thao đỉnh cao châu Âu tại Việt Nam.</p>"
  },
  {
    name: "VTVcab Truyền hình Cáp Việt Nam",
    type: "TV",
    contactName: "Bùi Tuấn Anh",
    phone: "02437717520",
    email: "vtvcab@vtvcab.vn",
    website: "https://vtvcab.vn",
    notes: "<p>Mạng truyền hình cáp phủ sóng rộng khắp, sở hữu đa dạng gói bản quyền thể thao On Sports, ẩm thực và phim truyện quốc tế.</p>"
  },
  {
    name: "Truyền hình SCTV",
    type: "TV",
    contactName: "Đỗ Minh Đức",
    phone: "02838400500",
    email: "cskh@sctv.vn",
    website: "https://sctv.com.vn",
    notes: "<p>Công ty Truyền hình cáp Saigontourist với hơn 4,5 triệu thuê bao hộ gia đình trên toàn quốc.</p>"
  },
  {
    name: "Đài PT-TH Hà Nội (HanoiTV)",
    type: "TV",
    contactName: "Vũ Hải Đăng",
    phone: "02438343714",
    email: "hanoitv@hanoitv.vn",
    website: "https://hanoionline.vn",
    notes: "<p>Kênh truyền hình thời sự, văn hóa và đời sống thủ đô Hà Nội. <strong>Định hướng:</strong> Nhóm khán giả trung niên và gia đình thủ đô.</p>"
  },
  {
    name: "Truyền hình Kỹ thuật số VTC",
    type: "TV",
    contactName: "Lê Văn Khoa",
    phone: "02444508888",
    email: "vtcquangcao@vtc.gov.vn",
    website: "https://vtc.gov.vn",
    notes: "<p>Đài truyền hình kỹ thuật số trực thuộc Bộ Thông tin và Truyền thông. Sở hữu 16 kênh truyền hình chất lượng cao phủ sóng toàn quốc.</p>"
  },
  {
    name: "Kênh VOV Giao Thông Quốc Gia",
    type: "TV",
    contactName: "Trần Quốc Hưng",
    phone: "02437734567",
    email: "vovgiaothong@vov.vn",
    website: "https://vovgiaothong.vn",
    notes: "<p>Kênh phát thanh FM 91MHz trực tiếp trên mọi tuyến quốc lộ và đô thị. Tiếp cận hàng triệu tài xế xe hơi, taxi và xe tải mỗi ngày.</p>"
  },
  {
    name: "Đài Tiếng Nói Việt Nam (VOV)",
    type: "TV",
    contactName: "Nguyễn Tiến Thịnh",
    phone: "02438255700",
    email: "vov@vov.gov.vn",
    website: "https://vov.vn",
    notes: "<p>Đài phát thanh quốc gia gồm VOV1, VOV2, VOV3, VOV5 và VOV Giao thông. Đạt độ phủ sóng 99% vùng sâu vùng xa.</p>"
  },
  {
    name: "Truyền hình Quốc Phòng Việt Nam (QPVN)",
    type: "TV",
    contactName: "Đinh Xuân Trường",
    phone: "069555111",
    email: "bientap@qpvn.vn",
    website: "https://qpvn.vn",
    notes: "<p>Kênh truyền hình chuyên biệt về quốc phòng, công nghệ quân sự và lòng tự hào dân tộc Việt Nam.</p>"
  },
  {
    name: "Truyền hình Công An Nhân Dân (ANTV)",
    type: "TV",
    contactName: "Hoàng Ngọc Lâm",
    phone: "02438456677",
    email: "antv@bocongan.gov.vn",
    website: "https://antv.gov.vn",
    notes: "<p>Chuyên mục điều tra phá án, an ninh trật tự và an toàn giao thông với lượng người xem ổn định trên truyền hình cáp.</p>"
  },
  {
    name: "Truyền hình Quốc Hội Việt Nam",
    type: "TV",
    contactName: "Tạ Quang Bửu",
    phone: "02437349988",
    email: "quochoitv@quochoi.vn",
    website: "https://quochoitv.vn",
    notes: "<p>Kênh truyền hình thiết yếu quốc gia, phát sóng các kỳ họp Quốc hội và phản ánh tâm tư nguyện vọng của cử tri.</p>"
  },
  {
    name: "Kênh Truyền hình Nhân Dân",
    type: "TV",
    contactName: "Cao Minh Nhật",
    phone: "02438254231",
    email: "truyenhinhnhandan@nhandan.org.vn",
    website: "https://nhandantv.vn",
    notes: "<p>Kênh truyền thông chính luận phản ánh chính xác các chủ trương đường lối phát triển kinh tế xã hội của đất nước.</p>"
  },
  {
    name: "FPT Play Truyền hình OTT",
    type: "TV",
    contactName: "Nguyễn Minh Châu",
    phone: "19006600",
    email: "hotrofptplay@fpt.com.vn",
    website: "https://fptplay.vn",
    notes: "<p>Nền tảng truyền hình trực tuyến hàng đầu Việt Nam với hơn 20 triệu người dùng ứng dụng trên Smart TV và điện thoại.</p>"
  },
  {
    name: "VieON Network",
    type: "TV",
    contactName: "Lê Ngọc Thảo",
    phone: "02871089999",
    email: "support@vieon.vn",
    website: "https://vieon.vn",
    notes: "<p>Nền tảng OTT nội dung thuần Việt hàng đầu thuộc DatVietVAC. Sở hữu các show thực tế triệu view như Rap Việt, 2 Ngày 1 Đêm.</p>"
  },
  {
    name: "Galaxy Play Media",
    type: "TV",
    contactName: "Trần Anh Vũ",
    phone: "19008675",
    email: "contact@galaxyplay.vn",
    website: "https://galaxyplay.vn",
    notes: "<p>Dịch vụ xem phim trực tuyến số 1 Việt Nam với thư viện phim chiếu rạp độc quyền và phim bộ chất lượng 4K.</p>"
  },
  {
    name: "TV360 Viettel",
    type: "TV",
    contactName: "Phan Văn Hậu",
    phone: "18008098",
    email: "tv360@viettel.com.vn",
    website: "https://tv360.vn",
    notes: "<p>Ứng dụng truyền hình số của Tập đoàn Viettel miễn phí 4G/5G, đạt tốc độ tăng trưởng thuê bao nhanh nhất thị trường OTT Việt Nam.</p>"
  },
  {
    name: "Đài PT-TH Đà Nẵng (DaNangTV)",
    type: "TV",
    contactName: "Lương Thế Vinh",
    phone: "02363821000",
    email: "drt@danang.gov.vn",
    website: "https://drt.danang.vn",
    notes: "<p>Kênh truyền hình trung tâm khu vực miền Trung - Tây Nguyên, phục vụ tuyên truyền phát triển du lịch và kinh tế biển.</p>"
  },

  // ==========================================
  // 3. QUẢNG CÁO NGOÀI TRỜI & AD NETWORK (BANNER) - 25 đối tác
  // ==========================================
  {
    name: "Goldsun Media Group",
    type: "BANNER",
    contactName: "Phạm Hải Long",
    phone: "0903405566",
    email: "contact@goldsungroup.net",
    website: "https://goldsungroup.net",
    notes: "<p>Tập đoàn quảng cáo ngoài trời (OOH) lớn nhất Việt Nam. <strong>Tài sản:</strong> Mạng lưới Billboard cao tốc, màn hình LED ngã tư và biển quảng cáo sân bay toàn quốc.</p>"
  },
  {
    name: "Chicilon Media Vietnam",
    type: "BANNER",
    contactName: "Quách Vĩnh Nam",
    phone: "02839104888",
    email: "info@chicilonmedia.com",
    website: "https://chicilonmedia.com",
    notes: "<p>Doanh nghiệp dẫn đầu kênh truyền thông thang máy kỹ thuật số (Building LCD/Frame). Tiếp cận hơn 40 triệu lượt cư dân văn phòng cao cấp mỗi ngày.</p>"
  },
  {
    name: "VINAMA Media & Outdoor",
    type: "BANNER",
    contactName: "Nguyễn Thanh Tuấn",
    phone: "0918776655",
    email: "contact@vinama.vn",
    website: "https://vinama.vn",
    notes: "<p>Đơn vị khai thác vị trí quảng cáo ngoài trời trung tâm quận 1 TP.HCM, màn hình LED 3D Naked-Eye tại Phố đi bộ Nguyễn Huệ.</p>"
  },
  {
    name: "Bizman Media OOH",
    type: "BANNER",
    contactName: "Lê Trọng Nghĩa",
    phone: "0903889977",
    email: "contact@bizman.com.vn",
    website: "https://bizman.com.vn",
    notes: "<p>Chuyên gia quảng cáo sân bay Nội Bài, Tân Sơn Nhất, Đà Nẵng, Phú Quốc cùng hệ thống biển tấm lớn trên trục giao thông huyết mạch.</p>"
  },
  {
    name: "Sen Vàng Media OOH",
    type: "BANNER",
    contactName: "Hoàng Nhật Linh",
    phone: "02838488888",
    email: "info@senvangvn.com",
    website: "https://senvangvn.com",
    notes: "<p>Hệ thống màn hình LED quảng cáo tại các giao lộ sầm uất nhất Hà Nội và TP.HCM, đi kèm năng lực sản xuất sự kiện giải trí quy mô quốc tế.</p>"
  },
  {
    name: "Cốc Cốc Ad Network",
    type: "BANNER",
    contactName: "Trần Anh Quân",
    phone: "02435123456",
    email: "sales@coccoc.com",
    website: "https://ads.coccoc.com",
    notes: "<p>Trình duyệt số 1 do người Việt phát triển với hơn 28 triệu người dùng. <strong>Định dạng:</strong> Newtab Banner, Search Ads, Icon Ads với CPC/CPM cạnh tranh.</p>"
  },
  {
    name: "Shopee Ads Network",
    type: "BANNER",
    contactName: "Vũ Phương Thảo",
    phone: "02873081221",
    email: "ads.support@shopee.vn",
    website: "https://shopee.vn",
    notes: "<p>Mạng quảng cáo tìm kiếm và hiển thị trên sàn thương mại điện tử lớn nhất Việt Nam. Định dạng Discovery Ads và In-feed Display hiệu quả cao.</p>"
  },
  {
    name: "TikTok Shop Ads Vietnam",
    type: "BANNER",
    contactName: "Lâm Gia Bảo",
    phone: "0989123456",
    email: "tiktokads.vietnam@tiktok.com",
    website: "https://ads.tiktok.com",
    notes: "<p>Giải pháp quảng cáo video ngắn và livestream shopping thịnh hành số 1 tại Đông Nam Á. Tiếp cận khách hàng tức thì từ video đến giỏ hàng.</p>"
  },
  {
    name: "Adtima Digital Media",
    type: "BANNER",
    contactName: "Nguyễn Đắc Thắng",
    phone: "02838295678",
    email: "contact@adtima.vn",
    website: "https://adtima.vn",
    notes: "<p>Đơn vị độc quyền khai thác hệ sinh thái Zalo, Zing MP3, Báo Mới. Tiếp cận hơn 75 triệu người dùng thường xuyên hàng tháng tại Việt Nam.</p>"
  },
  {
    name: "CleverGroup Digital Network",
    type: "BANNER",
    contactName: "Nguyễn Khánh Trình",
    phone: "02432115566",
    email: "contact@clevergroup.vn",
    website: "https://clevergroup.vn",
    notes: "<p>Tập đoàn giải pháp công nghệ quảng cáo hàng đầu Đông Nam Á, đối tác cấp cao của Google và Meta tại Việt Nam suốt hơn 15 năm qua.</p>"
  },
  {
    name: "NovaAds Vietnam",
    type: "BANNER",
    contactName: "Lê Viết Hùng",
    phone: "02437890123",
    email: "info@novaads.com",
    website: "https://novaads.com",
    notes: "<p>Tiên phong giải pháp Search Marketing và Performance Marketing cho hơn 2.000 doanh nghiệp vừa và nhỏ trên toàn quốc.</p>"
  },
  {
    name: "Eway Affiliate & Ad Network",
    type: "BANNER",
    contactName: "Đặng Hoàng Nam",
    phone: "02437956789",
    email: "contact@eway.vn",
    website: "https://eway.vn",
    notes: "<p>Mạng tiếp thị liên kết (Affiliate Network) và quảng cáo tự động hóa dựa trên dữ liệu lớn (Big Data) và thuật toán AI tối ưu giá thầu.</p>"
  },
  {
    name: "Interspace Vietnam (Accesstrade)",
    type: "BANNER",
    contactName: "Đỗ Hữu Hưng",
    phone: "02439766789",
    email: "support@accesstrade.vn",
    website: "https://accesstrade.vn",
    notes: "<p>Nền tảng tăng trưởng doanh số theo hình thức CPA/CPO lớn nhất Việt Nam với hơn 2 triệu đối tác phát hành nội dung (Publisher & KOC).</p>"
  },
  {
    name: "Yeah1 Digital Display Network",
    type: "BANNER",
    contactName: "Nguyễn Anh Nhượng",
    phone: "02839103888",
    email: "digital@yeah1.vn",
    website: "https://yeah1group.com",
    notes: "<p>Mạng lưới phân phối quảng cáo hiển thị đa kênh sở hữu hàng trăm triệu lượt hiển thị tự nhiên trên Facebook, YouTube và các trang giải trí số.</p>"
  },
  {
    name: "MicroAd Vietnam",
    type: "BANNER",
    contactName: "Saito Kenji",
    phone: "02838275656",
    email: "info@microad.vn",
    website: "https://microad.vn",
    notes: "<p>Công ty quảng cáo số có vốn đầu tư Nhật Bản, cung cấp nền tảng DSP/SSP phân phối banner chuẩn xác theo sở thích hành vi người dùng.</p>"
  },
  {
    name: "Asong Investment OOH",
    type: "BANNER",
    contactName: "Kim Sung Min",
    phone: "02838221199",
    email: "contact@asong.com.vn",
    website: "https://asong.com.vn",
    notes: "<p>Sở hữu các vị trí pano quảng cáo tấm lớn tại các vòng xoay trung tâm Bến Thành, Điện Biên Phủ và Hàng Xanh TP.HCM.</p>"
  },
  {
    name: "Nam Long Media Outdoor",
    type: "BANNER",
    contactName: "Đào Duy Anh",
    phone: "0903224466",
    email: "namlong@namlongmedia.com",
    website: "https://namlongmedia.com",
    notes: "<p>Nhà thầu quảng cáo xe buýt, trạm chờ xe buýt và pano ngoài trời tại các đô thị vệ tinh như Bình Dương, Đồng Nai và Long An.</p>"
  },
  {
    name: "Kim Ngân OOH Advertising",
    type: "BANNER",
    contactName: "Nguyễn Kim Ngân",
    phone: "0913557799",
    email: "adv@kimnganooh.com",
    website: "https://kimnganooh.com",
    notes: "<p>Chuyên thiết kế và thi công hệ thống hộp đèn siêu thị, pano trung tâm thương mại Vincom, Aeon Mall và Lotte Mart trên cả nước.</p>"
  },
  {
    name: "Quảng Cáo Mặt Trời Vàng (GoldSun DOOH)",
    type: "BANNER",
    contactName: "Hoàng Văn Tuấn",
    phone: "02435558888",
    email: "dooh@goldsungroup.com",
    website: "https://goldsungroup.net",
    notes: "<p>Tiên phong mạng lưới màn hình LED kỹ thuật số ngoài trời thông minh kết hợp camera đo lường lưu lượng giao thông thực tế.</p>"
  },
  {
    name: "NextTech Media Network",
    type: "BANNER",
    contactName: "Nguyễn Hòa Bình",
    phone: "02437951234",
    email: "media@nexttech.asia",
    website: "https://nexttech.asia",
    notes: "<p>Hệ sinh thái tiếp thị số kết hợp cổng thanh toán trực tuyến NgânLượng và dịch vụ hậu cần kho bãi cho ngành bán lẻ thương mại điện tử.</p>"
  },
  {
    name: "Appier Vietnam Ads",
    type: "BANNER",
    contactName: "Trần Bảo Ngọc",
    phone: "02839151234",
    email: "vietnam@appier.com",
    website: "https://appier.com",
    notes: "<p>Nền tảng trí tuệ nhân tạo dự đoán hành vi khách hàng, tự động phân bổ ngân sách quảng cáo banner trên website và ứng dụng di động.</p>"
  },
  {
    name: "Innity Vietnam Network",
    type: "BANNER",
    contactName: "Phan Đình Luật",
    phone: "02839301234",
    email: "vietnam@innity.com",
    website: "https://innity.com",
    notes: "<p>Mạng quảng cáo tương tác kỹ thuật số với các định dạng Rich Media độc đáo: Spin, Peel Down, 3D Canvas và Lightbox trên các báo điện tử lớn.</p>"
  },
  {
    name: "Vietba Media",
    type: "BANNER",
    contactName: "Bùi Thị Phương",
    phone: "02437621234",
    email: "vietba@vietbamedia.com",
    website: "https://vietbamedia.com",
    notes: "<p>Đơn vị lâu năm trong ngành sản xuất nội dung truyền hình và quản lý các cụm biển quảng cáo pano cao tốc Hà Nội - Hải Phòng.</p>"
  },
  {
    name: "Mekong OOH Media",
    type: "BANNER",
    contactName: "Lê Tấn Lộc",
    phone: "02923831234",
    email: "contact@mekongooh.vn",
    website: "https://mekongooh.vn",
    notes: "<p>Nhà khai thác mạng lưới quảng cáo biển bảng và màn hình LED độc quyền tại các bến xe, sân bay và cầu Cần Thơ khu vực Đồng bằng Sông Cửu Long.</p>"
  },
  {
    name: "Bizfly Martech Network",
    type: "BANNER",
    contactName: "Vũ Hoàng Sơn",
    phone: "02473006886",
    email: "support@bizfly.vn",
    website: "https://bizfly.vn",
    notes: "<p>Hệ sinh thái phần mềm quảng cáo tự động, CRM và Email Marketing trực thuộc VCCorp giúp doanh nghiệp thu thập và nuôi dưỡng khách hàng tiềm năng.</p>"
  },

  // ==========================================
  // 4. DOANH NGHIỆP & TẬP ĐOÀN VIỆT NAM (OTHER) - 25 đối tác
  // ==========================================
  {
    name: "Vinamilk (Công ty Cổ phần Sữa Việt Nam)",
    type: "OTHER",
    contactName: "Nguyễn Văn An",
    phone: "02854155555",
    email: "vinamilk@vinamilk.com.vn",
    website: "https://vinamilk.com.vn",
    notes: "<p>Thương hiệu quốc gia ngành sữa dinh dưỡng. <strong>Nhu cầu hợp tác:</strong> Các chiến dịch truyền thông đa kênh, CSR vì trẻ em Việt Nam và activation học đường.</p>"
  },
  {
    name: "VinFast Auto Việt Nam",
    type: "OTHER",
    contactName: "Lê Thị Mai Hương",
    phone: "1900232389",
    email: "support.vn@vinfastauto.com",
    website: "https://vinfastauto.com",
    notes: "<p>Hãng xe điện thông minh toàn cầu của Việt Nam. Thường xuyên triển khai các sự kiện lái thử trải nghiệm xe điện và chiến dịch phủ sóng OOH toàn quốc.</p>"
  },
  {
    name: "Tập đoàn Masan (Masan Group)",
    type: "OTHER",
    contactName: "Trần Đình Long",
    phone: "02862563862",
    email: "contactus@msn.masangroup.com",
    website: "https://masangroup.com",
    notes: "<p>Tập đoàn tiêu dùng và bán lẻ hàng đầu sở hữu chuỗi siêu thị WinMart, thương hiệu nước mắm Chin-Su, Nam Ngư, Mì Omachi và MEATDeli.</p>"
  },
  {
    name: "FPT Corporation",
    type: "OTHER",
    contactName: "Nguyễn Thế Vĩnh",
    phone: "02473007300",
    email: "fpt@fpt.com.vn",
    website: "https://fpt.com.vn",
    notes: "<p>Tập đoàn công nghệ và viễn thông lớn nhất Việt Nam. Cần hợp tác các sự kiện công nghệ Techday, giáo dục đại học FPT và dịch vụ chuyển đổi số doanh nghiệp.</p>"
  },
  {
    name: "Viettel Telecom",
    type: "OTHER",
    contactName: "Phan Quốc Hùng",
    phone: "18008098",
    email: "cskh@viettel.com.vn",
    website: "https://vietteltelecom.vn",
    notes: "<p>Doanh nghiệp viễn thông số 1 Việt Nam. Hợp tác thường xuyên các chương trình chăm sóc khách hàng Viettel++ và giải pháp IoT doanh nghiệp.</p>"
  },
  {
    name: "TH True Milk",
    type: "OTHER",
    contactName: "Hoàng Thị Thảo",
    phone: "1800545440",
    email: "chamsockhachhang@thmilk.vn",
    website: "https://thmilk.vn",
    notes: "<p>Thương hiệu sữa tươi sạch nguyên chất tiên phong ứng dụng công nghệ cao tại Việt Nam, ưu tiên các chiến dịch sống xanh và bảo vệ sức khỏe gia đình.</p>"
  },
  {
    name: "Highlands Coffee",
    type: "OTHER",
    contactName: "Lê Hoàng Long",
    phone: "19001755",
    email: "customerservice@highlandscoffee.com.vn",
    website: "https://highlandscoffee.com.vn",
    notes: "<p>Chuỗi cà phê Việt Nam với hơn 700 cửa hàng trên khắp cả nước. Phù hợp các chiến dịch đồng quảng cáo Co-branding và quà tặng khách hàng thân thiết.</p>"
  },
  {
    name: "Trung Nguyên Legend",
    type: "OTHER",
    contactName: "Đặng Lê Nguyên",
    phone: "02839251852",
    email: "legend@trungnguyen.com.vn",
    website: "https://trungnguyenlegend.com",
    notes: "<p>Tập đoàn cà phê năng lượng đổi đời, đại diện văn hóa cà phê Việt Nam vươn tầm thế giới. Chuyên tổ chức hội thảo văn hóa và sách quý đổi đời.</p>"
  },
  {
    name: "Thế Giới Di Động (MWG)",
    type: "OTHER",
    contactName: "Đoàn Văn Hiểu Em",
    phone: "18001060",
    email: "cskh@thegioididong.com",
    website: "https://thegioididong.com",
    notes: "<p>Nhà bán lẻ thiết bị di động, điện máy và bách hóa lớn nhất Việt Nam với hơn 3.000 cửa hàng phủ kín khắp 63 tỉnh thành.</p>"
  },
  {
    name: "Biti's Vietnam",
    type: "OTHER",
    contactName: "Vưu Lệ Quyên",
    phone: "02838753443",
    email: "tuvan_khachhang@bitis.com.vn",
    website: "https://bitis.com.vn",
    notes: "<p>Thương hiệu giày dép quốc dân nổi tiếng với dòng sản phẩm Biti's Hunter và các chiến dịch truyền thông 'Đi để trở về' lay động cảm xúc giới trẻ.</p>"
  },
  {
    name: "Sabeco (Bia Sài Gòn)",
    type: "OTHER",
    contactName: "Lâm Du An",
    phone: "02838294083",
    email: "sabeco@sabeco.com.vn",
    website: "https://sabeco.com.vn",
    notes: "<p>Tổng công ty Cổ phần Bia - Rượu - Nước giải khát Sài Gòn, thương hiệu bia lâu đời và gắn bó với văn hóa ẩm thực người Việt.</p>"
  },
  {
    name: "Habeco (Bia Hà Nội)",
    type: "OTHER",
    contactName: "Trần Đình Thanh",
    phone: "02438631316",
    email: "habeco@habeco.com.vn",
    website: "https://habeco.com.vn",
    notes: "<p>Nét văn hóa ẩm thực đặc trưng của đất Hà thành. Thường xuyên tài trợ các lễ hội bia và chương trình ẩm thực mùa hè tại miền Bắc.</p>"
  },
  {
    name: "Tập đoàn KIDO",
    type: "OTHER",
    contactName: "Trần Lệ Nguyên",
    phone: "02838270468",
    email: "info@kido.vn",
    website: "https://kido.vn",
    notes: "<p>Doanh nghiệp dẫn đầu ngành hàng dầu ăn, kem và bánh kẹo tại Việt Nam sở hữu các nhãn hiệu Tường An, Merino, Celano.</p>"
  },
  {
    name: "PNJ (Công ty Vàng Bạc Đá Quý Phú Nhuận)",
    type: "OTHER",
    contactName: "Cao Thị Ngọc Dung",
    phone: "1800545457",
    email: "chamsockhachhang@pnj.com.vn",
    website: "https://pnj.com.vn",
    notes: "<p>Thương hiệu trang sức số 1 Việt Nam với các chiến dịch tôn vinh vẻ đẹp phụ nữ, tình yêu đích thực và đám cưới mùa xuân.</p>"
  },
  {
    name: "DOJI Gold & Gems Group",
    type: "OTHER",
    contactName: "Đỗ Minh Phú",
    phone: "18001168",
    email: "cskh@doji.vn",
    website: "https://doji.vn",
    notes: "<p>Tập đoàn vàng bạc đá quý và trang sức cao cấp với chuỗi trung tâm trang sức lộng lẫy tại các trung tâm thương mại lớn.</p>"
  },
  {
    name: "Tập đoàn Sun Group",
    type: "OTHER",
    contactName: "Đặng Minh Trường",
    phone: "02439386060",
    email: "contact@sungroup.com.vn",
    website: "https://sungroup.com.vn",
    notes: "<p>Tập đoàn kiến tạo các công trình du lịch nghỉ dưỡng và vui chơi giải trí hàng đầu Việt Nam: Bà Nà Hills, Fansipan Legend, Phú Quốc Sunset Town.</p>"
  },
  {
    name: "Vingroup PR & Event",
    type: "OTHER",
    contactName: "Nguyễn Diệu Linh",
    phone: "02439749999",
    email: "info@vingroup.net",
    website: "https://vingroup.net",
    notes: "<p>Tập đoàn tư nhân đa ngành lớn nhất Việt Nam. Cần hợp tác các sự kiện ra mắt dự án bất động sản Vinhomes và hoạt động thiện nguyện Quỹ Thiện Tâm.</p>"
  },
  {
    name: "Vietjet Air Media",
    type: "OTHER",
    contactName: "Nguyễn Thị Phương Thảo",
    phone: "19001886",
    email: "19001886@vietjetair.com",
    website: "https://vietjetair.com",
    notes: "<p>Hãng hàng không thế hệ mới năng động. Khai thác kênh quảng cáo dán thân máy bay, tạp chí One2Fly trên chuyến bay và bàn ăn ghế ngồi.</p>"
  },
  {
    name: "Vietnam Airlines Lotusmedia",
    type: "OTHER",
    contactName: "Đặng Ngọc Hòa",
    phone: "19001100",
    email: "contact@vietnamairlines.com",
    website: "https://vietnamairlines.com",
    notes: "<p>Hãng hàng không quốc gia chuẩn 4 sao quốc tế. Kênh truyền thông Heritage Magazine và màn hình giải trí ghế máy bay tiếp cận tệp khách hàng thương gia cao cấp.</p>"
  },
  {
    name: "Tân Hiệp Phát Beverage",
    type: "OTHER",
    contactName: "Trần Uyên Phương",
    phone: "02743755291",
    email: "thp@thp.com.vn",
    website: "https://thp.com.vn",
    notes: "<p>Tập đoàn nước giải khát hàng đầu Việt Nam sở hữu Trà xanh Không Độ, Trà thanh nhiệt Dr Thanh và Nước tăng lực Number 1.</p>"
  },
  {
    name: "Phúc Long Tea & Coffee",
    type: "OTHER",
    contactName: "Lâm Bội Minh",
    phone: "18006779",
    email: "sales@phuclong.masangroup.com",
    website: "https://phuclong.com.vn",
    notes: "<p>Chuỗi đồ uống trà và cà phê truyền thống được giới trẻ và nhân viên văn phòng yêu thích bậc nhất nhờ chất lượng đậm vị trà tươi.</p>"
  },
  {
    name: "Golden Gate Restaurant Group",
    type: "OTHER",
    contactName: "Đào Thế Vinh",
    phone: "19006622",
    email: "support.hn@ggg.com.vn",
    website: "https://ggg.com.vn",
    notes: "<p>Tập đoàn ẩm thực chuỗi nhà hàng số 1 Việt Nam sở hữu hơn 450 nhà hàng gồm Gogi House, Kichi-Kichi, Manwah, Sumo Yakiniku.</p>"
  },
  {
    name: "Momo Fintech (M-Service)",
    type: "OTHER",
    contactName: "Nguyễn Bá Diệp",
    phone: "1900545441",
    email: "hotro@momo.vn",
    website: "https://momo.vn",
    notes: "<p>Siêu ứng dụng tài chính hàng đầu Việt Nam với hơn 31 triệu người dùng. Cung cấp nền tảng giải pháp Mini App, Voucher khuyến mãi và Gamification tiếp thị.</p>"
  },
  {
    name: "VNG Corporation (Zalo/VNG)",
    type: "OTHER",
    contactName: "Lê Hồng Minh",
    phone: "02839623888",
    email: "pr@vng.com.vn",
    website: "https://vng.com.vn",
    notes: "<p>Kỳ lân công nghệ đầu tiên của Việt Nam, phát triển Zalo, ZaloPay, mảng game trực tuyến và điện toán đám mây VNG Cloud.</p>"
  },
  {
    name: "Tiki Vietnam",
    type: "OTHER",
    contactName: "Trần Ngọc Thái Sơn",
    phone: "19006035",
    email: "hotro@tiki.vn",
    website: "https://tiki.vn",
    notes: "<p>Sàn thương mại điện tử cam kết 100% hàng chính hãng và dịch vụ giao hàng nhanh TikiNOW 2h được người tiêu dùng đánh giá uy tín hàng đầu.</p>"
  }
];

console.log(`Loaded ${VIETNAMESE_PARTNERS_RAW.length} authentic Vietnamese partners.`);

// Generate sampleCollaborators.ts
const samplePartnersCode = `import type { DirectoryPartner } from "./types";

export const SAMPLE_DIRECTORY_PARTNERS: DirectoryPartner[] = ${JSON.stringify(
  VIETNAMESE_PARTNERS_RAW.map((p, idx) => ({
    id: `partner-sample-${idx + 1}`,
    agencyId: "agency-sample",
    partnerName: p.name,
    partnerType: p.type,
    contactInfo: {
      contactName: p.contactName,
      phone: p.phone,
      email: p.email,
      website: p.website,
    },
    notes: p.notes,
    isActive: true,
    firstUsedAt: "2026-01-15T08:00:00Z",
    usageHistoryVerified: true,
    version: 1,
    canDelete: true,
    deleteBlockedReason: null,
  })),
  null,
  2
)};
`;

const sampleFilePath = path.resolve(__dirname, "../src/pages/collaborators/sampleCollaborators.ts");
fs.writeFileSync(sampleFilePath, samplePartnersCode, "utf-8");
console.log(`Updated ${sampleFilePath} with ${VIETNAMESE_PARTNERS_RAW.length} Vietnamese partners.`);
