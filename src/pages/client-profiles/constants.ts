// Khoảng ngân sách marketing của client. Backend lưu dạng String tự do
// (client_profiles.budget_range) nên đây chỉ là danh sách gợi ý cho Select;
// giá trị cũ ngoài danh sách vẫn được giữ và hiển thị thêm 1 option.
export const BUDGET_RANGES = [
  "UNDER_50M",
  "RANGE_50M_200M",
  "RANGE_200M_500M",
  "RANGE_500M_1B",
  "RANGE_1B_5B",
  "OVER_5B",
] as const;
