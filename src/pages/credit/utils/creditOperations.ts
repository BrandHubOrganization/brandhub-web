import {
  FileText,
  Sparkles,
  Hash,
  UserCheck,
  Contact,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import type { CreditOperation } from "@/pages/credit/types/credit";

export interface OperationMeta {
  icon: typeof FileText;
  label: string;
  description: string;
  unitLabel: string;
  unitDesc: string;
}

export const OPERATION_CONFIG: Record<CreditOperation, OperationMeta> = {
  CONTENT_GENERATE: {
    icon: FileText,
    label: "Tạo nội dung",
    description: "Tạo bài viết, bài đăng social đa kênh bằng AI chuyên sâu",
    unitLabel: "Yêu cầu",
    unitDesc: "Tính phí cho mỗi lượt tạo nội dung thành công",
  },
  CAPTION_VARIANTS: {
    icon: Sparkles,
    label: "Tạo các phương án chú thích",
    description:
      "Sinh nhiều biến thể caption, tiêu đề hấp dẫn và CTA theo ngữ cảnh",
    unitLabel: "Yêu cầu",
    unitDesc: "Tính phí cho mỗi lượt sinh biến thể thành công",
  },
  HASHTAG_GENERATE: {
    icon: Hash,
    label: "Gợi ý hashtag",
    description:
      "Phân tích ngữ cảnh và xuất bộ hashtag thịnh hành tối ưu tương tác",
    unitLabel: "Yêu cầu",
    unitDesc: "Tính phí cho mỗi lượt trích xuất hashtag thành công",
  },
  AMBASSADOR_GENERATE: {
    icon: UserCheck,
    label: "Tạo đại sứ",
    description: "Tạo hình tượng đại sứ ảo đại diện cho thương hiệu nhất quán",
    unitLabel: "Ảnh",
    unitDesc: "Tính phí cho mỗi hình ảnh đại sứ xuất bản thành công",
  },
  CHARACTER_SHEET: {
    icon: Contact,
    label: "Tạo bộ ảnh nhân vật",
    description:
      "Xuất bảng tạo hình đa góc mặt, dáng đứng và biểu cảm nhân vật",
    unitLabel: "Ảnh",
    unitDesc: "Tính phí cho mỗi ảnh nhân vật tạo thành công",
  },
  COMMERCIAL_IMAGE: {
    icon: ImageIcon,
    label: "Tạo ảnh thương mại",
    description:
      "Tạo hình ảnh sản phẩm quảng cáo và poster truyền thông chất lượng cao",
    unitLabel: "Ảnh",
    unitDesc: "Tính phí cho mỗi hình ảnh thương mại hoàn thiện",
  },
  VIDEO_GENERATE: {
    icon: Video,
    label: "Tạo video",
    description:
      "Chuyển ảnh hoặc văn bản thành video ngắn chuyển động điện ảnh",
    unitLabel: "Video",
    unitDesc: "Tính phí cho mỗi video render xuất bản thành công",
  },
};
